'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

import useAdminAuth from '@/hooks/useAdminAuth';
import { apiFetch } from '@/lib/api';
import Button from '@/components/admin/common/Button';

import styles from './stock.module.css';

// Umbrales por defecto, solo como fallback si un producto
// viejo no tuviera stockMinimo/stockMinimoGranel cargado.
const UMBRAL_BAJO_UNIDAD_DEFAULT = 5;
const UMBRAL_BAJO_GRANEL_KG_DEFAULT = 2;

function calcularEstado(stockReal, umbralBajo) {

  if (stockReal <= 0) {
    return {
      color: '#fee2e2',
      texto: 'Sin stock'
    };
  }

  if (stockReal <= umbralBajo) {
    return {
      color: '#fef9c3',
      texto: 'Bajo'
    };
  }

  return {
    color: '#dcfce7',
    texto: 'OK'
  };
}

export default function AdminStockPage() {

  const loading = useAdminAuth();

  const [filas, setFilas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [buscar, setBuscar] = useState('');
  const [soloSinStock, setSoloSinStock] = useState(false);
  const [stockMenorA, setStockMenorA] = useState('');
  const [soloGranel, setSoloGranel] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    obtenerDatos();
  }, []);

  async function obtenerDatos() {
    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/stock`
      );

      if (!response) return;

      const data = await response.json();

      // El backend ya devuelve stockGranel/stockMinimoGranel en Kg
      // (convierte gramos -> Kg del lado del servidor). No hay que tocarlo acá.

      setFilas(data);

      const cats = [...new Set(data.map((item) => item.categoria))];

      setCategorias(cats);
    } catch (error) {
      console.error(error);
      alert('Error obteniendo stock');
    }
  }

  function actualizarVariantePrecio(varianteId, valor) {
    const nuevasFilas = filas.map((fila) =>
      fila.varianteId === varianteId
        ? { ...fila, precio: valor }
        : fila
    );

    setFilas(nuevasFilas);
  }

  // El stock "por unidad" es único por producto (campo `stock`), no
  // por variante. Antes esta función matcheaba por varianteId y solo
  // tocaba la primera variante, por eso no impactaba correctamente en
  // el backend.
  function actualizarStockUnidad(productoId, valor) {
    const nuevasFilas = filas.map((fila) =>
      fila.productoId === productoId
        ? {
            ...fila,
            stock:
              valor === '' ? 0 : Math.round(Number(valor))
          }
        : fila
    );

    setFilas(nuevasFilas);
  }

  function actualizarStockGranel(productoId, valor) {
    const nuevasFilas = filas.map((fila) =>
      fila.productoId === productoId
        ? { ...fila, stockGranel: valor }
        : fila
    );

    setFilas(nuevasFilas);
  }

  async function guardarCambios() {
    try {
      setGuardando(true);

      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/stock`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ filas })
        }
      );

      if (!response) return;

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Error guardando');
        return;
      }

      alert('Cambios guardados');
    } catch (error) {
      console.error(error);
      alert('Error guardando');
    } finally {
      setGuardando(false);
    }
  }

  const filasFiltradas = useMemo(() => {
    return filas.filter((item) => {
      if (categoriaFiltro && item.categoria !== categoriaFiltro) {
        return false;
      }

      if (
        buscar &&
        !item.producto.toLowerCase().includes(buscar.toLowerCase())
      ) {
        return false;
      }

      const stockReal =
        item.tipoStock === 'granel'
          ? Number(item.stockGranel || 0)
          : Number(item.stock);

      if (soloSinStock && stockReal > 0) {
        return false;
      }

      if (stockMenorA && stockReal >= Number(stockMenorA)) {
        return false;
      }

      if (soloGranel && item.tipoStock !== 'granel') {
        return false;
      }

      return true;
    });
  }, [filas, categoriaFiltro, buscar, soloSinStock, stockMenorA, soloGranel]);

  // Agrupamos SIEMPRE por producto (granel y por unidad),
  // con sus variantes anidadas debajo. El stock vive:
  // - a nivel Producto para granel (stockGranel, en Kg)
  // - a nivel Variante para productos por unidad (item.stock)
  // Los mínimos viajan junto con cada nivel, y ahora son editables.

  const productosAgrupados = useMemo(() => {
    return Object.values(
      filasFiltradas.reduce((acc, item) => {
        if (!acc[item.productoId]) {
          acc[item.productoId] = {
            productoId: item.productoId,
            categoria: item.categoria,
            producto: item.producto,
            tipoStock: item.tipoStock,
            stockGranel: item.stockGranel,
            stockMinimoGranel: item.stockMinimoGranel,
            variantes: []
          };
        }

        acc[item.productoId].variantes.push({
          varianteId: item.varianteId,
          peso: item.peso,
          precio: item.precio,
          stock: item.stock,
          stockMinimo: item.stockMinimo
        });

        return acc;
      }, {})
    );
  }, [filasFiltradas]);

  if (loading) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <h1 className={styles.title}>Administración de Stock</h1>
        <Link href="/admin" className={styles.btnSecondary}>
          <LayoutDashboard size={15} />
          Panel Administrador
        </Link>
      </div>

      {/* FILTROS */}
      <div className={styles.filtros}>
        <input
          placeholder="Buscar producto"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className={styles.input}
        />

        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className={styles.select}
        >
          <option value="">Todas las categorías</option>

          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Stock menor a"
          value={stockMenorA}
          onChange={(e) => setStockMenorA(e.target.value)}
          className={styles.inputStockMenor}
        />

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={soloSinStock}
            onChange={(e) => setSoloSinStock(e.target.checked)}
          />
          Sin stock
        </label>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={soloGranel}
            onChange={(e) => setSoloGranel(e.target.checked)}
          />
          Solo granel
        </label>
      </div>

      <div className={styles.footerGuardar}>
        <Button variant="success" onClick={guardarCambios} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      {/* PLANILLA */}
      <div className={styles.tableWrapper}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th className={styles.th}>Producto</th>
              <th className={styles.thRight}>Stock</th>
              <th className={styles.th}>Variantes</th>
            </tr>
          </thead>

          <tbody>
            {productosAgrupados.map((producto) => {
              const esGranel = producto.tipoStock === 'granel';

              const umbralGranel =
                producto.stockMinimoGranel ?? UMBRAL_BAJO_GRANEL_KG_DEFAULT;

              const varianteUnidad = esGranel ? null : producto.variantes[0];

              const stockActual = esGranel
                ? Number(producto.stockGranel || 0)
                : Number(varianteUnidad?.stock || 0);

              const umbralActual = esGranel
                ? umbralGranel
                : varianteUnidad?.stockMinimo ?? UMBRAL_BAJO_UNIDAD_DEFAULT;

              const estado = calcularEstado(stockActual, umbralActual);

              return (
                <tr key={producto.productoId} className={styles.fila}>
                  <td className={styles.tdProducto}>
                    {producto.producto}
                  </td>

                  <td className={styles.tdRight}>
                    <input
                      type="number"
                      step={esGranel ? '0.01' : '1'}
                      min="0"
                      value={stockActual}
                      onChange={(e) => {
                        const valor =
                          e.target.value === ''
                            ? ''
                            : Number(e.target.value);

                        if (esGranel) {
                          actualizarStockGranel(
                            producto.productoId,
                            valor
                          );
                        } else {
                          actualizarStockUnidad(
                            producto.productoId,
                            valor
                          );
                        }
                      }}
                      className={styles.inputStock}
                      style={{ background: estado ? estado.color : '#fff' }}
                    />
                  </td>

                  <td className={styles.td}>
                    <div className={styles.variantesContainer}>
                      {producto.variantes.map((variante) => (
                        <span key={variante.varianteId} className={styles.variante}>
                          <span className={styles.variantePeso}>
                            {variante.peso}:
                          </span>
                          <input
                            type="number"
                            value={variante.precio}
                            onChange={(e) =>
                              actualizarVariantePrecio(
                                variante.varianteId,
                                e.target.value
                              )
                            }
                            className={styles.inputPrecio}
                          />
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.guardarInferior}>
        <Button variant="success" onClick={guardarCambios} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  );
}
