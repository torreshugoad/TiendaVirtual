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

    console.error(
      'API:',
      url,
      respuesta.status
    );

    throw new Error(
      `Error HTTP ${respuesta.status}`
    );

  }

  return respuesta;

}