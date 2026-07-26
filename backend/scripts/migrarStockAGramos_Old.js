require('dotenv').config();

const mongoose = require('mongoose');

const Producto = require('../models/Producto');

/* ===============================
   Convierte el texto del peso
   a gramos enteros
================================ */

function calcularEquivalencia(peso) {

  if (!peso) return 0;

  const texto =
    peso
      .toLowerCase()
      .replace(',', '.')
      .replace(/\s/g, '');

  if (texto.endsWith('kg')) {

    return Math.round(

      parseFloat(
        texto.replace('kg', '')
      ) * 1000

    );

  }

  if (texto.endsWith('gr')) {

    return Math.round(

      parseFloat(
        texto.replace('gr', '')
      )

    );

  }

  return 0;

}

/* ===============================
   Migración
================================ */

async function migrar() {

  await mongoose.connect(

    process.env.MONGODB_URI

  );

  console.log('');
  console.log('=================================');
  console.log(' Migrando stock a gramos');
  console.log('=================================');
  console.log('');

  const productos =
    await Producto.find();

  let modificados = 0;

  for (const producto of productos) {

    let cambios = false;

    console.log(
      `Producto: ${producto.nombre}`
    );

    /* ==========================
       STOCK A GRANEL
    ========================== */

    if (
      producto.tipoStock === 'granel'
    ) {

      if (

        producto.stockGranel == null &&

        producto.stockGranelKg != null

      ) {

        producto.stockGranel =

          Math.round(

            Number(
              producto.stockGranelKg
            ) * 1000

          );

        console.log(

          `  Stock: ${producto.stockGranelKg} Kg -> ${producto.stockGranel} g`

        );

        cambios = true;

      }

    }

    /* ==========================
       VARIANTES
    ========================== */

    for (const variante of producto.variantes) {

      const nuevaEquivalencia =

        calcularEquivalencia(
          variante.peso
        );

      if (

        variante.equivalencia !==
        nuevaEquivalencia

      ) {

        console.log(

          `  ${variante.peso}: ${variante.equivalencia || '-'} -> ${nuevaEquivalencia} g`

        );

        variante.equivalencia =
          nuevaEquivalencia;

        cambios = true;

      }

    }

    if (cambios) {

      await producto.save();

      modificados++;

      console.log(
        '  ✓ Guardado'
      );

    } else {

      console.log(
        '  Sin cambios'
      );

    }

    console.log('');

  }

  console.log('=================================');

  console.log(
    `Productos modificados: ${modificados}`
  );

  console.log(
    `Total productos: ${productos.length}`
  );

  console.log('=================================');

  await mongoose.disconnect();

}

migrar()

  .then(() => {

    console.log('');
    console.log('Migración finalizada.');
    process.exit(0);

  })

  .catch(error => {

    console.error(error);

    process.exit(1);

  });