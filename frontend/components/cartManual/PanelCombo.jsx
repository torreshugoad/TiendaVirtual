import CampoDescuento from './CampoDescuento';
import BoxPrecioConDescuento from './BoxPrecioConDescuento';
import { formatearPeso } from '@/lib/formatearPeso';
import styles from './cartManual.module.css';

export default function PanelCombo({
  componentesConStock,
  descuentoTipo,
  setDescuentoTipo,
  descuentoValor,
  setDescuentoValor,
  precioCalculado,
  descuentoAplicado,
  precioConDescuento,
  cantidad,
  setCantidad
}) {
  return (
    <div className={styles.card}>
      <label className={styles.label}>Combo</label>

      {componentesConStock.length > 0 && (
        <p className={styles.stockInfo}>
          {componentesConStock.map((c, i) => (
            <span key={i}>
              {c.nombre}: stock{' '}
              {c.stockGranel !== null ? formatearPeso(c.stockGranel) : '—'}
              {i < componentesConStock.length - 1 && ' · '}
            </span>
          ))}
        </p>
      )}

      <CampoDescuento
        descuentoTipo={descuentoTipo}
        setDescuentoTipo={setDescuentoTipo}
        descuentoValor={descuentoValor}
        setDescuentoValor={setDescuentoValor}
      />

      <BoxPrecioConDescuento
        etiqueta="Precio del combo"
        precioOriginal={precioCalculado}
        descuentoAplicado={descuentoAplicado}
        precioFinal={precioConDescuento}
      />

      <label className={`${styles.label} ${styles.mt10}`}>Cantidad</label>

      <input
        type="number"
        step="1"
        min="1"
        value={cantidad}
        onChange={e => setCantidad(e.target.value)}
        className={styles.input}
      />
    </div>
  );
}
