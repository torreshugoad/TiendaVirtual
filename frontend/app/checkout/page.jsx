'use client';

import { useEffect, useMemo, useState } from 'react';

/* ==========================
   Convierte el texto del peso
   (ej. "100Gr", "1Kg") a gramos.
   Espejo de calcularEquivalencia
   en VariantesEditor.jsx.
========================== */

function parsearPesoAGramos(peso) {

  if (!peso) return 0;

  const texto =

    String(peso)
      .toLowerCase()
      .replace(',', '.')
      .replace(/\s/g, '');

  if (texto.endsWith('kg')) {

    return Math.round(

      parseFloat(
        texto.replace('kg', '')
      ) * 1000
    );
  }

  if (texto.endsWith('gr')) {

    return Math.round(

      parseFloat(
        texto.replace('gr', '')
      )
    );
  }

  return 0;
}

function formatearGramos(gramos) {

  if (gramos >= 1000) {

    const kg = gramos / 1000;

    return `${
      Number(kg.toFixed(2))
    }Kg`;
  }

  return `${gramos}Gr`;
}

export default function CheckoutPage() {

  const [carrito, setCarrito] =
    useState([]);

  const [configuracion,
    setConfiguracion] =
    useState(null);

  const [tipoEntrega,
    setTipoEntrega] =
    useState('retiro');

  const [nombre,
    setNombre] =
    useState('');

  const [telefono,
    setTelefono] =
    useState('');

  const [direccion,
    setDireccion] =
    useState('');

  const [pedidoConfirmado,
    setPedidoConfirmado] =
    useState(false);

  const [loading,
    setLoading] =
    useState(false);

  useEffect(() => {

    const carritoGuardado =
      JSON.parse(

        localStorage.getItem(
          'carrito'
        ) || '[]'

      );

    setCarrito(
      carritoGuardado
    );

    obtenerConfiguracion();

  }, []);

  async function obtenerConfiguracion() {

    try {

      const res = await fetch(

        `${process.env.NEXT_PUBLIC_API_URL}/api/configuracion`

      );

      const data =
        await res.json();

      setConfiguracion(data);

    } catch (error) {

      console.log(error);
    }
  }

  const subtotal =
    carrito.reduce(

      (acc, item) =>

        acc +

        (
          Number(item.precio) *

          Number(item.cantidad)
        ),

      0
    );

  // Agrupamos el carrito por producto para poder mostrar, cuando
  // se compran varias variantes/cantidades de un mismo producto
  // pesable (ej. 100Gr + 250Gr), el total combinado en gramos.

  const pedidoAgrupado =
    useMemo(() => {

      const grupos =
        carrito.reduce(
          (acc, item) => {

            if (!acc[item.productoId]) {

              acc[item.productoId] = {

                productoId:
                  item.productoId,

                nombre:
                  item.nombre,

                foto:
                  item.foto,

                tipoStock:
                  item.tipoStock,

                variantes: []
              };
            }

            acc[
              item.productoId
            ].variantes.push(item);

            return acc;
          },
          {}
        );

      return Object.values(grupos).map(
        grupo => {

          const esGranel =

            grupo.tipoStock ===
            'granel';

          const totalGramos =

            esGranel

              ? grupo.variantes.reduce(
                  (acc, v) =>

                    acc +

                    parsearPesoAGramos(
                      v.peso
                    ) *

                    Number(v.cantidad || 0),

                  0
                )

              : null;

          const totalPrecio =

            grupo.variantes.reduce(
              (acc, v) =>

                acc +

                Number(v.precio) *

                Number(v.cantidad),

              0
            );

          return {
            ...grupo,
            esGranel,
            totalGramos,
            totalPrecio
          };
        }
      );

    }, [carrito]);

  const envioGratisDesde =
    Number(

      configuracion
        ?.envioGratisDesde || 0

    );

  const costoBaseEnvio =
    Number(

      configuracion
        ?.costoEnvio || 0

    );

  const tieneEnvioGratis =

    subtotal >=
    envioGratisDesde;

  const costoEnvio =

    tipoEntrega === 'envio'

      ? (

          tieneEnvioGratis
            ? 0
            : costoBaseEnvio

        )

      : 0;

  const totalFinal =
    subtotal + costoEnvio;

  async function confirmarPedido() {

    if (!nombre || !telefono) {

      alert(
        'Completar datos'
      );

      return;
    }

    if (

      tipoEntrega ===
      'envio' &&

      !direccion

    ) {

      alert(
        'Ingresar dirección'
      );

      return;
    }

    try {

      setLoading(true);

      const itemsPedido =

        carrito.map(item => ({

          productoId:
            item.productoId,

          nombre:
            item.nombre,

          foto:
            item.foto,

          peso:
            item.peso,

          cantidad:
            item.cantidad,

          precio:
            item.precio

        }));

      const body = {

        cliente:
          nombre,

        telefono,

        direccion,

        tipoEntrega,

        envio:
          costoEnvio,

        items:
          itemsPedido

      };

      /* CHECKOUT */

      const resCheckout =
        await fetch(

          `${process.env.NEXT_PUBLIC_API_URL}/api/checkout`,

          {

            method: 'POST',

            headers: {

              'Content-Type':
                'application/json'

            },

            body:
              JSON.stringify(body)

          }

        );

      const data =
        await resCheckout.json();

      if (!resCheckout.ok) {

        throw new Error(

          data.mensaje ||

          'Error en checkout'
        );
      }

      /* WHATSAPP */

      const productosTexto =

        pedidoAgrupado.map(grupo => {

          const lineas =

            grupo.variantes.map(v => {

              const subtotalItem =

                Number(v.precio) *

                Number(v.cantidad);

              return grupo.esGranel

                ? `${v.peso} - Cant ${v.cantidad}: $${subtotalItem}`

                : `Cant. ${v.cantidad}: $${subtotalItem}`;

            }).join('\n');

          const totalLinea =

            grupo.esGranel &&

            (
              grupo.variantes.length > 1 ||

              Number(grupo.variantes[0].cantidad) > 1
            )

              ? `\n*Total: ${
                  formatearGramos(
                    grupo.totalGramos
                  )
                }*`

              : '';

          return `*${grupo.nombre}*
${lineas}${totalLinea}`;

        }).join('\n\n');

      const mensaje =

`Hola, te paso mi pedido

Pedido: #${data.nropedido}
Cliente: ${nombre}
Teléfono: ${telefono}
Entrega: ${
  tipoEntrega === 'retiro'
    ? 'Retiro en tienda'
    : direccion
}
━━━━━━━━━━━━━━━━
${productosTexto}
━━━━━━━━━━━━━━━━
Envío: $${costoEnvio}
TOTAL: $${totalFinal}`;

      const telefonoWhatsapp =

        configuracion
          ?.telefonoWhatsapp
          ?.replace(
            /\D/g,
            ''
          );

      /* LIMPIAR CARRITO */

      localStorage.removeItem(
        'carrito'
      );

      setCarrito([]);

      setPedidoConfirmado(
        true
      );

      /* ABRIR WHATSAPP */

      if (telefonoWhatsapp) {

        const urlWhatsapp =

          /Android|iPhone|iPad|iPod/i.test(
            navigator.userAgent
          )

            ? `whatsapp://send?phone=${telefonoWhatsapp}&text=${encodeURIComponent(mensaje)}`

            : `https://web.whatsapp.com/send?phone=${telefonoWhatsapp}&text=${encodeURIComponent(mensaje)}`;

        window.location.href =
          urlWhatsapp;
      }

    } catch (error) {

      console.log(error);

      alert(

        error.message ||

        'Ocurrió un error al registrar el pedido'

      );

    } finally {

      setLoading(false);
    }
  }

  /* PEDIDO CONFIRMADO */

  if (pedidoConfirmado) {

    return (

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#f5f5f5',
          padding: '20px'
        }}
      >

        <div
          style={{
            background: '#ffffff',
            padding: '50px',
            borderRadius: '20px',
            textAlign: 'center',
            maxWidth: '700px',
            boxShadow:
              '0 2px 12px rgba(0,0,0,0.08)'
          }}
        >

          <h1
            style={{
              color: '#16a34a'
            }}
          >

            ¡Pedido confirmado!

          </h1>

          <p
            style={{
              fontSize: '18px',
              marginTop: '20px',
              lineHeight: '1.6'
            }}
          >

            Muchas gracias por su compra.

            <br /><br />

            Se abrió automáticamente
            WhatsApp con el resumen
            del pedido.

          </p>

        </div>

      </div>
    );
  }

  return (

    <div
      style={{
        background: '#f5f5f5',
        minHeight: '100vh',
        padding: '30px'
      }}
    >

      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          background: '#ffffff',
          padding: '30px',
          borderRadius: '20px',
          boxShadow:
            '0 2px 12px rgba(0,0,0,0.08)'
        }}
      >

        <h1>
          Finalizar compra
        </h1>

        <hr />

        <h2>
          Resumen del pedido
        </h2>

        {

          pedidoAgrupado.map(
            grupo => (

            <div
              key={grupo.productoId}

              style={{
                padding: '15px 0',
                borderBottom:
                  '1px solid #e5e7eb'
              }}
            >

              <p
                style={{
                  margin: '0 0 6px 0',
                  fontSize: '17px'
                }}
              >

                <strong>
                  {grupo.nombre}
                </strong>

              </p>

              {

                grupo.variantes.map(
                  (v, i) => (

                    <div
                      key={i}

                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        alignItems: 'center',
                        paddingLeft: '10px',
                        marginBottom: '4px'
                      }}
                    >

                      <span
                        style={{
                          color: '#6b7280'
                        }}
                      >

                        {

                          grupo.esGranel

                            ? (
                              <>
                                {v.peso}

                                {' · '}

                                Cantidad:
                                {' '}

                                {v.cantidad}
                              </>
                            )

                            : (
                              <>
                                Cant.
                                {' '}
                                {v.cantidad}
                              </>
                            )
                        }

                      </span>

                      <strong>

                        $

                        {

                          Number(v.precio) *

                          Number(v.cantidad)

                        }

                      </strong>

                    </div>
                  )
                )
              }

              {

                grupo.esGranel &&

                (
                  grupo.variantes.length > 1 ||

                  Number(grupo.variantes[0].cantidad) > 1
                ) && (

                  <p
                    style={{
                      margin: '6px 0 0 10px',
                      color: '#111827',
                      fontWeight: 'bold'
                    }}
                  >

                    Total: {
                      formatearGramos(
                        grupo.totalGramos
                      )
                    }

                  </p>
                )
              }

            </div>
          ))
        }

        <div
          style={{
            marginTop: '25px'
          }}
        >

          <p>

            Subtotal:
            {' '}

            <strong>
              ${subtotal}
            </strong>

          </p>

          {

            tipoEntrega === 'envio' && (

              <>

                <p>

                  Envío:
                  {' '}

                  <strong>

                    {

                      costoEnvio === 0

                        ? 'GRATIS'

                        : `$${costoEnvio}`

                    }

                  </strong>

                </p>

                {

                  costoEnvio === 0 && (

                    <p
                      style={{
                        color: 'green',
                        fontWeight: 'bold'
                      }}
                    >

                      ¡Tu compra tiene envío gratis!

                    </p>
                  )
                }

              </>
            )
          }

          <h2>

            Total final:
            {' '}

            ${totalFinal}

          </h2>

        </div>

        <hr />

        <div
          style={{
            marginTop: '25px'
          }}
        >

          <label>
            Nombre
          </label>

          <input
            type="text"

            value={nombre}

            onChange={e =>
              setNombre(
                e.target.value
              )
            }

            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              marginBottom: '18px',
              borderRadius: '10px',
              border: '1px solid #d1d5db'
            }}
          />

          <label>
            Teléfono
          </label>

          <input
            type="text"

            value={telefono}

            onChange={e =>
              setTelefono(
                e.target.value
              )
            }

            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              marginBottom: '18px',
              borderRadius: '10px',
              border: '1px solid #d1d5db'
            }}
          />

          <label>
            Tipo de entrega
          </label>

          <select

            value={tipoEntrega}

            onChange={e =>
              setTipoEntrega(
                e.target.value
              )
            }

            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              marginBottom: '18px',
              borderRadius: '10px',
              border: '1px solid #d1d5db'
            }}
          >

            <option value="retiro">
              Retiro en tienda
            </option>

            <option value="envio">
              Envío a domicilio
            </option>

          </select>

          {

            tipoEntrega === 'envio' && (

              <>

                <label>
                  Dirección
                </label>

                <input
                  type="text"

                  value={direccion}

                  onChange={e =>
                    setDireccion(
                      e.target.value
                    )
                  }

                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '8px',
                    marginBottom: '18px',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db'
                  }}
                />

              </>
            )
          }

          <button

            onClick={
              confirmarPedido
            }

            disabled={loading}

            style={{
              width: '100%',
              background: loading
                ? '#9ca3af'
                : '#16a34a',
              color: '#ffffff',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              cursor: loading
                ? 'not-allowed'
                : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              marginTop: '20px'
            }}
          >

            {

              loading

                ? 'Procesando pedido...'

                : 'Confirmar Pedido'

            }

          </button>

        </div>

      </div>

    </div>
  );
}