'use client';

import {

  useEffect,
  useMemo,
  useState

} from 'react';

export default function useHome() {

  /* ==========================
     ESTADOS
  ========================== */

  const [

    productos,

    setProductos

  ] = useState([]);

  const [

    categorias,

    setCategorias

  ] = useState([]);

  const [

    categoriaSeleccionada,

    setCategoriaSeleccionada

  ] = useState(null);

  const [

    cargandoProductos,

    setCargandoProductos

  ] = useState(false);

  const [

    carrito,

    setCarrito

  ] = useState([]);

  const [

    mounted,

    setMounted

  ] = useState(false);

  const [

    busqueda,

    setBusqueda

  ] = useState('');

  const [

    configuracion,

    setConfiguracion

  ] = useState({

    nombreTienda:
      'Superbien',

    descripcionTienda:
      'Tienda de productos saludables',

    notaHeader: ''

  });

  /* ==========================
     MOUNT
  ========================== */

  useEffect(() => {

    setMounted(true);

  }, []);

  /* ==========================
     CONFIGURACION
  ========================== */

  useEffect(() => {

    obtenerConfiguracion();

  }, []);

  /* ==========================
     CATEGORIAS
  ========================== */

  useEffect(() => {

    obtenerCategorias();

  }, []);

  /* ==========================
     CONFIGURACION
  ========================== */

  async function obtenerConfiguracion() {

    try {

      const res = await fetch(

        `${process.env.NEXT_PUBLIC_API_URL}/api/configuracion`,

        {

          cache: 'no-store'

        }

      );

      const data =

        await res.json();

      const config =

        Array.isArray(data)

          ? data[0]

          : data;

      if (config) {

        setConfiguracion({

          nombreTienda:

            config.nombreTienda ||

            'Superbien',

          descripcionTienda:

            config.descripcionTienda ||

            '',

          notaHeader:

            config.notaHeader ||

            ''

        });

      }

    } catch (error) {

      console.log(error);

    }

  }

  /* ==========================
     CATEGORIAS
  ========================== */

  async function obtenerCategorias() {

    try {

      const res = await fetch(

        `${process.env.NEXT_PUBLIC_API_URL}/api/categorias`,

        {

          cache: 'no-store'

        }

      );

      const data =

        await res.json();

      setCategorias(

        Array.isArray(data)

          ? data

          : []

      );

    } catch (error) {

      console.log(error);

    }

  }

  /* ==========================
     PRODUCTOS
  ========================== */

  async function seleccionarCategoria(

    categoria

  ) {

    setCategoriaSeleccionada(

      categoria

    );

    setCargandoProductos(true);

    try {

      const res = await fetch(

`${process.env.NEXT_PUBLIC_API_URL}/api/productos/categoria/${categoria._id}`,

        {

          cache: 'no-store'

        }

      );

      const data =

        await res.json();

      setProductos(

        Array.isArray(data)

          ? data

          : []

      );

    } catch (error) {

      console.log(error);

    } finally {

      setCargandoProductos(false);

    }

  }

  function volverCategorias() {

    setCategoriaSeleccionada(

      null

    );

    setProductos([]);

  }

  /* ==========================
     STOCK
  ========================== */

  function calcularStockDisponible(

    producto,

    variante

  ) {

    if (

      producto.tipoStock !== 'granel'

    ) {

      return Number(

        variante.stock || 0

      );

    }
