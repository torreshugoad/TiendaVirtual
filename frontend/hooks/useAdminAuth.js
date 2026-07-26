'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { apiFetch } from '@/lib/api';

export default function useAdminAuth() {

  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    verificarLogin();

  }, []);

  async function verificarLogin() {

    const token =
      localStorage.getItem('token');

    if (!token) {

      setLoading(false);

      router.replace('/admin/login');

      return;

    }

    try {

      const res = await apiFetch(

        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/verify`

      );

      if (!res) return;

      const data =
        await res.json();

      if (!data.ok) {

        throw new Error();

      }

      setLoading(false);

    } catch (error) {

      console.error(error);

      localStorage.removeItem('token');

      localStorage.removeItem(
        'adminLogueado'
      );

      setLoading(false);

      router.replace('/admin/login');

    }

  }

  return loading;

}