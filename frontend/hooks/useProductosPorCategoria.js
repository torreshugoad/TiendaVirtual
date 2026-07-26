'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function useProductosPorCategoria() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  async function obtenerProductosPorCategoria(categoriaId) {
    try {
      setLoading(true);

      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/productos/categoria/${categoriaId}?activo=true`
      );

      if (!res) return;

      const data = await res.json();

      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error obteniendo productos por categoría:', error);
    } finally {
      setLoading(false);
    }
  }

  function limpiarProductos() {
    setProductos([]);
  }

  return {
    productos,
    loading,
    obtenerProductosPorCategoria,
    limpiarProductos,
  };
}
