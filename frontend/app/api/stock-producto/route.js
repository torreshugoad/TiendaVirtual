import { NextResponse } from 'next/server';

import { ObjectId } from 'mongodb';

import clientPromise from '@/lib/mongodb';

export async function POST(req) {

  try {

    const body = await req.json();

    const {
      productoId,
      peso
    } = body;

    console.log('BODY:', body);

    /* =========================
       VALIDACIONES
    ========================= */

    if (
      !productoId ||
      !peso
    ) {

      return NextResponse.json(
        {
          error:
            'Datos incompletos'
        },
        {
          status: 400
        }
      );
    }

    if (
      !ObjectId.isValid(
        productoId
      )
    ) {

      return NextResponse.json(
        {
          error:
            'Producto inválido'
        },
        {
          status: 400
        }
      );
    }

    /* =========================
       CONEXION DB
    ========================= */

    const client =
      await clientPromise;

    const db =
      client.db('Tienda');

    /* =========================
       BUSCAR PRODUCTO
    ========================= */

    const producto =
      await db
        .collection('productos')
        .findOne({
          _id:
            new ObjectId(
              productoId
            )
        });

    if (!producto) {

      return NextResponse.json(
        {
          error:
            'Producto no encontrado'
        },
        {
          status: 404
        }
      );
    }

    /* =========================
       BUSCAR VARIANTE
    ========================= */

    const variante =
      producto.variantes?.find(
        v =>

          v.peso
            ?.toLowerCase()
            .replace(/\s/g, '') ===

          peso
            ?.toLowerCase()
            .replace(/\s/g, '')
      );

    if (!variante) {

      return NextResponse.json(
        {
          error:
            'Variante no encontrada'
        },
        {
          status: 404
        }
      );
    }

    /* =========================
       CALCULAR STOCK
    ========================= */

    let stockDisponible = 0;

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
          Number(texto) / 1000;
      }

      if (
        kgNecesarios <= 0
      ) {

        stockDisponible = 0;

      } else {

        stockDisponible =
          Math.floor(

            Number(
              producto.stockGranelKg || 0
            ) / kgNecesarios
          );
      }

    } else {

      stockDisponible =
        Number(
          variante.stock || 0
        );
    }

    /* =========================
       RESPUESTA
    ========================= */

    return NextResponse.json({
      stock: stockDisponible
    });

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