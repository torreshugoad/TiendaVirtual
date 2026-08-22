'use client';

import { Store, Phone, Truck, Package, Save } from 'lucide-react';
import Card from '@/components/admin/common/Card';
import Button from '@/components/admin/common/Button';
import styles from './ConfiguracionForm.module.css';

export default function ConfiguracionForm({
  configuracion = {},
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
      {/* INFORMACIÓN DE LA TIENDA */}
      <h2 className={styles.tituloSeccion}>
        <Store size={20} />
        Información de la tienda
      </h2>

      <div className={styles.grid}>
        <Campo
          label="Nombre de la tienda"
          name="nombreTienda"
          value={configuracion?.nombreTienda ?? ''}
          onChange={handleChange}
        />

        <Campo
          label="Descripción"
          name="descripcion"
          value={configuracion?.descripcion ?? ''}
          onChange={handleChange}
        />
      </div>

      <CampoArea
        label="Mensaje principal"
        name="notaHeader"
        value={configuracion?.notaHeader ?? ''}
        onChange={handleChange}
      />

      <hr className={styles.hr} />

      {/* CONTACTO */}
      <h2 className={styles.tituloSeccion}>
        <Phone size={20} />
        Contacto
      </h2>

      <div className={styles.grid}>
        <Campo
          label="WhatsApp"
          name="telefonoWhatsapp"
          value={configuracion?.telefonoWhatsapp ?? ''}
          onChange={handleChange}
        />

        <Campo
          label="Instagram"
          name="instagram"
          value={configuracion?.instagram ?? ''}
          onChange={handleChange}
        />

        <Campo
          label="Facebook"
          name="facebook"
          value={configuracion?.facebook ?? ''}
          onChange={handleChange}
        />
      </div>

      <hr className={styles.hr} />

      {/* ENVÍOS */}
      <h2 className={styles.tituloSeccion}>
        <Truck size={20} />
        Envíos
      </h2>

      <div className={styles.grid}>
        <Campo
          label="Costo de envío"
          type="number"
          name="costoEnvio"
          value={configuracion?.costoEnvio ?? 0}
          onChange={handleChange}
        />

        <Campo
          label="Envío gratis desde"
          type="number"
          name="envioGratisDesde"
          value={configuracion?.envioGratisDesde ?? 0}
          onChange={handleChange}
        />
      </div>

      <hr className={styles.hr} />

      {/* PEDIDOS */}
      <h2 className={styles.tituloSeccion}>
        <Package size={20} />
        Nro. Pedido
      </h2>

      <div className={styles.grid}>
        <Campo
          label="Número pedido inicial / actual"
          type="number"
          name="nropedido"
          value={configuracion?.nropedido ?? 0}
          onChange={handleChange}
        />
      </div>

      <div className={styles.footer}>
        <Button onClick={onGuardar} disabled={saving}>
          <span className={styles.contenidoBoton}>
            <Save size={18} />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </span>
        </Button>
      </div>
    </Card>
  );
}

/* COMPONENTES AUXILIARES */

function Campo({ label, ...props }) {
  return (
    <div className={styles.campo}>
      <label className={styles.label}>{label}</label>
      <input {...props} className={styles.inputBase} />
    </div>
  );
}

function CampoArea({ label, ...props }) {
  return (
    <div className={styles.campoArea}>
      <label className={styles.label}>{label}</label>
      <textarea {...props} rows={3} className={styles.textarea} />
    </div>
  );
}