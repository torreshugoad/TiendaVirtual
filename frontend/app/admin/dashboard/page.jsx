'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  RefreshCw,
  DollarSign,
  Package,
  TrendingUp,
  Clock
} from 'lucide-react';

import useAdminAuth from '@/hooks/useAdminAuth';
import usePeriodo from '@/hooks/usePeriodo';
import { apiFetch } from '@/lib/api';

import DashboardCard from '@/components/admin/dashboard/DashboardCard';
import DashboardSection from '@/components/admin/dashboard/DashboardSection';
import TopProductos from '@/components/admin/dashboard/TopProductos';
import StockBajo from '@/components/admin/dashboard/StockBajo';
import FiltroPeriodo from '@/components/admin/FiltroPeriodo';

import buttonStyles from '@/styles/buttons.module.css';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const loading = useAdminAuth();

  const {
    tipo,
    setTipo,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin
  } = usePeriodo('semana');

  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!loading && fechaInicio && fechaFin) {
      obtenerDashboard();
    }
  }, [loading, fechaInicio, fechaFin]);

  async function obtenerDashboard() {
    try {
      setError(false);

      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
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

  return (
    <main className={styles.main}>
      <div className={styles.headerContainer}>
        <h1 className={styles.title}>Dashboard</h1>
        <Link href="/admin" className={styles.btnSecondary}>
          <LayoutDashboard size={15} />
          Panel Administrador
        </Link>
      </div>

      <FiltroPeriodo
        tipo={tipo}
        setTipo={setTipo}
        fechaInicio={fechaInicio}
        setFechaInicio={setFechaInicio}
        fechaFin={fechaFin}
        setFechaFin={setFechaFin}
      />

      {error && (
        <div className={styles.errorContainer}>
          <p>No se pudo cargar el dashboard.</p>
          <button
            type="button"
            className={buttonStyles.btnPrimary}
            onClick={obtenerDashboard}
          >
            <RefreshCw size={15} />
            Reintentar
          </button>
        </div>
      )}

      {!error && !dashboard && <p>Cargando dashboard...</p>}

      {!error && dashboard && (
        <>
          <div className={styles.cardsGrid}>
            <DashboardCard
              titulo="Facturación del período"
              valor={`$${Number(dashboard.facturacionPeriodo || 0).toFixed(2)}`}
              icono={DollarSign}
              color="#2563eb"
            />

            <DashboardCard
              titulo="Pedidos del período"
              valor={dashboard.cantidadPedidosPeriodo ?? 0}
              icono={Package}
              color="#16a34a"
            />

            <DashboardCard
              titulo="Ticket Promedio"
              valor={`$${Number(dashboard.ticketPromedioPeriodo || 0).toFixed(2)}`}
              icono={TrendingUp}
              color="#6b21a8"
            />

            <DashboardCard
              titulo="Pedidos Pendientes"
              valor={dashboard.pedidosPendientes ?? 0}
              icono={Clock}
              color="#f59e0b"
            />
          </div>

          <div className={styles.sectionsGrid}>
            <DashboardSection titulo="Top Productos">
              <TopProductos productos={dashboard.topProductos} />
            </DashboardSection>

            <DashboardSection titulo="Stock Bajo">
              <StockBajo productos={dashboard.stockBajo} />
            </DashboardSection>
          </div>
        </>
      )}
    </main>
  );
}
