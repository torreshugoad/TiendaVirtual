'use client';

import EstadoSelect from '@/components/admin/common/EstadoSelect';
import Button from '@/components/admin/common/Button';

export default function PedidosToolbar({
  textoBusqueda,
  setTextoBusqueda,

  estadoFiltro,
  setEstadoFiltro,

  fechaDesde,
  setFechaDesde,

  fechaHasta,
  setFechaHasta,

  onActualizar,
  onExportar
}) {
  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <input
          placeholder="Buscar cliente, teléfono o pedido..."
          value={textoBusqueda}
          onChange={(e) => setTextoBusqueda(e.target.value)}
          style={styles.input}
        />

        <EstadoSelect
          value={estadoFiltro}
          onChange={setEstadoFiltro}
          incluirTodos
        />

        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          style={styles.input}
        />

        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.right}>
        <Button variant="secondary" onClick={onActualizar}>
          🔄 Actualizar
        </Button>

        <Button variant="success" onClick={onExportar}>
          📊 Exportar Excel
        </Button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
    marginBottom: 25
  },

  left: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    flex: 1
  },

  right: {
    display: 'flex',
    gap: 10
  },

  input: {
    padding: 10,
    border: '1px solid #ddd',
    borderRadius: 10,
    minWidth: 170,
    fontSize: 14
  }
};