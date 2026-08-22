'use client';

import PedidoRow from './PedidoRow';
import EmptyState from '@/components/admin/common/EmptyState';
import styles from './PedidosTable.module.css';

export default function PedidosTable({
  pedidos = [],
  onSeleccionar,
  onActualizarEstado
}) {
  if (pedidos.length === 0) {
    return <EmptyState mensaje="No hay pedidos para mostrar." />;
  }

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Nº</th>
            <th className={styles.th}>Fecha</th>
            <th className={styles.th}>Cliente</th>
            <th className={styles.thRight}>Total</th>
            <th className={styles.th}>Estado</th>
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
