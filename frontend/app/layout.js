import { CartProvider } from '../context/CartContext';

export const metadata = {
  title: 'Tienda Superbien',
  description: 'Tienda online saludable'
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>

        <CartProvider>
          {children}
        </CartProvider>

      </body>
    </html>
  );
}