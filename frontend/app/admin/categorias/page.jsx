'use client';

import Link from 'next/link';
import { LayoutDashboard, Plus } from 'lucide-react';

import useAdminAuth from '@/hooks/useAdminAuth';
import useCategorias from '@/hooks/useCategorias';
import useCategoriaForm from '@/hooks/useCategoriaForm';
import CategoriaForm from '@/components/admin/categorias/CategoriaForm';
import CategoriaCard from '@/components/admin/categorias/CategoriaCard';

import styles from './categorias.module.css';

export default function AdminCategorias() {
  const authLoading = useAdminAuth();

  const { categorias, loading, crearCategoria, actualizarCategoria, eliminarCategoria } =
    useCategorias();

  const {
    formulario,
    editandoId,
    subiendoImagen,
    mostrarFormulario,
    handleChange,
    subirImagen,
    iniciarEdicion,
    abrirNuevo,
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
    <main className={styles.page}>
      <div className={styles.headerContainer}>
        <h1 className={styles.title}>Categorías</h1>

        <div className={styles.headerActions}>
          <button className={styles.btnPrimary} onClick={abrirNuevo}>
            <Plus size={16} />
            Nueva categoría
          </button>

          <Link href="/admin/productos" className={styles.btnSecondary}>
            Productos
          </Link>

          <Link href="/admin" className={styles.btnSecondary}>
            <LayoutDashboard size={16} />
            Panel Administrador
          </Link>
        </div>

        <p className={styles.subtitle}>
          {categorias.length} categorías cargadas
        </p>
      </div>

      {mostrarFormulario && (
        <CategoriaForm
          formulario={formulario}
          editandoId={editandoId}
          subiendoImagen={subiendoImagen}
          onChange={handleChange}
          onFileChange={subirImagen}
          onSubmit={guardarCategoria}
          onCancel={resetFormulario}
        />
      )}

      {loading ? (
        <p>Cargando categorías...</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.encabezado}>Nombre</th>
                <th className={styles.encabezado}>Activa</th>
                <th className={styles.encabezado}>Orden</th>
                <th className={`${styles.encabezado} ${styles.encabezadoAcciones}`}></th>
              </tr>
            </thead>
            <tbody>
              {[...categorias]
                .sort((a, b) => a.orden - b.orden)
                .map((categoria) => (
                  <CategoriaCard
                    key={categoria._id}
                    categoria={categoria}
                    onEdit={iniciarEdicion}
                    onDelete={handleEliminar}
                  />
                ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}