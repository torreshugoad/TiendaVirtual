const express = require('express');

const router = express.Router();

const Producto =
  require('../models/Producto');

router.post(
  '/',
  async (req, res) => {

    try {

      const { carrito } =
        req.body;

      if (
        !Array.isArray(carrito)
      ) {

        return res.status(400).json({

          error:
            'Carrito inválido'

        });

      }

      // Cache de productos ya consultados: evita pedirlos de nuevo
      // y permite sumar el consumo de varias líneas del carrito
      // que pertenecen al mismo producto granel.

      const productosCache = {};

      // Gramos pedidos por producto (solo aplica a productos granel,
      // donde varias variantes -100Gr, 250Gr, etc.- descuentan del
      // mismo pool de stock).

      const gramosPedidosPorProducto = {};

      for (const item of carrito) {

        let producto =
          productosCache[item.productoId];

        if (!producto) {

          producto =
            await Producto.findById(
              item.productoId
            );

          productosCache[item.productoId] =
            producto;
        }

        if (!producto) {

          return res.status(404).json({

            error:
              `Producto no encontrado: ${item.nombre}`

          });

        }

        /* ==========================
           COMBO: no tiene variante propia.
           Se explota en sus componentes y
           se suma a la misma bolsa de
           gramos por producto.
        ========================== */

        if (
          producto.tipoStock ===
          'combo'
        ) {

          if (
            !producto.componentes ||
            producto.componentes.length === 0
          ) {

            return res.status(400).json({

              error:
                `${producto.nombre} no tiene componentes configurados`

            });

          }

          for (const componente of producto.componentes) {

            const idComponente =
              String(componente.productoId);

            let productoComponente =
              productosCache[idComponente];

            if (!productoComponente) {

              productoComponente =
                await Producto.findById(
                  idComponente
                );

              productosCache[idComponente] =
                productoComponente;
            }

            if (!productoComponente) {

              return res.status(404).json({

                error:
                  `Componente no encontrado en ${producto.nombre}`

              });

            }

            const gramosNecesarios =

              Number(
                componente.cantidadGramos || 0
              ) *

              Number(item.cantidad || 0);

            gramosPedidosPorProducto[
              idComponente
            ] =

              (
                gramosPedidosPorProducto[
                  idComponente
                ] || 0
              ) + gramosNecesarios;
          }

          continue;
        }

        const variante =
          producto.variantes.find(

            v =>

              v.peso === item.peso

          );

        if (!variante) {

          return res.status(404).json({

            error:
              `Variante no encontrada: ${item.peso}`

          });

        }

        /* ==========================
           GRANEL: se acumula, no se
           valida línea por línea.
        ========================== */

        if (
          producto.tipoStock ===
          'granel'
        ) {

          const gramosLinea =

            Number(
              item.cantidad || 0
            ) *

            Number(
              variante.equivalencia || 0
            );

          gramosPedidosPorProducto[
            item.productoId
          ] =

            (
              gramosPedidosPorProducto[
                item.productoId
              ] || 0
            ) + gramosLinea;

          continue;
        }

        /* ==========================
           POR UNIDAD: sigue siendo
           por variante, cada una
           tiene su propio stock.
        ========================== */

        const stockDisponible =

          Number(
            variante.stock || 0
          );

        if (

          Number(item.cantidad) >

          stockDisponible

        ) {

          return res.status(400).json({

            error:

              `Stock insuficiente para ${item.nombre} ${item.peso}`

          });

        }
      }

      /* ==========================
         Ahora sí: validamos el total
         pedido por producto granel,
         una sola vez por producto,
         contra el stock real en gramos.
      ========================== */

      for (const productoId of Object.keys(gramosPedidosPorProducto)) {

        const producto =
          productosCache[productoId];

        const gramosPedidos =
          gramosPedidosPorProducto[productoId];

        const stockGramos =

          Number(
            producto.stockGranel || 0
          );

        if (gramosPedidos > stockGramos) {

          return res.status(400).json({

            error:

              `Stock insuficiente para ${producto.nombre}`

          });

        }
      }

      res.json({

        ok: true

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        error:
          'Error verificando stock'

      });

    }

  }

);

module.exports = router;
