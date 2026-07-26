'use client';

export default function DashboardSection({
  titulo,
  children
}) {

  return (

    <div style={styles.container}>

      <h2 style={styles.title}>
        {titulo}
      </h2>

      {children}

    </div>

  );

}

const styles = {

  container: {

    background: '#fff',

    borderRadius: 12,

    padding: 24,

    boxShadow:
      '0 2px 8px rgba(0,0,0,.08)'

  },

  title: {

    marginTop: 0,

    marginBottom: 20,

    fontSize: 20,

    fontWeight: 600

  }

};