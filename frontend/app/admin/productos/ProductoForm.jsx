'use client';

import Card from '@/components/admin/common/Card';

import DatosProducto from './DatosProducto';
import UploadImagen from './UploadImagen';
import VariantesEditor from './VariantesEditor';
import ComponentesEditor from './ComponentesEditor';
import AccionesFormulario from './AccionesFormulario';

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

  );

}