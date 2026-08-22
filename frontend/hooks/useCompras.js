'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function useCompras() {

  const [compra, setCompra] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  async function crear(payload) {

    try {

      setLoading(true);
      setError(null);

      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/compras`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!res) return null;

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al crear la compra');
      }

      const data = await res.json();
      setCompra(data);
      return data;

    } catch (err) {

      // el mensaje ya quedó en `error`; no hace falta duplicarlo en consola
      // para validaciones esperadas (setError ya lo muestra en pantalla)
      setError(err.message);
      throw err;

    } finally {

      setLoading(false);

    }

  }

  async function actualizar(id, payload) {

    try {

      setLoading(true);
      setError(null);

      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/compras/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!res) return null;

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al actualizar la compra');
      }

      const data = await res.json();
      setCompra(data);
      return data;

    } catch (err) {

      // el mensaje ya quedó en `error`; no hace falta duplicarlo en consola
      // para validaciones esperadas (setError ya lo muestra en pantalla)
      setError(err.message);
      throw err;

    } finally {

      setLoading(false);

    }

  }

  async function evaluarPrecios(id) {

    try {

      setLoading(true);
      setError(null);

      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/compras/${id}/evaluar-precios`,
        {
          method: 'POST'
        }
      );

      if (!res) return null;

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al evaluar los precios');
      }

      const data = await res.json();
      setCompra(data);
      return data;

    } catch (err) {

      // el mensaje ya quedó en `error`; no hace falta duplicarlo en consola
      // para validaciones esperadas (setError ya lo muestra en pantalla)
      setError(err.message);
      throw err;

    } finally {

      setLoading(false);

    }

  }

  async function confirmar(id) {

    try {

      setLoading(true);
      setError(null);

      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/compras/${id}/confirmar`,
        {
          method: 'POST'
        }
      );

      if (!res) return null;

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al confirmar la compra');
      }

      const data = await res.json();
      setCompra(data);
      return data;

    } catch (err) {

      // el mensaje ya quedó en `error`; no hace falta duplicarlo en consola
      // para validaciones esperadas (setError ya lo muestra en pantalla)
      setError(err.message);
      throw err;

    } finally {

      setLoading(false);

    }

  }

  async function anular(id) {

    try {

      setLoading(true);
      setError(null);

      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/compras/${id}/anular`,
        {
          method: 'POST'
        }
      );

      if (!res) return null;

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al anular la compra');
      }

      const data = await res.json();
      setCompra(data);
      return data;

    } catch (err) {

      // el mensaje ya quedó en `error`; no hace falta duplicarlo en consola
      // para validaciones esperadas (setError ya lo muestra en pantalla)
      setError(err.message);
      throw err;

    } finally {

      setLoading(false);

    }

  }

  async function listar() {

    try {

      setLoading(true);
      setError(null);

      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/compras`
      );

      if (!res) return [];

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al listar las compras');
      }

      return await res.json();

    } catch (err) {

      // el mensaje ya quedó en `error`; no hace falta duplicarlo en consola
      // para validaciones esperadas (setError ya lo muestra en pantalla)
      setError(err.message);
      throw err;

    } finally {

      setLoading(false);

    }

  }

  async function obtener(id) {

    try {

      setLoading(true);
      setError(null);

      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/compras/${id}`
      );

      if (!res) return null;

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al obtener la compra');
      }

      const data = await res.json();
      setCompra(data);
      return data;

    } catch (err) {

      // el mensaje ya quedó en `error`; no hace falta duplicarlo en consola
      // para validaciones esperadas (setError ya lo muestra en pantalla)
      setError(err.message);
      throw err;

    } finally {

      setLoading(false);

    }

  }

  return {

    compra,

    loading,

    error,

    crear,

    actualizar,

    evaluarPrecios,

    confirmar,

    anular,

    listar,

    obtener,

    setCompra

  };

}
