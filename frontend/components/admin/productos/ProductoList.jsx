'use client';

import { useState } from 'react';
import ProductoFila from './ProductoFila';
import ProductoPreview from './ProductoPreview';
import EmptyState from '@/components/admin/common/EmptyState';
import styles from './ProductoFila.module.css';

export default function ProductoList({
  productos = [],
  onEditar,
  onEliminar
}) {
  const [productoPreview, setProductoPreview] = useState(null);

  const productosOrdenados = [...productos].sort(
    (a, b) => (a.orden || 0) - (b.orden || 0)
  );

  if (productosOrdenados.length === 0) {
    return <EmptyState mensaje="No hay productos registrados." />;
  }

  return (
    <div>
      <div style={estilos.info}>
        {productosOrdenados.length} productos cargados
      </div>

      <div className={styles.tablaWrapper}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Tipo stock</th>
              <th>Stock</th>
              <th>Variantes</th>
              <th>Precio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {productosOrdenados.map((producto) => (
              <ProductoFila
                key={producto._id || producto.id}
                producto={producto}
                onEditar={onEditar}
                onEliminar={onEliminar}
                onPreview={setProductoPreview}
              />
            ))}
          </tbody>
        </table>
      </div>

      {productoPreview && (
        <ProductoPreview
          producto={productoPreview}
          onClose={() => setProductoPreview(null)}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      )}
    </div>
  );
}

const estilos = {
  info: {
    marginBottom: '12px',
    color: '#6b7280',
    fontSize: '0.875rem',
    fontWeight: 500
  }
};