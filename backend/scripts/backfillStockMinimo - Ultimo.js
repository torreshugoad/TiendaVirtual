require('dotenv').config();

const mongoose = require('mongoose');
const Producto = require('../models/Producto');

async function main() {

  await mongoose.connect(process.env.MONGO_URI);

  console.log('Conectado a Mongo');

  // Solo productos A GRANEL sin stockMinimoGranel
  const resultadoGranel = await Producto.updateMany(
    {
      tipoStock: 'granel',
      stockMinimoGranel: { $exists: false }
    },
    { $set: { stockMinimoGranel: 2000 } } // 2 Kg en gramos
  );

  console.log(
    `stockMinimoGranel actualizado en ${resultadoGranel.modifiedCount} productos a granel`
  );

  // Solo variantes de productos POR UNIDAD sin stockMinimo
  const productosUnidad = await Producto.find({
    tipoStock: 'unidad',
    'variantes.stockMinimo': { $exists: false }
  });

  let variantesActualizadas = 0;

  for (const producto of productosUnidad) {
    let cambio = false;

    producto.variantes.forEach((v) => {
      if (v.stockMinimo === undefined) {
        v.stockMinimo = 5;
        cambio = true;
        variantesActualizadas++;
      }
    });

    if (cambio) {
      await producto.save();
    }
  }

  console.log(
    `stockMinimo agregado en ${variantesActualizadas} variantes (productos por unidad)`
  );

  await mongoose.disconnect();

  console.log('Listo');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});