import { calcularStockDisponible } from '@/lib/stock';

const styles = {
  card: {
    background: '#ffffff',
    borderRadius: '8px',
    padding: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  },
  nombre: {
    margin: 0,
    marginBottom: '5px',
    fontSize: '18px',
    lineHeight: 0.6,
    color: '#03240b',
  },
  descripcion: {
    fontSize: '13px',
    color: '#666',
    marginTop: '5px',
    marginBottom: '10px',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
  },
  fila: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
  },
  imagenWrap: {
    width: '100px',
    flexShrink: 0,
  },
  imagen: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '20px',
  },
  variantesCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  variante: {
    border: '1px solid #025221',
    borderRadius: '5px',
    padding: '5px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1px',
  },
  varianteInfo: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '60px',
  },
  peso: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  precio: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#c20326',
    lineHeight: 1.1,
  },
};

function botonAgregarStyle(stockDisponible) {
  return {
    background: stockDisponible <= 0 ? '#6b7280' : '#41635a',
    color: '#ffffff',
    border: 'none',
    padding: '10px 14px',
    borderRadius: '10px',
    cursor: stockDisponible <= 0 ? 'not-allowed' : 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    minWidth: '130px',
    textAlign: 'center',
  };
}

function urlImagen(producto) {
  if (!producto.foto || producto.foto === '') {
    return '/placeholder-producto.jpg';
  }
  return producto.foto.replace('/upload/', '/upload/e_vignette:20/');
}

export default function ProductoCard({ producto, onAgregarAlCarrito }) {
  return (
    <div style={styles.card}>
      <h2 style={styles.nombre}>{producto.nombre}</h2>
      <p style={styles.descripcion}>{producto.descripcion}</p>

      <div style={styles.fila}>
        <div style={styles.imagenWrap}>
          <img
            src={urlImagen(producto)}
            alt={producto.nombre}
            style={styles.imagen}
          />
        </div>

        <div style={styles.variantesCol}>
          {producto.variantes.map((variante) => {
            const stockDisponible = calcularStockDisponible(
              producto,
              variante
            );

            return (
              <div key={variante._id} style={styles.variante}>
                <div style={styles.varianteInfo}>
                  <span style={styles.peso}>{variante.peso}</span>
                  <span style={styles.precio}>${variante.precio}</span>
                </div>

                <button
                  disabled={stockDisponible <= 0}
                  onClick={() => onAgregarAlCarrito(producto, variante)}
                  style={botonAgregarStyle(stockDisponible)}
                >
                  {stockDisponible <= 0 ? 'Sin stock' : 'Agregar al carrito'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
