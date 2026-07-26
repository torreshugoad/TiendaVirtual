'use client';

import { useMemo, useState } from 'react';

import useProductos from '@/hooks/useProductos';

/* ==========================
   Convierte el texto del peso
   (ej. "100Gr", "1Kg") a gramos.
   Espejo de calcularEquivalencia
   en VariantesEditor.jsx.
========================== */

function parsearPesoAGramos(peso) {

  if (!peso) return 0;

  const texto =

    String(peso)
      .toLowerCase()
      .replace(',', '.')
      .replace(/\s/g, '');

  if (texto.endsWith('kg')) {

    return Math.round(

      parseFloat(
        texto.replace('kg', '')
      ) * 1000
    );
  }

  if (texto.endsWith('gr')) {

    return Math.round(

      parseFloat(
        texto.replace('gr', '')
      )
    );
  }

  return 0;
}

export default function CalculadoraPesoPage() {


  const {
    productos,
    loading
  } = useProductos();

  const [buscar, setBuscar] =
    useState('');

  const [productoId, setProductoId] =
    useState('');

  const [varianteId, setVarianteId] =
    useState('');

  const [nuevoPeso, setNuevoPeso] =
    useState('');

  const [unidad, setUnidad] =
    useState('gr');

  const [cantidad, setCantidad] =
    useState(1);

  // Solo tiene sentido pesar productos a granel
  // (los que se venden por peso, no por unidad).

  const productosGranel =
    useMemo(() => {

      return productos.filter(p => {

        if (p.tipoStock !== 'granel') {

          return false;
        }

        if (
          buscar &&
          !p.nombre
            .toLowerCase()
            .includes(
              buscar.toLowerCase()
            )
        ) {

          return false;
        }

        return true;
      });

    }, [productos, buscar]);

  const productoSeleccionado =

    productos.find(
      p => p._id === productoId
    ) || null;

  const variantes =

    productoSeleccionado?.variantes ||
    [];

  const varianteSeleccionada =

    variantes.find(
      v => v._id === varianteId
    ) || null;

  const precioPorGramo =

    varianteSeleccionada

      ? Number(
          varianteSeleccionada.precio || 0
        ) /

        Number(
          varianteSeleccionada.equivalencia || 1
        )

      : 0;

  const nuevoPesoGramos =

    unidad === 'kg'

      ? Math.round(
          Number(nuevoPeso || 0) * 1000
        )

      : Math.round(
          Number(nuevoPeso || 0)
        );

  const precioCalculado =

    Math.round(
      precioPorGramo *
      nuevoPesoGramos
    );

  const diferenciaAPagar =

    varianteSeleccionada

      ? precioCalculado -

        (
          Number(
            varianteSeleccionada.precio || 0
          ) *

          Number(cantidad || 0)
        )

      : 0;

  function seleccionarProducto(id) {

    setProductoId(id);

    const producto =
      productos.find(
        p => p._id === id
      );

    // Por defecto, tomamos la primera variante como referencia.

    setVarianteId(

      producto?.variantes?.[0]?._id ||
      ''
    );

    setNuevoPeso('');

    setCantidad(1);
  }

  return (

    <div
      style={{
        padding: '14px',
        background: '#f3f4f6',
        minHeight: '100vh'
      }}
    >

      <h1
        style={{
          fontSize: '28px',
          marginBottom: '4px'
        }}
      >
        Balanza
      </h1>

 
      {/* BUSCADOR DE PRODUCTO */}

      <div
        style={{
          background: '#fff',
          borderRadius: '10px',
          border: '1px solid #e5e7eb',
          padding: '8px',
          marginBottom: '8px'
        }}
      >

        <label
          style={label}
        >
          Producto
        </label>

        <input
          placeholder="Buscar producto..."
          value={buscar}
          onChange={e =>
            setBuscar(
              e.target.value
            )
          }
          style={{
            ...input,
            marginBottom: '8px'
          }}
        />

        <select
          value={productoId}
          onChange={e =>
            seleccionarProducto(
              e.target.value
            )
          }
          style={input}
        >

          <option value="">
            Seleccioná un producto...
          </option>

          {

            productosGranel.map(p => (

              <option
                key={p._id}
                value={p._id}
              >
                {p.nombre}
              </option>
            ))
          }

        </select>

        {

          buscar &&

          productosGranel.length === 0 && (

            <p
              style={{
                fontSize: '13px',
                color: '#9ca3af',
                marginTop: '8px'
              }}
            >
              No hay productos a granel que coincidan con la búsqueda.
            </p>
          )
        }

      </div>

      {

        productoSeleccionado && (

          <div
            style={{
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap'
            }}
          >

            {/* VARIANTES DE REFERENCIA */}

            <div
              style={{
                flex: '1 1 260px',
                background: '#fff',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                padding: '8px'
              }}
            >

              <label style={label}>
                Compra Realizada
              </label>

              <select
                value={varianteId}
                onChange={e =>
                  setVarianteId(
                    e.target.value
                  )
                }
                style={{
                  ...input,
                  marginBottom: '8px'
                }}
              >

                {

                  variantes.map(v => (

                    <option
                      key={v._id}
                      value={v._id}
                    >
                      {v.peso} — ${v.precio}
                    </option>
                  ))
                }

              </select>

              <label style={label}>
                Cantidad
              </label>

              <input
                type="number"
                step="1"
                min="1"
                value={cantidad}
                onChange={e =>
                  setCantidad(
                    e.target.value
                  )
                }
                style={input}
              />

            </div>

            {/* CALCULADORA */}

            <div
              style={{
                flex: '1 1 260px',
                background: '#fff',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                padding: '8px'
              }}
            >

              <label style={label}>
                Peso Nuevo
              </label>

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '8px'
                }}
              >

                <input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="Ej. 280"
                  value={nuevoPeso}
                  onChange={e =>
                    setNuevoPeso(
                      e.target.value
                    )
                  }
                  style={{
                    ...input,
                    flex: 1
                  }}
                />

                <select
                  value={unidad}
                  onChange={e =>
                    setUnidad(
                      e.target.value
                    )
                  }
                  style={{
                    ...input,
                    width: '80px'
                  }}
                >

                  <option value="gr">
                    Gr
                  </option>

                  <option value="kg">
                    Kg
                  </option>

                </select>

              </div>

              {

                varianteSeleccionada &&

                nuevoPeso !== '' && (

                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '10px',
                      padding: '6px',
                      textAlign: 'center'
                    }}
                  >

                    <div
                      style={{
                        fontSize: '16px',
                        color: '#6b7280',
                        marginBottom: '8px'
                      }}
                    >
                      Precio para {nuevoPesoGramos}Gr

                    </div>

                    <div
                      style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#16a34a'
                      }}
                    >
                      ${precioCalculado}
                    </div>

                    <div
                      style={{
                        marginTop: '14px',
                        paddingTop: '4px',
                        borderTop: '1px solid #bbf7d0'
                      }}
                    >

                      <div
                        style={{
                          fontSize: '13px',
                          color: '#6b7280',
                          marginBottom: '4px'
                        }}
                      >
                        Diferencia

                      </div>

                      <div
                        style={{
                          fontSize: '36px',
                          fontWeight: 'bold',
                          color: '#dc2626'
                        }}
                      >

                        {

                          diferenciaAPagar >= 0

                            ? `+$${diferenciaAPagar}`

                            : `-$${Math.abs(diferenciaAPagar)}`
                        }

                      </div>

                    </div>

                  </div>
                )
              }

              {

                !varianteSeleccionada && (

                  <p
                    style={{
                      fontSize: '13px',
                      color: '#9ca3af'
                    }}
                  >
                    Elegí una variante de referencia.
                  </p>
                )
              }

            </div>

          </div>
        )
      }

    </div>
  );
}

const label = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 'bold',
  marginBottom: '6px',
  color: '#374151'
};

const input = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  boxSizing: 'border-box'
};
