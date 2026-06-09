const express =
  require('express');

const router =
  express.Router();

const Producto =
  require('../models/Producto');

const Pedido =
  require('../models/Pedido');

router.post(
  '/',
  async (req, res) => {

    try {

      const {

        cliente,
        telefono,
        direccion,
        tipoEntrega,
        envio,
        items

      } = req.body;

      if (
        !items ||
        items.length === 0
      ) {

        return res.status(400).json({

          mensaje:
            'Carrito vacío'
        });
      }

      let subtotal = 0;

      /* VALIDAR STOCK */

      for (const item of items) {

        const producto =
          await Producto.findById(
            item.productoId
          );

        if (!producto) {

          return res.status(404).json({

            mensaje:
              `Producto no encontrado`
          });
        }

        const variante =
          producto.variantes.find(

            v =>
              v.peso === item.peso
          );

        if (!variante) {

          return res.status(404).json({

            mensaje:
              `Variante no encontrada`
          });
        }

        /* STOCK NORMAL */

        if (
          producto.tipoStock !==
          'granel'
        ) {

          if (
            Number(
              variante.stock
            ) < item.cantidad
          ) {

            return res.status(400).json({

              mensaje:
                `${producto.nombre} sin stock suficiente`
            });
          }

        } else {

          /* STOCK GRANEL */

          let kgNecesarios = 0;

          const texto =
            variante.peso
              .toLowerCase()
              .replace(/\s/g, '');

          if (
            texto.includes('kg')
          ) {

            kgNecesarios =
              Number(
                texto.replace(
                  'kg',
                  ''
                )
              );

          } else if (
            texto.includes('gr')
          ) {

            kgNecesarios =
              Number(
                texto.replace(
                  'gr',
                  ''
                )
              ) / 1000;
          }

          const stockDisponible =

            Math.floor(

              Number(
                producto.stockGranelKg || 0
              ) / kgNecesarios
            );

          if (
            stockDisponible <
            item.cantidad
          ) {

            return res.status(400).json({

              mensaje:
                `${producto.nombre} sin stock suficiente`
            });
          }
        }

        subtotal +=
          Number(item.precio) *
          Number(item.cantidad);
      }

      /* DESCONTAR STOCK */

      for (const item of items) {

        const producto =
          await Producto.findById(
            item.productoId
          );

        const variante =
          producto.variantes.find(

            v =>
              v.peso === item.peso
          );

        if (
          producto.tipoStock !==
          'granel'
        ) {

          variante.stock -=
            item.cantidad;

        } else {

          let kgNecesarios = 0;

          const texto =
            variante.peso
              .toLowerCase()
              .replace(/\s/g, '');

          if (
            texto.includes('kg')
          ) {

            kgNecesarios =
              Number(
                texto.replace(
                  'kg',
                  ''
                )
              );

          } else if (
            texto.includes('gr')
          ) {

            kgNecesarios =
              Number(
                texto.replace(
                  'gr',
                  ''
                )
              ) / 1000;
          }

          producto.stockGranelKg -=

            kgNecesarios *
            item.cantidad;
        }

        await producto.save();
      }

      /* GENERAR NRO PEDIDO */

      const ultimoPedido =
        await Pedido.findOne()
          .sort({
            fecha: -1
          });

      let nuevoNumero = 1;

      if (
        ultimoPedido &&
        ultimoPedido.nropedido
      ) {

        nuevoNumero =

          Number(
            ultimoPedido.nropedido
          ) + 1;
      }

      /* ARMAR ITEMS */

      const itemsPedido =
        items.map(item => ({

          productoId:
            item.productoId,

          nombre:
            item.nombre,

          peso:
            item.peso,

          precio:
            item.precio,

          cantidad:
            item.cantidad,

          subtotal:
            Number(item.precio) *
            Number(item.cantidad)
        }));

      const total =
        subtotal +
        Number(envio || 0);

      /* CREAR PEDIDO */

      const pedido =
        new Pedido({

          nropedido:
            String(nuevoNumero),

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

      await pedido.save();

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