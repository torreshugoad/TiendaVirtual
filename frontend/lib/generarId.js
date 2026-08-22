/* ==========================
   crypto.randomUUID() solo existe en contextos seguros
   (HTTPS, o localhost bien resuelto). Al probar en la red
   local por IP o en HTTP plano, el navegador no lo expone.
   Este fallback no necesita ser criptográficamente perfecto,
   solo único para identificar el pedido.
========================== */

export function generarId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return (
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2)
  );
}
