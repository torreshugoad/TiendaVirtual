'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import ProductoCard from './ProductoCard';
import styles from './ProductoPreview.module.css';

export default function ProductoPreview({ producto, onClose, onEditar, onEliminar }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (producto) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [producto, onClose]);

  if (!producto) return null;

  function editarYCerrar(p) {
    onClose();
    if (onEditar) onEditar(p);
  }

  function eliminarYCerrar(p) {
    onClose();
    if (onEliminar) onEliminar(p);
  }

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-preview"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Cerrar vista previa"
          title="Cerrar vista previa"
        >
          <X size={18} />
        </button>

        <ProductoCard
          producto={producto}
          onEditar={editarYCerrar}
          onEliminar={eliminarYCerrar}
        />
      </div>
    </div>
  );
}