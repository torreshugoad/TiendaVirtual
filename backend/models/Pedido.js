const mongoose = require('mongoose');

const PedidoSchema =
  new mongoose.Schema({

    nropedido: {
      type: String,
      required: true
    },

    // Identifica el carrito que originó el pedido. Es la clave
    // de idempotencia: si dos requests llegan con el mismo cartId
    // (dos pestañas, doble click, reintento de red), el índice
    // único de más abajo evita que se cree un segundo pedido.
    //
    // OJO: sin "required" a nivel de schema a propósito. Los
    // pedidos ya existentes no tienen cartId, y si algún otro
    // endpoint (ej. POST /api/pedidos) todavía crea pedidos sin
    // este campo, "required: true" acá rompería esos saves.
    // La validación de "cartId obligatorio" para el flujo de
    // checkout vive en la ruta /api/checkout, no acá.
    cartId: {
      type: String
    },

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

        peso: String,

        // Precio final por unidad, ya con el descuento aplicado
        // (es el que se usa para calcular subtotal/total).
        precio: Number,

        // Precio de lista antes de aplicar CUALQUIER descuento
        // (ni promoción ni manual).
        precioOriginal: Number,

        // ---- Promoción del producto (visible al cliente) ----
        // Porcentaje de producto.descuento vigente al momento de
        // la compra (snapshot, no se recalcula después).
        descuentoPromocion: {
          type: Number,
          default: 0
        },

        // Monto que restó la promoción, en pesos.
        montoPromocion: {
          type: Number,
          default: 0
        },

        // Precio resultante tras aplicar solo la promoción,
        // antes del descuento manual (si lo hubiera).
        precioConPromocion: Number,

        // ---- Descuento manual (carrito del vendedor) ----
        // 'porcentaje' | 'monto' | null (sin descuento manual).
        descuentoTipo: {
          type: String,
          enum: ['porcentaje', 'monto', null],
          default: null
        },

        // Valor cargado por el usuario (ej. 10 para "10%" o
        // "$10", según descuentoTipo).
        descuentoValor: {
          type: Number,
          default: 0
        },

        // Monto de descuento manual ya resuelto en pesos, aplicado
        // sobre precioConPromocion (precioConPromocion - descuentoMonto = precio).
        descuentoMonto: {
          type: Number,
          default: 0
        },

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

    fecha: {
      type: Date,
      default: Date.now
    }

  });

// Índice único PARCIAL: la regla de unicidad solo aplica a los
// documentos que tienen cartId. Los pedidos viejos (sin este
// campo) quedan afuera y no generan conflicto entre sí.
PedidoSchema.index(
  { cartId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      cartId: { $exists: true }
    }
  }
);

module.exports =
  mongoose.model(
    'Pedido',
    PedidoSchema
  );