'use client';

import Button from '@/components/admin/common/Button';

export default function AccionesFormulario({

  editando,

  saving = false,

  onGuardar,

  onCancelar

}) {

  return (

    <div style={styles.container}>

      <Button

        variant="secondary"

        onClick={onCancelar}

        disabled={saving}

      >

        🧹 Nuevo

      </Button>

      <Button

        variant="success"

        onClick={onGuardar}

        disabled={saving}

      >

        {

          saving

            ? 'Guardando...'

            : editando

              ? '💾 Actualizar producto'

              : '➕ Crear producto'

        }

      </Button>

    </div>

  );

}

const styles = {

  container: {

    display: 'flex',

    justifyContent: 'flex-end',

    gap: 12,

    marginTop: 24,

    flexWrap: 'wrap'

  }

};