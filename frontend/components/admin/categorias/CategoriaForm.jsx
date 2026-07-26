import Image from 'next/image';
import styles from '@/app/admin/categorias/categorias.module.css';

export default function CategoriaForm({
  formulario,
  editandoId,
  subiendoImagen,
  onChange,
  onFileChange,
  onSubmit,
  onCancel,
}) {
  return (
    <div className={styles.card}>
      <h2>{editandoId ? 'Editar Categoría' : 'Nueva Categoría'}</h2>

      <input
        name="nombre"
        placeholder="Nombre"
        value={formulario.nombre}
        onChange={onChange}
        className={styles.input}
      />

      <textarea
        name="descripcion"
        placeholder="Descripción"
        value={formulario.descripcion}
        onChange={onChange}
        className={styles.textarea}
      />

      <input
        name="orden"
        type="number"
        placeholder="Orden"
        value={formulario.orden}
        onChange={onChange}
        className={styles.input}
      />

      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          name="activa"
          checked={formulario.activa}
          onChange={onChange}
        />
        Categoría activa
      </label>

      <input
        type="file"
        onChange={onFileChange}
        disabled={subiendoImagen}
        className={styles.input}
      />

      {subiendoImagen && <p>Subiendo imagen...</p>}

      {formulario.imagen && (
        <Image
          src={formulario.imagen}
          alt="preview"
          width={120}
          height={120}
          className={styles.imagePreview}
        />
      )}

      <button onClick={onSubmit} className={styles.saveButton}>
        {editandoId ? 'Actualizar Categoría' : 'Guardar Categoría'}
      </button>

      {editandoId && (
        <button
          onClick={onCancel}
          className={styles.navButton}
          style={{ marginTop: 10, width: '100%' }}
        >
          Cancelar edición
        </button>
      )}
    </div>
  );
}
