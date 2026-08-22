'use client';

import { useState } from 'react';
import { Eye, RefreshCw } from 'lucide-react';

import EstadoBadge from '@/components/admin/common/EstadoBadge';
import EstadoSelect from '@/components/admin/common/EstadoSelect';
import styles from './PedidosTable.module.css';

export default function PedidoRow({
  pedido,
  onSeleccionar,
  onActualizarEstado
}) {
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  const total = Number(pedido.total || 0);

  const fecha = new Date(pedido.fecha).toLocaleDateString('es-AR');

  function manejarCambioEstado(nuevoEstado) {
    if (nuevoEstado === 'Cancelado') {
      const confirmar = window.confirm(
        `¿Cancelar el pedido #${pedido.nropedido}? Esta acción repone el stock de los productos del pedido.`
      );

      if (!confirmar) return;
    }

    onActualizarEstado(pedido._id, nuevoEstado);
    setCambiandoEstado(false);
  }

  return (
    <tr>
      <td className={styles.td}>#{pedido.nropedido}</td>

      <td className={styles.td}>{fecha}</td>

      <td className={styles.td}>
        <strong>{pedido.cliente}</strong>
      </td>

      <td className={styles.tdRight}>${total.toFixed(2)}</td>

      <td className={styles.td}>
        <div className={styles.estadoConAcciones}>
          {cambiandoEstado ? (
            <EstadoSelect
              value={pedido.estado}
              onChange={manejarCambioEstado}
            />
          ) : (
            <EstadoBadge estado={pedido.estado} />
          )}

          <div className={styles.acciones}>
            <button
              onClick={() => onSeleccionar(pedido)}
              className={styles.iconButton}
              aria-label="Ver pedido"
              title="Ver pedido"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => setCambiandoEstado((v) => !v)}
              className={styles.iconButton}
              aria-label="Cambiar estado"
              title="Cambiar estado"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}
