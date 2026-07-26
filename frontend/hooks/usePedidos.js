'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function usePedidos() {

  const [pedidos, setPedidos] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [pedidoSeleccionado,
    setPedidoSeleccionado] = useState(null);

  const [estadoFiltro,
    setEstadoFiltro] = useState('todos');

  const [textoBusqueda,
    setTextoBusqueda] = useState('');

  const [fechaDesde,
    setFechaDesde] = useState('');

  const [fechaHasta,
    setFechaHasta] = useState('');

  useEffect(() => {

    obtenerPedidos();

  }, []);

  async function obtenerPedidos() {

    try {

      setLoading(true);

      const res = await apiFetch(

        `${process.env.NEXT_PUBLIC_API_URL}/api/pedidos`

      );

      if (!res) return;

      const data = await res.json();

      setPedidos(data);

    } catch (err) {

      console.error(err);

      setError(err);

    } finally {

      setLoading(false);

    }

  }

  async function actualizarEstado(

    id,

    estado

  ) {

    try {

      const res = await apiFetch(

        `${process.env.NEXT_PUBLIC_API_URL}/api/pedidos/${id}`,

        {

          method: 'PUT',

          headers: {

            'Content-Type':
              'application/json'

          },

          body: JSON.stringify({

            estado

          })

        }

      );

      if (!res) return false;

      await obtenerPedidos();

      return true;

    } catch (err) {

      console.error(err);

      return false;

    }

  }

  async function eliminarPedido(id) {

    if (

      !confirm(

        '¿Eliminar pedido?'

      )

    ) return;

    try {

      const res = await apiFetch(

        `${process.env.NEXT_PUBLIC_API_URL}/api/pedidos/${id}`,

        {

          method: 'DELETE'

        }

      );

      if (!res) return;

      await obtenerPedidos();

    } catch (err) {

      console.error(err);

    }

  }

  const pedidosFiltrados =

    useMemo(() => {

      return pedidos.filter(pedido => {

        const estadoOk =

          estadoFiltro === 'todos'

            ? true

            : pedido.estado === estadoFiltro;

        const texto =

          textoBusqueda
            .toLowerCase()
            .trim();

        const textoOk =

          texto === ''

            ||

          pedido.cliente
            ?.toLowerCase()
            .includes(texto)

            ||

          pedido.telefono
            ?.toLowerCase()
            .includes(texto)

            ||

          String(
            pedido.nropedido
          ).includes(texto);

        let fechaOk = true;

        if (fechaDesde) {

          fechaOk =

            new Date(pedido.fecha) >=

            new Date(fechaDesde);

        }

        if (

          fechaOk &&

          fechaHasta

        ) {

          const hasta =

            new Date(fechaHasta);

          hasta.setHours(

            23,

            59,

            59,

            999

          );

          fechaOk =

            new Date(pedido.fecha)

            <=

            hasta;

        }

        return (

          estadoOk &&

          textoOk &&

          fechaOk

        );

      });

    },

    [

      pedidos,

      estadoFiltro,

      textoBusqueda,

      fechaDesde,

      fechaHasta

    ]);

  return {

    loading,

    error,

    pedidos,

    pedidosFiltrados,

    pedidoSeleccionado,

    estadoFiltro,

    textoBusqueda,

    fechaDesde,

    fechaHasta,

    setPedidoSeleccionado,

    setEstadoFiltro,

    setTextoBusqueda,

    setFechaDesde,

    setFechaHasta,

    obtenerPedidos,

    actualizarEstado,

    eliminarPedido

  };

}