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

        `${process.env.NEXT_PUBLIC_API_URL}/api/productos`

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

    // STOCK NORMAL

    if (
      producto.tipoStock !== 'granel'
    ) {

      return Number(
        variante.stock || 0
      );
    }

    // STOCK GRANEL

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
          padding: '5px',
          boxShadow:
            '0 2px 8px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >

        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center'
          }}
        >

          <div>

  <h1
    style={{
      margin: 0,
      fontSize: '36px',
      color: '#d7fae4',
      lineHeight: 1.1
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
      fontSize: '16px',
      color: '#d1fae5',
      fontWeight: '500'
    }}
  >

    {
      configuracion?.descripcionTienda ||
      'Tu descripción aquí'
    }

  </p>

</div>

          <Link
            href="/cart"
            style={{
              textDecoration: 'none'
            }}
          >

            <button
              style={{
                background: '#45d178',
                color: '#ffffff',
                border: 'none',
                padding: '12px 12px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >

              Mi carrito
              {' '}
              (
              {cantidadCarrito}
              )

            </button>

          </Link>

        </div>

      </header>


      {/* CONTENIDO */}

      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '20px'
        }}
      >

        {

          !categoriaSeleccionada

            ? (

              <>

                <h2
                  style={{
                    marginBottom: '10px',
                    color: '#111827'
                  }}
                >

                  Categorías

                </h2>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(240px, 1fr))',
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
                              '5px',
                            padding:
                              '20px 20px',
                            cursor:
                              'pointer',
                            boxShadow:
                              '0 4px 14px rgba(0,0,0,0.08)',
                            fontSize:
                              '28px',
                            fontWeight:
                              'bold'
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
                    flexWrap: 'wrap',
                    gap: '15px'
                  }}
                >

                  <h2
                    style={{
                      margin: 5,
                      color: '#111827'
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
                        '12px 18px',
                      borderRadius:
                        '8px',
                      cursor:
                        'pointer',
                      fontWeight:
                        'bold'
                    }}
                  >

                    Volver a categorías

                  </button>

                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '25px'
                  }}
                >

                  {

                    productosFiltrados.map(
  producto => (

    <div
      key={producto._id}

      style={{
        background: '#ffffff',
        borderRadius: '10px',
        padding: '10px',
        boxShadow:
          '0 4px 14px rgba(0,0,0,0.08)'
      }}
    >

      <h2
        style={{
          marginTop: 0,
          marginBottom: '8px',
          color: '#111827'
        }}
      >

        {producto.nombre}

      </h2>

      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
          flexWrap: 'wrap'
        }}
      >

        {/* IMAGEN */}

        <div
          style={{
            width: '120px',
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
              width: '100%',
              height: '180px',
              objectFit: 'cover',
              borderRadius: '5px'
            }}
          />

        </div>

        {/* VARIANTES */}

        <div
          style={{
            flex: 1,
            minWidth: '160px'
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
                        '1px solid #d1d5db',

                      borderRadius:
                        '1px',

                      padding:
                        '1px',

                      marginBottom:
                        '10px',

                      display: 'flex',

                      justifyContent:
                        'space-between',

                      alignItems:
                        'center',

                      gap: '10px',

                      flexWrap:
                        'wrap'
                    }}
                  >

                    <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'space-between',
    width: '140px',
  }}
>

  <span
    style={{
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#111827'
    }}
  >

    {variante.peso}

  </span>

  <span
    style={{
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#c20326'
    }}
  >

    $
    {variante.precio}

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

                            ? '#9ca3af'

                            : '#68ba86',

                        color:
                          '#ffffff',

                        border:
                          'none',

                        padding:
                          '10px 18px',

                        borderRadius:
                          '8px',

                        cursor:
                          stockDisponible <= 0

                            ? 'not-allowed'

                            : 'pointer',

                        fontWeight:
                          'bold',

                        fontSize:
                          '15px',

                        minWidth:
                          '150px'
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

              </>

            )
        }

      </div>

    </div>
  );
}