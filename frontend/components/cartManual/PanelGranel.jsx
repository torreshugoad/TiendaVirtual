import CampoDescuento from './CampoDescuento';
import BoxPrecioConDescuento from './BoxPrecioConDescuento';
import { formatearPeso } from '@/lib/formatearPeso';
import styles from './cartManual.module.css';

export default function PanelGranel({
  productoSeleccionado,
  variantes,
  varianteId,
  varianteSeleccionada,
  cambiarVarianteReferencia,
  nuevoPeso,
  setNuevoPeso,
  unidad,
  setUnidad,
  nuevoPesoGramos,
  descuentoTipo,
  setDescuentoTipo,
  descuentoValor,
  setDescuentoValor,
  precioCalculado,
  descuentoAplicado,
  precioConDescuento
}) {
  const stockGranel = Number(productoSeleccionado?.stockGranel || 0);
  const superaStock = nuevoPeso !== '' && nuevoPesoGramos > stockGranel;

  return (
    <>
      <div className={styles.card}>
        <label className={styles.label}>Variante de referencia</label>

        <select
          value={varianteId}
          onChange={e => cambiarVarianteReferencia(e.target.value)}
          className={styles.input}
        >
          {variantes.map(v => (
            <option key={v._id} value={v._id}>
              {v.peso} — ${v.precio}
            </option>
          ))}
        </select>

        <p className={superaStock ? styles.stockInfoAlerta : styles.stockInfo}>
          Stock disponible: {formatearPeso(stockGranel)}
          {superaStock && ' — supera el stock actual'}
        </p>
      </div>

      <div className={styles.card}>
        <label className={styles.label}>Peso a cargar</label>

        <div className={`${styles.filaGap} ${styles.mb8}`}>
          <input
            type="number"
            step="1"
            min="0"
            placeholder="Ej. 280"
            value={nuevoPeso}
            onChange={e => setNuevoPeso(e.target.value)}
            className={`${styles.input} ${styles.inputFlex}`}
          />

          <select
            value={unidad}
            onChange={e => setUnidad(e.target.value)}
            className={`${styles.input} ${styles.selectUnidad}`}
          >
            <option value="gr">Gr</option>
            <option value="kg">Kg</option>
          </select>
        </div>

        {varianteSeleccionada && nuevoPeso !== '' && (
          <>
            <CampoDescuento
              descuentoTipo={descuentoTipo}
              setDescuentoTipo={setDescuentoTipo}
              descuentoValor={descuentoValor}
              setDescuentoValor={setDescuentoValor}
            />

            <BoxPrecioConDescuento
              etiqueta={`Precio para ${nuevoPesoGramos}Gr`}
              precioOriginal={precioCalculado}
              descuentoAplicado={descuentoAplicado}
              precioFinal={precioConDescuento}
            />
          </>
        )}
      </div>
    </>
  );
}
