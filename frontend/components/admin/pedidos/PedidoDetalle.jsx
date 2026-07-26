'use client';

import { Fragment } from 'react';

import Button from '@/components/admin/common/Button';
import EstadoBadge from '@/components/admin/common/EstadoBadge';

/* ==========================
   Convierte el texto del peso
   (ej. "100Gr", "1Kg") a gramos.
========================== */

function parsearPesoAGramos(peso) {

  if (!peso) return 0;

  const texto =

    String(peso)
      .toLowerCase()
      .replace(',', '.')
      .replace(/\s/g, '');

  if (texto.endsWith('kg')) {

    return Math.round(

      parseFloat(
        texto.replace('kg', '')
      ) * 1000
    );
  }

  if (texto.endsWith('gr')) {

    return Math.round(

      parseFloat(
        texto.replace('gr', '')
      )
    );
  }

  return 0;
}

function formatearGramos(gramos) {

  if (gramos >= 1000) {

    const kg = gramos / 1000;

    return `${Number(kg.toFixed(2))}Kg`;
  }

  return `${gramos}Gr`;
}

export default function PedidoDetalle({

  pedido,

  onClose

}) {

  if (!pedido) return null;

  const fecha = new Date(

    pedido.fecha

  ).toLocaleString(

    'es-AR'

  );

  const subtotal =

    Number(

      pedido.subtotal || 0

    );

  const envio =

    Number(

      pedido.envio || 0

    );

  const total =

    Number(

      pedido.total || 0

    );

  // Agrupamos los items por producto para poder mostrar, cuando
  // se compraron varias variantes/cantidades de un mismo producto
  // pesable (ej. 100Gr + 250Gr), el total combinado en gramos.

  const pedidoAgrupado = (() => {

    const grupos = (pedido.items || []).reduce(

      (acc, item) => {

        const clave =

          item.productoId || item.nombre;

        if (!acc[clave]) {

          acc[clave] = {

            clave,

            nombre: item.nombre,

            items: []

          };
        }

        acc[clave].items.push(item);

        return acc;
      },
      {}
    );

    return Object.values(grupos).map(grupo => {

      const gramosPorLinea =

        grupo.items.map(

          item =>

            parsearPesoAGramos(item.peso) *

            Number(item.cantidad || 0)
        );

      const esGranel =

        gramosPorLinea.every(g => g > 0);

      const totalGramos =

        esGranel

          ? gramosPorLinea.reduce((a, b) => a + b, 0)

          : null;

      return {
        ...grupo,
        esGranel,
        totalGramos
      };
    });

  })();

  return (

    <div style={styles.overlay}>

      <div style={styles.panel}>

        <div style={styles.header}>

          <div>

            <h2 style={styles.titulo}>

              Pedido #

              {pedido.nropedido}

            </h2>

            <small>

              {fecha}

            </small>

          </div>

          <Button

            variant="secondary"

            onClick={onClose}

          >

            ✕

          </Button>

        </div>

        <section style={styles.section}>

          <div style={styles.clienteHeader}>

            <strong style={styles.clienteNombre}>
              {pedido.cliente}
            </strong>

            <EstadoBadge estado={pedido.estado} />

          </div>

          <div style={styles.datosCliente}>

            <div style={styles.filaDato}>
              <span style={styles.icono}>📞</span>
              <span>{pedido.telefono}</span>
            </div>

            <div style={styles.filaDato}>
              <span style={styles.icono}>🚚</span>
              <span>{pedido.tipoEntrega}</span>
            </div>

            {pedido.direccion && (
              <div style={styles.filaDato}>
                <span style={styles.icono}>📍</span>
                <span>{pedido.direccion}</span>
              </div>
            )}

          </div>

        </section>

        <section style={styles.section}>

          <h3>

            Productos

          </h3>

          <table style={styles.table}>

            <thead>

              <tr>

                <th>Producto</th>

                <th>Cant.</th>

                <th>Precio</th>

                <th>Total</th>

              </tr>

            </thead>

            <tbody>

              {pedidoAgrupado.map(

                grupo => (

                  <Fragment key={grupo.clave}>

                    <tr style={{ background: '#f9fafb' }}>

                      <td

                        colSpan={4}

                        style={{

                          fontWeight: 'bold',
                          paddingTop: 10
                        }}

                      >

                        {grupo.nombre}

                      </td>

                    </tr>

                    {grupo.items.map(

                      (item, index) => (

                        <tr key={index}>

                          <td style={{ paddingLeft: 16, color: '#6b7280' }}>

                            {item.peso || `Cant. ${item.cantidad}`}

                          </td>

                          <td>

                            {item.cantidad}

                          </td>

                          <td>

                            $

                            {Number(
                              item.precio || 0
                            ).toFixed(2)}

                          </td>

                          <td>

                            $

                            {Number(
                              item.subtotal || 0
                            ).toFixed(2)}

                          </td>

                        </tr>
                      )
                    )}

                    {grupo.esGranel &&

                      (
                        grupo.items.length > 1 ||

                        Number(grupo.items[0].cantidad) > 1
                      ) && (

                        <tr>

                          <td

                            colSpan={4}

                            style={{
                              fontWeight: 'bold',
                              paddingLeft: 16
                            }}

                          >

                            Total: {formatearGramos(grupo.totalGramos)}

                          </td>

                        </tr>
                      )}

                  </Fragment>
                )
              )}

            </tbody>

          </table>

        </section>

        <section style={styles.totales}>

          <div>

            <span>

              Subtotal  

            </span>

	    {": "}

            <strong>

              $

              {subtotal.toFixed(2)}

            </strong>

          </div>

          <div>

            <span>

              Envío

            </span>

	    {": "}

            <strong>

              $

              {envio.toFixed(2)}

            </strong>

          </div>

          <div style={styles.totalFinal}>

            <span>

              TOTAL

            </span>

            <strong>

              $

              {total.toFixed(2)}

            </strong>

          </div>

        </section>

      </div>

    </div>

  );

}

const styles = {

  overlay: {

    position: 'fixed',

    inset: 0,

    background:

      'rgba(0,0,0,.35)',

    display: 'flex',

    justifyContent: 'flex-end',

    zIndex: 999

  },

  panel: {

    width: 520,

    maxWidth: '100%',

    background: '#fff',

    height: '100vh',

    overflowY: 'auto',

    padding: 16,

    boxShadow:

      '-5px 0 20px rgba(0,0,0,.15)'

  },

  header: {

    display: 'flex',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: 20

  },

  titulo: {

    margin: 0

  },

  section: {

    marginBottom: 20

  },

  clienteHeader: {

    display: 'flex',

    justifyContent: 'space-between',

    alignItems: 'center',

    flexWrap: 'wrap',

    gap: 8,

    marginBottom: 10

  },

  clienteNombre: {

    fontSize: 16

  },

  datosCliente: {

    display: 'flex',

    flexDirection: 'column',

    gap: 4,

    background: '#f9fafb',

    borderRadius: 10,

    padding: '10px 12px'

  },

  filaDato: {

    display: 'flex',

    alignItems: 'center',

    gap: 8,

    fontSize: 14,

    color: '#374151',

    lineHeight: 1.4

  },

  icono: {

    width: 20,

    textAlign: 'center',

    flexShrink: 0

  },

  table: {

    width: '100%',

    borderCollapse: 'collapse'

  },

  totales: {

    display: 'flex',

    flexDirection: 'column',

    gap: 10,

    borderTop:

      '1px solid #ddd',

    paddingTop: 20

  },

  totalFinal: {

    fontSize: 18,

    display: 'flex',

    justifyContent:

      'space-between'

  }

};