'use client';

import { useEffect, useMemo, useState } from 'react';

export default function AdminStockPage() {

  const [filas, setFilas] =
    useState([]);

  const [categorias, setCategorias] =
    useState([]);

  const [categoriaFiltro, setCategoriaFiltro] =
    useState('');

  const [buscar, setBuscar] =
    useState('');

  const [soloSinStock, setSoloSinStock] =
    useState(false);

  const [stockMenorA, setStockMenorA] =
    useState('');

  const [soloGranel, setSoloGranel] =
    useState(false);

  const [guardando, setGuardando] =
    useState(false);

  useEffect(() => {

    obtenerDatos();

  }, []);

  async function obtenerDatos() {

    try {

const response = await fetch(

  `${process.env.NEXT_PUBLIC_API_URL}/api/admin/stock`

);

      const data =
        await response.json();

      setFilas(data);

      const cats =
        [...new Set(
          data.map(
            item => item.categoria
          )
        )];

      setCategorias(cats);

    } catch (error) {

      console.error(error);

      alert(
        'Error obteniendo stock'
      );
    }
  }

  function actualizarFila(
    index,
    campo,
    valor
  ) {

    const nuevasFilas =
      [...filas];

    nuevasFilas[index][campo] =
      valor;

    setFilas(nuevasFilas);
  }

  async function guardarCambios() {

    try {

      setGuardando(true);

const response = await fetch(

  `${process.env.NEXT_PUBLIC_API_URL}/api/admin/stock`,
        {
          method: 'PUT',
          headers: {
            'Content-Type':
              'application/json'
          },
          body: JSON.stringify({
            filas
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        alert(
          data.error ||
          'Error guardando'
        );

        return;
      }

      alert(
        'Cambios guardados'
      );

    } catch (error) {

      console.error(error);

      alert(
        'Error guardando'
      );

    } finally {

      setGuardando(false);
    }
  }

  const filasFiltradas =
    useMemo(() => {

      return filas.filter(item => {

        if (
          categoriaFiltro &&
          item.categoria !==
            categoriaFiltro
        ) {

          return false;
        }

        if (
          buscar &&
          !item.producto
            .toLowerCase()
            .includes(
              buscar.toLowerCase()
            )
        ) {

          return false;
        }

        const stockReal =
          item.tipoStock ===
          'granel'

            ? Number(
                item.stockGranelKg || 0
              )

            : Number(
                item.stock
              );

        if (
          soloSinStock &&
          stockReal > 0
        ) {

          return false;
        }

        if (
          stockMenorA &&
          stockReal >=
            Number(stockMenorA)
        ) {

          return false;
        }

        if (
          soloGranel &&
          item.tipoStock !==
            'granel'
        ) {

          return false;
        }

        return true;
      });

    }, [
      filas,
      categoriaFiltro,
      buscar,
      soloSinStock,
      stockMenorA,
      soloGranel
    ]);

  const productosAgrupados =
    Object.values(

      filasFiltradas.reduce(
        (acc, item) => {

          /* =========================
             PRODUCTOS NORMALES
          ========================= */

          if (
            item.tipoStock !==
            'granel'
          ) {

            acc[
              `${item.productoId}-${item.varianteId}`
            ] = item;

            return acc;
          }

          /* =========================
             PRODUCTOS GRANEL
          ========================= */

          if (
            !acc[item.productoId]
          ) {

            acc[item.productoId] = {

              ...item,

              variantes: []
            };
          }

          acc[
            item.productoId
          ].variantes.push({

            varianteId:
              item.varianteId,

            peso:
              item.peso,

            precio:
              item.precio
          });

          return acc;

        },
        {}
      )
    );

  return (

    <div
      style={{
        padding: '20px',
        background: '#f3f4f6',
        minHeight: '100vh'
      }}
    >

      <h1>
        Administración de Stock
      </h1>

      {/* FILTROS */}

      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '20px',
          background: '#f6d6d6',
          padding: '10px',
          borderRadius: '5px'
        }}
      >

        <input
          placeholder="Buscar producto"
          value={buscar}
          onChange={e =>
            setBuscar(
              e.target.value
            )
          }
          style={{
            padding: '10px',
            borderRadius: '8px',
            border:
              '1px solid #ccc'
          }}
        />

        <select
          value={categoriaFiltro}
          onChange={e =>
            setCategoriaFiltro(
              e.target.value
            )
          }
          style={{
            padding: '10px',
            borderRadius: '5px'
          }}
        >

          <option value="">
            Todas las categorías
          </option>

          {

            categorias.map(cat => (

              <option
                key={cat}
                value={cat}
              >

                {cat}

              </option>
            ))
          }

        </select>

        <input
          type="number"
          placeholder="Stock menor a"
          value={stockMenorA}
          onChange={e =>
            setStockMenorA(
              e.target.value
            )
          }
          style={{
            padding: '10px',
            borderRadius: '5px',
            border:
              '1px solid #ccc',
            width: '150px'
          }}
        />

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}
        >

          <input
            type="checkbox"
            checked={soloSinStock}
            onChange={e =>
              setSoloSinStock(
                e.target.checked
              )
            }
          />

          Sin stock

        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}
        >

          <input
            type="checkbox"
            checked={soloGranel}
            onChange={e =>
              setSoloGranel(
                e.target.checked
              )
            }
          />

          Solo granel

        </label>

      </div>

      {/* TABLA */}

      <div
        style={{
          overflowX: 'auto',
          background: '#fff',
          borderRadius: '5px'
        }}
      >

        <table
          style={{
            width: '100%',
            borderCollapse:
              'collapse'
          }}
        >

          <thead
            style={{
              background: '#111827',
              color: '#ffffff'
            }}
          >

            <tr>

              <th style={th}>
                Categoría
              </th>

              <th style={th}>
                Producto
              </th>

              <th style={th}>
                Variante
              </th>

              <th style={th}>
                Tipo
              </th>

              <th style={th}>
                Precio
              </th>

              <th style={th}>
                Stock
              </th>

              <th style={th}>
                Estado
              </th>

            </tr>

          </thead>

          <tbody>

            {

              productosAgrupados.map(
                (item, index) => {

                  const fondo =

                    index % 2 === 0

                      ? '#ffffff'

                      : '#f9fafb';

                  const stockReal =

                    item.tipoStock ===
                    'granel'

                      ? Number(
                          item.stockGranelKg || 0
                        )

                      : Number(
                          item.stock
                        );

                  let colorEstado =
                    '#dcfce7';

                  let textoEstado =
                    'OK';

                  if (stockReal <= 0) {

                    colorEstado =
                      '#fee2e2';

                    textoEstado =
                      'Sin stock';

                  } else if (
                    stockReal <= 5
                  ) {

                    colorEstado =
                      '#fef9c3';

                    textoEstado =
                      'Bajo';
                  }

                  /* =========================
                     PRODUCTOS GRANEL
                  ========================= */

                  if (
                    item.tipoStock ===
                    'granel'
                  ) {

                    return (

                      <tr
                        key={index}
                        style={{
                          background:
                            fondo,
                          borderBottom:
                            '2px solid #edf1f8'
                        }}
                      >

                        <td
                          colSpan={7}
                          style={{
                            padding: '10px'
                          }}
                        >

                          {/* CABECERA */}

                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns:
                                '1.5fr 2fr 1fr 1fr 1fr',
                              gap: '15px',
                              alignItems:
                                'center',
                              marginBottom:
                                '5px'
                            }}
                          >

                            <div>
                              <strong>
                                {item.categoria}
                              </strong>
                            </div>

                            <div>
                              <strong
                                style={{
                                  fontSize:
                                    '18px'
                                }}
                              >
                                {item.producto}
                              </strong>
                            </div>

                            <div>
                              Granel
                            </div>

                            <div>

                              <input
                                type="number"
                                step="0.01"
                                value={
                                  item.stockGranelKg || 0
                                }
                                onChange={e => {

                                  const nuevasFilas =
                                    [...filas];

                                  nuevasFilas.forEach(
                                    fila => {

                                      if (
                                        fila.productoId ===
                                        item.productoId
                                      ) {

                                        fila.stockGranelKg =
                                          e.target.value;
                                      }
                                    }
                                  );

                                  setFilas(
                                    nuevasFilas
                                  );
                                }}
                                style={input}
                              />

                            </div>

                            <div>

                              <span
                                style={{
                                  background:
                                    colorEstado,
                                  padding:
                                    '5px 10px',
                                  borderRadius:
                                    '999px',
                                  fontWeight:
                                    'bold'
                                }}
                              >

                                {textoEstado}

                              </span>

                            </div>

                          </div>

                          {/* VARIANTES */}

                          <div
                            style={{
                              borderTop:
                                '2px solid #235094'
                            }}
                          >

                            {

                              item.variantes.map(
                                (
                                  variante,
                                  vIndex
                                ) => (

                                  <div
                                    key={vIndex}
                                    style={{
                                      display:
                                        'grid',
                                      gridTemplateColumns:
                                        '2fr 1fr',
                                      gap:
                                        '5px',
                                      padding:
                                        '2px 0',
                                      borderBottom:
                                        vIndex !==
                                        item.variantes.length - 1

                                          ? '1px solid #8fb3fa'

                                          : 'none'
                                    }}
                                  >

                                    <div>

                                      <strong>
                                        {
                                          variante.peso
                                        }
                                      </strong>

                                    </div>

                                    <div>

                                      <input
                                        type="number"
                                        value={
                                          variante.precio
                                        }
                                        onChange={e => {

                                          const nuevasFilas =
                                            [...filas];

                                          nuevasFilas.forEach(
                                            fila => {

                                              if (
                                                fila.varianteId ===
                                                variante.varianteId
                                              ) {

                                                fila.precio =
                                                  e.target.value;
                                              }
                                            }
                                          );

                                          setFilas(
                                            nuevasFilas
                                          );
                                        }}
                                        style={input}
                                      />

                                    </div>

                                  </div>
                                )
                              )
                            }

                          </div>

                        </td>

                      </tr>
                    );
                  }

                  /* =========================
                     PRODUCTOS NORMALES
                  ========================= */

                  return (

                    <tr
                      key={index}
                      style={{
                        background:
                          fondo,
                        borderBottom:
                          '1px solid #e5e7eb'
                      }}
                    >

                      <td style={td}>
                        {item.categoria}
                      </td>

                      <td style={td}>
                        {item.producto}
                      </td>

                      <td style={td}>
                        {item.peso}
                      </td>

                      <td style={td}>
                        {item.tipoStock}
                      </td>

                      <td style={td}>

                        <input
                          type="number"
                          value={
                            item.precio
                          }
                          onChange={e =>
                            actualizarFila(
                              index,
                              'precio',
                              e.target.value
                            )
                          }
                          style={input}
                        />

                      </td>

                      <td style={td}>

                        <input
                          type="number"
                          value={
                            item.stock
                          }
                          onChange={e =>
                            actualizarFila(
                              index,
                              'stock',
                              e.target.value
                            )
                          }
                          style={input}
                        />

                      </td>

                      <td style={td}>

                        <span
                          style={{
                            background:
                              colorEstado,
                            padding:
                              '5px 10px',
                            borderRadius:
                              '999px',
                            fontWeight:
                              'bold'
                          }}
                        >

                          {textoEstado}

                        </span>

                      </td>

                    </tr>
                  );
                }
              )
            }

          </tbody>

        </table>

      </div>

      <button
        onClick={guardarCambios}
        disabled={guardando}
        style={{
          marginTop: '20px',
          background: '#16a34a',
          color: '#fff',
          border: 'none',
          padding: '14px 20px',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '16px'
        }}
      >

        {

          guardando

            ? 'Guardando...'

            : 'Guardar cambios'
        }

      </button>

    </div>
  );
}

const th = {
  padding: '12px',
  textAlign: 'left'
};

const td = {
  padding: '12px'
};

const input = {
  width: '100%',
  padding: '8px',
  borderRadius: '8px',
  border: '1px solid #d1d5db'
};