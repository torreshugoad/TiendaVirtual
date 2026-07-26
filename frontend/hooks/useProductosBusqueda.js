'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function useProductosBusqueda() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerTodosLosProductos();
  }, []);

  async function obtenerTodosLosProductos() {
    try {
      setLoading(true);

      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/productos?activo=true`
      );

      if (!res) return;

      const data = await res.json();

      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error obteniendo productos para búsqueda:', error);
    } finally {
      setLoading(false);
    }
  }

  return { productos, loading };
}
