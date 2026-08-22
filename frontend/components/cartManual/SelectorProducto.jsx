import BuscadorProductos from '@/components/home/BuscadorProductos';

import styles from './cartManual.module.css';

export default function SelectorProducto({
  buscar,
  setBuscar,
  productoId,
  seleccionarProducto,
  productosFiltrados
}) {
  return (
    <div className={styles.card}>
      <label className={styles.label}>Producto</label>

      <BuscadorProductos
        valor={buscar}
        onChange={setBuscar}
        placeholder="Buscar producto..."
        style={{ border: '1px solid #d1d5db', marginBottom: 8 }}
      />

      <select
        value={productoId}
        onChange={e => seleccionarProducto(e.target.value)}
        className={styles.input}
      >
        <option value="">Seleccioná un producto...</option>
        {productosFiltrados.map(p => (
          <option key={p._id} value={p._id}>
            {p.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
