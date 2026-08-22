'use client';

export async function apiFetch(url, options = {}) {

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  const headers = {
    ...(options.headers || {})
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const respuesta = await fetch(url, {
    ...options,
    headers
  });

  if (respuesta.status === 401) {

    if (typeof window !== 'undefined') {

      localStorage.removeItem('token');
      localStorage.removeItem('adminLogueado');

      window.location.href = '/admin/login';

    }

    return null;

  }

  if (!respuesta.ok) {

    // Los distintos endpoints del backend no usan siempre el mismo
    // nombre de campo para el mensaje de error (admin usa "error",
    // checkout usa "mensaje"), así que probamos los dos antes de
    // caer al genérico.
    const data = await respuesta.json().catch(() => null);
    const mensaje = data?.error || data?.mensaje || `Error HTTP ${respuesta.status}`;

    // Un 4xx es una validación esperada de la app (falta un dato, etc.) y ya
    // se muestra prolijamente en pantalla; no hace falta que además ensucie
    // la consola como si fuera un bug. Un 5xx sí es una falla real del
    // servidor y conviene loguearla.
    if (respuesta.status >= 500) {
      console.error('API:', url, respuesta.status, mensaje);
    }

    throw new Error(mensaje);

  }

  return respuesta;

}
