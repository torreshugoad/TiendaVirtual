'use client';

import { ESTADOS_PEDIDO } from '@/constants/pedido';

export default function EstadoSelect({
  value,
  onChange,
  disabled = false,
  incluirTodos = false,
  style = {}
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      style={{ ...styles.select, ...style }}
    >
      {incluirTodos && (
        <option value="todos">Todos</option>
      )}

      {ESTADOS_PEDIDO.map((estado) => (
        <option key={estado} value={estado}>
          {estado}
        </option>
      ))}
    </select>
  );
}

const styles = {
  select: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    background: '#fff',
    fontSize: 14,
    cursor: 'pointer',
    minWidth: 190,
    outline: 'none'
  }
};