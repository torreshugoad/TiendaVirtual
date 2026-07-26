export const PRODUCTO_INICIAL = {

  nombre: '',

  foto: '',

  categoria: '',

  descripcion: '',

  orden: 0,

  tipoStock: 'unidad',

  stockGranelKg: 0,

  variantes: []

};

export const VARIANTE_INICIAL = {

  peso: '',

  precio: 0,

  stock: 0,

  equivalenciaKg: 0

};

export const TIPOS_STOCK = [

  {

    value: 'unidad',

    label: 'Por unidad'

  },

  {

    value: 'granel',

    label: 'A granel'

  }

];