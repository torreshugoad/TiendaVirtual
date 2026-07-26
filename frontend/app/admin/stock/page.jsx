'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';

import useAdminAuth from '@/hooks/useAdminAuth';
import { apiFetch } from '@/lib/api';

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

  function actualizarVarianteStock(varianteId, valor) {
    const nuevasFilas = filas.map((fila) =>
      fila.varianteId === varianteId
        ? { ...fila, stock: valor }
        : fila
    );

    setFilas(nuevasFilas);
  }

  function actualizarVariantePrecio(varianteId, valor) {
    const nuevasFilas = filas.map((fila) =>
      fila.varianteId === varianteId
        ? { ...fila, precio: valor }
        : fila
    );

    setFilas(nuevasFilas);
  }

  function actualizarVarianteStockMinimo(varianteId, valor) {
    const nuevasFilas = filas.map((fila) =>
      fila.varianteId === varianteId
        ? { ...fila, stockMinimo: valor }
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

  function actualizarStockMinimoGranel(productoId, valor) {
    const nuevasFilas = filas.map((fila) =>
      fila.productoId === productoId
        ? { ...fila, stockMinimoGranel: valor }
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
    <div
      style={{
        padding: '14px',
        background: '#f3f4f6',
        minHeight: '100vh'
      }}
    >
      <h1 style={{ fontSize: '18px', marginBottom: '10px' }}>
        Administración de Stock
      </h1>

      {/* FILTROS */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '10px',
          background: '#f6d6d6',
          padding: '8px',
          borderRadius: '5px',
          fontSize: '13px'
        }}
      >
        <input
          placeholder="Buscar producto"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          style={{
            padding: '6px 8px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '13px'
          }}
        />

        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          style={{
            padding: '6px 8px',
            borderRadius: '5px',
            fontSize: '13px'
          }}
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
          style={{
            padding: '6px 8px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            width: '50px',
            fontSize: '13px'
          }}
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <input
            type="checkbox"
            checked={soloSinStock}
            onChange={(e) => setSoloSinStock(e.target.checked)}
          />
          Sin stock
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <input
            type="checkbox"
            checked={soloGranel}
            onChange={(e) => setSoloGranel(e.target.checked)}
          />
          Solo granel
        </label>
      </div>

      {/* PLANILLA */}
      <div
        style={{
          overflowX: 'auto',
          background: '#fff',
          borderRadius: '5px',
          border: '1px solid #e5e7eb'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#111827', color: '#ffffff' }}>
            <tr>
              <th style={th}>Categoría</th>
              <th style={th}>Producto / Variante</th>
              <th style={{ ...th, textAlign: 'right' }}>Precio</th>
              <th style={{ ...th, textAlign: 'right' }}>Stock</th>
              <th style={{ ...th, textAlign: 'right' }}>Stock mínimo</th>
              <th style={{ ...th, textAlign: 'center' }}>Estado</th>
            </tr>
          </thead>

          <tbody>
            {productosAgrupados.map((producto, index) => {
              const esGranel = producto.tipoStock === 'granel';

              const fondo = index % 2 === 0 ? '#ffffff' : '#f9fafb';

              const umbralGranel =
                producto.stockMinimoGranel ?? UMBRAL_BAJO_GRANEL_KG_DEFAULT;

              const estadoProducto = esGranel
                ? calcularEstado(
                    Number(producto.stockGranel || 0),
                    umbralGranel
                  )
                : null;

              return (
                <Fragment key={producto.productoId}>
                  {/* FILA PRODUCTO */}
                  <tr
                    style={{
                      background: fondo,
                      borderTop: '2px solid #d1d5db'
                    }}
                  >
                    <td style={{ ...td, fontWeight: 'bold' }}>
                      {producto.categoria}
                    </td>

                    <td
                      style={{
                        ...td,
                        fontWeight: 'bold',
                        fontSize: '13px'
                      }}
                    >
                      {producto.producto}
                    </td>

                    <td style={td} />

                    <td style={{ ...td, textAlign: 'right' }}>
                      {esGranel ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={producto.stockGranel ?? 0}
                          onChange={(e) => {
                            const valor =
                              e.target.value === ''
                                ? ''
                                : Number(e.target.value);

                            actualizarStockGranel(
                              producto.productoId,
                              valor
                            );
                          }}
                          style={{ ...input, textAlign: 'right' }}
                        />
                      ) : (
                        <span style={{ color: '#9ca3af' }}>—</span>
                      )}
                    </td>

                    <td style={{ ...td, textAlign: 'right' }}>
                      {esGranel ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={producto.stockMinimoGranel ?? 0}
                          onChange={(e) => {
                            const valor =
                              e.target.value === ''
                                ? ''
                                : Number(e.target.value);

                            actualizarStockMinimoGranel(
                              producto.productoId,
                              valor
                            );
                          }}
                          style={{ ...input, textAlign: 'right' }}
                        />
                      ) : (
                        <span style={{ color: '#9ca3af' }}>—</span>
                      )}
                    </td>

                    <td style={{ ...td, textAlign: 'center' }}>
                      {estadoProducto && (
                        <span
                          style={{
                            background: estadoProducto.color,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {estadoProducto.texto}
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* FILAS VARIANTE */}
                  {producto.variantes.map((variante) => {
                    const stockVariante = Number(variante.stock || 0);

                    const umbralVariante =
                      variante.stockMinimo ?? UMBRAL_BAJO_UNIDAD_DEFAULT;

                    const estadoVariante = esGranel
                      ? null
                      : calcularEstado(stockVariante, umbralVariante);

                    return (
                      <tr
                        key={variante.varianteId}
                        style={{
                          background: fondo,
                          borderBottom: '1px solid #f1f5f9'
                        }}
                      >
                        <td style={td} />

                        <td
                          style={{
                            ...td,
                            paddingLeft: '20px',
                            color: '#4b5563'
                          }}
                        >
                          ↳ {variante.peso}
                        </td>

                        <td style={{ ...td, textAlign: 'right' }}>
                          <input
                            type="number"
                            value={variante.precio}
                            onChange={(e) =>
                              actualizarVariantePrecio(
                                variante.varianteId,
                                e.target.value
                              )
                            }
                            style={{ ...input, textAlign: 'right' }}
                          />
                        </td>

                        <td style={{ ...td, textAlign: 'right' }}>
                          {esGranel ? (
                            <span style={{ color: '#9ca3af' }}>—</span>
                          ) : (
                            <input
                              type="number"
                              step="1"
                              min="0"
                              value={variante.stock}
                              onChange={(e) =>
                                actualizarVarianteStock(
                                  variante.varianteId,
                                  e.target.value === ''
                                    ? 0
                                    : Math.round(Number(e.target.value))
                                )
                              }
                              style={{ ...input, textAlign: 'right' }}
                            />
                          )}
                        </td>

                        <td style={{ ...td, textAlign: 'right' }}>
                          {esGranel ? (
                            <span style={{ color: '#9ca3af' }}>—</span>
                          ) : (
                            <input
                              type="number"
                              step="1"
                              min="0"
                              value={variante.stockMinimo ?? 0}
                              onChange={(e) =>
                                actualizarVarianteStockMinimo(
                                  variante.varianteId,
                                  e.target.value === ''
                                    ? 0
                                    : Math.round(Number(e.target.value))
                                )
                              }
                              style={{ ...input, textAlign: 'right' }}
                            />
                          )}
                        </td>

                        <td style={{ ...td, textAlign: 'center' }}>
                          {estadoVariante && (
                            <span
                              style={{
                                background: estadoVariante.color,
                                padding: '2px 8px',
                                borderRadius: '999px',
                                fontSize: '11px',
                                fontWeight: 'bold'
                              }}
                            >
                              {estadoVariante.texto}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        onClick={guardarCambios}
        disabled={guardando}
        style={{
          marginTop: '12px',
          background: '#16a34a',
          color: '#fff',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px'
        }}
      >
        {guardando ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  );
}

const th = {
  padding: '6px 10px',
  fontSize: '13px',
  textAlign: 'left'
};

const td = {
  padding: '4px 10px',
  fontSize: '13px'
};

const input = {
  width: '100%',
  padding: '3px 6px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '13px'
};