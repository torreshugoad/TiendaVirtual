'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import {
  Plus,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil
} from 'lucide-react';

import useAdminAuth from '@/hooks/useAdminAuth';
import useCompras from '@/hooks/useCompras';
import usePeriodo from '@/hooks/usePeriodo';
import { ESTADO_COMPRA } from '@/lib/estadoCompra';
import styles from './historialCompras.module.css';

const formatoMoneda = (valor) =>
  (valor ?? 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 });

export default function HistorialComprasPage() {
  const authLoading = useAdminAuth();
  const { listar, loading, error } = useCompras();
  const [compras, setCompras] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const {
    tipo,
    setTipo,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin
  } = usePeriodo('mes');

  useEffect(() => {
    if (!authLoading) {
      listar().then(setCompras).catch(() => {});
    }
  }, [authLoading]);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const comprasFiltradas = compras.filter((c) => {
    const fechaCompra = new Date(c.fecha?.$date || c.fecha);

    const coincideDesde = fechaInicio
      ? fechaCompra >= new Date(fechaInicio)
      : true;

    const coincideHasta = fechaFin
      ? fechaCompra <= new Date(`${fechaFin}T23:59:59`)
      : true;

    return coincideDesde && coincideHasta;
  });

  if (authLoading) return null;

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Historial de compras</h1>

        <div className={styles.actionButtons}>
          <Link href="/admin/compras" className={styles.btnPrimary}>
            <Plus size={15} />
            Nueva Compra
          </Link>

          <Link href="/admin" className={styles.btnSecondary}>
            <LayoutDashboard size={15} />
            Panel Administrador
          </Link>
        </div>
      </div>

      {/* Filtro por fecha */}
      <div className={styles.filtersContainer}>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className={styles.filterInput}
        >
          <option value="semana">Última semana</option>
          <option value="mes">Último mes</option>
          <option value="personalizado">Personalizado</option>
        </select>

        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className={styles.filterInput}
        />

        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className={styles.filterInput}
        />
      </div>

      {error && <div className={styles.errorText}>{error}</div>}
      {loading && <div className={styles.loadingText}>Cargando...</div>}

      {/* Contenedor con scroll horizontal */}
      <div className={styles.tableWrapper}>
        <div className={styles.tableInner}>
          {/* ENCABEZADO */}
          <div className={styles.tableHeader}>
            <div>Fecha</div>
            <div>Proveedor</div>
            <div>N° Factura</div>
            <div>Ítems</div>
            <div className={styles.tableHeaderRight}>Total</div>
            <div>Estado</div>
            <div></div>
          </div>

          {/* FILAS */}
          <div>
            {comprasFiltradas.map((c, idx) => {
              const isExpanded = expandedId === c._id;
              const fechaCompra = c.fecha?.$date || c.fecha;
              // Fallback para un estado desconocido: sólo texto, sin clase de color
              // (evita inventar un color/inline style para un caso que no debería pasar).
              const estadoInfo = ESTADO_COMPRA[c.estado] || { texto: c.estado, badgeClass: null };
              const esBorrador = c.estado === 'borrador';

              return (
                <div key={c._id} className={idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                  <div className={styles.tableRowContent}>
                    <div>{fechaCompra ? new Date(fechaCompra).toLocaleDateString('es-AR') : '-'}</div>
                    <div>{c.proveedor || '-'}</div>
                    <div>{c.numeroFactura || '-'}</div>
                    <div>{c.items?.length ?? 0}</div>
                    <div className={styles.tableCellRight}>{formatoMoneda(c.costoTotalCompra)}</div>
                    <div>
                      <span
                        className={clsx(styles.badge, estadoInfo.badgeClass && styles[estadoInfo.badgeClass])}
                      >
                        {estadoInfo.texto}
                      </span>
                    </div>
                    <div className={styles.actionsContainer}>
                      <button
                        onClick={() => toggleExpand(c._id)}
                        aria-label={isExpanded ? 'Ocultar resumen' : 'Ver resumen'}
                        title={isExpanded ? 'Ocultar resumen' : 'Ver resumen'}
                        className={styles.iconButton}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <Link
                        href={`/admin/compras/${c._id}`}
                        aria-label={esBorrador ? 'Editar compra' : 'Ver compra'}
                        title={esBorrador ? 'Editar compra' : 'Ver compra'}
                        className={clsx(
                          styles.actionLink,
                          esBorrador ? styles.actionLinkEditar : styles.actionLinkVer
                        )}
                      >
                        {esBorrador ? <Pencil size={16} /> : <Eye size={16} />}
                      </Link>
                    </div>
                  </div>

                  {/* INFORMACIÓN RESUMIDA */}
                  {isExpanded && (
                    <div className={styles.expandedSection}>
                      <h4 className={styles.expandedTitle}>Resumen de productos</h4>
                      <table className={styles.expandedTable}>
                        <thead>
                          <tr className={styles.expandedTableHeader}>
                            <th className={styles.expandedTh}>Producto</th>
                            <th className={styles.expandedTh}>Cantidad</th>
                            <th className={styles.expandedThRight}>Costo total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {c.items && c.items.length > 0 ? (
                            c.items.map((item, idx2) => {
                              let detalleModalidad = item.modalidadCompra || '';

                              if (item.modalidadCompra === 'caja') {
                                const uCaja = item.unidadesporCaja ?? item.unidadesPorCaja;
                                detalleModalidad = uCaja ? `caja x ${uCaja} u.` : 'caja';
                              } else if (item.modalidadCompra === 'bolsa') {
                                const pBolsa = item.pesoBolsaKg ?? item.pesoBolsa;
                                detalleModalidad = pBolsa ? `bolsa x ${pBolsa} kg` : 'bolsa';
                              }

                              return (
                                <tr key={idx2} className={styles.expandedTr}>
                                  <td className={styles.expandedTd}>{item.nombreProducto}</td>
                                  <td className={styles.expandedTd}>
                                    {item.cantidadComprada} {detalleModalidad ? `(${detalleModalidad})` : ''}
                                  </td>
                                  <td className={styles.expandedTdRight}>
                                    {formatoMoneda(item.costoTotal)}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={3} className={styles.emptyProducts}>Sin productos registrados</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!loading && comprasFiltradas.length === 0 && (
        <div className={styles.emptyState}>No hay compras cargadas todavía.</div>
      )}
    </div>
  );
}
