'use client';

export default function PageHeader({

  titulo,

  subtitulo,

  acciones

}) {

  return (

    <div style={styles.container}>

      <div>

        <h1 style={styles.title}>

          {titulo}

        </h1>

        {subtitulo && (

          <p style={styles.subtitle}>

            {subtitulo}

          </p>

        )}

      </div>

      <div>

        {acciones}

      </div>

    </div>

  );

}

const styles = {

  container: {

    display: 'flex',

    justifyContent:
      'space-between',

    alignItems: 'center',

    marginBottom: 25,

    flexWrap: 'wrap',

    gap: 15

  },

  title: {

    margin: 0

  },

  subtitle: {

    color: '#777',

    marginTop: 5

  }

};