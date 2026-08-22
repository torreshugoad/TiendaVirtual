'use client';

import { Fragment } from 'react';
import { X, Phone, Truck, MapPin, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import Button from '@/components/admin/common/Button';
import EstadoBadge from '@/components/admin/common/EstadoBadge';
import styles from './PedidoDetalle.module.css';

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

function formatearMoneda(valor) {
  return Number(valor || 0).toFixed(2);
}

// Etiqueta corta del descuento manual, ej. "10%" o "$150.00".
function etiquetaDescuentoManual(item) {
  return item.descuentoTipo === 'porcentaje'
    ? `${item.descuentoValor}%`
    : `$${formatearMoneda(item.descuentoValor)}`;
}

/* ==========================
   Muestra el precio de una línea del pedido, contemplando los
   DOS descuentos posibles (independientes entre sí):

   - PROMOCIÓN: cargada en el producto, visible para el cliente
     en la tienda (item.montoPromocion / item.descuentoPromocion).
   - MANUAL: cargado a mano por el vendedor en el carrito manual
     (item.descuentoMonto / item.descuentoTipo / item.descuentoValor).

   Si hay ambos, se muestran en cascada: precio de lista tachado
   arriba de todo, después el precio con la promoción aplicada
   (también tachado, más chico), y por último el precio final.
========================== */

function CeldaPrecio({ item }) {
  const hayPromocion = Number(item.montoPromocion || 0) > 0;
  const hayManual = Number(item.descuentoMonto || 0) > 0;

  if (!hayPromocion && !hayManual) {
    return <>${formatearMoneda(item.precio)}</>;
  }

  return (
    <>
      <div className={styles.precioLista}>
        ${formatearMoneda(item.precioOriginal)}
      </div>

      {hayPromocion && (
        <div className={styles.promocionInfo}>
          Promoción -{item.descuentoPromocion}%
          {' '}
          (${formatearMoneda(item.montoPromocion)})
          {hayManual && (
            <>
              {' → '}
              <span className={styles.promocionTachada}>
                ${formatearMoneda(item.precioConPromocion)}
              </span>
            </>
          )}
        </div>
      )}

      <div>${formatearMoneda(item.precio)}</div>

      {hayManual && (
        <div className={styles.descuentoManualInfo}>
          Descuento -{etiquetaDescuentoManual(item)}
          {' '}
          (${formatearMoneda(item.descuentoMonto)})
        </div>
      )}
    </>
  );
}

// Deja el texto listo para usarse como nombre de archivo: sin acentos,
// sin espacios ni caracteres especiales (guiones bajos en su lugar).
function sanitizarNombreArchivo(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Arma y descarga el PDF del pedido. Recibe los mismos datos ya
// calculados en el componente (pedidoAgrupado, totales, etc.) para no
// duplicar esa lógica.
function generarPdfPedido({
  pedido,
  fecha,
  pedidoAgrupado,
  subtotal,
  envio,
  total,
  totalPromociones,
  totalDescuentos
}) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`Pedido #${pedido.nropedido}`, 14, 18);

  doc.setFontSize(10);
  doc.text(fecha, 14, 25);

  doc.setFontSize(11);
  doc.text(`Cliente: ${pedido.cliente}`, 14, 35);
  doc.text(`Teléfono: ${pedido.telefono}`, 14, 41);
  doc.text(`Entrega: ${pedido.tipoEntrega}`, 14, 47);

  let siguienteY = 53;

  if (pedido.direccion) {
    doc.text(`Dirección: ${pedido.direccion}`, 14, siguienteY);
    siguienteY += 6;
  }

  // Armamos las filas de la tabla a partir de los mismos grupos que
  // se muestran en pantalla, línea por línea.
  const filas = [];

  pedidoAgrupado.forEach(grupo => {
    grupo.items.forEach(item => {
      const hayPromocion = Number(item.montoPromocion || 0) > 0;
      const hayManual = Number(item.descuentoMonto || 0) > 0;

      const lineasPrecio = [];

      if (hayPromocion || hayManual) {
        lineasPrecio.push(`Lista: $${formatearMoneda(item.precioOriginal)}`);
      }

      if (hayPromocion) {
        lineasPrecio.push(
          `Promo -${item.descuentoPromocion}%: -$${formatearMoneda(item.montoPromocion)}`
        );
      }

      if (hayManual) {
        lineasPrecio.push(
          `Desc. -${etiquetaDescuentoManual(item)}: -$${formatearMoneda(item.descuentoMonto)}`
        );
      }

      lineasPrecio.push(`Final: $${formatearMoneda(item.precio)}`);

      filas.push([
        grupo.nombre,
        item.peso || `Cant. ${item.cantidad}`,
        String(item.cantidad),
        (hayPromocion || hayManual)
          ? lineasPrecio.join('\n')
          : `$${formatearMoneda(item.precio)}`,
        `$${formatearMoneda(item.subtotal)}`
      ]);
    });

    // Igual que en pantalla: si el producto es a granel y hay más de
    // una línea (o una sola con cantidad > 1), sumamos el total en
    // gramos/kilos como fila de referencia.
    if (
      grupo.esGranel &&
      (
        grupo.items.length > 1 ||
        Number(grupo.items[0].cantidad) > 1
      )
    ) {
      filas.push([
        {
          content: `Total ${grupo.nombre}: ${formatearGramos(grupo.totalGramos)}`,
          colSpan: 5,
          styles: { fontStyle: 'bold', halign: 'left' }
        }
      ]);
    }
  });

  autoTable(doc, {
    startY: siguienteY + 4,
    head: [['Producto', 'Peso/Cant.', 'Cant.', 'Precio', 'Total']],
    body: filas,
    styles: { fontSize: 9, cellPadding: 3, valign: 'middle', textColor: 0 },
    headStyles: { fillColor: [40, 40, 40], textColor: 255 },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    }
  });

  let y = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(10);

  doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 140, y, { align: 'left' });
  y += 6;

  if (totalPromociones > 0) {
    doc.setFont(undefined, 'bold');
    doc.text(`Promociones: -$${totalPromociones.toFixed(2)}`, 140, y);
    doc.setFont(undefined, 'normal');
    y += 6;
  }

  const totalManual = totalDescuentos - totalPromociones;

  if (totalManual > 0) {
    doc.setFont(undefined, 'bold');
    doc.text(`Descuento manual: -$${totalManual.toFixed(2)}`, 140, y);
    doc.setFont(undefined, 'normal');
    y += 6;
  }

  doc.text(`Envío: $${envio.toFixed(2)}`, 140, y);
  y += 8;

  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.text(`TOTAL: $${total.toFixed(2)}`, 140, y);
  doc.setFont(undefined, 'normal');

  const nombreArchivo =
    `Pedido${pedido.nropedido}-${sanitizarNombreArchivo(pedido.cliente)}.pdf`;

  doc.save(nombreArchivo);
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

  // Suma de todos los descuentos aplicados (promoción + manual, por
  // unidad x cantidad de cada línea), para mostrar cómo se llegó al total.
  const totalDescuentos =
    (pedido.items || []).reduce(
      (acc, item) =>
        acc +
        (
          Number(item.montoPromocion || 0) +
          Number(item.descuentoMonto || 0)
        ) *
          Number(item.cantidad || 0),
      0
    );

  // Cuánto de ese total corresponde solo a promociones del catálogo
  // (para poder distinguirlo del descuento manual en el resumen).
  const totalPromociones =
    (pedido.items || []).reduce(
      (acc, item) =>
        acc +
        Number(item.montoPromocion || 0) *
          Number(item.cantidad || 0),
      0
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
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.titulo}>
              Pedido #
              {pedido.nropedido}
            </h2>

            <small>
              {fecha}
            </small>

          </div>

          <div className={styles.headerActions}>
            <Button
              variant="icon"
              onClick={() =>
                generarPdfPedido({
                  pedido,
                  fecha,
                  pedidoAgrupado,
                  subtotal,
                  envio,
                  total,
                  totalPromociones,
                  totalDescuentos
                })
              }
              aria-label="Descargar PDF"
              title="Descargar PDF"
            >
              <Download size={16} />
            </Button>

            <Button
              variant="icon"
              onClick={onClose}
              aria-label="Cerrar"
              title="Cerrar"
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        <section className={styles.section}>
          <div className={styles.clienteHeader}>
            <strong className={styles.clienteNombre}>
              {pedido.cliente}
            </strong>

            <EstadoBadge estado={pedido.estado} />
          </div>
          <div className={styles.datosCliente}>
            <div className={styles.filaDato}>
              <span className={styles.icono}><Phone size={14} /></span>
              <span>{pedido.telefono}</span>
            </div>

            <div className={styles.filaDato}>
              <span className={styles.icono}><Truck size={14} /></span>
              <span>{pedido.tipoEntrega}</span>
            </div>

            {pedido.direccion && (
              <div className={styles.filaDato}>
                <span className={styles.icono}><MapPin size={14} /></span>
                <span>{pedido.direccion}</span>
              </div>
            )}

          </div>
        </section>
        <section className={styles.section}>

          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
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
                    <tr className={styles.filaGrupo}>
                      <td colSpan={4} className={styles.grupoNombre}>
                        {grupo.nombre}
                      </td>
                    </tr>
                    {grupo.items.map(
                      (item, index) => (
                        <tr key={index}>
                          <td className={styles.itemInfo}>
                            {item.peso || `Cant. ${item.cantidad}`}
                          </td>
                          <td>
                            {item.cantidad}
                          </td>
                          <td>
                            <CeldaPrecio item={item} />
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
                          <td colSpan={4} className={styles.grupoTotalGramos}>
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
        <section className={styles.totales}>
          <div>
            <span>Subtotal</span>
            {': '}
            <strong>
              ${subtotal.toFixed(2)}
            </strong>
          </div>
          {totalPromociones > 0 && (
            <div>
              <span>Promociones</span>
              {': '}
              <strong className={styles.montoPromocion}>
                -${totalPromociones.toFixed(2)}
              </strong>
            </div>
          )}
          {(totalDescuentos - totalPromociones) > 0 && (
            <div>
              <span>Descuento manual</span>
              {': '}
              <strong className={styles.montoDescuento}>
                -${(totalDescuentos - totalPromociones).toFixed(2)}
              </strong>
            </div>
          )}
          <div>
            <span>Envío</span>
            {': '}
            <strong>
              ${envio.toFixed(2)}
            </strong>
          </div>
          <div className={styles.totalFinal}>
            <span>TOTAL</span>
            <strong>
              ${total.toFixed(2)}
            </strong>
          </div>
        </section>
      </div>
    </div>
  );
}