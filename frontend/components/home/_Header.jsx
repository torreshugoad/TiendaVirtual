import Link from 'next/link';

const styles = {
  header: {
    background: 'hsl(146, 88%, 23%)',
    padding: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  fila: {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
  },
  titulo: {
    margin: 0,
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '36px',
    color: '#c4ffc3',
    lineHeight: 1,
  },
  descripcion: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#ffffff',
  },
  botonCarrito: {
    background: '#c2410c',
    color: '#ffffff',
    border: 'none',
    padding: '14px 18px',
    borderRadius: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '16px',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
  },
  nota: {
    marginTop: '6px',
    background: '#fff3cd',
    color: '#856404',
    padding: '6px',
    borderRadius: '6px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'Verdana, sans-serif',
    fontSize: '13px',
    maxWidth: '900px',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
  },
};

export default function Header({ configuracion, cantidadCarrito }) {
  return (
    <header style={styles.header}>
      <div style={styles.fila}>
        <div>
          <h1 style={styles.titulo}>{configuracion.nombreTienda}</h1>
          <p style={styles.descripcion}>{configuracion.descripcion}</p>
        </div>

        <Link href="/cart" style={{ textDecoration: 'none' }}>
          <button style={styles.botonCarrito}>
            Mi carrito: {cantidadCarrito}
          </button>
        </Link>
      </div>

      {configuracion.notaHeader && (
        <div style={styles.nota}>{configuracion.notaHeader}</div>
      )}
    </header>
  );
}
