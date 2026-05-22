const mongoose =
  require('mongoose');

const categoriaSchema =
  new mongoose.Schema({

    nombre: {
      type: String,
      required: true,
      trim: true
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
      default: 0,
      index: true
    },

    activa: {
      type: Boolean,
      default: true,
      index: true
    }

  }, {
    timestamps: true
  });

/*
  Índice compuesto:
  mejora búsquedas tipo:
  find({ activa: true }).sort({ orden: 1 })
*/

categoriaSchema.index({
  activa: 1,
  orden: 1
});

module.exports =
  mongoose.model(
    'Categoria',
    categoriaSchema
  );