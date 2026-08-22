'use client';

import styles from '@/styles/buttons.module.css';

/*
  Ubicación: frontend/components/admin/common/Button.jsx
  Antes tenía su propia paleta de colores inline, distinta de
  styles/buttons.module.css (ej. primary azul acá vs verde oscuro allá).
  Ahora cada variant mapea a la clase correspondiente del módulo
  compartido, así hay un solo lugar donde vive el color de cada botón
  en toda la app.
*/

const VARIANT_CLASS = {
  primary: styles.btnPrimary,
  success: styles.btnExport,
  danger: styles.btnDanger,
  secondary: styles.btnSecondary,
  ghost: styles.btnGhost,
  icon: styles.iconButton
};

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  style = {}
}) {
  const variantClass = VARIANT_CLASS[variant] || styles.btnPrimary;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={variantClass}
      style={style}
    >
      {children}
    </button>
  );
}
