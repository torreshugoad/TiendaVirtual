import styles from '@/app/admin/reportes/reportes.module.css';

export default function ReporteCard({ titulo, valor }) {
  return (
    <div className={styles.card}>
      <h3>{titulo}</h3>
      <h1>{valor}</h1>
    </div>
  );
}