import CampoDescuento from './CampoDescuento';
import BoxPrecioConDescuento from './BoxPrecioConDescuento';
import styles from './cartManual.module.css';

export default function PanelUnidad({
  variantes,
  varianteId,
  setVarianteId,
  varianteSeleccionada,
  cantidad,
  setCantidad,
  descuentoTipo,
  setDescuentoTipo,
  descuentoValor,
  setDescuentoValor,
  precioCalculado,
  descuentoAplicado,
  precioConDescuento
}) {
  const stockVariante = Number(varianteSeleccionada?.stock || 0);
  const superaStock = Number(cantidad || 0) > stockVariante;

  return (
    <div className={styles.card}>
      <label className={styles.label}>Variante</label>

      <select
        value={varianteId}
        onChange={e => setVarianteId(e.target.value)}
        className={`${styles.input} ${styles.mb8}`}
      >
        {variantes.map(v => (
          <option key={v._id} value={v._id}>
            {v.peso} — ${v.precio}
          </option>
        ))}
      </select>

      {varianteSeleccionada && (
        <p className={superaStock ? styles.stockInfoAlerta : styles.stockInfo}>
          Stock disponible: {stockVariante} unidades
          {superaStock && ' — supera el stock actual'}
        </p>
      )}

      <label className={styles.label}>Cantidad</label>

      <input
        type="number"
        step="1"
        min="1"
        value={cantidad}
        onChange={e => setCantidad(e.target.value)}
        className={`${styles.input} ${styles.mb8}`}
      />

      <CampoDescuento
        descuentoTipo={descuentoTipo}
        setDescuentoTipo={setDescuentoTipo}
        descuentoValor={descuentoValor}
        setDescuentoValor={setDescuentoValor}
      />

      {varianteSeleccionada && (
        <BoxPrecioConDescuento
          etiqueta="Precio unitario"
          precioOriginal={precioCalculado}
          descuentoAplicado={descuentoAplicado}
          precioFinal={precioConDescuento}
        />
      )}
    </div>
  );
}
