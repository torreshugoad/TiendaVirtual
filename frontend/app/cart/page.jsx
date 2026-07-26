'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CartPage() {

  const [carrito, setCarrito] = useState([]);

  useEffect(() => {

    const carritoGuardado = JSON.parse(
      localStorage.getItem('carrito') || '[]'
    );

    setCarrito(carritoGuardado);

  }, []);

  function actualizarCarrito(nuevoCarrito) {

    setCarrito(nuevoCarrito);

    localStorage.setItem(
      'carrito',
      JSON.stringify(nuevoCarrito)
    );
  }

async function aumentarCantidad(index) {

  try {

    const nuevoCarrito = [...carrito];

    const item = nuevoCarrito[index];
console.log(item);

    const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/stock-producto`,
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json'
        },
        body: JSON.stringify({
          productoId: item.productoId,
          peso: item.peso,
          carrito
        })
      }
    );

    const data =
      await response.json();

    if (!response.ok) {

      alert(
        data.error ||
        'Error obteniendo stock'
      );

      return;
    }

    const stockDisponible =
      Number(data.stock);

    if (
      Number(item.cantidad) >=
      stockDisponible
    ) {

      alert(
        'Stock máximo alcanzado'
      );

      return;
    }

    item.cantidad += 1;

    item.subtotal =
      Number(item.precio) *
      Number(item.cantidad);

    item.stockDisponible =
      stockDisponible;

    actualizarCarrito(
      nuevoCarrito
    );

  } catch (error) {

    console.error(error);

    alert(
      'Error verificando stock'
    );
  }
}

async function verificarStock() {

  try {

    const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/verificar-stock`,
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json'
        },
        body: JSON.stringify({
          carrito
        })
      }
    );

    const data =
      await response.json();

    console.log(
      'DEBUG verificarStock →',
      'status:', response.status,
      'ok:', response.ok,
      'data:', data
    );

    if (!response.ok) {

      alert(
        data.error ||
        'Error verificando stock'
      );

      return;
    }

    window.location.href =
      '/checkout';

  } catch (error) {

    console.error(error);

    alert(
      'Error verificando stock'
    );
  }
}

  function disminuirCantidad(index) {

    const nuevoCarrito = [
      ...carrito
    ];

    const item = nuevoCarrito[index];

    item.cantidad -= 1;

    if (item.cantidad <= 0) {

      nuevoCarrito.splice(index, 1);

    } else {

      item.subtotal =
        Number(item.precio) *
        Number(item.cantidad);
    }

    actualizarCarrito(
      nuevoCarrito
    );
  }

  function eliminarProducto(index) {

    const nuevoCarrito = [
      ...carrito
    ];

    nuevoCarrito.splice(index, 1);

    actualizarCarrito(
      nuevoCarrito
    );
  }

const total = carrito.reduce(

  (acc, item) =>

    acc +

    (
      Number(item.precio) *

      Number(item.cantidad)
    ),

  0
);

  return (

    <div
      style={{
        background: '#f5f5f5',
        minHeight: '100vh',
        padding: '10px'
      }}
    >

      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >

        {/* HEADER */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}
        >

          <h1
            style={{
              margin: 0
            }}
          >

            Mi carrito

          </h1>

          <Link href="/">

            <button
              style={{
                background: '#111827',
                color: '#fff',
                border: 'none',
                padding: '12px 18px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >

              Seguir comprando

            </button>

          </Link>

        </div>

        {

          carrito.length === 0 ? (

            <div
              style={{
                background: '#fff',
                padding: '40px',
                borderRadius: '16px',
                textAlign: 'center'
              }}
            >

              <h2>
                Tu carrito está vacío
              </h2>

              <Link href="/">

                <button
                  style={{
                    marginTop: '20px',
                    background: '#16a34a',
                    color: '#fff',
                    border: 'none',
                    padding: '14px 20px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >

                  Ver productos

                </button>

              </Link>

            </div>

          ) : (

            <>

              {

                carrito.map((item, index) => (

                  <div
                    key={index}

                    style={{
                      background: '#fff',
                      borderRadius: '16px',
                      padding: '20px',
                      marginBottom: '20px',
                      display: 'flex',
                      gap: '20px',
                      alignItems: 'center',
                      boxShadow:
                        '0 2px 10px rgba(0,0,0,0.08)'
                    }}
                  >

                    <div
                      style={{
                        flex: 1
                      }}
                    >

                      <h2
                        style={{
                          marginTop: 0
                        }}
                      >

                        {item.nombre}

                      </h2>

                      <p>
                        Variante:
                        {' '}
                        {item.peso}
                      </p>

                      <p>
                        Precio unitario:
                        {' '}
                        ${item.precio}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginTop: '15px'
                        }}
                      >

                        <button

                          onClick={() =>
                            disminuirCantidad(index)
                          }

                          style={{
                            width: '46px',
                            height: '36px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '30px'
                          }}
                        >

                          -

                        </button>

                        <strong>
                          {item.cantidad}
                        </strong>

                        <button

                          onClick={() =>
                            aumentarCantidad(index)
                          }

                          style={{
                            width: '46px',
                            height: '36px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '30px'
                          }}
                        >

                          +

                        </button>

                      </div>

                    </div>

                    <div
                      style={{
                        textAlign: 'left'
                      }}
                    >

                      <h3>

                        $

{

  Number(item.precio) *

  Number(item.cantidad)
}

                      </h3>

                      <button

                        onClick={() =>
                          eliminarProducto(index)
                        }

                        style={{
                          background: '#dc2626',
                          color: '#fff',
                          border: 'none',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >

                        Eliminar

                      </button>

                    </div>

                  </div>
                ))
              }

              {/* TOTAL */}

              <div
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '25px',
                  boxShadow:
                    '0 2px 10px rgba(0,0,0,0.08)'
                }}
              >

                <h2>

                  Total:
                  {' '}
                  ${total}

                </h2>

<button

  onClick={verificarStock}

  style={{
    width: '100%',
    marginTop: '20px',
    background: '#16a34a',
    color: '#fff',
    border: 'none',
    padding: '16px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px'
  }}
>

  Finalizar compra

</button>

              </div>

            </>

          )
        }

      </div>

    </div>
  );
}