import styles from '@/app/admin/reportes/reportes.module.css';

export default function ProductosVendidosTable({ productos }) {
  return (
    <div className={styles.tableContainer}>
      <h2>Productos vendidos</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Producto</th>
            <th className={styles.th}>Cantidad</th>
            <th className={styles.th} style={{ textAlign: 'right' }}>Importe</th>
          </tr>
        </thead>
        <tbody>
          {productos?.map((producto, index) => (
            <tr key={index}>
              <td className={styles.td}>{producto.producto}</td>
              <td className={styles.td}>{producto.cantidad}</td>
              <td className={styles.td} style={{ textAlign: 'right' }}>
                ${producto.importe?.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}