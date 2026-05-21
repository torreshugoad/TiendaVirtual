/* /frontend/app/api/admin/stock/route.js */

import { NextResponse } from 'next/server';

import { ObjectId } from 'mongodb';

import clientPromise from '../../../../lib/mongodb';

/* =========================
   GET
========================= */

export async function GET() {

  try {

    const client =
      await clientPromise;

    const db =
      client.db('Tienda');

    const productos =
      await db
        .collection('productos')
        .find({})
        .toArray();

    const categorias =
      await db
        .collection('categorias')
        .find({})
        .toArray();

    const filas = [];

    for (const producto of productos) {

let categoriaId = null;

if (
  producto.categoria
) {

  if (
    typeof producto.categoria ===
    'object'
  ) {

    categoriaId =
      producto.categoria._id ||
      producto.categoria;

  } else {

    categoriaId =
      producto.categoria;
  }
}

const categoria =
  categorias.find(
    cat =>
      String(cat._id) ===
      String(categoriaId)
  );

      for (
        const variante of
        producto.variantes || []
      ) {

        let stock = 0;

        /* =========================
           STOCK GRANEL
        ========================= */

        if (
          producto.tipoStock ===
          'granel'
        ) {

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

          } else {

            kgNecesarios =
              Number(texto) /
              1000;
          }

          stock = Math.floor(

            Number(
              producto.stockGranelKg ||
              0
            ) / kgNecesarios
          );

        } else {

          /* =========================
             STOCK NORMAL
          ========================= */

          stock = Number(
            variante.stock || 0
          );
        }

        filas.push({

          productoId:
            producto._id,

          varianteId:
            variante._id,

          producto:
            producto.nombre,

          categoria:
            categoria?.nombre ||
            'Sin categoría',

          peso:
            variante.peso,

          precio:
            variante.precio,

          stock,

stockGranelKg:
  Number(
    producto.stockGranelKg || 0
  ),

          tipoStock:
            producto.tipoStock ||
            'unidad'
        });
      }
    }

    return NextResponse.json(
      filas
    );

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          'Error obteniendo stock'
      },
      {
        status: 500
      }
    );
  }
}

/* =========================
   PUT
========================= */

export async function PUT(req) {

  try {

    const body =
      await req.json();

    const { filas } = body;

    if (
      !Array.isArray(filas)
    ) {

      return NextResponse.json(
        {
          error:
            'Filas inválidas'
        },
        {
          status: 400
        }
      );
    }

    const client =
      await clientPromise;

    const db =
      client.db('Tienda');

    for (const fila of filas) {

      const producto =
        await db
          .collection('productos')
          .findOne({
            _id: new ObjectId(
              fila.productoId
            )
          });

      if (!producto) {

        continue;
      }

      const variantes =
        producto.variantes.map(
          variante => {

            if (

              String(
                variante._id
              ) ===
              String(
                fila.varianteId
              )
            ) {

              return {

                ...variante,

                precio:
                  Number(
                    fila.precio
                  ),

                stock:
                  Number(
                    fila.stock
                  )
              };
            }

            return variante;
          }
        );

      /* =========================
         PRODUCTOS GRANEL
      ========================= */

      if (
        producto.tipoStock ===
        'granel'
      ) {

        let kgNecesarios = 0;

        const texto =
          fila.peso
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

        } else {

          kgNecesarios =
            Number(texto) /
            1000;
        }

const stockKg =
  Number(
    fila.stockGranelKg || 0
  );

        await db
          .collection('productos')
          .updateOne(
            {
              _id:
                producto._id
            },
            {
              $set: {
                variantes,
                stockGranelKg:
                  stockKg
              }
            }
          );

      } else {

        /* =========================
           PRODUCTOS NORMALES
        ========================= */

        await db
          .collection('productos')
          .updateOne(
            {
              _id:
                producto._id
            },
            {
              $set: {
                variantes
              }
            }
          );
      }
    }

    return NextResponse.json({
      ok: true
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          'Error guardando stock'
      },
      {
        status: 500
      }
    );
  }
}