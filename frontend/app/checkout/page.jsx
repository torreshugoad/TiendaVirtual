'use client';

import { useEffect, useState } from 'react';

export default function CheckoutPage() {

  const [carrito, setCarrito] = useState([]);
  const [configuracion, setConfiguracion] =
    useState(null);

  const [tipoEntrega, setTipoEntrega] =
    useState('retiro');

  const [nombre, setNombre] =
    useState('');

  const [telefono, setTelefono] =
    useState('');

  const [direccion, setDireccion] =
    useState('');

  const [pedidoConfirmado, setPedidoConfirmado] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {

    const carritoGuardado = JSON.parse(
      localStorage.getItem('carrito') || '[]'
    );

    setCarrito(carritoGuardado);

    obtenerConfiguracion();

  }, []);

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

const subtotal = carrito.reduce(

  (acc, item) =>

    acc +

    (
      Number(item.precio) *

      Number(item.cantidad)
    ),

  0
);

  const envioGratisDesde = Number(
    configuracion?.envioGratisDesde || 0
  );

  const costoBaseEnvio = Number(
    configuracion?.costoEnvio || 0
  );

  const tieneEnvioGratis =
    subtotal >= envioGratisDesde;

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

      alert('Completar datos');

      return;
    }

    if (
      tipoEntrega === 'envio' &&
      !direccion
    ) {

      alert('Ingresar dirección');

      return;
    }

    try {

      setLoading(true);

      // CREAR PEDIDO

      const pedido = {

  cliente:
    nombre,

  telefono,

  direccion,

  tipoEntrega,

  envio:
    costoEnvio,

  items:
    carrito,

  subtotal,

  total:
    totalFinal,

  estado:
    'Pedido pendiente',

  confirmacionEnviada:
    false,

  fecha:
    new Date()
};

      // GUARDAR PEDIDO

      const resPedido = await fetch(

  `${process.env.NEXT_PUBLIC_API_URL}/api/pedidos`,

  {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json'
    },

    body: JSON.stringify({

      cliente: nombre,

      telefono,

      direccion,

      tipoEntrega,

      envio: costoEnvio,

      items: carrito,

      subtotal,

      total: totalFinal,

      estado: 'Pedido pendiente',

      confirmacionEnviada: false,

      fecha: new Date()
    })
  }
);

      if (!resPedido.ok) {

        throw new Error(
          'Error al guardar pedido'
        );
      }

      // DESCONTAR STOCK

      const resStock = await fetch(

        `${process.env.NEXT_PUBLIC_API_URL}/api/pedidos/descontar-stock`,

        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            items: carrito
          })
        }
      );

      if (!resStock.ok) {

        throw new Error(
          'Error al descontar stock'
        );
      }

      // LIMPIAR CARRITO

      localStorage.removeItem('carrito');

      setCarrito([]);

      setPedidoConfirmado(true);

    } catch (error) {

      console.log(error);

      alert(
        'Ocurrió un error al registrar el pedido'
      );

    } finally {

      setLoading(false);
    }
  }

  // PEDIDO CONFIRMADO

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

            Muchas gracias por su compra,
            en breve recibirá un mensaje
            de confirmación al teléfono indicado.

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

          carrito.map((item, index) => (

            <div
              key={index}

              style={{
                padding: '15px 0',
                borderBottom:
                  '1px solid #e5e7eb'
              }}
            >

<div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}
>

  <div>

    <p
      style={{
        margin: 0
      }}
    >

      <strong>
        {item.nombre}
      </strong>

    </p>

    <p
      style={{
        margin: '4px 0',
        color: '#6b7280'
      }}
    >

      {item.peso}

      {' · '}

      Cantidad:
      {' '}

      {item.cantidad}

    </p>

  </div>

  <strong>

    $

    {

      Number(item.precio) *

      Number(item.cantidad)
    }

  </strong>

</div>

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
              setNombre(e.target.value)
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
              setTelefono(e.target.value)
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
              setTipoEntrega(e.target.value)
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
                    setDireccion(e.target.value)
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

            onClick={confirmarPedido}

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