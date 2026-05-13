'use client';

import {
  useEffect,
  useState
} from 'react';

import {
  useRouter
} from 'next/navigation';

import * as XLSX
  from 'xlsx';

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
    `${process.env.NEXT_PUBLIC_API_URL}/api/productos`
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

          estado: nuevoEstado,

          confirmacionEnviada:
            nuevoEstado ===
            'Confirmación enviada'

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

    pedidosFiltrados.map(
      pedido => ({

      Fecha:
        formatearFecha(
          pedido.fecha
        ),

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

      Total:
        pedido.total

    }));

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

      case 'Confirmación enviada':
        return '#2196F3';

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
      padding: 30,
      fontFamily: 'Arial',
      background: '#f7f7f7',
      minHeight: '100vh'
    }}>

      <div style={{
        display: 'flex',
        justifyContent:
          'space-between',
        alignItems: 'center',
        marginBottom: 30
      }}>

<div style={{
  display: 'flex',
  justifyContent:
    'space-between',
  alignItems: 'center',
  width: '100%'
}}>

  <h1>
    Administración Pedidos
  </h1>

  <button
    onClick={exportarExcel}
    style={{
      background: '#4CAF50',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      borderRadius: 10,
      cursor: 'pointer',
      fontWeight: 'bold'
    }}
  >

    Exportar Excel

  </button>

</div>

      </div>

      <div style={{
        background: 'white',
        padding: 20,
        borderRadius: 12,
        marginBottom: 30,
        display: 'flex',
        gap: 15,
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
            Confirmación enviada
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

      <div style={{
        display: 'grid',
        gap: 20
      }}>

        {pedidosFiltrados.map(
          pedido => (

          <div
            key={pedido._id}
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 25,
              boxShadow:
                '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >

            <div style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 15
            }}>

              <div>

                <h2 style={{
                  margin: 0
                }}>

                  {pedido.cliente}

                </h2>

                <p>
                  📞 {pedido.telefono}
                </p>

                <p>

                  🕒
                  {' '}
                  {
                    formatearFecha(
                      pedido.fecha
                    )
                  }

                </p>

                <p>

                  🚚
                  {' '}
                  {
                    pedido.tipoEntrega
                  }

                </p>

                {pedido.direccion && (

                  <p>

                    📍
                    {' '}
                    {
                      pedido.direccion
                    }

                  </p>

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
                  padding:
                    '10px 16px',
                  borderRadius: 20,
                  fontWeight: 'bold',
                  marginBottom: 10
                }}>

                  {pedido.estado}

                </div>

                <h2>

                  $
                  {pedido.total
                    ?.toFixed(2)}

                </h2>

              </div>

            </div>

            <hr style={{
              margin: '20px 0'
            }} />

            <h3>
              Productos
            </h3>

<p
  style={{
    fontWeight: 'bold',
    marginBottom: '20px'
  }}
>

  Subtotal pedido:
  {' '}

  $

  {

    pedido.items?.reduce(

      (acc, item) =>

        acc +

        (
          Number(item.precio) *

          Number(item.cantidad)
        ),

      0
    )
  }

</p>

            <div style={{
              display: 'grid',
              gap: 10
            }}>

              {pedido.items?.map(
                (item, index) => (

                <div
                  key={index}
                  style={{
                    background: '#f9f9f9',
                    padding: 15,
                    borderRadius: 10
                  }}
                >

                  <strong>
                    {item.nombre}
                  </strong>

                  <p>
                    Variante:
                    {' '}
                    {item.peso}
                  </p>

                  <p>

                    Cantidad:
                    {' '}
                    {item.cantidad}

                  </p>

                  <p>

                    Precio:
                    {' '}
                    $
                    {item.precio}

                  </p>

                  <p>

  Subtotal:
  {' '}

  $

  {

    Number(item.precio) *

    Number(item.cantidad)
  }

</p>

                </div>

              ))}

            </div>

            <div style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              marginTop: 25
            }}>

              <button
                onClick={() =>
                  cambiarEstado(
                    pedido._id,
                    'Confirmación enviada'
                  )
                }
                style={{
                  ...botonEstado,
                  background: '#2196F3'
                }}
              >

                Confirmación enviada

              </button>

              <button
                onClick={() =>
                  cambiarEstado(
                    pedido._id,
                    'Pedido entregado'
                  )
                }
                style={{
                  ...botonEstado,
                  background: '#4CAF50'
                }}
              >

                Pedido entregado

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
                  background: '#777'
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
                  background: '#ff4d4d'
                }}
              >

                Cancelar

              </button>

            </div>

          </div>

        ))}

      </div>

    </main>
  );
}

const inputStyle = {

  flex: 1,

  minWidth: 250,

  padding: 14,

  borderRadius: 10,

  border: '1px solid #ddd'

};

const botonEstado = {

  color: 'white',

  border: 'none',

  padding: '12px 18px',

  borderRadius: 10,

  cursor: 'pointer',

  fontWeight: 'bold'

};