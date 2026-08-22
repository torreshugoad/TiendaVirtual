'use client';

import { X, Save, Plus } from 'lucide-react';
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
        <span style={styles.contenidoBoton}>
          <X size={16} />
          Cancelar
        </span>
      </Button>
      <Button
        variant="success"
        onClick={onGuardar}
        disabled={saving}
      >
        {
          saving
            ? 'Guardando...'
            : (
              <span style={styles.contenidoBoton}>
                {editando ? <Save size={16} /> : <Plus size={16} />}
                {editando ? 'Actualizar producto' : 'Crear producto'}
              </span>
            )
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
  },
  contenidoBoton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6
  }
};
