import ProductoCard from './ProductoCard';

const styles = {
  cargando: {
    textAlign: 'center',
    padding: '30px',
    fontWeight: 'bold',
    color: '#111827',
  },
  vacio: {
    textAlign: 'center',
    padding: '30px',
    color: '#666',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '5px',
  },
};

export default function ProductosGrid({
  productos,
  cargando,
  mensajeVacio,
  onAgregarAlCarrito,
}) {
  if (cargando) {
    return <div style={styles.cargando}>Cargando productos...</div>;
  }

  if (productos.length === 0) {
    return <div style={styles.vacio}>{mensajeVacio}</div>;
  }

  return (
    <div style={styles.grid}>
      {productos.map((producto) => (
        <ProductoCard
          key={producto._id}
          producto={producto}
          onAgregarAlCarrito={onAgregarAlCarrito}
        />
      ))}
    </div>
  );
}
