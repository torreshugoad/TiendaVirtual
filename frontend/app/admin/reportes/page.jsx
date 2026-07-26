'use client';

import useAdminAuth
from '@/hooks/useAdminAuth';

import { apiFetch } from '@/lib/api';

import {
  useEffect,
  useState
} from 'react';

import * as XLSX
  from 'xlsx';

import { saveAs }
  from 'file-saver';

export default function ReportesPage() {

const loading =
  useAdminAuth();

  const [tipo,
    setTipo] =
    useState('semana');

  const [reporte,
    setReporte] =
    useState(null);

  const [fechaInicio,
    setFechaInicio] =
    useState('');

  const [fechaFin,
    setFechaFin] =
    useState('');

useEffect(() => {
  if (!loading) {
    obtenerReporte();
  }
}, [loading, tipo]);

async function obtenerReporte() {
  try {
    const res = await apiFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/reportes/ventas?tipo=${tipo}`
    );
    if (!res) return;
    const data = await res.json();
    console.log(data);
    setReporte(data);
  }
  catch (error) {
    console.error(error);
  }
}


  function formatearFecha(fecha) {

    return new Date(fecha)
      .toLocaleString();
  }

  async function exportarExcel() {

    if (
      !fechaInicio ||
      !fechaFin
    ) {

      alert(
        'Seleccionar fechas'
      );

      return;
    }

const res = await apiFetch(

  `${process.env.NEXT_PUBLIC_API_URL}/api/reportes/ventas-excel?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`

);

if (!res) return;

const ventas = await res.json();

    const datos =
      ventas.map(v => ({

        Fecha:
          formatearFecha(
            v.fecha
          ),

        Cliente:
          v.cliente,

        Telefono:
          v.telefono,

        Producto:
          v.producto,

        Variante:
          v.variante,

        Cantidad:
          v.cantidad,

        Precio:
          v.precio,

        Importe:
          v.subtotal,

        Estado:
          v.estado

      }));

    const workbook =
      XLSX.utils.book_new();

    const sheet =
      XLSX.utils.json_to_sheet(
        datos
      );

    XLSX.utils.book_append_sheet(

      workbook,

      sheet,

      'Ventas'

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
      'reporte_ventas.xlsx'
    );
  }

if (loading) {

  return null;

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
        marginBottom: 30,
        flexWrap: 'wrap',
        gap: 20
      }}>

        <div>

          <h1>
            Reportes Ventas
          </h1>

          <div style={{
            display: 'flex',
            gap: 10,
            marginTop: 15,
            flexWrap: 'wrap'
          }}>

            <input
              type="date"
              value={fechaInicio}
              onChange={(e) =>

                setFechaInicio(
                  e.target.value
                )

              }
              style={inputStyle}
            />

            <input
              type="date"
              value={fechaFin}
              onChange={(e) =>

                setFechaFin(
                  e.target.value
                )

              }
              style={inputStyle}
            />

            <button
              onClick={
                exportarExcel
              }
              style={botonExcel}
            >

              Exportar Excel

            </button>

          </div>

        </div>

        <select
          value={tipo}
          onChange={(e) =>

            setTipo(
              e.target.value
            )

          }
          style={{
            padding: 12,
            borderRadius: 10,
            border:
              '1px solid #ddd'
          }}
        >

          <option value="semana">
            Última semana
          </option>

          <option value="mes">
            Último mes
          </option>

        </select>

      </div>

      {reporte && (

        <>

          <div style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 20,
            marginBottom: 30
          }}>

            <Card
              titulo="Facturación"
              valor={`$${reporte.facturacionTotal?.toFixed(2)}`}
            />

            <Card
              titulo="Pedidos"
              valor={
                reporte.cantidadPedidos
              }
            />

            <Card
              titulo="Ticket Promedio"
              valor={`$${reporte.ticketPromedio?.toFixed(2)}`}
            />

          </div>

          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 25
          }}>

            <h2>
              Productos vendidos
            </h2>

            <table style={{
              width: '100%',
              borderCollapse:
                'collapse'
            }}>

              <thead>

                <tr>

                  <th style={thStyle}>
                    Producto
                  </th>

                  <th style={thStyle}>
                    Cantidad
                  </th>

                  <th style={thStyle}>
                    Importe
                  </th>

                </tr>

              </thead>

              <tbody>

                {reporte.productos?.map(
                  (producto, index) => (

                  <tr key={index}>

                    <td style={tdStyle}>
                      {producto.producto}
                    </td>

                    <td style={tdStyle}>
                      {producto.cantidad}
                    </td>

                    <td style={tdStyle}>

                      $
                      {producto.importe?.toFixed(2)}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </>

      )}

    </main>
  );
}

function Card({
  titulo,
  valor
}) {

  return (

    <div style={{
      background: 'white',
      padding: 25,
      borderRadius: 12,
      boxShadow:
        '0 2px 8px rgba(0,0,0,0.08)'
    }}>

      <h3>
        {titulo}
      </h3>

      <h1>
        {valor}
      </h1>

    </div>
  );
}

const thStyle = {

  borderBottom:
    '1px solid #ddd',

  textAlign: 'left',

  padding: 12

};

const tdStyle = {

  borderBottom:
    '1px solid #eee',

  padding: 12

};

const inputStyle = {

  padding: 12,

  borderRadius: 10,

  border:
    '1px solid #ddd'

};

const botonExcel = {

  background: '#4CAF50',

  color: 'white',

  border: 'none',

  padding: '12px 20px',

  borderRadius: 10,

  cursor: 'pointer',

  fontWeight: 'bold'

};