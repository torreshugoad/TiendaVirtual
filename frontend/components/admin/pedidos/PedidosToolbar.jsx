'use client';

import { RefreshCw, FileSpreadsheet } from 'lucide-react';

import EstadoSelect from '@/components/admin/common/EstadoSelect';
import Button from '@/components/admin/common/Button';
import styles from './PedidosToolbar.module.css';

export default function PedidosToolbar({
  textoBusqueda,
  setTextoBusqueda,

  estadoFiltro,
  setEstadoFiltro,

  tipo,
  setTipo,

  fechaInicio,
  setFechaInicio,

  fechaFin,
  setFechaFin,

  onActualizar,
  onExportar
}) {
  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <input
          placeholder="Buscar cliente, teléfono o pedido..."
          value={textoBusqueda}
          onChange={(e) => setTextoBusqueda(e.target.value)}
          className={styles.input}
        />

        <EstadoSelect
          value={estadoFiltro}
          onChange={setEstadoFiltro}
          incluirTodos
        />

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className={styles.select}
        >
          <option value="semana">Última semana</option>
          <option value="mes">Último mes</option>
          <option value="personalizado">Personalizado</option>
        </select>

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
      </div>

      <div className={styles.right}>
        <Button variant="secondary" onClick={onActualizar}>
          <span className={styles.contenidoBoton}>
            <RefreshCw size={16} />
            Actualizar
          </span>
        </Button>

        <Button variant="success" onClick={onExportar}>
          <span className={styles.contenidoBoton}>
            <FileSpreadsheet size={16} />
            Exportar Excel
          </span>
        </Button>
      </div>
    </div>
  );
}
