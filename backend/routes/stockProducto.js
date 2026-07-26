const express = require('express');

const router = express.Router();

const Producto =
  require('../models/Producto');

function buscarVariante(
  producto,
  peso
) {

  return producto.variantes.find(

    v =>

      v.peso
        ?.trim()
        .toLowerCase() ===

      peso
        ?.trim()
        .toLowerCase()
  );
}

/* ==========================
   Cuántos gramos de un producto componente ya están
   reservados por el resto del carrito (líneas sueltas
   de ese producto + otros combos que también lo usen),
   EXCLUYENDO la línea del combo que estamos evaluando
   (para poder calcular cuánto más admite esa línea).
========================== */

async function gramosReservadosParaComponente(

  carrito,
  idComponente,
  idComboAExcluir,
  productosCache

) {

  let total = 0;

  for (const item of carrito) {

    if (

      String(item.productoId) ===

      String(idComboAExcluir)

    ) {

      continue;
    }

    let prod =
      productosCache[item.productoId];

    if (!prod) {

      prod =
        await Producto.findById(
          item.productoId
        );

      productosCache[item.productoId] =
        prod;
    }

    if (!prod) {

      continue;
    }

    if (

      prod.tipoStock === 'granel' &&

      String(item.productoId) ===
        String(idComponente)

    ) {

      const variante =
        buscarVariante(
          prod,
          item.peso
        );

      if (variante) {

        total +=

          Number(item.cantidad || 0) *

          Number(variante.equivalencia || 0);
      }

      continue;
    }

    if (prod.tipoStock === 'combo') {

      const comp =
        (prod.componentes || []).find(

          c =>

            String(c.productoId) ===
            String(idComponente)

        );

      if (comp) {

        total +=

          Number(comp.cantidadGramos || 0) *

          Number(item.cantidad || 0);
      }
    }
  }

  return total;
}

router.post(
  '/',
  async (req, res) => {

    try {

      const {

        productoId,

        peso,

        carrito

      } = req.body;

      if (!productoId) {

        return res.status(400).json({

          error:
            'Datos incompletos'

        });

      }

      const producto =
        await Producto.findById(
          productoId
        );

      if (!producto) {

        return res.status(404).json({

          error:
            'Producto no encontrado'

        });

      }

      const carritoArray =
        Array.isArray(carrito)

          ? carrito

          : [];

      /* ==========================
         COMBO: no tiene variante propia,
         se calcula en base a sus
         componentes.
      ========================== */

      if (producto.tipoStock === 'combo') {

        if (

          !producto.componentes ||

          producto.componentes.length === 0

        ) {

          return res.status(400).json({

            error:
              'Combo sin componentes configurados'

          });

        }

        const productosCache = {};

        let stockDisponible = Infinity;

        for (const componente of producto.componentes) {

          const productoComponente =
            await Producto.findById(
              componente.productoId
            );

          if (!productoComponente) {

            return res.status(404).json({

              error:
                'Componente del combo no encontrado'

            });

          }

          const gramosReservados =

            await gramosReservadosParaComponente(

              carritoArray,

              componente.productoId,

              productoId,

              productosCache

            );

          const stockRestante =

            Number(
              productoComponente.stockGranel || 0
            ) - gramosReservados;

          const alcanzaPara =

            Math.floor(

              Math.max(
                stockRestante,
                0
              ) /

              Number(
                componente.cantidadGramos || 1
              )

            );

          stockDisponible =

            Math.min(
              stockDisponible,
              alcanzaPara
            );
        }

        return res.json({

          stock: stockDisponible

        });
      }

      /* ==========================
         GRANEL / UNIDAD: como antes,
         se busca la variante por peso.
      ========================== */

      if (!peso) {

        return res.status(400).json({

          error:
            'Datos incompletos'

        });

      }

      const variante =
        buscarVariante(
          producto,
          peso
        );

      if (!variante) {

        return res.status(404).json({

          error:
            'Variante no encontrada'

        });

      }

      let stockDisponible = 0;

      if (

        producto.tipoStock ===

        'granel'

      ) {

        // Gramos que ya están reservados por OTRAS variantes de
        // este mismo producto en el carrito (ej. si ya tengo
        // "100Gr" cargado y estoy por sumar "250Gr", acá se
        // descuenta lo que ya pide la línea de 100Gr).

        const gramosOtrasVariantes =

          carritoArray

            .filter(item =>

              item.productoId ===
                productoId &&

              item.peso
                ?.trim()
                .toLowerCase() !==

                peso
                  ?.trim()
                  .toLowerCase()
            )

            .reduce(
              (acc, item) => {

                const varianteItem =
                  buscarVariante(
                    producto,
                    item.peso
                  );

                if (!varianteItem) {

                  return acc;
                }

                return (

                  acc +

                  Number(
                    item.cantidad || 0
                  ) *

                  Number(
                    varianteItem.equivalencia || 0
                  )
                );
              },
              0
            );

        const stockRestante =

          Number(
            producto.stockGranel || 0
          ) - gramosOtrasVariantes;

        stockDisponible =

          Math.floor(

            Math.max(
              stockRestante,
              0
            ) /

            Number(
              variante.equivalencia || 1
            )

          );

      } else {

        stockDisponible =

          Number(

            variante.stock || 0

          );

      }

      res.json({

        stock: stockDisponible

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        error:
          'Error obteniendo stock'

      });

    }

  }

);

module.exports = router;
