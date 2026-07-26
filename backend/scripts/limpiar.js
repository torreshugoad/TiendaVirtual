// limpiar.js
require('dotenv').config();
const mongoose = require('mongoose');
const Producto = require('../models/Producto');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  await Producto.updateMany(
    { tipoStock: { $ne: 'granel' } },
    { $unset: { stockMinimoGranel: '' } }
  );

  await Producto.updateMany(
    { tipoStock: 'granel' },
    { $unset: { 'variantes.$[].stockMinimo': '' } }
  );

  console.log('Campos de más eliminados');

  await mongoose.disconnect();
}

main().catch(console.error);