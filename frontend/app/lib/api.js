const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function obtenerConfiguracion() {
  const res = await fetch(`${API_URL}/api/configuracion`, {
    cache: 'no-store',
  });
  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

export async function obtenerCategorias() {
  const res = await fetch(`${API_URL}/api/categorias`, {
    cache: 'no-store',
  });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function obtenerProductosPorCategoria(categoriaId) {
  const res = await fetch(
    `${API_URL}/api/productos/categoria/${categoriaId}`,
    { cache: 'no-store' }
  );
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
