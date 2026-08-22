import ItemCarritoFila from './ItemCarritoFila';
import styles from './cartManual.module.css';

export default function ListaCarrito({
  carrito,
  actualizarCantidad,
  quitarDelCarrito,
  subtotal,
  tipoEntrega,
  costoEnvio,
  totalFinal
}) {
  return (
    <div className={styles.card}>
      <label className={styles.label}>Carrito ({carrito.length} ítems)</label>

      {carrito.length === 0 && (
        <p className={styles.vacio}>Todavía no agregaste productos.</p>
      )}

      {carrito.map(item => (
        <ItemCarritoFila
          key={item.tempId}
          item={item}
          onCambiarCantidad={actualizarCantidad}
          onQuitar={quitarDelCarrito}
        />
      ))}

      {carrito.length > 0 && (
        <div className={styles.totales}>
          <div className={styles.totalLinea}>Subtotal: ${subtotal}</div>

          {tipoEntrega === 'envio' && (
            <div className={styles.totalLinea}>
              Envío: {costoEnvio === 0 ? 'GRATIS' : `$${costoEnvio}`}
            </div>
          )}

          <div className={styles.totalFinal}>Total: ${totalFinal}</div>
        </div>
      )}
    </div>
  );
}
