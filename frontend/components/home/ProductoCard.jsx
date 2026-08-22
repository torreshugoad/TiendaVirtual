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
    color: '#870019',
    lineHeight: 1.1,
  },
  precioOriginal: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#9ca3af',
    textDecoration: 'line-through',
    lineHeight: 1.1,
  },
badgePromo: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #c13f13, #f5af19)', // Degradado rojo a amarillo/naranja vibrante
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: '1000',
    padding: '10px 22px',
    borderRadius: '25px 10px 25px 10px',
    marginLeft: '12px',
    verticalAlign: 'middle',
    boxShadow: '0 6px 10px rgba(241, 39, 17, 0.3)',
    border: '2px dashed #ffffff', // Da un toque de etiqueta/sticker recortado
    transform: 'rotate(8deg)',     // Inclinación divertida opuesta
    letterSpacing: '0.5px',
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

// Promoción visible del producto (0 = sin descuento activo).
// Se expresa como porcentaje, igual que en Producto.descuento.
function calcularPrecioConDescuento(precio, descuentoPorcentaje) {
  const precioOriginal = Number(precio || 0);
  const porcentaje = Number(descuentoPorcentaje || 0);

  if (porcentaje <= 0) {
    return { precioOriginal, precioFinal: precioOriginal, hayDescuento: false };
  }

  const precioFinal = Math.round(
    precioOriginal - (precioOriginal * porcentaje) / 100
  );

  return { precioOriginal, precioFinal, hayDescuento: true };
}

// Bloque de precio: si hay promoción, muestra el original tachado
// arriba y el precio final debajo; si no, solo el precio normal.
function BloquePrecio({ precio, descuentoPorcentaje }) {
  const { precioOriginal, precioFinal, hayDescuento } =
    calcularPrecioConDescuento(precio, descuentoPorcentaje);

  if (!hayDescuento) {
    return <span style={styles.precio}>${precioOriginal}</span>;
  }

  return (
    <>
      <span style={styles.precioOriginal}>${precioOriginal}</span>
      <span style={styles.precio}>${precioFinal}</span>
    </>
  );
}

export default function ProductoCard({ producto, onAgregarAlCarrito }) {
  const descuentoPorcentaje = Number(producto.descuento || 0);
  const tienePromocion = descuentoPorcentaje > 0;

  return (
    <div style={styles.card}>
      <h2 style={styles.nombre}>
        {producto.nombre}
        {tienePromocion && (
          <span style={styles.badgePromo}>-{descuentoPorcentaje}%</span>
        )}
      </h2>
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
          {producto.tipoStock === 'combo' ? (
            <div style={styles.variante}>
              <div style={styles.varianteInfo}>
                <span style={styles.peso}>Combo</span>
                <BloquePrecio
                  precio={producto.precioCombo}
                  descuentoPorcentaje={descuentoPorcentaje}
                />
              </div>

              <button
                onClick={() =>
                  onAgregarAlCarrito(producto, {
                    peso: null,
                    precio: producto.precioCombo,
                  })
                }
                style={botonAgregarStyle(1)}
              >
                Agregar al carrito
              </button>
            </div>
          ) : (
            producto.variantes.map((variante) => {
              const stockDisponible = calcularStockDisponible(
                producto,
                variante
              );

              return (
                <div key={variante._id} style={styles.variante}>
                  <div style={styles.varianteInfo}>
                    <span style={styles.peso}>{variante.peso}</span>
                    <BloquePrecio
                      precio={variante.precio}
                      descuentoPorcentaje={descuentoPorcentaje}
                    />
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
            })
          )}
        </div>
      </div>
    </div>
  );
}
