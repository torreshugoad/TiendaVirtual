const mongoose =
  require('mongoose');

const categoriaSchema =
  new mongoose.Schema({

    nombre: {
      type: String,
      required: true
    },

    imagen: {
      type: String,
      default: ''
    },

    descripcion: {
      type: String,
      default: ''
    },

    orden: {
      type: Number,
      default: 0
    },

    activa: {
      type: Boolean,
      default: true
    }

  });

module.exports =
  mongoose.model(
    'Categoria',
    categoriaSchema
  );