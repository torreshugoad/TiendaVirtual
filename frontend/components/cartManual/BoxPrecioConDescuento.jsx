import styles from './cartManual.module.css';

// Muestra el precio original (tachado, si hay descuento), el
// descuento aplicado y el precio final que va a quedar cargado.
export default function BoxPrecioConDescuento({
  etiqueta,
  precioOriginal,
  descuentoAplicado,
  precioFinal
}) {
  const hayDescuento = descuentoAplicado > 0;

  return (
    <div className={styles.precioBox}>
      <div className={styles.precioBoxEtiqueta}>{etiqueta}</div>

      {hayDescuento && (
        <div className={styles.precioBoxTachado}>${precioOriginal}</div>
      )}

      <div className={styles.precioBoxFinal}>${precioFinal}</div>

      {hayDescuento && (
        <div className={styles.precioBoxDescuento}>
          Descuento aplicado: -${descuentoAplicado}
        </div>
      )}
    </div>
  );
}
