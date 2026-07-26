'use client';

import { useEffect, useState } from 'react';

import useAdminAuth from '@/hooks/useAdminAuth';
import { apiFetch } from '@/lib/api';

import DashboardCard from '@/components/admin/dashboard/DashboardCard';
import DashboardSection from '@/components/admin/dashboard/DashboardSection';
import TopProductos from '@/components/admin/dashboard/TopProductos';
import StockBajo from '@/components/admin/dashboard/StockBajo';

export default function DashboardPage() {
  const loading = useAdminAuth();

  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!loading) {
      obtenerDashboard();
    }
  }, [loading]);

  async function obtenerDashboard() {
    try {
      setError(false);

      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`
      );

      if (!res) return;

      const data = await res.json();

      setDashboard(data);
    } catch (err) {
      console.error(err);
      setError(true);
    }
  }

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <main style={{ padding: 40 }}>
        <p>No se pudo cargar el dashboard.</p>

        <button onClick={obtenerDashboard}>
          Reintentar
        </button>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main style={{ padding: 40 }}>
        Cargando dashboard...
      </main>
    );
  }

  const ventasTotales = Number(dashboard.ventasTotales || 0);
  const facturacionMensual = Number(dashboard.facturacionMensual || 0);

  return (
    <main
      style={{
        padding: 30,
        background: '#f7f7f7',
        minHeight: '100vh',
        fontFamily: 'Arial'
      }}
    >
      <h1 style={{ marginBottom: 30 }}>Dashboard</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 20,
          marginBottom: 30
        }}
      >
        <DashboardCard
          titulo="Ventas Totales"
          valor={`$${ventasTotales.toFixed(2)}`}
          icono="💰"
          color="#2563eb"
        />

        <DashboardCard
          titulo="Pedidos Pendientes"
          valor={dashboard.pedidosPendientes ?? 0}
          icono="⏳"
          color="#f59e0b"
        />

        <DashboardCard
          titulo="Pedidos Hoy"
          valor={dashboard.pedidosHoy ?? 0}
          icono="📦"
          color="#16a34a"
        />

        <DashboardCard
          titulo="Facturación Mensual"
          valor={`$${facturacionMensual.toFixed(2)}`}
          icono="📈"
          color="#6b21a8"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20
        }}
      >
        <DashboardSection titulo="Top Productos">
          <TopProductos productos={dashboard.topProductos} />
        </DashboardSection>

        <DashboardSection titulo="Stock Bajo">
          <StockBajo productos={dashboard.stockBajo} />
        </DashboardSection>
      </div>
    </main>
  );
}