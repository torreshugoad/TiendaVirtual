'use client';

import { LayoutDashboard } from 'lucide-react';

import styles from './DashboardCard.module.css';

export default function DashboardCard({
  titulo,
  valor,
  icono: Icono = LayoutDashboard,
  color = '#2563eb',
  subtitulo = ''
}) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div
          className={styles.icono}
          style={{ background: color }}
        >
          <Icono size={24} />
        </div>

        <div>
          <h3 className={styles.titulo}>{titulo}</h3>

          {subtitulo && <small className={styles.subtitulo}>{subtitulo}</small>}
        </div>
      </div>

      <div className={styles.valor}>{valor}</div>
    </div>
  );
}
