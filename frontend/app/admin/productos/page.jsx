'use client';

import { useMemo, useState } from 'react';

import useAdminAuth from '@/hooks/useAdminAuth';
import useProductos from '@/hooks/useProductos';
import useCategorias from '@/hooks/useCategorias';
import useProductoForm from '@/hooks/useProductoForm';

import PageHeader from '@/components/admin/common/PageHeader';
import Loading from '@/components/admin/common/Loading';

import ProductoForm from './ProductoForm';
import ProductoList from './ProductoList';
import FiltroCategorias from './FiltroCategorias';

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

    <main style={styles.container}>

      <PageHeader

        titulo="Productos"

        subtitulo="Administración de productos"

      />

      <ProductoForm

        {...productoForm}

        categorias={categorias}

        productos={productos}

      />

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

const styles = {

  container: {

    display: 'flex',

    flexDirection: 'column',

    gap: 24,

    padding: 24

  }

};
