/**
 * Convierte la cantidad comprada (en la unidad que eligió el operador)
 * a la unidad base con la que se maneja el stock internamente:
 *   - granel -> gramos
 *   - unidad -> unidades
 */
function calcularCantidadBase({ tipoStock, modalidadCompra, cantidadComprada, pesoBolsaKg, unidadesPorCaja }) {
  if (!cantidadComprada || cantidadComprada <= 0) {
    throw new Error('La cantidad comprada debe ser mayor a 0');
  }

  if (tipoStock === 'granel') {
    if (modalidadCompra === 'kg') return cantidadComprada * 1000;
    if (modalidadCompra === 'bolsa') {
      if (!pesoBolsaKg || pesoBolsaKg <= 0) throw new Error('Falta indicar los Kg por bolsa');
      return cantidadComprada * pesoBolsaKg * 1000;
    }
  }

  if (tipoStock === 'unidad') {
    if (modalidadCompra === 'unidad') return cantidadComprada;
    if (modalidadCompra === 'caja') {
      if (!unidadesPorCaja || unidadesPorCaja <= 0) throw new Error('Falta indicar las unidades por caja');
      return cantidadComprada * unidadesPorCaja;
    }
  }

  throw new Error(`Combinación inválida: tipoStock="${tipoStock}", modalidadCompra="${modalidadCompra}"`);
}

/**
 * Precio sugerido de venta para una variante puntual, a partir del costo
 * unitario base (por gramo si es granel, por unidad si es unidad) y de los
 * parámetros de margen propios de la variante.
 *
 * granel: precioSugerido = costoPorGramo * equivalenciaEnGramos * margenMultiplicador * factorAjuste
 * unidad: precioSugerido = costoPorUnidad * margenMultiplicador * factorAjuste
 */
// Redondea al múltiplo de 100 más cercano (ej: 9167 -> 9200, 9130 -> 9100).
// Si en algún momento querés otro redondeo (a 50, a 10), es el único lugar a tocar.
function redondear(valor, multiplo = 100) {
  return Math.round(valor / multiplo) * multiplo;
}

function calcularPrecioSugerido({ tipoStock, costoUnitarioBase, variante }) {
  const margen = variante.margenMultiplicador ?? 2;
  const factor = variante.factorAjuste ?? 1;

  if (tipoStock === 'granel') {
    return redondear(costoUnitarioBase * variante.equivalencia * margen * factor);
  }
  return redondear(costoUnitarioBase * margen * factor);
}

/**
 * Distribuye el total de cargos adicionales de la compra (flete, impuestos,
 * descarga, etc.) entre los ítems, según la incidencia del costo total de
 * cada uno (costoUnitarioBase * cantidadBase) sobre el subtotal de la factura.
 *
 * Si algún ítem no tiene costoUnitarioBase o cantidadBase cargados, no hay
 * subtotal confiable para prorratear: se devuelve sin cargo asignado, y es
 * responsabilidad de quien llame validar eso antes de evaluar precios.
 *
 * NOTA: `items` puede venir como subdocumentos de Mongoose. A propósito NO
 * se usa spread ({...item}) sobre ellos: los campos del schema son getters
 * definidos en el prototipo, no propiedades propias, así que un spread los
 * pierde silenciosamente (quedan undefined) y arrastra NaN aguas abajo.
 * Por eso acá se leen los valores con acceso directo (item.campo) y se
 * devuelven objetos planos nuevos con sólo lo que hace falta.
 *
 * @param {Array} items - [{ costoUnitarioBase, cantidadBase, ... }]
 * @param {Array} cargos - [{ tipo, descripcion, monto }]
 * @returns {Array} un objeto { cargoAsignado, costoUnitarioBaseConCargos } por cada ítem, en el mismo orden
 */
function prorratearCargos(items, cargos = []) {
  const totalCargos = cargos.reduce((acc, c) => acc + (c.monto || 0), 0);

  const subtotales = items.map(item => (item.costoUnitarioBase || 0) * (item.cantidadBase || 0));
  const subtotalFactura = subtotales.reduce((acc, s) => acc + s, 0);

  return items.map((item, i) => {
    const subtotalItem = subtotales[i];

    if (subtotalFactura === 0 || !item.cantidadBase) {
      return { cargoAsignado: 0, costoUnitarioBaseConCargos: item.costoUnitarioBase };
    }

    const proporcion = subtotalItem / subtotalFactura;
    const cargoAsignado = proporcion * totalCargos;
    const costoUnitarioBaseConCargos = (subtotalItem + cargoAsignado) / item.cantidadBase;

    return { cargoAsignado, costoUnitarioBaseConCargos };
  });
}

module.exports = { calcularCantidadBase, calcularPrecioSugerido, prorratearCargos };
