'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const API =
  `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`;

export default function useDashboard() {

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const obtenerDashboard =
    useCallback(async () => {

      try {

        setLoading(true);

        setError(null);

        const res =
          await apiFetch(API);

        if (!res) return;

        const data =
          await res.json();

        setDashboard(data);

      } catch (err) {

        console.error(err);

        setError(
          'No se pudo cargar el dashboard.'
        );

      } finally {

        setLoading(false);

      }

    }, []);

  useEffect(() => {

    obtenerDashboard();

  }, [obtenerDashboard]);

  function actualizarDashboard() {

    obtenerDashboard();

  }

  return {

    dashboard,

    loading,

    error,

    obtenerDashboard,

    actualizarDashboard

  };

}