const mongoose = require('mongoose');
const Compra = require('../models/Compra');
const Producto = require('../models/Producto');
const { calcularCantidadBase, calcularPrecioSugerido, prorratearCargos } = require('../utils/compras');

/**
 * Recalcula sólo los datos "objetivos" del ítem (conversión a unidad base y
 * costo unitario). NO toca variantesSugeridas ni huboCambioCosto: eso vive
 * en un paso aparte (evaluarPrecios), para que guardar no dispare cálculo
 * de precio de venta y no se pise lo que el operador ya evaluó/tildó.
 */
async function construirItemBase(input) {
  const producto = await Producto.findById(input.producto);
  if (!producto) throw new Error('Producto no encontrado');

  // La cantidad (y, según la modalidad, pesoBolsaKg/unidadesPorCaja) puede
  // completarse más tarde: guardar no exige tenerla todavía. Si falta algo
  // para hacer la conversión, cantidadBase queda en null hasta que se
  // complete (se valida recién al evaluar precios o al confirmar).
  let cantidadBase = null;
  try {
    cantidadBase = calcularCantidadBase({
      tipoStock: producto.tipoStock,
      modalidadCompra: input.modalidadCompra,
      cantidadComprada: input.cantidadComprada,
      pesoBolsaKg: input.pesoBolsaKg,
      unidadesPorCaja: input.unidadesPorCaja
    });
  } catch {
    cantidadBase = null;
  }

  // "granel" tiene un pool de stock compartido (stockGranel), no hace falta elegir variante.
  // "unidad" tiene stock independiente por variante: hay que saber a cuál suma.
  if (producto.tipoStock === 'unidad' && !input.varianteDestino) {
    throw new Error(`Indicá a qué variante suma el stock de "${producto.nombre}"`);
  }

  const costoUnitarioBase =
    input.costoTotal > 0 && cantidadBase > 0 ? input.costoTotal / cantidadBase : null;

  return {
    producto: producto._id,
    nombreProducto: producto.nombre,
    tipoStock: producto.tipoStock,
    modalidadCompra: input.modalidadCompra,
    cantidadComprada: input.cantidadComprada,
    pesoBolsaKg: input.pesoBolsaKg,
    unidadesPorCaja: input.unidadesPorCaja,
    varianteDestino: producto.tipoStock === 'unidad' ? input.varianteDestino : undefined,
    cantidadBase,
    costoTotal: input.costoTotal || 0,
    costoUnitarioBase
  };
}

exports.crearCompra = async (req, res) => {
  try {
    const { proveedor, numeroFactura, fecha, items, cargos } = req.body;
    if (!items?.length) return res.status(400).json({ error: 'La compra necesita al menos un ítem' });

    const itemsCalculados = await Promise.all(items.map(construirItemBase));
    const costoTotalCompra = itemsCalculados.reduce((acc, it) => acc + it.costoTotal, 0);

    const compra = await Compra.create({
      proveedor,
      numeroFactura,
      fecha,
      items: itemsCalculados, // sin variantesSugeridas todavía: se generan al "Evaluar cambios de costo"
      cargos: cargos || [],
      costoTotalCompra,
      creadoPor: req.admin?._id
    });

    res.status(201).json(compra);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.actualizarCompra = async (req, res) => {
  try {
    const compra = await Compra.findById(req.params.id);
    if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });
    if (compra.estado !== 'borrador') {
      return res.status(400).json({ error: 'Solo se puede editar una compra en borrador' });
    }

    const { proveedor, numeroFactura, fecha, items, cargos } = req.body;
    if (!items?.length) return res.status(400).json({ error: 'La compra necesita al menos un ítem' });

    const itemsBase = await Promise.all(items.map(construirItemBase));

    // Guardar NO recalcula nada de precios: conserva tal cual lo que venía en
    // el payload del frontend para cada ítem (variantesSugeridas, con los
    // checkboxes "aplicar" y precios editados a mano; costoUnitarioBaseEvaluado;
    // huboCambioCosto; cargoAsignado/costoUnitarioBaseConCargos). El frontend
    // siempre manda de vuelta lo último que recibió del servidor, así que esto
    // es la fuente de verdad correcta — ir a buscarlo de nuevo a la DB fue el
    // bug que pisaba tus ediciones.
    const itemsCalculados = itemsBase.map((nuevo, i) => ({
      ...nuevo,
      variantesSugeridas: items[i].variantesSugeridas || [],
      costoUnitarioBaseEvaluado: items[i].costoUnitarioBaseEvaluado ?? undefined,
      huboCambioCosto: items[i].huboCambioCosto ?? false,
      cargoAsignado: items[i].cargoAsignado ?? undefined,
      costoUnitarioBaseConCargos: items[i].costoUnitarioBaseConCargos ?? undefined
    }));

    compra.proveedor = proveedor;
    compra.numeroFactura = numeroFactura;
    compra.fecha = fecha;
    compra.items = itemsCalculados;
    compra.cargos = cargos || [];
    compra.costoTotalCompra = itemsCalculados.reduce((acc, it) => acc + it.costoTotal, 0);
    await compra.save();

    res.json(compra);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Paso separado del guardado: para cada ítem, compara el costo unitario actual
 * contra el que tenía la última vez que se evaluó. Sólo recalcula
 * variantesSugeridas para los que cambiaron; el resto queda tal cual estaba
 * (respetando lo que el operador ya tildó o editó a mano).
 */
exports.evaluarPrecios = async (req, res) => {
  try {
    const compra = await Compra.findById(req.params.id);
    if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });
    if (compra.estado !== 'borrador') {
      return res.status(400).json({ error: 'Solo se puede evaluar precios de una compra en borrador' });
    }

    for (const item of compra.items) {
      if (item.costoUnitarioBase == null) {
        throw new Error(`Falta cargar cantidad y/o costo de "${item.nombreProducto}" para evaluar precios`);
      }
    }

    // Reparte el flete/impuestos/otros cargos de la compra entre los ítems,
    // según la incidencia del costo de cada uno en el total de la factura.
    // Se hace acá (no al guardar) porque necesita que todos los ítems ya
    // tengan costo y cantidad cargados para que el prorrateo sea confiable.
    const itemsProrrateados = prorratearCargos(compra.items, compra.cargos);
    itemsProrrateados.forEach((prorrateado, i) => {
      compra.items[i].cargoAsignado = prorrateado.cargoAsignado;
      compra.items[i].costoUnitarioBaseConCargos = prorrateado.costoUnitarioBaseConCargos;
    });

    for (const item of compra.items) {
      // El costo "real" del ítem para evaluar precio de venta es el que ya
      // incluye su parte de flete/impuestos, no el costo puro de factura.
      const costoReal = item.costoUnitarioBaseConCargos;

      const yaEvaluadoAntes = item.costoUnitarioBaseEvaluado != null;
      const costoDistinto = item.costoUnitarioBaseEvaluado !== costoReal;

      // "huboCambioCosto" sólo debe reflejar un cambio real respecto a una
      // evaluación anterior. La primera vez que se evalúa un ítem no es un
      // "cambio", es la evaluación inicial — así que no se marca la alerta,
      // aunque sí se calculan las sugerencias de precio por primera vez.
      item.huboCambioCosto = yaEvaluadoAntes && costoDistinto;

      const necesitaRecalcular = !yaEvaluadoAntes || costoDistinto;
      if (!necesitaRecalcular) continue;

      const producto = await Producto.findById(item.producto);
      if (!producto) throw new Error(`El producto "${item.nombreProducto}" ya no existe`);

      item.variantesSugeridas = producto.variantes.map(v => {
        const margenMultiplicador = v.margenMultiplicador ?? 2;
        const factorAjuste = v.factorAjuste ?? 1;
        const precioSugerido = calcularPrecioSugerido({
          tipoStock: producto.tipoStock,
          costoUnitarioBase: costoReal,
          variante: v
        });
        // Si el operador ya había tocado "Nuevo precio" a mano en una evaluación
        // anterior, se respeta; si no, el nuevo precio sigue al sugerido.
        const previa = item.variantesSugeridas.find(x => String(x.variante) === String(v._id));
        const editadoManualmente = previa?.editadoManualmente ?? false;
        return {
          variante: v._id,
          nombreVariante: v.peso,
          precioActual: v.precio,
          precioSugerido,
          precioNuevo: editadoManualmente ? previa.precioNuevo : precioSugerido,
          margenMultiplicador,
          factorAjuste,
          editadoManualmente,
          aplicar: previa?.aplicar ?? false
        };
      });

      item.costoUnitarioBaseEvaluado = costoReal;
    }

    await compra.save();
    res.json(compra);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Confirma la compra: SIEMPRE suma stock, y actualiza precio solo en las
 * variantes que el operador marcó "aplicar". Lee cada Producto fresco desde
 * la base dentro de la transacción (no confía en datos viejos del borrador)
 * y valida que el producto siga siendo consistente con lo calculado antes
 * de aplicar ningún cambio.
 */
exports.confirmarCompra = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const compra = await Compra.findById(req.params.id).session(session);
    if (!compra) throw new Error('Compra no encontrada');
    if (compra.estado === 'confirmada') throw new Error('La compra ya fue confirmada');
    if (compra.estado === 'anulada') throw new Error('La compra está anulada');

    // Fix: antes no se validaba costo acá, así que una compra con un ítem sin
    // costo cargado igual podía confirmarse. Se corta ANTES de tocar stock/precios.
    for (const item of compra.items) {
      if (!item.costoTotal || item.costoTotal <= 0 || item.costoUnitarioBase == null) {
        throw new Error(`Falta cargar cantidad y/o costo de "${item.nombreProducto}". Editá la compra antes de confirmar.`);
      }
    }

    for (const item of compra.items) {
      const producto = await Producto.findById(item.producto).session(session);
      if (!producto) {
        throw new Error(`El producto "${item.nombreProducto}" ya no existe. Editá la compra antes de confirmar.`);
      }

      if (producto.tipoStock !== item.tipoStock) {
        throw new Error(
          `"${producto.nombre}" cambió de tipo de stock desde que se creó la compra. Editá la compra antes de confirmar.`
        );
      }

      if (item.tipoStock === 'granel') {
        // Pool único, compartido por todas las variantes del producto
        producto.stockGranel = (producto.stockGranel || 0) + item.cantidadBase;
      } else {
        // Cada variante tiene su propio stock independiente
        const variante = producto.variantes.id(item.varianteDestino);
        if (!variante) {
          throw new Error(
            `La variante destino de "${producto.nombre}" ya no existe. Editá la compra antes de confirmar.`
          );
        }
        variante.stock = (variante.stock || 0) + item.cantidadBase;
      }

      for (const vs of item.variantesSugeridas) {
        if (!vs.aplicar) continue;
        const variante = producto.variantes.id(vs.variante);
        if (!variante) {
          throw new Error(
            `Una variante de "${producto.nombre}" ya no existe. Editá la compra antes de confirmar.`
          );
        }
        variante.precio = vs.precioNuevo;
      }

      await producto.save({ session });
    }

    compra.estado = 'confirmada';
    compra.confirmadaEn = new Date();
    await compra.save({ session });

    await session.commitTransaction();
    res.json(compra);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
};

exports.anularCompra = async (req, res) => {
  try {
    const compra = await Compra.findById(req.params.id);
    if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });
    if (compra.estado === 'confirmada') {
      return res.status(400).json({
        error: 'No se puede anular una compra ya confirmada (revertiría stock/precios ya aplicados)'
      });
    }
    compra.estado = 'anulada';
    await compra.save();
    res.json(compra);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.listarCompras = async (req, res) => {
  const compras = await Compra.find().sort({ createdAt: -1 });
  res.json(compras);
};

exports.obtenerCompra = async (req, res) => {
  const compra = await Compra.findById(req.params.id);
  if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });
  res.json(compra);
};
