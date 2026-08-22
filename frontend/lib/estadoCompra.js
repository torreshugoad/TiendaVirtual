// Ubicación sugerida: frontend/lib/estadoCompra.js
//
// Fuente única del texto y la clase de badge para el estado de una compra.
// La badgeClass hace referencia a .badgeBorrador / .badgeConfirmada /
// .badgeAnulada, definidas en frontend/styles/buttons.module.css.
// Usado por ComprasForm.jsx y por la página de historial de compras.

export const ESTADO_COMPRA = {
  borrador: { texto: '📝 Borrador', badgeClass: 'badgeBorrador' },
  confirmada: { texto: '✔ Confirmada', badgeClass: 'badgeConfirmada' },
  anulada: { texto: '✘ Anulada', badgeClass: 'badgeAnulada' }
};
