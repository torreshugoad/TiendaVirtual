'use client';

import EstadoBadge from '@/components/admin/common/EstadoBadge';
import EstadoSelect from '@/components/admin/common/EstadoSelect';
import Button from '@/components/admin/common/Button';

export default function PedidoRow({
  pedido,
  onSeleccionar,
  onActualizarEstado
}) {
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
  }

  return (
    <tr>
      <td style={styles.td}>#{pedido.nropedido}</td>

      <td style={styles.td}>{fecha}</td>

      <td style={styles.td}>
        <strong>{pedido.cliente}</strong>
      </td>

      <td style={styles.td}>${total.toFixed(2)}</td>

      <td style={styles.td}>
        <EstadoBadge estado={pedido.estado} />
      </td>

      <td style={styles.td}>
        <EstadoSelect
          value={pedido.estado}
          onChange={manejarCambioEstado}
        />
      </td>

      <td style={styles.td}>
        <Button variant="secondary" onClick={() => onSeleccionar(pedido)}>
          Ver
        </Button>
      </td>
    </tr>
  );
}

const styles = {
  td: {
    padding: '8px 10px',
    borderBottom: '1px solid #eee',
    verticalAlign: 'middle',
    fontSize: 13
  }
};