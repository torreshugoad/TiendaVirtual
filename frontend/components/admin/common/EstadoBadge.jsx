'use client';

const ESTADOS = {

  'Pedido pendiente': {
    color: '#92400e',
    background: '#fef3c7',
    icono: '🟡'
  },

  'Pedido entregado': {
    color: '#166534',
    background: '#dcfce7',
    icono: '🟢'
  },

  'Cancelado': {
    color: '#991b1b',
    background: '#fee2e2',
    icono: '🔴'
  }
};

export default function EstadoBadge({ estado }) {

  const datos =
    ESTADOS[estado] ||
    {
      color: '#374151',
      background: '#f3f4f6',
      icono: '⚪'
    };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color: datos.color,
        background: datos.background,
        whiteSpace: 'nowrap'
      }}
    >
      <span>{datos.icono}</span>
      {estado}
    </span>
  );
}