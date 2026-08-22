import { useState } from 'react';
import { apiFetch } from '@/lib/api';

const FORMULARIO_VACIO = {
  nombre: '',
  imagen: '',
  descripcion: '',
  orden: 0,
  activa: true,
};

export default function useCategoriaForm() {
  const [editandoId, setEditandoId] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function subirImagen(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('imagen', file);

    try {
      setSubiendoImagen(true);

      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
        { method: 'POST', body: formData }
      );

      if (!res) return;

      const data = await res.json();
      setFormulario((prev) => ({ ...prev, imagen: data.imageUrl }));
    } catch (error) {
      console.error('Error subiendo imagen:', error);
    } finally {
      setSubiendoImagen(false);
    }
  }

  function iniciarEdicion(categoria) {
    setEditandoId(categoria._id);
    setFormulario({
      nombre: categoria.nombre,
      imagen: categoria.imagen,
      descripcion: categoria.descripcion,
      orden: categoria.orden,
      activa: categoria.activa,
    });
    setMostrarFormulario(true);
  }

  function abrirNuevo() {
    setEditandoId(null);
    setFormulario(FORMULARIO_VACIO);
    setMostrarFormulario(true);
  }

  function resetFormulario() {
    setEditandoId(null);
    setFormulario(FORMULARIO_VACIO);
    setMostrarFormulario(false);
  }

  return {
    formulario,
    editandoId,
    subiendoImagen,
    mostrarFormulario,
    handleChange,
    subirImagen,
    iniciarEdicion,
    abrirNuevo,
    resetFormulario,
  };
}
