'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react';
import styles from './ProductoFila.module.css';

function formatearPrecio(valor) {
  return `$${Number(valor || 0).toLocaleString('es-AR')}`;
}

export default function ProductoFila({ producto, onEditar, onEliminar, onPreview }) {
  const { nombre, tipoStock, variantes = [] } = producto;

  const descuentoPorcentaje = Number(producto.descuento || 0);
  const tienePromocion = descuentoPorcentaje > 0;

  const badgeClase =
    tipoStock === 'granel'
      ? styles.badgeGranel
      : tipoStock === 'combo'
      ? styles.badgeCombo
      : styles.badgeUnidad;

  const badgeTexto =
    tipoStock === 'granel' ? 'Granel' : tipoStock === 'combo' ? 'Combo' : 'Unidad';

  const stockTexto =
    tipoStock === 'granel'
      ? `${((producto.stockGranel || 0) / 1000).toLocaleString('es-AR', {
          maximumFractionDigits: 3,
        })} Kg`
      : tipoStock === 'combo'
      ? '-'
      : `${variantes.reduce((total, v) => total + Number(v.stock || 0), 0)}`;

  const varianteTexto =
    tipoStock === 'combo'
      ? '-'
      : variantes.length === 0
      ? '-'
      : variantes.length === 1
      ? variantes[0].peso || 'Única'
      : `${variantes.length} variantes`;

  const precioTexto = (() => {
    if (tipoStock === 'combo') {
      return formatearPrecio(producto.precioCombo);
    }
    if (variantes.length === 0) return '-';
    if (variantes.length === 1) return formatearPrecio(variantes[0].precio);

    const precios = variantes.map((v) => Number(v.precio || 0));
    const min = Math.min(...precios);
    const max = Math.max(...precios);

    return min === max
      ? formatearPrecio(min)
      : `${formatearPrecio(min)}-${formatearPrecio(max)}`;
  })();

  return (
    <tr>
      <td>
        <div className={styles.celdaProducto}>
          <span>{nombre}</span>
          {tienePromocion && (
            <span
              className={styles.badgePromo}
              title={`Promoción activa: ${descuentoPorcentaje}% de descuento`}
            >
              -{descuentoPorcentaje}%
            </span>
          )}
        </div>
      </td>
      <td>
        <span className={badgeClase}>{badgeTexto}</span>
      </td>
      <td>{stockTexto}</td>
      <td>{varianteTexto}</td>
      <td className={styles.celdaPrecio}>{precioTexto}</td>
      <td>
        <div className={styles.acciones}>
          {onPreview && (
            <button
              onClick={() => onPreview(producto)}
              className={styles.iconButton}
              aria-label="Ver detalle"
              title="Ver detalle"
            >
              <Eye size={15} />
            </button>
          )}
          {onEditar && (
            <button
              onClick={() => onEditar(producto)}
              className={styles.iconButton}
              aria-label="Editar producto"
              title="Editar producto"
            >
              <Pencil size={15} />
            </button>
          )}
          {onEliminar && (
            <button
              onClick={() => onEliminar(producto)}
              className={styles.iconButton}
              aria-label="Eliminar producto"
              title="Eliminar producto"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}