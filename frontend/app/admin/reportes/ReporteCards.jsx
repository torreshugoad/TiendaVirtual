'use client';

import ReporteCard from './ReporteCard';

export default function ReporteCards({

  reporte,

  loading = false

}) {

  return (

    <div style={styles.grid}>

      <ReporteCard

        titulo="Facturación"

        valor={
          reporte
            ? `$${reporte.facturacionTotal.toFixed(2)}`
            : '$0.00'
        }

        icono="💰"

        color="#22c55e"

        loading={loading}

      />

      <ReporteCard

        titulo="Pedidos"

        valor={
          reporte
            ? reporte.cantidadPedidos
            : 0
        }

        icono="📦"

        color="#3b82f6"

        loading={loading}

      />

      <ReporteCard

        titulo="Ticket Promedio"

        valor={
          reporte
            ? `$${reporte.ticketPromedio.toFixed(2)}`
            : '$0.00'
        }

        icono="🧾"

        color="#8b5cf6"

        loading={loading}

      />

    </div>

  );

}

const styles = {

  grid: {

    display: 'grid',

    gridTemplateColumns:
      'repeat(auto-fit, minmax(250px,1fr))',

    gap: 20,

    marginBottom: 30

  }

};