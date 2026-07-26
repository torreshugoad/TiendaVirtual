'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function useProductos() {

  const [productos, setProductos] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    obtenerProductos();

  }, []);

  async function obtenerProductos() {

    try {

      setLoading(true);

      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/productos`
      );

      if (!res) return;

      const data = await res.json();

      setProductos(data);

    } catch (error) {

      console.error(
        'Error obteniendo productos:',
        error
      );

    } finally {

      setLoading(false);

    }

  }

  async function guardarProducto(producto) {

    try {

      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/productos`,
        {

          method: 'POST',

          headers: {

            'Content-Type': 'application/json'

          },

          body: JSON.stringify(producto)

        }

      );

      if (!res) return false;

      const nuevo = await res.json();

      setProductos(prev => [

        ...prev,

        nuevo

      ]);

      return true;

    } catch (error) {

      console.error(error);

      return false;

    }

  }

  async function actualizarProducto(

    id,

    producto

  ) {

    try {

      const res = await apiFetch(

        `${process.env.NEXT_PUBLIC_API_URL}/api/productos/${id}`,

        {

          method: 'PUT',

          headers: {

            'Content-Type': 'application/json'

          },

          body: JSON.stringify(producto)

        }

      );

      if (!res) return false;

      const actualizado = await res.json();

      setProductos(prev =>

        prev.map(p =>

          p._id === id

            ? actualizado

            : p

        )

      );

      return true;

    } catch (error) {

      console.error(error);

      return false;

    }

  }

  async function eliminarProducto(id) {

    const confirmar = window.confirm(

      '¿Eliminar este producto?'

    );

    if (!confirmar) return false;

    try {

      const res = await apiFetch(

        `${process.env.NEXT_PUBLIC_API_URL}/api/productos/${id}`,

        {

          method: 'DELETE'

        }

      );

      if (!res) return false;

      setProductos(prev =>

        prev.filter(

          producto =>

            producto._id !== id

        )

      );

      return true;

    } catch (error) {

      console.error(error);

      return false;

    }

  }

  function reemplazarProducto(producto) {

    setProductos(prev =>

      prev.map(p =>

        p._id === producto._id

          ? producto

          : p

      )

    );

  }

  return {

    productos,

    loading,

    obtenerProductos,

    guardarProducto,

    actualizarProducto,

    eliminarProducto,

    reemplazarProducto,

    setProductos

  };

}