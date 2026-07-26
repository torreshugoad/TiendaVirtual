require('dotenv').config();

const mongoose = require('mongoose');
const Producto = require('../models/Producto');

async function main() {

  await mongoose.connect(process.env.MONGO_URI);

  console.log('Conectado a Mongo');

  // Productos a granel sin stockMinimoGranel declarado
  const resultadoGranel = await Producto.updateMany(
    { stockMinimoGranel: { $exists: false } },
    { $set: { stockMinimoGranel: 2000 } } // 2 Kg en gramos
  );

  console.log(
    `stockMinimoGranel actualizado en ${resultadoGranel.modifiedCount} productos`
  );

  // Variantes sin stockMinimo declarado
  const resultadoVariantes = await Producto.updateMany(
    { 'variantes.stockMinimo': { $exists: false } },
    { $set: { 'variantes.$[].stockMinimo': 5 } }
  );

  console.log(
    `stockMinimo actualizado en ${resultadoVariantes.modifiedCount} productos`
  );

  await mongoose.disconnect();

  console.log('Listo');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});