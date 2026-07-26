'use client';

export default function DashboardCard({

  titulo,

  valor,

  icono = '📊',

  color = '#2563eb',

  subtitulo = ''

}) {

  return (

    <div style={styles.card}>

      <div style={styles.header}>

        <div
          style={{
            ...styles.icono,
            background: color
          }}
        >

          {icono}

        </div>

        <div>

          <h3 style={styles.titulo}>

            {titulo}

          </h3>

          {subtitulo && (

            <small style={styles.subtitulo}>

              {subtitulo}

            </small>

          )}

        </div>

      </div>

      <div style={styles.valor}>

        {valor}

      </div>

    </div>

  );

}

const styles = {

  card: {

    background: '#ffffff',

    borderRadius: 16,

    padding: 20,

    boxShadow:
      '0 4px 12px rgba(0,0,0,.08)',

    transition: 'all .2s ease',

    minHeight: 130,

    display: 'flex',

    flexDirection: 'column',

    justifyContent: 'space-between'

  },

  header: {

    display: 'flex',

    alignItems: 'center',

    gap: 15

  },

  icono: {

    width: 48,

    height: 48,

    borderRadius: 12,

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'center',

    color: '#fff',

    fontSize: 24

  },

  titulo: {

    margin: 0,

    fontSize: 15,

    fontWeight: 600,

    color: '#555'

  },

  subtitulo: {

    color: '#999'

  },

  valor: {

    marginTop: 20,

    fontSize: 34,

    fontWeight: 'bold',

    color: '#222'

  }

};