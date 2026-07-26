'use client';

import useAdminAuth from '@/hooks/useAdminAuth';
import useConfiguracion from '@/hooks/useConfiguracion';

import Loading from '@/components/admin/common/Loading';
import PageHeader from '@/components/admin/common/PageHeader';

import ConfiguracionForm from '@/components/admin/configuracion/ConfiguracionForm';

export default function ConfiguracionPage() {

  const loadingAuth = useAdminAuth();

  const {

    configuracion,

    loading,

    saving,

    actualizarCampo,

    guardarConfiguracion

  } = useConfiguracion();

  if (loadingAuth || loading) {

    return <Loading />;

  }


  return (

    <main style={styles.container}>

      <PageHeader

        titulo="Configuración"

        subtitulo="Configuración general de la tienda"

      />

      <ConfiguracionForm

        configuracion={configuracion}

        saving={saving}

        actualizarCampo={actualizarCampo}

        onGuardar={guardarConfiguracion}

      />

    </main>

  );

}

const styles = {

  container: {

    display: 'flex',

    flexDirection: 'column',

    gap: 24,

    padding: 24,

    maxWidth: 900,

    margin: '0 auto'

  }

};