const mongoose = require('mongoose');

const configuracionSchema =
  new mongoose.Schema({

    envioGratisDesde: Number,

    costoEnvio: Number,

    telefonoWhatsapp: String,

    nombreTienda: String,

nropedido: {
  type: Number,
  default: 1000
},

  });

module.exports =
  mongoose.model(
    'Configuracion',
    configuracionSchema,
    'configuracion'
  );