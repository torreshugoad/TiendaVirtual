import Image from 'next/image';
import styles from '@/app/admin/categorias/categorias.module.css';

export default function CategoriaCard({ categoria, onEdit, onDelete }) {
  return (
    <div className={styles.categoriaCard}>
      {categoria.imagen && (
        <Image
          src={categoria.imagen}
          alt={categoria.nombre}
          width={80}
          height={80}
          className={styles.categoriaImage}
        />
      )}

      <div className={styles.categoriaInfo}>
        <h2>{categoria.nombre}</h2>
        <p>{categoria.descripcion}</p>
        <p>Orden: {categoria.orden}</p>
        <p>{categoria.activa ? 'Activa' : 'Inactiva'}</p>
      </div>

      <div className={styles.actions}>
        <button onClick={() => onEdit(categoria)} className={styles.editButton}>
          Editar
        </button>
        <button
          onClick={() => onDelete(categoria._id)}
          className={styles.deleteButton}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
