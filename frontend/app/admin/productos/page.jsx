'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Plus, FolderKanban } from 'lucide-react';

import useAdminAuth from '@/hooks/useAdminAuth';
import useProductos from '@/hooks/useProductos';
import useCategorias from '@/hooks/useCategorias';
import useProductoForm from '@/hooks/useProductoForm';

import PageHeader from '@/components/admin/common/PageHeader';
import Loading from '@/components/admin/common/Loading';

import ProductoForm from '@/components/admin/productos/ProductoForm';
import ProductoList from '@/components/admin/productos/ProductoList';
import FiltroCategorias from '@/components/admin/productos/FiltroCategorias';

import styles from './productos.module.css';

export default function ProductosPage() {
  const loadingAuth = useAdminAuth();

  const {
    productos,
    loading,
    guardarProducto,
    actualizarProducto,
    eliminarProducto
  } = useProductos();

  const {
    categorias,
    loading: loadingCategorias
  } = useCategorias();

  const [
    categoriaSeleccionada,
    setCategoriaSeleccionada
  ] = useState('');

  const productoForm = useProductoForm({
    guardarProducto,
    actualizarProducto
  });

  const productosFiltrados = useMemo(() => {
    if (!categoriaSeleccionada)
      return productos;
    return productos.filter(producto => {
      const categoria =
        typeof producto.categoria === 'object'
          ? producto.categoria?._id
          : producto.categoria;
      return categoria === categoriaSeleccionada;
    });
  }, [
    productos,
    categoriaSeleccionada
  ]);

  if (
    loading ||
    loadingCategorias ||
    loadingAuth
  ) {
    return <Loading />;
  }

  return (
    <main className={styles.container}>
      <PageHeader titulo="Productos" />

      <div className={styles.buttonsRow}>
        <button
          className={styles.btnPrimary}
          onClick={productoForm.abrirNuevo}
        >
          <Plus size={16} />
          Nuevo producto
        </button>

        <Link href="/admin/categorias" className={styles.btnSecondary}>
          <FolderKanban size={16} />
          Categorías
        </Link>

        <Link href="/admin" className={styles.btnSecondary}>
          <LayoutDashboard size={16} />
          Panel Administrador
        </Link>
      </div>

      {productoForm.mostrarFormulario && (
        <ProductoForm
          {...productoForm}
          categorias={categorias}
          productos={productos}
        />
      )}

      <FiltroCategorias
        categorias={categorias}
        categoriaSeleccionada={categoriaSeleccionada}
        onChange={setCategoriaSeleccionada}
      />

      <ProductoList
        productos={productosFiltrados}
        onEditar={productoForm.cargarProducto}
        onEliminar={eliminarProducto}
      />
    </main>
  );
}