'use client';

import PedidoRow from './PedidoRow';
import EmptyState from '@/components/admin/common/EmptyState';

export default function PedidosTable({
  pedidos = [],
  onSeleccionar,
  onActualizarEstado
}) {
  if (pedidos.length === 0) {
    return <EmptyState mensaje="No hay pedidos para mostrar." />;
  }

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nº</th>
            <th style={styles.th}>Fecha</th>
            <th style={styles.th}>Cliente</th>
            <th style={styles.th}>Total</th>
            <th style={styles.th}>Estado</th>
            <th style={styles.th}>Cambiar Estado</th>
            <th style={styles.th}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {pedidos.map((pedido) => (
            <PedidoRow
              key={pedido._id}
              pedido={pedido}
              onSeleccionar={onSeleccionar}
              onActualizarEstado={onActualizarEstado}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    background: '#fff',
    borderRadius: 14,
    overflowX: 'auto',
    boxShadow: '0 2px 10px rgba(0,0,0,.08)'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: 780
  },

  th: {
    padding: 10,
    background: '#f8fafc',
    borderBottom: '2px solid #e5e7eb',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: 13,
    color: '#374151',
    whiteSpace: 'nowrap'
  }
};