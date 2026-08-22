'use client';

import { Pencil, Trash2 } from 'lucide-react';

import styles from './ProductoCard.module.css';

export default function ProductoCard({ producto, onEditar, onEliminar }) {
  const {
    nombre,
    foto,
    categoria,
    tipoStock,
    variantes = [],
    orden,
    descripcion,
  } = producto;

  const descuentoPorcentaje = Number(producto.descuento || 0);
  const tienePromocion = descuentoPorcentaje > 0;

  const nombreCategoria =
    typeof categoria === 'object' ? categoria?.nombre : categoria;

  const stockTexto =
    tipoStock === 'granel'
      ? `${((producto.stockGranel || 0) / 1000).toLocaleString('es-AR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 3,
        })} Kg`
      : tipoStock === 'combo'
      ? null
      : `${variantes.reduce(
          (total, v) => total + Number(v.stock || 0),
          0
        )} unidades`;

  const stockMinimoTexto =
    tipoStock === 'granel'
      ? `${((producto.stockMinimoGranel || 0) / 1000).toLocaleString('es-AR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 3,
        })} Kg`
      : tipoStock === 'combo'
      ? null
      : `${variantes.reduce(
          (total, v) => total + Number(v.stockMinimo || 0),
          0
        )} unidades`;

  const badgeClase =
    tipoStock === 'granel'
      ? styles.badgeGranel
      : tipoStock === 'combo'
      ? styles.badgeCombo
      : styles.badgeUnidad;

  const badgeTexto =
    tipoStock === 'granel' ? 'Granel' : tipoStock === 'combo' ? 'Combo' : 'Unidad';

  return (
    <div className={styles.card}>
      {/* Línea Superior: Nombre del producto */}
      <div className={styles.nombreRow}>
        <span className={styles.nombreValor}>{nombre}</span>
        {tienePromocion && (
          <span
            style={{
              marginLeft: 8,
              background: '#c20326',
              color: '#fff',
              fontSize: 11,
              fontWeight: 'bold',
              padding: '2px 8px',
              borderRadius: 999,
            }}
          >
            Promo -{descuentoPorcentaje}%
          </span>
        )}
      </div>

      {/* Descripción */}
      {descripcion && (
        <p className={styles.descripcion}>{descripcion}</p>
      )}

      {/* Cabecera inferior: categoría / orden / acciones */}
      <div className={styles.header}>
        <span className={styles.categoriaValor}>
          {nombreCategoria || 'Sin categoría'}
        </span>
        <span className={styles.ordenValor}>{orden ?? 0}</span>
        <div className={styles.accionesHeader}>
          <button
            onClick={() => onEditar(producto)}
            className={styles.iconButton}
            aria-label="Editar producto"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onEliminar(producto._id)}
            className={styles.iconButton}
            aria-label="Eliminar producto"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Cuerpo: imagen + datos */}
      <div className={styles.body}>
        <div className={styles.colFoto}>
          {foto ? (
            <img src={foto} alt={nombre} className={styles.imagen} />
          ) : (
            <div className={styles.sinImagen}>📦</div>
          )}
        </div>

        <div className={styles.colDatos}>
          {/* Tipo / Stock / Stock mínimo */}
          <div className={styles.filaInfo}>
            <div className={styles.campo}>
              <span className={styles.label}>Tipo</span>
              <span className={styles.valor}>
                <span className={badgeClase}>{badgeTexto}</span>
              </span>
            </div>

            {tipoStock === 'combo' ? (
              <div className={styles.campo} style={{ gridColumn: 'span 2' }}>
                <span className={styles.label}>Precio combo</span>
                <span className={`${styles.valor} ${styles.precioComboTexto}`}>
                  {tienePromocion && (
                    <span
                      style={{
                        textDecoration: 'line-through',
                        color: '#9ca3af',
                        fontWeight: 'normal',
                        marginRight: 6,
                        fontSize: '0.85em',
                      }}
                    >
                      ${Number(producto.precioCombo || 0).toLocaleString('es-AR')}
                    </span>
                  )}
                  $
                  {(
                    tienePromocion
                      ? Math.round(
                          Number(producto.precioCombo || 0) -
                            (Number(producto.precioCombo || 0) *
                              descuentoPorcentaje) /
                              100
                        )
                      : Number(producto.precioCombo || 0)
                  ).toLocaleString('es-AR')}
                </span>
              </div>
            ) : (
              <>
                <div className={styles.campo}>
                  <span className={styles.label}>Stock</span>
                  <span className={styles.valor}>{stockTexto}</span>
                </div>
                <div className={styles.campo}>
                  <span className={styles.label}>Stock mínimo</span>
                  <span className={styles.valor}>{stockMinimoTexto}</span>
                </div>
              </>
            )}
          </div>

          {/* Variantes */}
          {tipoStock !== 'combo' && variantes.length > 0 && (
            <table className={styles.tablaVariantes}>
              <thead>
                <tr>
                  <th>Variante</th>
                  <th>Equivalencia</th>
                  <th>Margen</th>
                  <th className={styles.precioCelda}>Precio</th>
                </tr>
              </thead>
              <tbody>
                {variantes.map((v, index) => {
                  const precioVariante = Number(v.precio || 0);
                  const precioConDescuento = tienePromocion
                    ? Math.round(
                        precioVariante -
                          (precioVariante * descuentoPorcentaje) / 100
                      )
                    : precioVariante;

                  return (
                    <tr key={index}>
                      <td>{v.peso}</td>
                      <td>{v.equivalencia} g</td>
                      <td>
                        {v.margenMultiplicador ?? 2}x{v.factorAjuste ?? 1}
                      </td>
                      <td className={styles.precioCelda}>
                        {tienePromocion && (
                          <span
                            style={{
                              textDecoration: 'line-through',
                              color: '#9ca3af',
                              marginRight: 6,
                              fontSize: '0.85em',
                            }}
                          >
                            ${precioVariante.toLocaleString('es-AR')}
                          </span>
                        )}
                        ${precioConDescuento.toLocaleString('es-AR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}