'use client';

import { useState, useEffect, useRef } from 'react';
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

  // Indica si ya empujamos una entrada al historial para la subvista actual
  // (categoría seleccionada o búsqueda activa). Sirve para no apilar una
  // entrada nueva en cada tecla que se escribe en el buscador.
  const subvistaPusheada = useRef(false);

  // Vuelve al estado inicial (pantalla de categorías / sin búsqueda).
  function irAInicio() {
    setCategoriaSeleccionada(null);
    limpiarProductos();
    setBusqueda('');
    subvistaPusheada.current = false;
  }

  // Escucha el botón "atrás" físico/gesto del celular (y el del navegador).
  useEffect(() => {
    function manejarPopState() {
      irAInicio();
    }

    window.addEventListener('popstate', manejarPopState);
    return () => window.removeEventListener('popstate', manejarPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuando el usuario empieza a escribir en el buscador (pasa de vacío a con
  // texto) empujamos UNA entrada al historial, para que el botón atrás
  // regrese a la pantalla de categorías.
  useEffect(() => {
    if (hayBusqueda && !categoriaSeleccionada && !subvistaPusheada.current) {
      window.history.pushState({ vista: 'busqueda' }, '');
      subvistaPusheada.current = true;
    }
  }, [hayBusqueda, categoriaSeleccionada]);

  function seleccionarCategoria(categoria) {
    if (!subvistaPusheada.current) {
      window.history.pushState({ vista: 'categoria' }, '');
      subvistaPusheada.current = true;
    }
    setCategoriaSeleccionada(categoria);
    obtenerProductosPorCategoria(categoria._id);
  }

  // Botón "volver" dentro de la UI: dispara history.back() para que sea
  // exactamente equivalente a presionar el botón atrás del celular.
  function volverCategorias() {
    if (subvistaPusheada.current) {
      window.history.back();
    } else {
      irAInicio();
    }
  }

  // Si el usuario borra el texto del buscador a mano (sin usar el botón
  // atrás), limpiamos también la entrada de historial que habíamos
  // empujado, para no dejar entradas "fantasma".
  function manejarCambioBusqueda(valor) {
    if (valor.trim().length === 0 && subvistaPusheada.current) {
      window.history.back();
    }
    setBusqueda(valor);
  }

  return (
    <div style={styles.pagina}>
      <Header configuracion={configuracion} cantidadCarrito={cantidadCarrito} />

      <main style={styles.main}>
        {!categoriaSeleccionada && (
          <BuscadorProductos valor={busqueda} onChange={manejarCambioBusqueda} />
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
