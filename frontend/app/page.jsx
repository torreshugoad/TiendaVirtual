'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {

  const [productos, setProductos] =
    useState([]);

  const [categorias, setCategorias] =
    useState([]);

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

  /* CONFIGURACION */

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

  /* MOUNT */

  useEffect(() => {

    setMounted(true);

  }, []);

  /* CARGAR CONFIGURACION */

  useEffect(() => {

    obtenerConfiguracion();

  }, []);

  /* CARGAR CATEGORIAS */

  useEffect(() => {

    obtenerCategorias();

  }, []);

  /* CARGAR CARRITO */

  useEffect(() => {

    if (!mounted) return;

    const carritoGuardado =

      localStorage.getItem(
        'carrito'
      );

    if (carritoGuardado) {

      setCarrito(
        JSON.parse(carritoGuardado)
      );
    }

  }, [mounted]);

  /* GUARDAR CARRITO */

  useEffect(() => {

    if (!mounted) return;

    localStorage.setItem(
      'carrito',
      JSON.stringify(carrito)
    );

  }, [carrito, mounted]);

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

  async function obtenerCategorias() {

    try {

      const res = await fetch(

        `${process.env.NEXT_PUBLIC_API_URL}/api/categorias`,
        {
          cache: 'force-cache'
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

    let kgNecesarios = 0;

    const texto =
      variante.peso
        .toLowerCase()
        .replace(/\s/g, '');

    if (
      texto.includes('kg')
    ) {

      kgNecesarios =
        Number(
          texto.replace(
            'kg',
            ''
          )
        );

    } else if (
      texto.includes('gr')
    ) {

      kgNecesarios =

        Number(
          texto.replace(
            'gr',
            ''
          )
        ) / 1000;

    } else {

      kgNecesarios =
        Number(texto) / 1000;
    }

    if (kgNecesarios <= 0) {

      return 0;
    }

    return Math.floor(

      Number(
        producto.stockGranelKg || 0
      ) / kgNecesarios
    );
  }

  function agregarAlCarrito(
    producto,
    variante
  ) {

    const existe =
      carrito.find(

        item =>

          item.productoId ===
            producto._id &&

          item.peso ===
            variante.peso
      );

    if (existe) {

      const nuevoCarrito =
        carrito.map(item => {

          if (

            item.productoId ===
              producto._id &&

            item.peso ===
              variante.peso
          ) {

            return {

              ...item,

              cantidad:
                item.cantidad + 1
            };
          }

          return item;
        });

      setCarrito(
        nuevoCarrito
      );

    } else {

      setCarrito([

        ...carrito,

        {
          _id:
            producto._id,

          productoId:
            String(producto._id),

          nombre:
            producto.nombre,

          foto:
            producto.foto,

          peso:
            variante.peso,

          precio:
            variante.precio,

          cantidad: 1
        }
      ]);
    }
  }

  const cantidadCarrito =

    mounted

      ? carrito.reduce(
          (acc, item) =>
            acc + item.cantidad,
          0
        )

      : 0;

  return (

    <div
      style={{
        minHeight: '100vh',
        background: '#ffedaa',
        fontFamily:
          'Arial, sans-serif'
      }}
    >

      {/* HEADER */}

      <header
        style={{
          background:
            'hsl(146, 88%, 23%)',

          padding: '10px',

          boxShadow:
            '0 2px 8px rgba(0,0,0,0.08)',

          position: 'sticky',

          top: 0,

          zIndex: 100
        }}
      >

        <div
          style={{
            maxWidth: '900px',

            margin: '0 auto',

            display: 'flex',

            justifyContent:
              'space-between',

            alignItems: 'center',

            gap: '10px'
          }}
        >

          <div>

            <h1
              style={{
                margin: 0,

                fontFamily:
                  'Montserrat, sans-serif',

                fontSize: '36px',

                color: '#c4ffc3',

                lineHeight: 1
              }}
            >

              {
                configuracion
                  .nombreTienda
              }

            </h1>

            <p
              style={{
                margin:
                  '4px 0 0 0',

                fontSize: '14px',

                color: '#ffffff'
              }}
            >

              {
                configuracion
                  .descripcionTienda
              }

            </p>

          </div>

          {/* CARRITO */}

          <Link
            href="/cart"
            style={{
              textDecoration:
                'none'
            }}
          >

            <button
              style={{
                background:
                  '#c2410c',

                color:
                  '#ffffff',

                border:
                  'none',

                padding:
                  '14px 18px',

                borderRadius:
                  '14px',

                fontWeight:
                  'bold',

                cursor:
                  'pointer',

                fontSize:
                  '16px',

                whiteSpace:
                  'nowrap',

                boxShadow:
                  '0 4px 10px rgba(0,0,0,0.15)'
              }}
            >

              Mi carrito
              {': '}
              {cantidadCarrito}

            </button>

          </Link>

        </div>

        {

          configuracion.notaHeader && (

            <div
              style={{
                marginTop: '6px',

                background: '#fff3cd',

                color: '#856404',

                padding: '6px',

                borderRadius: '6px',

                textAlign: 'center',

                fontWeight: 'bold',

                fontFamily:
                  'Verdana, sans-serif',

                fontSize: '13px',

                maxWidth: '900px',

                marginLeft: 'auto',

                marginRight: 'auto',

                boxShadow:
                  '0 2px 8px rgba(0,0,0,0.10)'
              }}
            >

              {
                configuracion.notaHeader
              }

            </div>
          )
        }

      </header>

      {/* CONTENIDO */}

      <main
        style={{
          maxWidth: '900px',

          margin: '0 auto',

          padding: '10px'
        }}
      >

        {

          !categoriaSeleccionada

            ? (

              <>

                <h2
                  style={{
                    marginBottom:
                      '10px',

                    color:
                      '#111827',

                    fontSize:
                      '20px'
                  }}
                >

                  Categorías

                </h2>

                <div
                  style={{
                    display: 'grid',

                    gridTemplateColumns:
                      '1fr 1fr',

                    gap: '10px'
                  }}
                >

                  {

                    categorias.map(
                      categoria => (

                        <button
                          key={
                            categoria._id
                          }

                          onClick={() =>
                            seleccionarCategoria(
                              categoria
                            )
                          }

                          style={{
                            background:
                              '#6ec4b5',

                            border:
                              'none',

                            borderRadius:
                              '12px',

                            padding:
                              '20px 10px',

                            cursor:
                              'pointer',

                            boxShadow:
                              '0 2px 8px rgba(0,0,0,0.08)',

                            fontSize:
                              '18px',

                            fontWeight:
                              'bold',

                            color:
                              '#111827'
                          }}
                        >

                          {
                            categoria.nombre
                          }

                        </button>
                      )
                    )
                  }

                </div>

              </>

            )

            : (

              <>

                <div
                  style={{
                    display: 'flex',

                    justifyContent:
                      'space-between',

                    alignItems:
                      'center',

                    marginBottom:
                      '12px',

                    gap: '10px'
                  }}
                >

                  <h2
                    style={{
                      margin: 0,

                      color:
                        '#111827',

                      fontSize:
                        '22px'
                    }}
                  >

                    {
                      categoriaSeleccionada
                        .nombre
                    }

                  </h2>

                  <button
                    onClick={
                      volverCategorias
                    }

                    style={{
                      background:
                        '#7f1d1d',

                      color:
                        '#ffffff',

                      border:
                        'none',

                      padding:
                        '8px 36px',

                      borderRadius:
                        '8px',

                      cursor:
                        'pointer',

                      fontWeight:
                        'bold',

                      fontSize:
                        '16px'
                    }}
                  >

                    Volver

                  </button>

                </div>

                {

                  cargandoProductos

                    ? (

                      <div
                        style={{
                          textAlign:
                            'center',

                          padding:
                            '30px',

                          fontWeight:
                            'bold',

                          color:
                            '#111827'
                        }}
                      >

                        Cargando productos...

                      </div>

                    )

                    : (

                      <div
                        style={{
                          display: 'grid',

                          gridTemplateColumns:
                            '1fr',

                          gap: '10px'
                        }}
                      >

                        {

                          productos.map(
                            producto => (

                              <div
                                key={
                                  producto._id
                                }

                                style={{
                                  background:
                                    '#ffffff',

                                  borderRadius:
                                    '8px',

                                  padding:
                                    '10px',

                                  boxShadow:
                                    '0 2px 10px rgba(0,0,0,0.06)'
                                }}
                              >

                                <h2
                                  style={{
                                    margin: 0,

                                    marginBottom:
                                      '5px',

                                    fontSize:
                                      '24px',

                                    lineHeight:
                                      1.0,

                                    color:
                                      '#03240b'
                                  }}
                                >

                                  {
                                    producto.nombre
                                  }

                                </h2>

                                <div
                                  style={{
                                    display:
                                      'flex',

                                    gap:
                                      '8px',

                                    alignItems:
                                      'flex-start'
                                  }}
                                >

                                  <div
                                    style={{
                                      width:
                                        '100px',

                                      flexShrink: 0
                                    }}
                                  >

                                    <img
                                      src={
                                        producto.foto &&
                                        producto.foto !== ''

                                          ? producto.foto

                                          : '/placeholder-producto.jpg'
                                      }

                                      alt={
                                        producto.nombre
                                      }

                                      style={{
                                        width:
                                          '100px',

                                        height:
                                          '100px',

                                        objectFit:
                                          'cover',

                                        borderRadius:
                                          '5px'
                                      }}
                                    />

                                  </div>

                                  <div
                                    style={{
                                      flex: 1,

                                      display:
                                        'flex',

                                      flexDirection:
                                        'column',

                                      gap:
                                        '3px'
                                    }}
                                  >

                                    {

                                      producto.variantes.map(
                                        variante => {

                                          const stockDisponible =

                                            calcularStockDisponible(
                                              producto,
                                              variante
                                            );

                                          return (

                                            <div
                                              key={
                                                variante._id
                                              }

                                              style={{
                                                border:
                                                  '1px solid #025221',

                                                borderRadius:
                                                  '5px',

                                                padding:
                                                  '5px',

                                                display:
                                                  'flex',

                                                justifyContent:
                                                  'space-between',

                                                alignItems:
                                                  'center',

                                                gap:
                                                  '1px'
                                              }}
                                            >

                                              <div
                                                style={{
                                                  display:
                                                    'flex',

                                                  flexDirection:
                                                    'column',

                                                  minWidth:
                                                    '60px'
                                                }}
                                              >

                                                <span
                                                  style={{
                                                    fontSize:
                                                      '14px',

                                                    fontWeight:
                                                      '600',

                                                    color:
                                                      '#111827'
                                                  }}
                                                >

                                                  {
                                                    variante.peso
                                                  }

                                                </span>

                                                <span
                                                  style={{
                                                    fontSize:
                                                      '20px',

                                                    fontWeight:
                                                      'bold',

                                                    color:
                                                      '#c20326',

                                                    lineHeight:
                                                      1.1
                                                  }}
                                                >

                                                  $
                                                  {
                                                    variante.precio
                                                  }

                                                </span>

                                              </div>

                                              <button
                                                disabled={
                                                  stockDisponible <= 0
                                                }

                                                onClick={() =>
                                                  agregarAlCarrito(
                                                    producto,
                                                    variante
                                                  )
                                                }

                                                style={{
                                                  background:
                                                    stockDisponible <= 0
                                                      ? '#6b7280'
                                                      : '#047857',

                                                  color:
                                                    '#ffffff',

                                                  border:
                                                    'none',

                                                  padding:
                                                    '10px 14px',

                                                  borderRadius:
                                                    '10px',

                                                  cursor:
                                                    stockDisponible <= 0
                                                      ? 'not-allowed'
                                                      : 'pointer',

                                                  fontWeight:
                                                    'bold',

                                                  fontSize:
                                                    '14px',

                                                  whiteSpace:
                                                    'nowrap',

                                                  minWidth:
                                                    '130px',

                                                  textAlign:
                                                    'center'
                                                }}
                                              >

                                                {

                                                  stockDisponible <= 0

                                                    ? 'Sin stock'

                                                    : 'Agregar al carrito'
                                                }

                                              </button>

                                            </div>
                                          );
                                        }
                                      )
                                    }

                                  </div>

                                </div>

                              </div>
                            )
                          )
                        }

                      </div>
                    )
                }

              </>

            )
        }

      </main>

    </div>
  );
}