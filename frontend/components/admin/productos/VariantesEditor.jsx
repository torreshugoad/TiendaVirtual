'use client';

import { Plus, Trash2 } from 'lucide-react';
import styles from './VariantesEditor.module.css';

/* ==========================
   Convierte el texto del peso
   a gramos enteros.
========================== */
function calcularEquivalencia(peso) {
  if (!peso) return 0;

  const texto = peso
    .toLowerCase()
    .replace(',', '.')
    .replace(/\s/g, '');

  if (texto.endsWith('kg')) {
    return Math.round(parseFloat(texto.replace('kg', '')) * 1000);
  }

  if (texto.endsWith('gr')) {
    return Math.round(parseFloat(texto.replace('gr', '')));
  }
  return 0;
}

export default function VariantesEditor({
  tipoStock,
  variantes,
  onAgregar,
  onActualizar,
  onEliminar
}) {
  function cambiarPeso(index, valor) {
    onActualizar(index, {
      peso: valor,
      equivalencia: calcularEquivalencia(valor)
    });
  }

  function cambiarPrecio(index, valor) {
    onActualizar(index, {
      precio: valor === '' ? '' : Number(valor)
    });
  }

  function cambiarStock(index, valor) {
    onActualizar(index, {
      stock: valor === '' ? '' : Number(valor)
    });
  }

  function cambiarStockMinimo(index, valor) {
    onActualizar(index, {
      stockMinimo: valor === '' ? '' : Number(valor)
    });
  }

  function cambiarMargen(index, valor) {
    onActualizar(index, {
      margenMultiplicador: valor
    });
  }

  function cambiarFactorAjuste(index, valor) {
    onActualizar(index, {
      factorAjuste: valor
    });
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.titulo}>Variantes</h3>
        <button
          type="button"
          onClick={onAgregar}
          className={styles.btnPrimary}
        >
          <span className={styles.contenidoBoton}>
            <Plus size={15} />
            Agregar
          </span>
        </button>
      </div>

      {variantes.length > 0 && (
        <div className={styles.tablaScroll}>
          <div className={styles.tablaContenido}>
            <div className={styles.encabezadoFila}>
              <span className={`${styles.labelEncabezado} ${styles.labelPeso}`}>
                Peso venta
              </span>
              <span className={`${styles.labelEncabezado} ${styles.labelNumero}`}>
                Precio
              </span>
              {tipoStock !== 'granel' && (
                <>
                  <span className={`${styles.labelEncabezado} ${styles.labelNumero}`}>
                    Stock
                  </span>
                  <span className={`${styles.labelEncabezado} ${styles.labelNumero}`}>
                    Stock mín.
                  </span>
                </>
              )}
              <span className={`${styles.labelEncabezado} ${styles.labelNumero}`}>
                Factor
              </span>
              <span className={`${styles.labelEncabezado} ${styles.labelNumero}`}>
                Ajuste
              </span>
              <span className={styles.espacioAccion}></span>
            </div>

            {variantes.map((v, index) => (
              <div key={index} className={styles.filaGrid}>
                <input
                  placeholder="Ej: 500gr"
                  title="Opción peso venta"
                  value={v.peso ?? ''}
                  onChange={(e) => cambiarPeso(index, e.target.value)}
                  className={styles.inputPeso}
                />
                <input
                  type="number"
                  placeholder="0"
                  title="Precio Venta"
                  value={v.precio ?? ''}
                  onChange={(e) => cambiarPrecio(index, e.target.value)}
                  className={styles.inputNumero}
                />
                {tipoStock !== 'granel' && (
                  <>
                    <input
                      type="number"
                      placeholder="0"
                      title="Stock Actual"
                      value={v.stock ?? ''}
                      onChange={(e) => cambiarStock(index, e.target.value)}
                      className={styles.inputNumero}
                    />
                    <input
                      type="number"
                      placeholder="0"
                      title="Stock mínimo"
                      value={v.stockMinimo ?? ''}
                      onChange={(e) => cambiarStockMinimo(index, e.target.value)}
                      className={styles.inputNumero}
                    />
                  </>
                )}

                <input
                  type="text"
                  inputMode="decimal"
                  title="Factor multiplicador"
                  placeholder="Margen"
                  value={v.margenMultiplicador ?? ''}
                  onChange={(e) => cambiarMargen(index, e.target.value)}
                  className={styles.inputNumero}
                />

                <input
                  type="text"
                  inputMode="decimal"
                  title="Ajuste fino"
                  placeholder="Ajuste"
                  value={v.factorAjuste ?? ''}
                  onChange={(e) => cambiarFactorAjuste(index, e.target.value)}
                  className={styles.inputNumero}
                />

                <button
                  type="button"
                  className={styles.iconDanger}
                  onClick={() => onEliminar(index)}
                  title="Eliminar variante"
                  aria-label="Eliminar variante"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}