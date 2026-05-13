'use client';

import {
  useEffect,
  useState
} from 'react';

export default function DashboardPage() {

  const [dashboard,
    setDashboard] =
    useState(null);

  useEffect(() => {

    obtenerDashboard();

  }, []);

  async function obtenerDashboard() {

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`
    );

    const data =
      await res.json();

    setDashboard(data);
  }

  if (!dashboard) {

    return (

      <main style={{
        padding: 40
      }}>

        Cargando dashboard...

      </main>

    );
  }

  return (

    <main style={{
      padding: 30,
      background: '#f7f7f7',
      minHeight: '100vh',
      fontFamily: 'Arial'
    }}>

      <h1 style={{
        marginBottom: 30
      }}>

        Dashboard

      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 20,
        marginBottom: 30
      }}>

        <Card
          titulo="Ventas Totales"
          valor={`$${dashboard.ventasTotales?.toFixed(2)}`}
        />

        <Card
          titulo="Pedidos Pendientes"
          valor={
            dashboard.pedidosPendientes
          }
        />

        <Card
          titulo="Pedidos Hoy"
          valor={
            dashboard.pedidosHoy
          }
        />

        <Card
          titulo="Facturación Mensual"
          valor={`$${dashboard.facturacionMensual?.toFixed(2)}`}
        />

      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns:
          '1fr 1fr',
        gap: 20
      }}>

        <div style={{
          background: 'white',
          padding: 25,
          borderRadius: 12
        }}>

          <h2>
            Top Productos
          </h2>

          {dashboard.topProductos?.map(
            (p, index) => (

            <div
              key={index}
              style={{
                padding: 10,
                borderBottom:
                  '1px solid #eee'
              }}
            >

              <strong>
                {p[0]}
              </strong>

              <p>
                Vendidos:
                {' '}
                {p[1]}
              </p>

            </div>

          ))}

        </div>

        <div style={{
          background: 'white',
          padding: 25,
          borderRadius: 12
        }}>

          <h2>
            Stock Bajo
          </h2>

          {dashboard.stockBajo?.length === 0 && (

            <p>
              No hay alertas
            </p>

          )}

          {dashboard.stockBajo?.map(
            (p, index) => (

            <div
              key={index}
              style={{
                padding: 10,
                borderBottom:
                  '1px solid #eee'
              }}
            >

              <strong>
                {p.nombre}
              </strong>

              <p>
                Stock:
                {' '}
                {p.stock}
              </p>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}

function Card({
  titulo,
  valor
}) {

  return (

    <div style={{
      background: 'white',
      padding: 25,
      borderRadius: 12,
      boxShadow:
        '0 2px 8px rgba(0,0,0,0.08)'
    }}>

      <h3>
        {titulo}
      </h3>

      <h1>
        {valor}
      </h1>

    </div>
  );
}