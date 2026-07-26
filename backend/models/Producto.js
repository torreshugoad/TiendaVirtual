const mongoose = require('mongoose');

const varianteSchema = new mongoose.Schema({

  peso: {
    type: String,
    required: true
  },

  /*
    Equivalencia en gramos.
    Ejemplos:
    25 Gr  -> 25
    50 Gr  -> 50
    100 Gr -> 100
    250 Gr -> 250
    500 Gr -> 500
    1 Kg   -> 1000
  */

  equivalencia: {
    type: Number,
    required: true,
    min: 1
  },

  precio: {
    type: Number,
    default: 0
  },

  // Solo se utiliza cuando
  // tipoStock === 'unidad'

  stock: {
    type: Number,
    default: 0
  },

  // Umbral para la alerta de "stock bajo" en el dashboard

  stockMinimo: {
    type: Number,
    default: 5,
    min: 0
  }

});

const productoSchema = new mongoose.Schema({

  nombre: {
    type: String,
    required: true
  },

  descripcion: {
    type: String,
    default: ''
  },

  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: true
  },

  foto: {
    type: String,
    default: ''
  },

  orden: {
    type: Number,
    default: 0
  },

  // Permite ocultar el producto del catálogo público sin
  // borrarlo (ej. descontinuado, fuera de temporada, o una
  // oferta que ya venció).

  activo: {
    type: Boolean,
    default: true
  },

  tipoStock: {
    type: String,
    enum: [
      'unidad',
      'granel',
      'combo'
    ],
    default: 'unidad'
  },

  /*
    Solo se usa cuando tipoStock === 'combo'.
    Es el precio de oferta fijo del combo (no se
    calcula sumando los componentes).
  */

  precioCombo: {
    type: Number,
    default: 0
  },

  /*
    Solo se usa cuando tipoStock === 'combo'.
    Cada componente apunta a un producto A GRANEL
    ya existente, y cuánto se descuenta de SU stock
    (en gramos) por cada combo vendido.

    Ejemplo: Combo Desayuno = 100gr de "Avena" +
    100gr de "Semillas de zapallo" + 100gr de "Pasas".
    Al vender 1 combo, se descuentan 100gr de cada uno.
  */

  componentes: [{

    productoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto'
    },

    cantidadGramos: {
      type: Number,
      min: 1
    }

  }],

  /*
    Stock total del producto
    expresado SIEMPRE en gramos.

    Ejemplo:

    2 Kg    => 2000
    1.75 Kg => 1750
    500 Gr  => 500
  */

  stockGranel: {
    type: Number,
    default: 0,
    min: 0
  },

  /*
    Umbral para la alerta de "stock bajo"
    en productos a granel, expresado SIEMPRE
    en gramos (misma convención que stockGranel).

    Default: 2000 => equivale a 2 Kg
  */

  stockMinimoGranel: {
    type: Number,
    default: 2000,
    min: 0
  },

  variantes: [varianteSchema]

});

module.exports =
  mongoose.model(
    'Producto',
    productoSchema
  );