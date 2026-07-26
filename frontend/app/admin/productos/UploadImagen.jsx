'use client';

import Image from 'next/image';
import useUpload from '@/hooks/useUpload';

export default function UploadImagen({

  imagen,

  onChange

}) {

  const {

    subirImagen,

    subiendo

  } = useUpload();

  async function handleFile(event) {

    const file = event.target.files?.[0];

    if (!file) return;

    const url = await subirImagen(file);

    if (url) {

      onChange(url);

    }

  }

  return (

    <div style={styles.container}>

      <input

        type="file"

        accept="image/*"

        onChange={handleFile}

        style={styles.input}

      />

      {

        subiendo && (

          <span style={styles.texto}>

            Subiendo imagen...

          </span>

        )

      }

      {

        imagen && (

          <Image

            src={imagen}

            alt="Vista previa"

            width={44}

            height={44}

            style={styles.preview}

          />

        )

      }

    </div>

  );

}

const styles = {

  container: {

    display: 'flex',

    alignItems: 'center',

    gap: 10,

    marginTop: 4,

    marginBottom: 6,

    flexWrap: 'wrap'

  },

  input: {

    flex: 1,

    padding: 6,

    fontSize: 13

  },

  preview: {

    borderRadius: 8,

    objectFit: 'cover',

    border: '1px solid #ddd'

  },

  texto: {

    color: '#6b7280',

    fontSize: 12

  }

};