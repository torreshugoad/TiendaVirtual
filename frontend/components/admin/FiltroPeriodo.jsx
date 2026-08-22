'use client';

import { FileSpreadsheet } from 'lucide-react';

import styles from './FiltroPeriodo.module.css';

export default function FiltroPeriodo({
  tipo,
  setTipo,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  onExportar
}) {
  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className={styles.select}
        >
          <option value="semana">Última semana</option>
          <option value="mes">Último mes</option>
          <option value="personalizado">Personalizado</option>
        </select>
      </div>

      <div className={styles.right}>
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className={styles.input}
        />

        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className={styles.input}
        />

        {onExportar && (
          <button
            type="button"
            onClick={onExportar}
            className={styles.btnExport}
          >
            <FileSpreadsheet size={15} />
            Exportar Excel
          </button>
        )}
      </div>
    </div>
  );
}
