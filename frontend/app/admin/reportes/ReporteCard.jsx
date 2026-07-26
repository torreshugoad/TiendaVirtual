'use client';

export default function ReporteCard({

  titulo,

  valor,

  icono = '📊',

  color = '#2563eb',

  loading = false,

  subtitulo = ''

}) {

  return (

    <div style={styles.card}>

      <div style={styles.header}>

        <div
          style={{
            ...styles.icono,
            backgroundColor: color
          }}
        >
          {icono}
        </div>

        <div>

          <div style={styles.titulo}>
            {titulo}
          </div>

          {subtitulo && (

            <div style={styles.subtitulo}>
              {subtitulo}
            </div>

          )}

        </div>

      </div>

      <div style={styles.valor}>

        {loading ? '...' : valor}

      </div>

    </div>

  );

}

const styles = {

  card: {

    background: '#fff',

    borderRadius: 14,

    padding: 22,

    boxShadow:
      '0 2px 10px rgba(0,0,0,.08)',

    display: 'flex',

    flexDirection: 'column',

    justifyContent: 'space-between',

    transition: '.2s',

    minHeight: 140

  },

  header: {

    display: 'flex',

    alignItems: 'center',

    gap: 15

  },

  icono: {

    width: 52,

    height: 52,

    borderRadius: 14,

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'center',

    color: '#fff',

    fontSize: 26,

    flexShrink: 0

  },

  titulo: {

    fontSize: 15,

    fontWeight: 600,

    color: '#666'

  },

  subtitulo: {

    marginTop: 4,

    color: '#999',

    fontSize: 12

  },

  valor: {

    marginTop: 20,

    fontSize: 32,

    fontWeight: 'bold',

    color: '#222'

  }

};