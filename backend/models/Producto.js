const mongoose =
  require('mongoose');

const varianteSchema =
  new mongoose.Schema({

    peso: {
      type: String,
      required: true
    },

    precio: {
      type: Number,
      required: true
    },

    stock: {
      type: Number,
      default: 0
    },

    equivalenciaKg: {
      type: Number,
      default: 0
    }

  });

const productoSchema =
  new mongoose.Schema({

    nombre: {
      type: String,
      required: true
    },

    foto: {
      type: String,
      default: ''
    },

    categoria: {

      type:
        mongoose.Schema.Types.ObjectId,

      ref: 'Categoria'

    },

  orden: {
    type: Number,
    default: 99
  },

    descripcion: {
      type: String,
      default: ''
    },

    tipoStock: {

      type: String,

      enum: [
        'granel',
        'unidad'
      ],

      default: 'unidad'

    },

    stockGranelKg: {

      type: Number,

      default: 0

    },

    variantes: [

      varianteSchema

    ]

  });

module.exports =
  mongoose.model(
    'Producto',
    productoSchema
  );