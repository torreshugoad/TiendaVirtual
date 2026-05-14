const mongoose = require('mongoose');

const PedidoSchema =
  new mongoose.Schema({

    cliente: {
      type: String,
      required: true
    },

    telefono: {
      type: String,
      required: true
    },

    direccion: {
      type: String,
      default: ''
    },

    tipoEntrega: {
      type: String,
      required: true
    },

    envio: {
      type: Number,
      default: 0
    },

    items: [
      {
        productoId: String,

        nombre: String,

        foto: String,

        peso: String,

        precio: Number,

        cantidad: Number,

        subtotal: Number
      }
    ],

    subtotal: Number,

    total: Number,

    estado: {
      type: String,
      default: 'Pedido pendiente'
    },

    confirmacionEnviada: {
      type: Boolean,
      default: false
    },

    fecha: {
      type: Date,
      default: Date.now
    }

  });

module.exports =
  mongoose.model(
    'Pedido',
    PedidoSchema
  );