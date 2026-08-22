const express = require('express');

const router = express.Router();

const authOpcional = require('../middleware/authOpcional');

const Producto =
  require('../models/Producto');

const Pedido =
  require('../models/Pedido');

const Configuracion =
  require('../models/Configuracion');

/* ==========================
   Convierte el texto del peso
   (ej. "100Gr", "1Kg") a gramos.
   Misma lógica que en el frontend
   (calculadora de balanza / carrito manual).
========================== */

function parsearPesoAGramos(peso) {
  if (!peso) return 0;

  const texto = String(peso)
    .toLowerCase()
    .replace(',', '.')
    .replace(/\s/g, '');

  if (texto.endsWith('kg')) {
    return Math.round(parseFloat(texto.replace('kg', '')) * 1000);
  }

  if (texto.endsWith('gr')) {
    return Math.round(parseFloat(texto.replace('gr', '')));
  }

  return 0;
}

/* ==========================
   Para productos a granel, no hay una variante que
   coincida exacto con el peso pedido (ej. 137Gr).
   Usamos la variante cargada de mayor equivalencia que
   no supere el peso pedido como referencia de tarifa.
========================== */

function obtenerVarianteDeTarifa(variantes, gramos) {
  const ordenadas = [...variantes].sort(
    (a, b) => Number(a.equivalencia) - Number(b.equivalencia)
  );

  let elegida = ordenadas[0];

  for (const v of ordenadas) {
    if (gramos >= Number(v.equivalencia)) {
      elegida = v;
    } else {
      break;
    }
  }

  return elegida;
}

/* ==========================
   Aplica el descuento cargado desde el carrito manual sobre
   el precio base YA calculado en el servidor.

   Nunca confiamos en el "descuentoMonto" que pueda mandar el
   cliente: acá lo recalculamos siempre a partir del tipo/valor,
   igual que se recalcula el precio base en cada rama de arriba.

   tipo: 'porcentaje' | 'monto'. Cualquier otro valor se ignora
   (se trata como sin descuento).
========================== */

function calcularPrecioConDescuento(precioBase, tipo, valorCrudo) {

  const valor = Number(valorCrudo || 0);

  if (!valor || valor <= 0 || (tipo !== 'porcentaje' && tipo !== 'monto')) {

    return {
      precioOriginal: precioBase,
      descuentoTipo: null,
      descuentoValor: 0,
      descuentoMonto: 0,
      precioFinal: precioBase
    };
  }

  let descuentoMonto =
    tipo === 'monto'
      ? Math.round(valor)
      : Math.round((precioBase * valor) / 100);

  // El descuento nunca puede ser negativo ni superar el precio base.
  descuentoMonto = Math.min(Math.max(descuentoMonto, 0), precioBase);

  return {
    precioOriginal: precioBase,
    descuentoTipo: tipo,
    descuentoValor: valor,
    descuentoMonto,
    precioFinal: precioBase - descuentoMonto
  };
}

/* ==========================
   Combina, en cascada, los DOS descuentos que puede tener
   una línea del pedido:

   1) PROMOCIÓN: viene de producto.descuento (porcentaje
      cargado en el catálogo, visible para el cliente en la
      tienda). Se aplica siempre que el producto la tenga,
      sea carrito manual o compra normal del cliente.

   2) MANUAL: el que carga el vendedor a mano en el carrito
      manual (item.descuentoTipo / item.descuentoValor). Se
      aplica DESPUÉS, sobre el precio que ya tiene la promoción
      aplicada.

   Nunca se confía en nada que mande el cliente salvo el tipo/
   valor del descuento manual (el monto siempre se recalcula acá).
========================== */

function aplicarDescuentos(precioBase, producto, item, vendedorAutenticado) {

  const descuentoPromocionPct =
    Number(producto.descuento || 0);

  const promocion =
    calcularPrecioConDescuento(
      precioBase,
      descuentoPromocionPct > 0 ? 'porcentaje' : null,
      descuentoPromocionPct
    );

  // El descuento MANUAL solo existe en el carrito del vendedor, y
  // solo debe confiarse si la request viene con una sesión válida
  // (req.usuario). Cualquier descuentoTipo/descuentoValor que
  // mande un cliente sin login se ignora acá, sin importar qué
  // valor traiga.
  const manual =
    vendedorAutenticado
      ? calcularPrecioConDescuento(
          promocion.precioFinal,
          item.descuentoTipo,
          item.descuentoValor
        )
      : calcularPrecioConDescuento(
          promocion.precioFinal,
          null,
          0
        );

  return {
    // Precio de lista, sin ningún descuento.
    precioOriginal: precioBase,

    // Promoción del producto (snapshot al momento de la compra).
    descuentoPromocion: promocion.descuentoValor,
    montoPromocion: promocion.descuentoMonto,
    precioConPromocion: promocion.precioFinal,

    // Descuento manual del vendedor, aplicado sobre el precio
    // que ya tenía la promoción descontada.
    descuentoTipo: manual.descuentoTipo,
    descuentoValor: manual.descuentoValor,
    descuentoMonto: manual.descuentoMonto,

    // Precio final: el que se cobra y se usa para el subtotal.
    precioFinal: manual.precioFinal
  };
}

router.post(
  '/',
  authOpcional,
  async (req, res) => {

    try {

      const {

        cliente,
        telefono,
        direccion,
        tipoEntrega,
        envio,
        items,
        cartId

      } = req.body;

      if (!cartId) {

        return res.status(400).json({

          mensaje:
            'Falta cartId'

        });

      }

      if (
        !items ||
        items.length === 0
      ) {

        return res.status(400).json({

          mensaje:
            'Carrito vacío'

        });

      }

      /* ==========================
         CHEQUEO DE IDEMPOTENCIA
         Si este carrito ya generó un pedido (otra pestaña,
         doble click, reintento de red), devolvemos ESE pedido
         sin volver a tocar stock ni crear uno nuevo.
      ========================== */

      const pedidoExistente =
        await Pedido.findOne({ cartId });

      if (pedidoExistente) {

        return res.json({

          success: true,

          pedidoId:
            pedidoExistente._id,

          nropedido:
            pedidoExistente.nropedido

        });

      }

      let subtotal = 0;

      // Cache de productos ya consultados (evita refetch por línea
      // y permite mutar el MISMO documento en memoria para todos
      // los descuentos que le correspondan antes de guardarlo).

      const productosCache = {};

      async function obtenerProducto(id) {

        const idStr = String(id);

        if (!productosCache[idStr]) {

          productosCache[idStr] =
            await Producto.findById(id);
        }

        return productosCache[idStr];
      }

      // Gramos totales pedidos por producto GRANEL (suma de líneas
      // sueltas de ese producto + lo que exploten los combos que
      // lo incluyan como componente).

      const gramosPedidosPorProducto = {};

      // Unidades totales pedidas por variante de producto por UNIDAD
      // (clave: productoId + '|' + varianteId).

      const unidadesPedidasPorVariante = {};

      /* ==========================
         PASO 1: recorrer el carrito,
         calcular precios server-side,
         y ACUMULAR necesidades (sin
         validar ni descontar todavía).
      ========================== */

      for (const item of items) {

        const producto =
          await obtenerProducto(
            item.productoId
          );

        if (!producto) {

          return res.status(404).json({

            mensaje:
              'Producto no encontrado'

          });

        }

        /* ---------- COMBO ---------- */

        if (producto.tipoStock === 'combo') {

          if (
            !producto.componentes ||
            producto.componentes.length === 0
          ) {

            return res.status(400).json({

              mensaje:
                `${producto.nombre} no tiene componentes configurados`

            });

          }

          // Precio del combo: siempre el de oferta cargado en el
          // producto, nunca el que manda el cliente.

          const precioBaseCombo =
            Number(producto.precioCombo || 0);

          const {
            precioOriginal,
            descuentoPromocion,
            montoPromocion,
            precioConPromocion,
            descuentoTipo,
            descuentoValor,
            descuentoMonto,
            precioFinal
          } = aplicarDescuentos(
            precioBaseCombo,
            producto,
            item,
            Boolean(req.usuario)
          );

          item.precioOriginal = precioOriginal;
          item.descuentoPromocion = descuentoPromocion;
          item.montoPromocion = montoPromocion;
          item.precioConPromocion = precioConPromocion;
          item.descuentoTipo = descuentoTipo;
          item.descuentoValor = descuentoValor;
          item.descuentoMonto = descuentoMonto;
          item.precio = precioFinal;

          for (const componente of producto.componentes) {

            const productoComponente =
              await obtenerProducto(
                componente.productoId
              );

            if (!productoComponente) {

              return res.status(404).json({

                mensaje:
                  `Componente no encontrado en ${producto.nombre}`

              });

            }

            if (productoComponente.tipoStock !== 'granel') {

              return res.status(400).json({

                mensaje:
                  `El componente ${productoComponente.nombre} de ${producto.nombre} debe ser un producto a granel`

              });

            }

            const idComponente =
              String(componente.productoId);

            const gramosNecesarios =

              Number(componente.cantidadGramos || 0) *

              Number(item.cantidad || 0);

            gramosPedidosPorProducto[idComponente] =

              (
                gramosPedidosPorProducto[idComponente] || 0
              ) + gramosNecesarios;
          }

        /* ---------- GRANEL ---------- */

        } else if (producto.tipoStock === 'granel') {

          if (
            !producto.variantes ||
            producto.variantes.length === 0
          ) {

            return res.status(400).json({

              mensaje:
                `${producto.nombre} no tiene variantes de referencia cargadas`

            });

          }

          const gramosSolicitados =
            parsearPesoAGramos(item.peso);

          if (gramosSolicitados <= 0) {

            return res.status(400).json({

              mensaje:
                `Peso inválido para ${producto.nombre}`

            });

          }

          const varianteTarifa =
            obtenerVarianteDeTarifa(
              producto.variantes,
              gramosSolicitados
            );

          const precioPorGramo =
            Number(varianteTarifa.precio) /
            Number(varianteTarifa.equivalencia || 1);

          // Recalculamos el precio en el servidor: nunca confiamos
          // en el precio que manda el cliente/frontend.
          const precioBaseGranel =
            Math.round(precioPorGramo * gramosSolicitados);

          const {
            precioOriginal: precioOriginalGranel,
            descuentoPromocion: descuentoPromocionGranel,
            montoPromocion: montoPromocionGranel,
            precioConPromocion: precioConPromocionGranel,
            descuentoTipo: descuentoTipoGranel,
            descuentoValor: descuentoValorGranel,
            descuentoMonto: descuentoMontoGranel,
            precioFinal: precioFinalGranel
          } = aplicarDescuentos(
            precioBaseGranel,
            producto,
            item,
            Boolean(req.usuario)
          );

          item.precioOriginal = precioOriginalGranel;
          item.descuentoPromocion = descuentoPromocionGranel;
          item.montoPromocion = montoPromocionGranel;
          item.precioConPromocion = precioConPromocionGranel;
          item.descuentoTipo = descuentoTipoGranel;
          item.descuentoValor = descuentoValorGranel;
          item.descuentoMonto = descuentoMontoGranel;
          item.precio = precioFinalGranel;

          const idProducto =
            String(item.productoId);

          const gramosNecesarios =

            gramosSolicitados *
            Number(item.cantidad);

          gramosPedidosPorProducto[idProducto] =

            (
              gramosPedidosPorProducto[idProducto] || 0
            ) + gramosNecesarios;

        /* ---------- UNIDAD ---------- */

        } else {

          const variante =
            producto.variantes.find(

              v =>

                v.peso === item.peso

            );

          if (!variante) {

            return res.status(404).json({

              mensaje:
                'Variante no encontrada'

            });

          }

          // Recalculamos el precio en el servidor acá también.

          const precioBaseUnidad =
            Number(variante.precio || 0);

          const {
            precioOriginal: precioOriginalUnidad,
            descuentoPromocion: descuentoPromocionUnidad,
            montoPromocion: montoPromocionUnidad,
            precioConPromocion: precioConPromocionUnidad,
            descuentoTipo: descuentoTipoUnidad,
            descuentoValor: descuentoValorUnidad,
            descuentoMonto: descuentoMontoUnidad,
            precioFinal: precioFinalUnidad
          } = aplicarDescuentos(
            precioBaseUnidad,
            producto,
            item,
            Boolean(req.usuario)
          );

          item.precioOriginal = precioOriginalUnidad;
          item.descuentoPromocion = descuentoPromocionUnidad;
          item.montoPromocion = montoPromocionUnidad;
          item.precioConPromocion = precioConPromocionUnidad;
          item.descuentoTipo = descuentoTipoUnidad;
          item.descuentoValor = descuentoValorUnidad;
          item.descuentoMonto = descuentoMontoUnidad;
          item.precio = precioFinalUnidad;

          const clave =

            `${item.productoId}|${variante._id}`;

          unidadesPedidasPorVariante[clave] =

            (
              unidadesPedidasPorVariante[clave] || 0
            ) + Number(item.cantidad || 0);
        }

        subtotal +=

          Number(item.precio) *

          Number(item.cantidad);

      }

      /* ==========================
         PASO 2: validar los totales
         YA ACUMULADOS, antes de tocar
         nada en la base.
      ========================== */

      for (const idProducto of Object.keys(gramosPedidosPorProducto)) {

        const producto =
          await obtenerProducto(idProducto);

        const gramosPedidos =
          gramosPedidosPorProducto[idProducto];

        const stockDisponible =
          Number(producto.stockGranel || 0);

        if (stockDisponible < gramosPedidos) {

          return res.status(400).json({

            mensaje:
              `${producto.nombre} sin stock suficiente`

          });

        }
      }

      for (const clave of Object.keys(unidadesPedidasPorVariante)) {

        const [idProducto, idVariante] =
          clave.split('|');

        const producto =
          await obtenerProducto(idProducto);

        const variante =
          producto.variantes.id(idVariante);

        const cantidadPedida =
          unidadesPedidasPorVariante[clave];

        if (

          Number(variante.stock || 0) <

          cantidadPedida

        ) {

          return res.status(400).json({

            mensaje:
              `${producto.nombre} sin stock suficiente`

          });

        }
      }

      /* ==========================
         PASO 3: recién ahora, con TODO
         validado, aplicamos los
         descuentos y guardamos una
         sola vez por producto.
      ========================== */

      for (const idProducto of Object.keys(gramosPedidosPorProducto)) {

        const producto =
          await obtenerProducto(idProducto);

        producto.stockGranel -=
          gramosPedidosPorProducto[idProducto];
      }

      for (const clave of Object.keys(unidadesPedidasPorVariante)) {

        const [idProducto, idVariante] =
          clave.split('|');

        const producto =
          await obtenerProducto(idProducto);

        const variante =
          producto.variantes.id(idVariante);

        variante.stock -=
          unidadesPedidasPorVariante[clave];
      }

      // Guardamos una sola vez por producto tocado (sea por
      // descuento directo, granel o unidad, o por haber sido
      // componente de algún combo).

      for (const producto of Object.values(productosCache)) {

        if (producto && producto.isModified()) {

          await producto.save();
        }
      }

      /* ==========================
         NÚMERO DE PEDIDO
      ========================== */

      let configuracion =
        await Configuracion.findOne({});

      if (!configuracion) {

        configuracion =
          await Configuracion.create({

            nropedido: 1000

          });

      }

      configuracion.nropedido += 1;

      await configuracion.save();

      /* ==========================
         ARMAR ITEMS
      ========================== */

      const itemsPedido =

        items.map(item => ({

          productoId:
            item.productoId,

          nombre:
            item.nombre,

          peso:
            item.peso || null,

          precio:
            item.precio,

          precioOriginal:
            item.precioOriginal,

          descuentoPromocion:
            item.descuentoPromocion,

          montoPromocion:
            item.montoPromocion,

          precioConPromocion:
            item.precioConPromocion,

          descuentoTipo:
            item.descuentoTipo,

          descuentoValor:
            item.descuentoValor,

          descuentoMonto:
            item.descuentoMonto,

          cantidad:
            item.cantidad,

          subtotal:

            Number(item.precio) *

            Number(item.cantidad)

        }));

      const total =

        subtotal +

        Number(envio || 0);

      /* ==========================
         CREAR PEDIDO
      ========================== */

      const pedido =
        new Pedido({

          nropedido:

            String(
              configuracion.nropedido
            ),

          cartId,

          cliente,

          telefono,

          direccion,

          tipoEntrega,

          envio:

            Number(envio || 0),

          items:
            itemsPedido,

          subtotal,

          total

        });

      try {

        await pedido.save();

      } catch (errorGuardado) {

        // Carrera: otro request con el MISMO cartId ya guardó
        // su pedido entre nuestro chequeo de arriba y este save.
        // El índice único de Mongo lo detecta acá. Devolvemos
        // el pedido que ganó la carrera, sin duplicar nada.

        if (errorGuardado.code === 11000) {

          const pedidoYaCreado =
            await Pedido.findOne({ cartId });

          return res.json({

            success: true,

            pedidoId:
              pedidoYaCreado._id,

            nropedido:
              pedidoYaCreado.nropedido

          });

        }

        throw errorGuardado;
      }

      res.json({

        success: true,

        pedidoId:
          pedido._id,

        nropedido:
          pedido.nropedido

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        mensaje:
          'Error en checkout'

      });

    }

  }

);

module.exports = router;
