'use client';

export default function Button({

  children,

  onClick,

  type = 'button',

  variant = 'primary',

  disabled = false,

  style = {}

}) {

  const variants = {

    primary: {
      background: '#2563eb',
      color: '#fff'
    },

    success: {
      background: '#16a34a',
      color: '#fff'
    },

    danger: {
      background: '#dc2626',
      color: '#fff'
    },

    secondary: {
      background: '#f3f4f6',
      color: '#111'
    }

  };

  return (

    <button

      type={type}

      disabled={disabled}

      onClick={onClick}

      style={{

        ...styles.button,

        ...variants[variant],

        ...style

      }}

    >

      {children}

    </button>

  );

}

const styles = {

  button: {

    padding: '10px 18px',

    border: 'none',

    borderRadius: 10,

    cursor: 'pointer',

    fontWeight: 600,

    transition: '.2s'

  }

};