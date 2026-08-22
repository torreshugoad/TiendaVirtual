// Corre una sola vez: agrega margenMultiplicador y factorAjuste a las
// variantes existentes que NO los tengan guardados en la base.
//
// IMPORTANTE: no usamos Producto.find() + chequear "== null" porque Mongoose
// aplica los valores "default" del schema en memoria al leer un documento,
// aunque el campo no exista realmente en Mongo. Eso hace que parezca que ya
// está seteado en todos lados cuando en realidad nunca se persistió. Por eso
// filtramos directamente contra la base con $exists: false.
//
// Uso: node scripts/agregarMargenAVariantes.js
const mongoose = require('mongoose');
const Producto = require('../models/Producto');
require('dotenv').config();

const DEFAULT_MARGEN = 2.0;   // vender al doble del costo
const DEFAULT_FACTOR = 1.0;   // sin ajuste

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conectado a MongoDB');

  const resultadoMargen = await Producto.updateMany(
    {},
    { $set: { 'variantes.$[v].margenMultiplicador': DEFAULT_MARGEN } },
    { arrayFilters: [{ 'v.margenMultiplicador': { $exists: false } }] }
  );

  const resultadoFactor = await Producto.updateMany(
    {},
    { $set: { 'variantes.$[v].factorAjuste': DEFAULT_FACTOR } },
    { arrayFilters: [{ 'v.factorAjuste': { $exists: false } }] }
  );

  console.log(`margenMultiplicador agregado en ${resultadoMargen.modifiedCount} producto(s)`);
  console.log(`factorAjuste agregado en ${resultadoFactor.modifiedCount} producto(s)`);
  console.log('Listo.');
  process.exit(0);
}

run().catch(err => {
  console.error('Error en la migración:', err);
  process.exit(1);
});