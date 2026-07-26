const mongoose = require('mongoose');

const configuracionSchema = new mongoose.Schema({

  nombreTienda: {
    type: String,
    default: ''
  },

  descripcion: {
    type: String,
    default: ''
  },

  notaHeader: {
    type: String,
    default: ''
  },

  telefonoWhatsapp: {
    type: String,
    default: ''
  },

  instagram: {
    type: String,
    default: ''
  },

  facebook: {
    type: String,
    default: ''
  },

  envioGratisDesde: {
    type: Number,
    default: 0
  },

  costoEnvio: {
    type: Number,
    default: 0
  },

  nropedido: {
    type: Number,
    default: 1000
  },

  // Los agregaremos más adelante cuando migremos el login
  adminUser: {
    type: String,
    default: ''
  },

  adminPassword: {
    type: String,
    default: ''
  }

});

module.exports = mongoose.model(
  'Configuracion',
  configuracionSchema,
  'configuracion'
);