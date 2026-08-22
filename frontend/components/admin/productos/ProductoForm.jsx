'use client';

import { X } from 'lucide-react';

import Card from '@/components/admin/common/Card';

import DatosProducto from './DatosProducto';
import UploadImagen from './UploadImagen';
import VariantesEditor from './VariantesEditor';
import ComponentesEditor from './ComponentesEditor';
import AccionesFormulario from './AccionesFormulario';

import styles from './ProductoForm.module.css';

export default function ProductoForm({
  formulario,
  categorias,
  productos,
  handleChange,
  actualizarCampo,
  agregarVariante,
  actualizarVariante,
  eliminarVariante,
  agregarComponente,
  actualizarComponente,
  eliminarComponente,
  guardar,
  limpiar,
  editandoId,
  saving = false
}) {

  return (
    <div className={styles.overlay} onClick={limpiar}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <h2>{editandoId ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button
            onClick={limpiar}
            className={styles.closeButton}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

    <Card>
      <DatosProducto
        formulario={formulario}
        categorias={categorias}
        handleChange={handleChange}
        actualizarCampo={actualizarCampo}
      />

      <UploadImagen
        imagen={formulario.foto}
        onChange={(url) =>
          actualizarCampo('foto', url)
        }
      />
      {formulario.tipoStock === 'combo' ? (
        <ComponentesEditor
          componentes={formulario.componentes}
          productos={productos}
          productoIdActual={editandoId}
          onAgregar={agregarComponente}
          onActualizar={actualizarComponente}
          onEliminar={eliminarComponente}
        />
      ) : (

        <VariantesEditor
          tipoStock={formulario.tipoStock}
          variantes={formulario.variantes}
          onAgregar={agregarVariante}
          onActualizar={actualizarVariante}
          onEliminar={eliminarVariante}
        />
      )}

      <AccionesFormulario
        editando={!!editandoId}
        saving={saving}
        onGuardar={guardar}
        onCancelar={limpiar}
      />

    </Card>
      </div>
    </div>
  );
}