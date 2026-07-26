'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function useUpload() {

  const [subiendo, setSubiendo] = useState(false);

  async function subirImagen(file) {

    if (!file) return null;

    try {

      setSubiendo(true);

      const formData = new FormData();

      formData.append(
        'imagen',
        file
      );

      const res = await apiFetch(

        `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,

        {
          method: 'POST',
          body: formData
        }

      );

      if (!res) return null;

      const data = await res.json();

      return data.imageUrl;

    } catch (error) {

      console.error(
        'Error subiendo imagen:',
        error
      );

      return null;

    } finally {

      setSubiendo(false);

    }

  }

  return {

    subirImagen,

    subiendo

  };

}