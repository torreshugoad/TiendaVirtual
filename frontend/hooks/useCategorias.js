'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function useCategorias(soloActivas = false) {

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerCategorias();
  }, []);

  async function obtenerCategorias() {

    try {

      setLoading(true);

      const url =

        soloActivas

          ? `${process.env.NEXT_PUBLIC_API_URL}/api/categorias?activa=true`

          : `${process.env.NEXT_PUBLIC_API_URL}/api/categorias`;

      const res = await apiFetch(url);

      if (!res) return;

      const data = await res.json();

      setCategorias(data);

    } catch (error) {

      console.error(
        'Error obteniendo categorías:',
        error
      );

    } finally {

      setLoading(false);

    }

  }

  async function crearCategoria(categoria) {

    const res = await apiFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categorias`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoria)
      }
    );

    if (!res) return false;

    await obtenerCategorias();

    return true;

  }

  async function actualizarCategoria(id, categoria) {

    const res = await apiFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categorias/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoria)
      }
    );

    if (!res) return false;

    await obtenerCategorias();

    return true;

  }

  async function eliminarCategoria(id) {

    const res = await apiFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categorias/${id}`,
      {
        method: 'DELETE'
      }
    );

    if (!res) return false;

    await obtenerCategorias();

    return true;

  }

  return {

    categorias,
    loading,

    obtenerCategorias,

    crearCategoria,

    actualizarCategoria,

    eliminarCategoria

  };

}