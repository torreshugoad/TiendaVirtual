'use client';

import { Pencil, Trash2 } from 'lucide-react';
import styles from './CategoriaCard.module.css';

export default function CategoriaCard({ categoria = {}, onEdit, onDelete }) {
  return (
    <tr className={styles.categoriaRow}>
      <td className={styles.celda}>{categoria?.nombre ?? '-'}</td>
      <td className={styles.celda}>
        <span
          className={
            categoria?.activa ? styles.badgeActiva : styles.badgeInactiva
          }
        >
          {categoria?.activa ? 'Activa' : 'Inactiva'}
        </span>
      </td>
      <td className={`${styles.celda} ${styles.celdaOrden}`}>
        {categoria?.orden ?? 0}
      </td>
      <td className={`${styles.celda} ${styles.celdaAcciones}`}>
        <button
          onClick={() => onEdit(categoria)}
          className={styles.btnAccionEdit}
          aria-label="Editar categoría"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onDelete(categoria?._id)}
          className={styles.btnAccionDelete}
          aria-label="Eliminar categoría"
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}