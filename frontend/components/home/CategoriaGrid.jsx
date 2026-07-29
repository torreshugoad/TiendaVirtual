const styles = {
  titulo: {
    marginBottom: '10px',
    color: '#111827',
    fontSize: '20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  boton: {
    background: '#6ec4b5',
    border: 'none',
    borderRadius: '12px',
    padding: '20px 10px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#111827',
  },
  botonOferta: {
    background: '#f97316',
    border: 'none',
    borderRadius: '12px',
    padding: '20px 10px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cargando: {
    textAlign: 'center',
    padding: '30px',
    fontWeight: 'bold',
    color: '#111827',
  },
};

export default function CategoriaGrid({ categorias, cargando, onSeleccionar }) {
  return (
    <>
      <h2 style={styles.titulo}>Categorías</h2>

      {cargando ? (
        <div style={styles.cargando}>Cargando categorías, ya casi terminamos...</div>
      ) : (
        <div style={styles.grid}>
          {categorias.map((categoria) => {
            const esOferta = categoria.nombre
              ?.toLowerCase()
              .includes('oferta');

            return (
              <button
                key={categoria._id}
                style={esOferta ? styles.botonOferta : styles.boton}
                onClick={() => onSeleccionar(categoria)}
              >
                {categoria.nombre}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
