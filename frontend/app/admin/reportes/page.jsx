'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import useAdminAuth from '@/hooks/useAdminAuth';
import usePeriodo from '@/hooks/usePeriodo';
import { apiFetch } from '@/lib/api';
import FiltroPeriodo from '@/components/admin/FiltroPeriodo';

import ReporteCard from '@/components/admin/reportes/ReporteCard';
import ProductosVendidosTable from '@/components/admin/reportes/ProductosVendidosTable';

import styles from './reportes.module.css';

export default function ReportesPage() {
  const loading = useAdminAuth();
  const { tipo, setTipo, fechaInicio, setFechaInicio, fechaFin, setFechaFin } = usePeriodo('semana');
  const [reporte, setReporte] = useState(null);

  useEffect(() => {
    if (!loading && fechaInicio && fechaFin) {
      obtenerReporte();
    }
  }, [loading, fechaInicio, fechaFin]);

  async function obtenerReporte() {
    try {
      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reportes/ventas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
      );
      if (!res) return;
      const data = await res.json();
      setReporte(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function exportarExcel() {
    if (!fechaInicio || !fechaFin) return;

    const res = await apiFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/reportes/ventas-excel?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
    if (!res) return;

    const ventas = await res.json();
    const datos = ventas.map((v) => ({
      Fecha: new Date(v.fecha).toLocaleString(),
      Cliente: v.cliente,
      Telefono: v.telefono,
      Producto: v.producto,
      Variante: v.variante,
      Cantidad: v.cantidad,
      Precio: v.precio,
      Importe: v.subtotal,
      Estado: v.estado
    }));

    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(datos);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Ventas');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `reporte_ventas_${fechaInicio}_a_${fechaFin}.xlsx`);
  }

  if (loading) return null;

  return (
    <main className={styles.main}>
      <div className={styles.headerContainer}>
        <h1 className={styles.title}>Reportes Ventas</h1>
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
        onExportar={exportarExcel}
      />

      {reporte && (
        <>
          <div className={styles.cardsGrid}>
            <ReporteCard titulo="Facturación" valor={`$${reporte.facturacionTotal?.toFixed(2)}`} />
            <ReporteCard titulo="Pedidos" valor={reporte.cantidadPedidos} />
            <ReporteCard titulo="Ticket Promedio" valor={`$${reporte.ticketPromedio?.toFixed(2)}`} />
          </div>

          <ProductosVendidosTable productos={reporte.productos} />
        </>
      )}
    </main>
  );
}