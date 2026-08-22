'use client';

import Image from 'next/image';
import styles from './CategoriaForm.module.css';

export default function CategoriaForm({
  formulario = {},
  editandoId,
  subiendoImagen,
  onChange,
  onFileChange,
  onSubmit,
  onCancel,
}) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <h2 className={styles.titulo}>
            {editandoId ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button
            onClick={onCancel}
            className={styles.closeButton}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <input
          name="nombre"
          placeholder="Nombre"
          value={formulario?.nombre ?? ''}
          onChange={onChange}
          className={styles.input}
        />

        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={formulario?.descripcion ?? ''}
          onChange={onChange}
          className={styles.textarea}
        />

        <input
          name="orden"
          type="number"
          placeholder="Orden"
          value={formulario?.orden ?? ''}
          onChange={onChange}
          className={styles.input}
        />

        <div className={styles.checkboxContainer}>
          <input
            id="categoria-activa"
            type="checkbox"
            name="activa"
            checked={formulario?.activa ?? true}
            onChange={onChange}
            className={styles.checkbox}
          />
          <label htmlFor="categoria-activa" className={styles.checkboxLabel}>
            Categoría activa
          </label>
        </div>

        <input
          type="file"
          onChange={onFileChange}
          disabled={subiendoImagen}
          className={styles.input}
        />

        {subiendoImagen && (
          <p className={styles.textoCargando}>Subiendo imagen...</p>
        )}

        {formulario?.imagen && (
          <Image
            src={formulario.imagen}
            alt="preview"
            width={120}
            height={120}
            className={styles.imagePreview}
          />
        )}

        <div className={styles.filaBotones}>
          <button onClick={onCancel} className={styles.btnSecondary}>
            Cancelar
          </button>

          <button onClick={onSubmit} className={styles.btnPrimary}>
            {editandoId ? 'Actualizar Categoría' : 'Guardar Categoría'}
          </button>
        </div>
      </div>
    </div>
  );
}