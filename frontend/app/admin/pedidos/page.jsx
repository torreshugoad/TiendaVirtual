'use client';

export const dynamic = 'force-dynamic';

import {
  useEffect,
  useState
} from 'react';

import {
  useRouter
} from 'next/navigation';

import * as XLSX from 'xlsx';

import { saveAs }
  from 'file-saver';

export default function AdminPedidos() {

  const router =
    useRouter();

  const [pedidos,
    setPedidos] =
    useState([]);

  const [productos,
    setProductos] =
    useState([]);

  const [busqueda,
    setBusqueda] =
    useState('');

  const [estadoFiltro,
    setEstadoFiltro] =
    useState('');

  useEffect(() => {

    const logueado =
      localStorage.getItem(
        'adminLogueado'
      );

    if (!logueado) {

      router.push(
        '/admin/login'
      );

      return;
    }

    obtenerPedidos();
    obtenerProductos();

  }, []);

  async function obtenerPedidos() {

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/pedidos`
    );

    const data =
      await res.json();

    setPedidos(data);
  }

  async function obtenerProductos() {

const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/productos`,
  {
    cache: 'no-store'
  }
);

    const data =
      await res.json();

    setProductos(data);
  }

  async function cambiarEstado(
    id,
    nuevoEstado
  ) {

    await fetch(

      `${process.env.NEXT_PUBLIC_API_URL}/api/pedidos/${id}`,

      {
        method: 'PUT',

        headers: {
          'Content-Type':
            'application/json'
        },

        body: JSON.stringify({
          estado: nuevoEstado
        })

      }

    );

    obtenerPedidos();
  }

  const pedidosFiltrados =
    pedidos.filter(pedido => {

      const coincideBusqueda =

        String(
          pedido.cliente || ''
        )
          .toLowerCase()
          .includes(
            busqueda.toLowerCase()
          )

        ||

        pedido.telefono
          ?.includes(busqueda);

      const coincideEstado =

        estadoFiltro
          ? pedido.estado ===
            estadoFiltro
          : true;

      return (
        coincideBusqueda &&
        coincideEstado
      );

    });

  function exportarExcel() {

const resumenPedidos =
  pedidosFiltrados.flatMap(
    pedido =>

      pedido.items.map(
        item => ({

          Fecha:
            formatearFecha(
              pedido.fecha
            ),

          NroPedido:
            pedido.nropedido,

          Cliente:
            pedido.cliente,

          Telefono:
            pedido.telefono,

          Entrega:
            pedido.tipoEntrega,

          Direccion:
            pedido.direccion || '',

          Estado:
            pedido.estado,

          Producto:
            item.nombre,

          Cant:
            item.cantidad,

          Precio:
            item.precio,

          Total:
            pedido.total
        })
      )
  );

    const detalleProductos =
      [];

    pedidosFiltrados.forEach(
      pedido => {

        pedido.items?.forEach(
          item => {

            detalleProductos.push({

              Fecha:
                formatearFecha(
                  pedido.fecha
                ),

              Cliente:
                pedido.cliente,

              Producto:
                item.nombre,

              Variante:
                item.peso,

              Cantidad:
                item.cantidad,

              Precio:
                item.precio,

              Subtotal:

                Number(item.precio) *

                Number(item.cantidad)

            });

          });

      });

    const stockProductos =
      [];

    productos.forEach(
      producto => {

        if (
          producto.tipoStock ===
          'granel'
        ) {

          stockProductos.push({

            Producto:
              producto.nombre,

            Tipo:
              'Granel',

            Variante:
              '-',

            Stock:
              `${producto.stockGranelKg} Kg`

          });

        } else {

          producto.variantes
            ?.forEach(v => {

              stockProductos.push({

                Producto:
                  producto.nombre,

                Tipo:
                  'Unidad',

                Variante:
                  v.peso,

                Stock:
                  v.stock

              });

            });

        }

      });

    const workbook =
      XLSX.utils.book_new();

    const sheetPedidos =

      XLSX.utils.json_to_sheet(
        resumenPedidos
      );

    const sheetProductos =

      XLSX.utils.json_to_sheet(
        detalleProductos
      );

    const sheetStock =

      XLSX.utils.json_to_sheet(
        stockProductos
      );

    XLSX.utils.book_append_sheet(

      workbook,

      sheetPedidos,

      'Pedidos'

    );

    XLSX.utils.book_append_sheet(

      workbook,

      sheetProductos,

      'Productos'

    );

    XLSX.utils.book_append_sheet(

      workbook,

      sheetStock,

      'Stock'

    );

    const excelBuffer =

      XLSX.write(
        workbook,
        {
          bookType: 'xlsx',
          type: 'array'
        }
      );

    const data =
      new Blob(

        [excelBuffer],

        {
          type:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }

      );

    saveAs(
      data,
      'pedidos.xlsx'
    );
  }

  function formatearFecha(
    fecha
  ) {

    return new Date(fecha)
      .toLocaleString(
        'es-AR'
      );
  }

  function colorEstado(
    estado
  ) {

    switch (estado) {

      case 'Pedido pendiente':
        return '#ff9800';

      case 'Pedido entregado':
        return '#4CAF50';

      case 'Proceso finalizado':
        return '#777';

      case 'Cancelado':
        return '#ff4d4d';

      default:
        return '#999';
    }
  }

  return (

    <main style={{
      padding: 20,
      fontFamily: 'Arial',
      background: '#f7f7f7',
      minHeight: '100vh'
    }}>

      {/* HEADER */}

      <div style={{
        display: 'flex',
        justifyContent:
          'space-between',
        alignItems: 'center',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 10
      }}>

        <h1 style={{
          margin: 0
        }}>
          Pedidos
        </h1>

        <button
          onClick={exportarExcel}
          style={{
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >

          Exportar Excel

        </button>

      </div>

      {/* FILTROS */}

      <div style={{
        background: 'white',
        padding: 16,
        borderRadius: 10,
        marginBottom: 20,
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap'
      }}>

        <input
          placeholder="Buscar cliente o teléfono"
          value={busqueda}
          onChange={(e) =>
            setBusqueda(
              e.target.value
            )
          }
          style={inputStyle}
        />

        <select
          value={estadoFiltro}
          onChange={(e) =>
            setEstadoFiltro(
              e.target.value
            )
          }
          style={inputStyle}
        >

          <option value="">
            Todos los estados
          </option>

          <option>
            Pedido pendiente
          </option>

          <option>
            Pedido entregado
          </option>

          <option>
            Proceso finalizado
          </option>

          <option>
            Cancelado
          </option>

        </select>

      </div>

      {/* LISTADO */}

      <div style={{
        display: 'grid',
        gap: 14
      }}>

        {pedidosFiltrados.map((pedido) => {

          const subtotal =
            pedido.items?.reduce(
              (acc, item) =>
                acc +
                (
                  Number(item.precio) *
                  Number(item.cantidad)
                ),
              0
            );

          return (

            <div
              key={pedido._id}
              style={{
                background: 'white',
                borderRadius: 10,
                padding: 16,
                boxShadow:
                  '0 1px 4px rgba(0,0,0,0.08)'
              }}
            >

              {/* CABECERA */}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
                marginBottom: 10
              }}>

                <div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap'
                  }}>

                    <strong style={{
                      fontSize: 18
                    }}>
                      {pedido.cliente}
                    </strong>

                    <span style={{
                      background: '#16a34a',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 'bold'
                    }}>

                      #{pedido.nropedido}

                    </span>

                  </div>

                  <div style={{
                    fontSize: 13,
                    color: '#555',
                    marginTop: 4,
                    display: 'flex',
                    gap: 12,
                    flexWrap: 'wrap'
                  }}>

                    <span>
                      📞 {pedido.telefono}
                    </span>

                    <span>
                      🕒 {formatearFecha(pedido.fecha)}
                    </span>

                    <span>
                      🚚 {pedido.tipoEntrega}
                    </span>

                  </div>

                  {pedido.direccion && (

                    <div style={{
                      fontSize: 13,
                      color: '#666',
                      marginTop: 4
                    }}>
                      📍 {pedido.direccion}
                    </div>

                  )}

                </div>

                <div style={{
                  textAlign: 'right'
                }}>

                  <div style={{
                    background:
                      colorEstado(
                        pedido.estado
                      ),
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 'bold',
                    marginBottom: 6
                  }}>

                    {pedido.estado}

                  </div>

                  <div style={{
                    fontSize: 22,
                    fontWeight: 'bold'
                  }}>

                    $
                    {pedido.total?.toFixed(2)}

                  </div>

                </div>

              </div>

              {/* PRODUCTOS */}

              <div style={{
                borderTop: '1px solid #eee',
                paddingTop: 10
              }}>

                <div style={{
                  fontSize: 13,
                  fontWeight: 'bold',
                  marginBottom: 8
                }}>

                  Subtotal:
                  {' '}
                  ${subtotal}

                </div>

                <div style={{
                  display: 'grid',
                  gap: 6
                }}>

                  {pedido.items?.map(
                    (item, index) => (

                      <div
                        key={index}
                        style={{
                          background: '#f5f5f5',
                          borderRadius: 8,
                          padding: '8px 10px',
                          fontSize: 13,
                          display: 'flex',
                          justifyContent:
                            'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 10
                        }}
                      >

                        <div>

                          <strong>
                            {item.nombre}
                          </strong>

                          <div style={{
                            color: '#666',
                            marginTop: 2
                          }}>

                            {item.peso}
                            {' • '}
                            x{item.cantidad}

                          </div>

                        </div>

                        <div style={{
                          fontWeight: 'bold'
                        }}>

                          $
                          {
                            Number(item.precio) *
                            Number(item.cantidad)
                          }

                        </div>

                      </div>

                    ))}

                </div>

              </div>

              {/* BOTONES */}

              <div style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                marginTop: 14
              }}>

                <button
                  onClick={() =>
                    cambiarEstado(
                      pedido._id,
                      'Pedido entregado'
                    )
                  }
                  style={{
                    ...botonEstado,
                    background: '#4CAF50',
                    padding: '8px 12px',
                    fontSize: 12
                  }}
                >

                  Entregado

                </button>

                <button
                  onClick={() =>
                    cambiarEstado(
                      pedido._id,
                      'Proceso finalizado'
                    )
                  }
                  style={{
                    ...botonEstado,
                    background: '#777',
                    padding: '8px 12px',
                    fontSize: 12
                  }}
                >

                  Finalizar

                </button>

                <button
                  onClick={() =>
                    cambiarEstado(
                      pedido._id,
                      'Cancelado'
                    )
                  }
                  style={{
                    ...botonEstado,
                    background: '#ff4d4d',
                    padding: '8px 12px',
                    fontSize: 12
                  }}
                >

                  Cancelar

                </button>

              </div>

            </div>

          );

        })}

      </div>

    </main>
  );
}

const inputStyle = {

  flex: 1,

  minWidth: 220,

  padding: 10,

  borderRadius: 8,

  border: '1px solid #ddd',

  fontSize: 14

};

const botonEstado = {

  color: 'white',

  border: 'none',

  borderRadius: 8,

  cursor: 'pointer',

  fontWeight: 'bold'

};