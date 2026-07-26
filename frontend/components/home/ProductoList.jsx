import ProductosGrid from './ProductosGrid';

const styles = {
  filaSuperior: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    gap: '10px',
  },
  titulo: {
    margin: 0,
    color: '#111827',
    fontSize: '22px',
  },
  botonVolver: {
    background: '#7f1d1d',
    color: '#ffffff',
    border: 'none',
    padding: '8px 36px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
  },
};

export default function ProductoList({
  categoria,
  productos,
  cargando,
  onVolver,
  onAgregarAlCarrito,
}) {
  return (
    <>
      <div style={styles.filaSuperior}>
        <h2 style={styles.titulo}>{categoria.nombre}</h2>
        <button style={styles.botonVolver} onClick={onVolver}>
          Volver
        </button>
      </div>

      <ProductosGrid
        productos={productos}
        cargando={cargando}
        mensajeVacio="No hay productos en esta categoría"
        onAgregarAlCarrito={onAgregarAlCarrito}
      />
    </>
  );
}
