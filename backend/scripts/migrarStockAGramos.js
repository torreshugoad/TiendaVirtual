require('dotenv').config();

const mongoose = require('mongoose');

const Producto = require('../models/Producto');

/* ===============================
   Convierte el texto del peso
   a gramos enteros (fallback si
   la variante no tiene equivalenciaKg)
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
      parseFloat(texto.replace('kg', '')) * 1000
    );

  }

  if (texto.endsWith('gr')) {

    return Math.round(
      parseFloat(texto.replace('gr', ''))
    );

  }

  return 0;

}

/* ===============================
   Migración
================================ */

async function migrar() {

  await mongoose.connect(process.env.MONGO_URI);

  console.log('');
  console.log('=================================');
  console.log(' Migrando stock/equivalencia a gramos');
  console.log('=================================');
  console.log('');

  const productos = await Producto.find();

  let modificados = 0;

  for (const producto of productos) {

    let cambios = false;
    let debeBorrarStockGranelKg = false;
    let debeBorrarEquivalenciaKg = false;

    console.log(`Producto: ${producto.nombre}`);

    /* ==========================
       STOCK A GRANEL
    ========================== */

    if (producto.tipoStock === 'granel') {

      if (producto.stockGranelKg != null) {

        const nuevoStock = Math.round(
          Number(producto.stockGranelKg) * 1000
        );

        console.log(
          `  Stock: ${producto.stockGranelKg} Kg -> ${nuevoStock} g`
        );

        producto.stockGranel = nuevoStock;
        cambios = true;
        debeBorrarStockGranelKg = true;

      }

    }

    /* ==========================
       VARIANTES
    ========================== */

    for (const variante of producto.variantes) {

      let nuevaEquivalencia;

      // Prioridad: si existe equivalenciaKg, usarla directamente x1000
      if (variante.equivalenciaKg != null) {

        nuevaEquivalencia = Math.round(
          Number(variante.equivalenciaKg) * 1000
        );

        debeBorrarEquivalenciaKg = true;

      } else {

        // Fallback: parsear el texto de "peso"
        nuevaEquivalencia = calcularEquivalencia(variante.peso);

      }

      if (variante.equivalencia !== nuevaEquivalencia) {

        console.log(
          `  ${variante.peso}: ${variante.equivalencia || '-'} -> ${nuevaEquivalencia} g`
        );

        variante.equivalencia = nuevaEquivalencia;
        cambios = true;

      }

    }

    if (cambios) {

      await producto.save();
      modificados++;
      console.log('  ✓ Guardado');

    } else {

      console.log('  Sin cambios');

    }

    /* ==========================
       BORRAR CAMPOS VIEJOS
    ========================== */

    if (debeBorrarStockGranelKg || debeBorrarEquivalenciaKg) {

      const unset = {};

      if (debeBorrarStockGranelKg) {
        unset.stockGranelKg = '';
      }

      if (debeBorrarEquivalenciaKg) {
        unset['variantes.$[elem].equivalenciaKg'] = '';
      }

      await Producto.collection.updateOne(
        { _id: producto._id },
        { $unset: unset },
        debeBorrarEquivalenciaKg
          ? { arrayFilters: [{ 'elem.equivalenciaKg': { $exists: true } }] }
          : {}
      );

      console.log('  ✓ Campos viejos borrados');

    }

    console.log('');

  }

  console.log('=================================');
  console.log(`Productos modificados: ${modificados}`);
  console.log(`Total productos: ${productos.length}`);
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
