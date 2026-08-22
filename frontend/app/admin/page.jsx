'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAdminAuth from '@/hooks/useAdminAuth';
import styles from './page.module.css';

export default function AdminPage() {
  const router = useRouter();
  const loading = useAdminAuth();

  function logout() {
    localStorage.removeItem('adminLogueado');
    localStorage.removeItem('token');
    router.replace('/admin/login');
  }

  const sections = [
    {
      titulo: 'Pedidos',
      descripcion: 'Ver y actualizar los pedidos de la tienda',
      color: '#ea580c',
      sublinks: [
        {
          titulo: 'Ver Pedidos',
          href: '/admin/pedidos',
          color: '#f3cab1'
        },
        {
          titulo: 'Carrito Manual',
          href: '/Cartmanual%01',
          color: '#fd9366'
        }
      ]
    },
    {
      titulo: 'Precios / Stock',
      descripcion: 'Gestión rápida de planilla de productos y stock',
      href: '/admin/stock',
      color: '#16a34a',
      sublinks: []
    },
    {
      titulo: 'Compras',
      descripcion: 'Historial y control de compras',
      href: '/admin/compras/historial',
      color: '#9333ea',
      sublinks: []
    },
    {
      titulo: 'Reportes',
      descripcion: 'Dashboard y estadísticas generales de ventas',
      color: '#006b27',
      sublinks: [
        { 
          titulo: 'Dashboard', 
          href: '/admin/dashboard', 
          color: '#c6dfc4' 
        },
        { 
          titulo: 'Reportes', 
          href: '/admin/reportes', 
          color: '#aabea7' 
        }
      ]
    },
    {
      titulo: 'Administración Tienda',
      descripcion: 'Gestión de catálogo, productos y categorías',
      color: '#100d67',
      sublinks: [
        { 
          titulo: 'Productos', 
          href: '/admin/productos', 
          color: '#bab5da' 
        },
        { 
          titulo: 'Categorías', 
          href: '/admin/categorias', 
          color: '#a5b0c2' 
        }
      ]
    },
    {
      titulo: 'Configuración',
      descripcion: 'Ajustes de la aplicación y seguridad',
      color: '#7a0e0e',
      sublinks: [
        { titulo: 'Configuración', href: '/admin/configuracion', color: '#c6bdbf' },
        { titulo: 'Cambiar Password', href: '/admin/cambiar-password', color: '#a8a1a1' }
      ]
    }
  ];

  if (loading) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Panel Administrador</h1>
            <p className={styles.subtitle}>Gestión tienda online</p>
          </div>

          {/* LOGOUT */}
          <button onClick={logout} className={styles.btnDanger}>
            Logout
          </button>
        </div>

        {/* GRID DE SECCIONES */}
        <div className={styles.grid}>
          {sections.map((section) => (
            <div
              key={section.titulo}
              className={styles.card}
              style={{ borderTopColor: section.color }}
            >
              <div>
                <h2 className={styles.cardTitle}>{section.titulo}</h2>
                <p className={styles.cardDescription}>{section.descripcion}</p>
              </div>

              {/* RENDERIZADO CONDICIONAL */}
              {section.sublinks.length > 0 ? (
                <div className={styles.sublinksContainer}>
                  {section.sublinks.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={styles.sublinkButton}
                      style={{ backgroundColor: sub.color || section.color }}
                    >
                      {sub.titulo}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className={styles.singleButtonWrapper}>
                  <Link
                    href={section.href}
                    className={styles.singleButton}
                    style={{ backgroundColor: section.color }}
                  >
                    Ingresar
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}