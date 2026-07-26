'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '@/lib/api';

export default function useConfiguracion() {

  const [

    configuracion,

    setConfiguracion

  ] = useState({

    nombreTienda: '',

    descripcion: '',

    notaHeader: '',

    telefonoWhatsapp: '',

    instagram: '',

    facebook: '',

    costoEnvio: 0,

    envioGratisDesde: 0

  });

  const [

    loading,

    setLoading

  ] = useState(true);

  const [

    saving,

    setSaving

  ] = useState(false);

  useEffect(() => {

    cargarConfiguracion();

  }, []);

  async function cargarConfiguracion() {

    try {

      setLoading(true);

      const res = await apiFetch(

        `${process.env.NEXT_PUBLIC_API_URL}/api/configuracion`

      );

      if (!res) return;

      const data = await res.json();

      setConfiguracion({

        nombreTienda:
          data.nombreTienda || '',

        descripcion:
          data.descripcion || '',

        notaHeader:
          data.notaHeader || '',

        telefonoWhatsapp:
          data.telefonoWhatsapp || '',

        instagram:
          data.instagram || '',

        facebook:
          data.facebook || '',

        costoEnvio:
          data.costoEnvio || 0,

        envioGratisDesde:
          data.envioGratisDesde || 0

      });

    } catch (error) {

      console.error(

        'Error cargando configuración:',

        error

      );

    } finally {

      setLoading(false);

    }

  }

  function actualizarCampo(

    campo,

    valor

  ) {

    setConfiguracion(prev => ({

      ...prev,

      [campo]: valor

    }));

  }

  async function guardarConfiguracion() {

    try {

      setSaving(true);

      const res = await apiFetch(

        `${process.env.NEXT_PUBLIC_API_URL}/api/configuracion`,

        {

          method: 'PUT',

          headers: {

            'Content-Type':
              'application/json'

          },

          body: JSON.stringify(

            configuracion

          )

        }

      );

      if (!res) return false;

      const data =

        await res.json();

      if (data.configuracion) {

        setConfiguracion(

          data.configuracion

        );

      }

      return true;

    } catch (error) {

      console.error(

        'Error guardando configuración:',

        error

      );

      return false;

    } finally {

      setSaving(false);

    }

  }

  return {

    configuracion,

    loading,

    saving,

    actualizarCampo,

    guardarConfiguracion,

    cargarConfiguracion

  };

}