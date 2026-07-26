'use client';

import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { apiFetch } from '@/lib/api';

export default function useReportes() {

  const [tipo, setTipo] =
    useState('semana');

  const [reporte, setReporte] =
    useState(null);

  const [fechaInicio, setFechaInicio] =
    useState('');

  const [fechaFin, setFechaFin] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  useEffect(() => {

    obtenerReporte();

  }, [tipo]);

  async function obtenerReporte() {

    try {

      setLoading(true);
      setError(null);

      const res = await apiFetch(

        `${process.env.NEXT_PUBLIC_API_URL}/api/reportes/ventas?tipo=${tipo}`

      );

      if (!res) return;

      const data = await res.json();

      setReporte(data);

    } catch (err) {

      console.error(err);

      setError(
        'No se pudo obtener el reporte.'
      );

    } finally {

      setLoading(false);

    }

  }

  function formatearFecha(fecha) {

    return new Date(fecha)
      .toLocaleString();

  }

  async function exportarExcel() {

    if (!fechaInicio || !fechaFin) {

      alert(
        'Debe seleccionar ambas fechas.'
      );

      return;

    }

    try {

      const res = await apiFetch(

`${process.env.NEXT_PUBLIC_API_URL}/api/reportes/ventas-excel?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`

      );

      if (!res) return;

      const ventas =
        await res.json();

      const datos =
        ventas.map(v => ({

          Fecha:
            formatearFecha(v.fecha),

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

      const blob =
        new Blob(

          [excelBuffer],

          {

            type:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

          }

        );

      saveAs(

        blob,

        'reporte_ventas.xlsx'

      );

    } catch (err) {

      console.error(err);

      alert(
        'Error exportando Excel.'
      );

    }

  }

  return {

    loading,

    error,

    reporte,

    tipo,

    setTipo,

    fechaInicio,

    setFechaInicio,

    fechaFin,

    setFechaFin,

    obtenerReporte,

    exportarExcel

  };

}