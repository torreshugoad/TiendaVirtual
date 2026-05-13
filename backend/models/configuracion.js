const mongoose = require('mongoose');

const configuracionSchema =
  new mongoose.Schema({

    envioGratisDesde: Number,

    costoEnvio: Number,

    telefonoWhatsapp: String,

    nombreTienda: String

  });

module.exports =
  mongoose.model(
    'Configuracion',
    configuracionSchema,
    'configuracion'
  );