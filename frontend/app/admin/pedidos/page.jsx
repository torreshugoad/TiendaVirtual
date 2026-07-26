'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import useAdminAuth from '@/hooks/useAdminAuth';
import PedidosToolbar from '@/components/admin/pedidos/PedidosToolbar';
import PedidosTable from '@/components/admin/pedidos/PedidosTable';
import PedidoDetalle from '@/components/admin/pedidos/PedidoDetalle';

export default function AdminPedidos() {
  const loading = useAdminAuth();
  const router = useRouter();

  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);

  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  useEffect(() => {
    const logueado = localStorage.getItem('adminLogueado');

    if (!logueado) {
      router.push('/admin/login');
      return;
    }

    obtenerPedidos();
    obtenerProductos();
  }, []);

  async function obtenerPedidos() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pedidos`);
    const data = await res.json();
    setPedidos(data);
  }

  async function obtenerProductos() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/productos`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    setProductos(data);
  }

  async function cambiarEstado(id, nuevoEstado) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pedidos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    });

    if (!res.ok) {
      alert('No se pudo actualizar el estado del pedido');
      return;
    }

    obtenerPedidos();
  }

  function formatearFecha(fecha) {
    return new Date(fecha).toLocaleString('es-AR');
  }

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const coincideBusqueda =
      String(pedido.cliente || '')
        .toLowerCase()
        .includes(textoBusqueda.toLowerCase()) ||
      pedido.telefono?.includes(textoBusqueda);

    const coincideEstado =
      !estadoFiltro || estadoFiltro === 'todos'
        ? true
        : pedido.estado === estadoFiltro;

    const fechaPedido = new Date(pedido.fecha);

    const coincideDesde = fechaDesde
      ? fechaPedido >= new Date(fechaDesde)
      : true;

    const coincideHasta = fechaHasta
      ? fechaPedido <= new Date(`${fechaHasta}T23:59:59`)
      : true;

    return coincideBusqueda && coincideEstado && coincideDesde && coincideHasta;
  });

  function exportarExcel() {
    const resumenPedidos = pedidosFiltrados.flatMap((pedido) =>
      pedido.items.map((item) => ({
        Fecha: formatearFecha(pedido.fecha),
        NroPedido: pedido.nropedido,
        Cliente: pedido.cliente,
        Telefono: pedido.telefono,
        Entrega: pedido.tipoEntrega,
        Direccion: pedido.direccion || '',
        Estado: pedido.estado,
        Producto: item.nombre,
        Variante: item.peso,
        Cant: item.cantidad,
        Precio: item.precio,
        Subtotal: Number(item.precio) * Number(item.cantidad),
        TotalPedido: pedido.total
      }))
    );

    const detalleProductos = [];

    pedidosFiltrados.forEach((pedido) => {
      pedido.items?.forEach((item) => {
        detalleProductos.push({
          Fecha: formatearFecha(pedido.fecha),
          Cliente: pedido.cliente,
          Producto: item.nombre,
          Variante: item.peso,
          Cantidad: item.cantidad,
          Precio: item.precio,
          Subtotal: Number(item.precio) * Number(item.cantidad)
        });
      });
    });

    const stockProductos = [];

    productos.forEach((producto) => {
      if (producto.tipoStock === 'granel') {
        stockProductos.push({
          Producto: producto.nombre,
          Tipo: 'Granel',
          Variante: '-',
          Stock: `${(producto.stockGranel / 1000).toFixed(2)} Kg`
        });
      } else {
        producto.variantes?.forEach((v) => {
          stockProductos.push({
            Producto: producto.nombre,
            Tipo: 'Unidad',
            Variante: v.peso,
            Stock: v.stock
          });
        });
      }
    });

    const workbook = XLSX.utils.book_new();

    const sheetPedidos = XLSX.utils.json_to_sheet(resumenPedidos);
    const sheetProductos = XLSX.utils.json_to_sheet(detalleProductos);
    const sheetStock = XLSX.utils.json_to_sheet(stockProductos);

    XLSX.utils.book_append_sheet(workbook, sheetPedidos, 'Pedidos');
    XLSX.utils.book_append_sheet(workbook, sheetProductos, 'Productos');
    XLSX.utils.book_append_sheet(workbook, sheetStock, 'Stock');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const data = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    saveAs(data, 'pedidos.xlsx');
  }

  if (loading) {
    return null;
  }

  return (
    <main
      style={{
        padding: 20,
        fontFamily: 'Arial',
        background: '#f7f7f7',
        minHeight: '100vh'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 10
        }}
      >
        <h1 style={{ margin: 0 }}>Pedidos</h1>
      </div>

      <PedidosToolbar
        textoBusqueda={textoBusqueda}
        setTextoBusqueda={setTextoBusqueda}
        estadoFiltro={estadoFiltro}
        setEstadoFiltro={setEstadoFiltro}
        fechaDesde={fechaDesde}
        setFechaDesde={setFechaDesde}
        fechaHasta={fechaHasta}
        setFechaHasta={setFechaHasta}
        onActualizar={obtenerPedidos}
        onExportar={exportarExcel}
      />

      <PedidosTable
        pedidos={pedidosFiltrados}
        onSeleccionar={setPedidoSeleccionado}
        onActualizarEstado={cambiarEstado}
      />

      {pedidoSeleccionado && (
        <PedidoDetalle
          pedido={pedidoSeleccionado}
          onClose={() => setPedidoSeleccionado(null)}
        />
      )}
    </main>
  );
}