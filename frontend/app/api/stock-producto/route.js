import { NextResponse } from 'next/server';

import { ObjectId } from 'mongodb';

import clientPromise from '../../../lib/mongodb';

export async function POST(req) {

  try {

    const body =
      await req.json();

    const { carrito } =
      body;

    if (
      !Array.isArray(carrito)
    ) {

      return NextResponse.json(
        {
          error:
            'Carrito inválido'
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

    for (const item of carrito) {

      const producto =
        await db
          .collection('productos')
          .findOne({
            _id:
              new ObjectId(
                item.productoId
              )
          });

      if (!producto) {

        return NextResponse.json(
          {
            error:
              `Producto no encontrado`
          },
          {
            status: 404
          }
        );
      }

      const variante =
        producto.variantes?.find(
          v =>
            v.peso === item.peso
        );

      if (!variante) {

        return NextResponse.json(
          {
            error:
              `Variante no encontrada`
          },
          {
            status: 404
          }
        );
      }

      let stockDisponible = 0;

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
        }

        stockDisponible =
          Math.floor(

            Number(
              producto.stockGranelKg || 0
            ) / kgNecesarios
          );

      } else {

        stockDisponible =
          Number(
            variante.stock || 0
          );
      }

      if (
        Number(item.cantidad) >
        stockDisponible
      ) {

        return NextResponse.json(
          {
            error:
              `Sin stock para ${item.nombre}`
          },
          {
            status: 400
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
          'Error verificando stock'
      },
      {
        status: 500
      }
    );
  }
}