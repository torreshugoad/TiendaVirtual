'use client';

import { apiFetch } from '@/lib/api';

const API =
  `${process.env.NEXT_PUBLIC_API_URL}/api/productos`;

export default function useProductoAPI() {

  async function obtenerProductos() {

    const res = await apiFetch(API);

    if (!res) return [];

    return await res.json();

  }

  async function crearProducto(producto) {

    const res = await apiFetch(API, {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify(producto)

    });

    return !!res;

  }

  async function actualizarProducto(id, producto) {

    const res = await apiFetch(`${API}/${id}`, {

      method: 'PUT',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify(producto)

    });

    return !!res;

  }

  async function eliminarProducto(id) {

    const res = await apiFetch(`${API}/${id}`, {

      method: 'DELETE'

    });

    return !!res;

  }

  return {

    obtenerProductos,

    crearProducto,

    actualizarProducto,

    eliminarProducto

  };

}