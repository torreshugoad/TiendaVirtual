import styles from './cartManual.module.css';

// Campo para cargar el descuento del producto que se está por agregar
// al carrito. Permite elegir entre porcentaje (%) o monto fijo ($).
export default function CampoDescuento({
  descuentoTipo,
  setDescuentoTipo,
  descuentoValor,
  setDescuentoValor
}) {
  return (
    <div className={`${styles.mb8} ${styles.mt10}`}>
      <label className={styles.label}>Descuento (opcional)</label>

      <div className={styles.filaGap}>
        <input
          type="number"
          step="1"
          min="0"
          placeholder="0"
          value={descuentoValor}
          onChange={e => setDescuentoValor(e.target.value)}
          className={`${styles.input} ${styles.inputFlex}`}
        />

        <select
          value={descuentoTipo}
          onChange={e => setDescuentoTipo(e.target.value)}
          className={`${styles.input} ${styles.selectDescuentoTipo}`}
        >
          <option value="porcentaje">%</option>
          <option value="monto">$</option>
        </select>
      </div>
    </div>
  );
}
