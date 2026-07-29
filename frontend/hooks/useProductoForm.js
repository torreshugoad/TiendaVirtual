'use client';

import { useState } from 'react';

const formularioInicial = {

  nombre: '',

  foto: '',

  categoria: '',

  descripcion: '',

  orden: 0,

  activo: true,

  tipoStock: 'unidad',

  // El usuario trabaja en Kg.
  // Mongo guarda gramos.

  stockGranel: 0,

  // Umbral de alerta de "bajo stock" para granel, también en Kg.

  stockMinimoGranel: 2,

  // Solo se usa cuando tipoStock === 'combo'.

  precioCombo: 0,

  componentes: [],

  variantes: []

};

export default function useProductoForm({

  guardarProducto,

  actualizarProducto

}) {

  const [formulario, setFormulario] =

    useState(formularioInicial);

  const [editandoId, setEditandoId] =

    useState(null);

  /* ==========================
     CAMPOS
  ========================== */

  function handleChange(e) {

    const {

      name,

      value,

      type,

      checked

    } = e.target;

    setFormulario(prev => ({

      ...prev,

      [name]:

        type === 'number'

          ? Number(value)

          : type === 'checkbox'

            ? checked

            : value

    }));

  }

  function actualizarCampo(

    campo,

    valor

  ) {

    setFormulario(prev => ({

      ...prev,

      [campo]: valor

    }));

  }

  /* ==========================
     VARIANTES
  ========================== */

  function agregarVariante() {

    setFormulario(prev => ({

      ...prev,

      variantes: [

        ...prev.variantes,

        {

          peso: '',

          precio: '',

          stock: '',

          stockMinimo: '',

          equivalencia: 0

        }

      ]

    }));

  }

  function actualizarVariante(

    index,

    cambios

  ) {

    setFormulario(prev => {

      const nuevas =

        [...prev.variantes];

      nuevas[index] = {

        ...nuevas[index],

        ...cambios

      };

      return {

        ...prev,

        variantes: nuevas

      };

    });

  }

  function eliminarVariante(

    index

  ) {

    setFormulario(prev => ({

      ...prev,

      variantes:

        prev.variantes.filter(

          (_, i) => i !== index

        )

    }));

  }

  /* ==========================
     COMPONENTES (COMBO)
  ========================== */

  function agregarComponente() {

    setFormulario(prev => ({

      ...prev,

      componentes: [

        ...prev.componentes,

        {

          productoId: '',

          cantidadGramos: 0

        }

      ]

    }));

  }

  function actualizarComponente(

    index,

    cambios

  ) {

    setFormulario(prev => {

      const nuevos =

        [...prev.componentes];

      nuevos[index] = {

        ...nuevos[index],

        ...cambios

      };

      return {

        ...prev,

        componentes: nuevos

      };

    });

  }

  function eliminarComponente(

    index

  ) {

    setFormulario(prev => ({

      ...prev,

      componentes:

        prev.componentes.filter(

          (_, i) => i !== index

        )

    }));

  }

  /* ==========================
     EDITAR
  ========================== */

  function cargarProducto(

    producto

  ) {

    setEditandoId(

      producto._id

    );

    setFormulario({

      nombre:

        producto.nombre ?? '',

      foto:

        producto.foto ?? '',

      categoria:

        producto.categoria?._id ??

        producto.categoria ??

        '',

      descripcion:

        producto.descripcion ?? '',

      orden:

        producto.orden ?? 0,

      activo:

        producto.activo ?? true,

      tipoStock:

        producto.tipoStock ??

        'unidad',

      // gramos → Kg

      stockGranel:

        Number(

          producto.stockGranel ?? 0

        ) / 1000,

      stockMinimoGranel:

        Number(

          producto.stockMinimoGranel ?? 2000

        ) / 1000,

      precioCombo:

        Number(

          producto.precioCombo ?? 0

        ),

      componentes:

        producto.componentes

          ? producto.componentes.map(c => ({

              productoId:

                typeof c.productoId === 'object'

                  ? c.productoId?._id

                  : c.productoId,

              cantidadGramos:

                c.cantidadGramos ?? 0

            }))

          : [],

      variantes:

        producto.variantes

          ? producto.variantes.map(v => ({

              peso:

                v.peso ?? '',

              precio:

                v.precio ?? '',

              stock:

                v.stock ?? '',

              stockMinimo:

                v.stockMinimo ?? '',

              equivalencia:

                v.equivalencia ?? 0

            }))

          : []

    });

  }

  /* ==========================
     LIMPIAR
  ========================== */

  function limpiar() {

    setFormulario(

      formularioInicial

    );

    setEditandoId(null);

  }

  /* ==========================
     GUARDAR
  ========================== */

  async function guardar() {

    const producto = {

      ...formulario,

      // Kg → gramos

      stockGranel:

        Math.round(

          Number(

            formulario.stockGranel || 0

          ) * 1000

        ),

      stockMinimoGranel:

        Math.round(

          Number(

            formulario.stockMinimoGranel || 0

          ) * 1000

        ),

      precioCombo:

        Math.round(

          Number(

            formulario.precioCombo || 0

          )

        ),

      componentes:

        formulario.componentes

          .filter(c => c.productoId)

          .map(c => ({

            productoId:
              c.productoId,

            cantidadGramos:

              Math.round(

                Number(
                  c.cantidadGramos || 0
                )

              )

          }))

    };

    let ok = false;

    if (editandoId) {

      ok =

        await actualizarProducto(

          editandoId,

          producto

        );

    } else {

      ok =

        await guardarProducto(

          producto

        );

    }

    if (ok) {

      limpiar();

    }

  }

  return {

    formulario,

    editandoId,

    handleChange,

    actualizarCampo,

    agregarVariante,

    actualizarVariante,

    eliminarVariante,

    agregarComponente,

    actualizarComponente,

    eliminarComponente,

    cargarProducto,

    guardar,

    limpiar,

    setFormulario

  };

}