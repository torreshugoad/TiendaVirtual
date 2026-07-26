'use client';

import Card from '@/components/admin/common/Card';
import Button from '@/components/admin/common/Button';

export default function ConfiguracionForm({

  configuracion,

  actualizarCampo,

  onGuardar,

  saving

}) {

  function handleChange(e) {

    const { name, value } = e.target;

    actualizarCampo(name, value);

  }

  return (

    <Card>

      {/* ===========================
          INFORMACIÓN DE LA TIENDA
      ============================ */}

      <h2 style={styles.titulo}>

        🏪 Información de la tienda

      </h2>

      <div style={styles.grid}>

        <Campo

          label="Nombre de la tienda"

          name="nombreTienda"

          value={configuracion.nombreTienda || ''}

          onChange={handleChange}

        />

        <Campo

          label="Descripción"

          name="descripcion"

          value={configuracion.descripcion || ''}

          onChange={handleChange}

        />

      </div>

      <CampoArea

        label="Mensaje principal"

        name="notaHeader"

        value={configuracion.notaHeader || ''}

        onChange={handleChange}

      />

      <hr style={styles.hr} />

      {/* ===========================
          CONTACTO
      ============================ */}

      <h2 style={styles.titulo}>

        📞 Contacto

      </h2>

      <div style={styles.grid}>

        <Campo

          label="WhatsApp"

          name="telefonoWhatsapp"

          value={configuracion.telefonoWhatsapp || ''}

          onChange={handleChange}

        />

        <Campo

          label="Instagram"

          name="instagram"

          value={configuracion.instagram || ''}

          onChange={handleChange}

        />

        <Campo

          label="Facebook"

          name="facebook"

          value={configuracion.facebook || ''}

          onChange={handleChange}

        />

      </div>

      <hr style={styles.hr} />

      {/* ===========================
          ENVÍOS
      ============================ */}

      <h2 style={styles.titulo}>

        🚚 Envíos

      </h2>

      <div style={styles.grid}>

        <Campo

          label="Costo de envío"

          type="number"

          name="costoEnvio"

          value={configuracion.costoEnvio ?? 0}

          onChange={handleChange}

        />

        <Campo

          label="Envío gratis desde"

          type="number"

          name="envioGratisDesde"

          value={configuracion.envioGratisDesde ?? 0}

          onChange={handleChange}

        />

      </div>

      <div style={styles.footer}>

        <Button

          onClick={onGuardar}

          disabled={saving}

        >

          {

            saving

              ? 'Guardando...'

              : '💾 Guardar cambios'

          }

        </Button>

      </div>

    </Card>

  );

}

/* ===========================
   COMPONENTES AUXILIARES
=========================== */

function Campo({

  label,

  ...props

}) {

  return (

    <div style={styles.campo}>

      <label style={styles.label}>

        {label}

      </label>

      <input

        {...props}

        style={styles.input}

      />

    </div>

  );

}

function CampoArea({

  label,

  ...props

}) {

  return (

    <div style={styles.campoArea}>

      <label style={styles.label}>

        {label}

      </label>

      <textarea

        {...props}

        rows={4}

        style={styles.textarea}

      />

    </div>

  );

}

/* ===========================
   ESTILOS
=========================== */

const styles = {

  titulo: {

    marginBottom: 18,

    fontSize: 20,

    fontWeight: 700,

    color: '#1f2937'

  },

  hr: {

    margin: '30px 0',

    border: 0,

    borderTop: '1px solid #e5e7eb'

  },

  grid: {

    display: 'grid',

    gridTemplateColumns:
      'repeat(auto-fit,minmax(260px,1fr))',

    gap: 20

  },

  campo: {

    display: 'flex',

    flexDirection: 'column',

    gap: 6

  },

  campoArea: {

    display: 'flex',

    flexDirection: 'column',

    gap: 6,

    marginTop: 20

  },

  label: {

    fontWeight: 600,

    color: '#374151'

  },

  input: {

    padding: 10,

    border: '1px solid #d1d5db',

    borderRadius: 8,

    fontSize: 15

  },

  textarea: {

    padding: 10,

    border: '1px solid #d1d5db',

    borderRadius: 8,

    resize: 'vertical',

    fontSize: 15

  },

  footer: {

    marginTop: 35,

    display: 'flex',

    justifyContent: 'flex-end'

  }

};