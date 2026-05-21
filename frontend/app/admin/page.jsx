'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminPage() {

  const router = useRouter();

  function logout() {

    localStorage.removeItem(
      'adminLogueado'
    );

    router.push('/admin/login');
  }

  const cards = [

    {
      titulo: 'Dashboard',
      descripcion: 'Resumen general de la tienda',
      href: '/admin/dashboard',
      color: '#2563eb'
    },

    {
      titulo: 'Precios / Stock',
      descripcion: 'Planilla productos y stock',
      href: '/admin/stock',
      color: '#2563eb'
    },

    {
      titulo: 'Productos',
      descripcion: 'Administrar productos y stock',
      href: '/admin/productos',
      color: '#16a34a'
    },

    {
      titulo: 'Categorías',
      descripcion: 'Gestionar categorías',
      href: '/admin/categorias',
      color: '#9333ea'
    },

    {
      titulo: 'Pedidos',
      descripcion: 'Ver y actualizar pedidos',
      href: '/admin/pedidos',
      color: '#ea580c'
    },

    {
      titulo: 'Reportes',
      descripcion: 'Ventas y estadísticas',
      href: '/admin/reportes',
      color: '#dc2626'
    },

  ];

  return (

    <div
      style={{
        minHeight: '100vh',
        background: '#f3f4f6',
        padding: '40px'
      }}
    >

      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}
      >

        {/* HEADER */}

        <div
          style={{
            marginBottom: '40px',
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}
        >

          <div>

            <h1
              style={{
                fontSize: '42px',
                marginBottom: '10px',
                color: '#111827'
              }}
            >

              Panel Administrador

            </h1>

            <p
              style={{
                color: '#6b7280',
                fontSize: '18px'
              }}
            >

              Gestión completa de la tienda online

            </p>

          </div>

          {/* LOGOUT */}

          <button

            onClick={logout}

            style={{
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              padding: '14px 20px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >

            Logout

          </button>

        </div>

        {/* GRID */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '25px'
          }}
        >

          {

            cards.map(card => (

              <Link
                key={card.href}
                href={card.href}
                style={{
                  textDecoration: 'none'
                }}
              >

                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '22px',
                    padding: '30px',
                    minHeight: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow:
                      '0 4px 14px rgba(0,0,0,0.08)',
                    borderTop:
                      `6px solid ${card.color}`,
                    transition: '0.2s'
                  }}
                >

                  <div>

                    <h2
                      style={{
                        fontSize: '28px',
                        color: '#111827',
                        marginTop: 0,
                        marginBottom: '14px'
                      }}
                    >

                      {card.titulo}

                    </h2>

                    <p
                      style={{
                        color: '#6b7280',
                        fontSize: '16px',
                        lineHeight: '1.6'
                      }}
                    >

                      {card.descripcion}

                    </p>

                  </div>

                  <div
                    style={{
                      marginTop: '25px',
                      display: 'flex',
                      justifyContent: 'flex-end'
                    }}
                  >

                    <span
                      style={{
                        background: card.color,
                        color: '#ffffff',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
                    >

                      Ingresar

                    </span>

                  </div>

                </div>

              </Link>
            ))
          }

        </div>

      </div>

    </div>
  );
}