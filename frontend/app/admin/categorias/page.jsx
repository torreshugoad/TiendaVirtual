'use client';

import useAdminAuth from '@/hooks/useAdminAuth';
import { colors, radius } from '@/lib/styles/theme';

import useCategorias from '@/hooks/useCategorias';
import useCategoriaForm from '@/hooks/useCategoriaForm';
import CategoriaForm from '@/components/admin/categorias/CategoriaForm';
import CategoriaCard from '@/components/admin/categorias/CategoriaCard';

import styles from './categorias.module.css';

// Variables CSS derivadas del theme central. Se inyectan en el nodo raíz
// para que categorias.module.css (y sus componentes) las consuman con var(--...).
const themeVars = {
  '--color-primary': colors.primary,
  '--color-edit': colors.edit,
  '--color-danger': colors.danger,
  '--color-background': colors.background,
  '--color-card': colors.card,
  '--color-border': colors.border,
  '--color-text-muted': colors.textMuted,
  '--radius-sm': `${radius.sm}px`,
  '--radius-md': `${radius.md}px`,
  '--radius-lg': `${radius.lg}px`,
};

export default function AdminCategorias() {
  const authLoading = useAdminAuth();

  const { categorias, loading, crearCategoria, actualizarCategoria, eliminarCategoria } =
    useCategorias();

  const {
    formulario,
    editandoId,
    subiendoImagen,
    handleChange,
    subirImagen,
    iniciarEdicion,
    resetFormulario,
  } = useCategoriaForm();

  async function guardarCategoria() {
    const exito = editandoId
      ? await actualizarCategoria(editandoId, formulario)
      : await crearCategoria(formulario);

    if (exito) {
      resetFormulario();
    }
  }

  async function handleEliminar(id) {
    const confirmar = confirm('¿Eliminar categoría?');
    if (!confirmar) return;

    await eliminarCategoria(id);
  }

  if (authLoading) {
    return null;
  }

  return (
    <main className={styles.page} style={themeVars}>
      <div className={styles.headerRow}>
        <h1>Categorías</h1>
        <a href="/admin/productos">
          <button className={styles.navButton}>Productos</button>
        </a>
      </div>

      <CategoriaForm
        formulario={formulario}
        editandoId={editandoId}
        subiendoImagen={subiendoImagen}
        onChange={handleChange}
        onFileChange={subirImagen}
        onSubmit={guardarCategoria}
        onCancel={resetFormulario}
      />

      {loading ? (
        <p>Cargando categorías...</p>
      ) : (
        <div className={styles.grid}>
          {categorias.map((categoria) => (
            <CategoriaCard
              key={categoria._id}
              categoria={categoria}
              onEdit={iniciarEdicion}
              onDelete={handleEliminar}
            />
          ))}
        </div>
      )}
    </main>
  );
}
