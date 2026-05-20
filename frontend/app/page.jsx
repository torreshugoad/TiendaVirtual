'use client';

export const dynamic = 'force-dynamic';
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

  const [carrito, setCarrito] =
    useState(() => {

      if (
        typeof window !== 'undefined'
      ) {

        const carritoGuardado =

          localStorage.getItem(
            'carrito'
          );

        if (carritoGuardado) {

          return JSON.parse(
            carritoGuardado
          );
        }
      }

      return [];
    });

  const [configuracion, setConfiguracion] =
    useState(null);

  useEffect(() => {

    obtenerProductos();

    obtenerCategorias();

    obtenerConfiguracion();

  }, []);

  useEffect(() => {

    localStorage.setItem(
      'carrito',
      JSON.stringify(carrito)
    );

  }, [carrito]);

  async function obtenerProductos() {

    try {

const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/productos`,
  {
    cache: 'no-store'
  }
);

      const data = await res.json();

      setProductos(data);

    } catch (error) {

      console.log(error);
    }
  }

  async function obtenerCategorias() {

    try {

      const res = await fetch(

        `${process.env.NEXT_PUBLIC_API_URL}/api/categorias`

      );

      const data = await res.json();

      setCategorias(

        Array.isArray(data)

          ? data

          : []
      );

    } catch (error) {

      console.log(error);
    }
  }

  async function obtenerConfiguracion() {

    try {

      const res = await fetch(

        `${process.env.NEXT_PUBLIC_API_URL}/api/configuracion`

      );

      const data = await res.json();

      setConfiguracion(data);

    } catch (error) {

      console.log(error);
    }
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
          texto.replace('kg', '')
        );

    } else if (
      texto.includes('gr')
    ) {

      kgNecesarios =
        Number(
          texto.replace('gr', '')
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

      setCarrito(nuevoCarrito);

    } else {

      setCarrito([

        ...carrito,

        {
          productoId:
            producto._id,

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

  const productosFiltrados =

    categoriaSeleccionada

      ? productos.filter(
          producto => {

            if (
              typeof producto.categoria ===
              'object'
            ) {

              return (
                producto.categoria?._id ===
                categoriaSeleccionada._id
              );
            }

            return (
              producto.categoria ===
              categoriaSeleccionada._id
            );
          }
        )

      : [];

  const cantidadCarrito =

    carrito.reduce(
      (acc, item) =>
        acc + item.cantidad,
      0
    );

  return (

    <div
      style={{
        minHeight: '100vh',
        background: '#ffedaa'
      }}
    >

      {/* HEADER */}

      <header
        style={{
          background: 'hsl(146, 88%, 23%)',
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
                fontSize: '36px',
                color: '#c4ffc3',
                lineHeight: 1
              }}
            >

              {
                configuracion?.nombreTienda ||
                'Mi Tienda'
              }

            </h1>

            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                color: '#d1fae5'
              }}
            >

              {
                configuracion?.descripcionTienda ||
                'Tu descripción aquí'
              }

            </p>

          </div>

          {/* CARRITO */}

          <Link
            href="/cart"
            style={{
              textDecoration: 'none'
            }}
          >

            <button
              style={{
                background: '#f97316',
                color: '#ffffff',
                border: 'none',
                padding: '14px 18px',
                borderRadius: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px',
                whiteSpace: 'nowrap',
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

      </header>

      {/* CONTENIDO */}

      <div
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
                    marginBottom: '10px',
                    color: '#111827',
                    fontSize: '20px'
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

                    Array.isArray(categorias) &&

                    categorias.map(
                      categoria => (

                        <button
                          key={
                            categoria._id
                          }

                          onClick={() =>
                            setCategoriaSeleccionada(
                              categoria
                            )
                          }

                          style={{
                            background:
                              '#6ec4b5',
                            border: 'none',
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
                    alignItems: 'center',
                    marginBottom:
                      '12px',
                    gap: '10px'
                  }}
                >

                  <h2
                    style={{
                      margin: 0,
                      color: '#111827',
                      fontSize: '22px'
                    }}
                  >

                    {
                      categoriaSeleccionada.nombre
                    }

                  </h2>

                  <button
                    onClick={() =>
                      setCategoriaSeleccionada(
                        null
                      )
                    }

                    style={{
                      background:
                        '#111827',
                      color:
                        '#ffffff',
                      border: 'none',
                      padding:
                        '8px 12px',
                      borderRadius:
                        '8px',
                      cursor:
                        'pointer',
                      fontWeight:
                        'bold',
                      fontSize:
                        '12px'
                    }}
                  >

                    Volver

                  </button>

                </div>

                {/* PRODUCTOS */}

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      '1fr',
                    gap: '10px'
                  }}
                >

                  {

                    productosFiltrados.map(
                      producto => (

                        <div
                          key={producto._id}

                          style={{
                            background:
                              '#ffffff',

                            borderRadius:
                              '14px',

                            padding:
                              '12px',

                            boxShadow:
                              '0 2px 10px rgba(0,0,0,0.06)'
                          }}
                        >

                          {/* NOMBRE */}

                          <h2
                            style={{
                              margin: 0,
                              marginBottom: '10px',

                              fontSize:
                                '20px',

                              lineHeight:
                                1.1,

                              color:
                                '#111827'
                            }}
                          >

                            {producto.nombre}

                          </h2>

                          {/* CONTENIDO */}

                          <div
                            style={{
                              display: 'flex',
                              gap: '12px',
                              alignItems: 'flex-start'
                            }}
                          >

                            {/* IMAGEN */}

                            <div
                              style={{
                                width: '105px',
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

                                alt={producto.nombre}

                                style={{
                                  width: '105px',
                                  height: '105px',
                                  objectFit: 'cover',
                                  borderRadius: '12px'
                                }}
                              />

                            </div>

                            {/* VARIANTES */}

                            <div
                              style={{
                                flex: 1,

                                display: 'flex',

                                flexDirection:
                                  'column',

                                gap: '8px'
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
                                        key={variante._id}

                                        style={{
                                          border:
                                            '1px solid #e5e7eb',

                                          borderRadius:
                                            '10px',

                                          padding:
                                            '8px',

                                          display: 'flex',

                                          justifyContent:
                                            'space-between',

                                          alignItems:
                                            'center',

                                          gap: '10px'
                                        }}
                                      >

                                        {/* INFO */}

                                        <div
                                          style={{
                                            display: 'flex',
                                            flexDirection:
                                              'column'
                                          }}
                                        >

                                          <span
                                            style={{
                                              fontSize: '14px',
                                              fontWeight: '600',
                                              color: '#111827'
                                            }}
                                          >

                                            {variante.peso}

                                          </span>

                                          <span
                                            style={{
                                              fontSize: '20px',
                                              fontWeight: 'bold',
                                              color: '#c20326',
                                              lineHeight: 1.1
                                            }}
                                          >

                                            $
                                            {variante.precio}

                                          </span>

                                        </div>

                                        {/* BOTON */}

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

                                                ? '#9ca3af'

                                                : '#05ab52',

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

                                            display:
                                              'flex',

                                            alignItems:
                                              'center',

                                            gap:
                                              '6px',

                                            whiteSpace:
                                              'nowrap',

                                            minWidth:
                                              '110px',

                                            justifyContent:
                                              'center'
                                          }}
                                        >

                                          {

                                            stockDisponible <= 0

                                              ? 'Sin stock'

                                              : (
                                                <>
                                                  Agregar al carrito
                                                </>
                                              )
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

              </>

            )
        }

      </div>

    </div>
  );
}