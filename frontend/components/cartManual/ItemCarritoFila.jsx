import styles from './cartManual.module.css';

export default function ItemCarritoFila({ item, onCambiarCantidad, onQuitar }) {
  return (
    <div className={styles.itemFila}>
      <div className={styles.itemInfo}>
        <div className={styles.itemNombre}>{item.nombre}</div>
        <div className={styles.itemMeta}>
          {item.peso} —{' '}
          {item.descuentoMonto > 0 ? (
            <>
              <span className={styles.precioTachado}>
                ${item.precioOriginal}
              </span>{' '}
              ${item.precio} c/u{' '}
              <span className={styles.descuentoTexto}>
                (-${item.descuentoMonto})
              </span>
            </>
          ) : (
            <>${item.precio} c/u</>
          )}
        </div>
      </div>

      <input
        type="number"
        min="1"
        value={item.cantidad}
        onChange={e => onCambiarCantidad(item.tempId, e.target.value)}
        className={`${styles.input} ${styles.inputCantidadFila}`}
      />

      <div className={styles.itemSubtotal}>${item.subtotal}</div>

      <button onClick={() => onQuitar(item.tempId)} className={styles.botonQuitar}>
        ✕
      </button>
    </div>
  );
}
