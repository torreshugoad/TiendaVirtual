'use client';

import { useState } from 'react';
import Header from '@/components/home/Header';
import CategoriaGrid from '@/components/home/CategoriaGrid';
import ProductoList from '@/components/home/ProductoList';
import ProductosGrid from '@/components/home/ProductosGrid';
import BuscadorProductos from '@/components/home/BuscadorProductos';
import useConfiguracion from '@/hooks/useConfiguracion';
import useCategorias from '@/hooks/useCategorias';
import useProductosPorCategoria from '@/hooks/useProductosPorCategoria';
import useProductosBusqueda from '@/hooks/useProductosBusqueda';
import useCarrito from '@/hooks/useCarrito';
import useFiltroPorNombre from '@/hooks/useFiltroPorNombre';

const styles = {
  pagina: {
    minHeight: '100vh',
    background: '#ffedaa',
    fontFamily: 'Arial, sans-serif',
  },
  main: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '10px',
  },
  tituloResultados: {
    marginBottom: '10px',
    color: '#111827',
    fontSize: '20px',
  },
};

export default function HomePage() {
  const { configuracion } = useConfiguracion();
  const { categorias, loading: cargandoCategorias } = useCategorias(true);
  const {
    productos: productosCategoria,
    loading: cargandoProductosCategoria,
    obtenerProductosPorCategoria,
    limpiarProductos,
  } = useProductosPorCategoria();
  const { productos: todosLosProductos, loading: cargandoBusqueda } =
    useProductosBusqueda();
  const { cantidadCarrito, agregarAlCarrito } = useCarrito();

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const hayBusqueda = busqueda.trim().length > 0;

  const resultadosBusqueda = useFiltroPorNombre(
    todosLosProductos,
    busqueda
  );

  function seleccionarCategoria(categoria) {
    setCategoriaSeleccionada(categoria);
    obtenerProductosPorCategoria(categoria._id);
  }

  function volverCategorias() {
    setCategoriaSeleccionada(null);
    limpiarProductos();
  }

  return (
    <div style={styles.pagina}>
      <Header configuracion={configuracion} cantidadCarrito={cantidadCarrito} />

      <main style={styles.main}>
        {!categoriaSeleccionada && (
          <BuscadorProductos valor={busqueda} onChange={setBusqueda} />
        )}

        {categoriaSeleccionada ? (
          <ProductoList
            categoria={categoriaSeleccionada}
            productos={productosCategoria}
            cargando={cargandoProductosCategoria}
            onVolver={volverCategorias}
            onAgregarAlCarrito={agregarAlCarrito}
          />
        ) : hayBusqueda ? (
          <>
            <h2 style={styles.tituloResultados}>
              Resultados para "{busqueda}"
            </h2>

            <ProductosGrid
              productos={resultadosBusqueda}
              cargando={cargandoBusqueda}
              mensajeVacio={`No se encontraron productos para "${busqueda}"`}
              onAgregarAlCarrito={agregarAlCarrito}
            />
          </>
        ) : (
          <CategoriaGrid
            categorias={categorias}
            cargando={cargandoCategorias}
            onSeleccionar={seleccionarCategoria}
          />
        )}
      </main>
    </div>
  );
}