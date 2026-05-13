'use client';

import {

  createContext,

  useContext,

  useEffect,

  useState

} from 'react';

const CartContext =
  createContext();

export function CartProvider({
  children
}) {

  const [cart, setCart] =
    useState([]);

  useEffect(() => {

    const savedCart =
      localStorage.getItem(
        'cart'
      );

    if (savedCart) {

      setCart(
        JSON.parse(savedCart)
      );

    }

  }, []);

  useEffect(() => {

    localStorage.setItem(
      'cart',

      JSON.stringify(cart)

    );

  }, [cart]);

  function addToCart(producto) {

    setCart(prev => {

      const index =
        prev.findIndex(

          item =>

            item.productoId ===
              producto.productoId &&

            item.peso ===
              producto.peso

        );

      if (index >= 0) {

        const updated =
          [...prev];

        updated[index].cantidad += 1;

        updated[index].subtotal =

          updated[index].cantidad *

          updated[index].precio;

        return updated;
      }

      return [

        ...prev,

        {

          ...producto,

          cantidad: 1,

          subtotal:
            producto.precio

        }

      ];

    });
  }

  function removeFromCart(
    index
  ) {

    const updated =
      [...cart];

    updated.splice(index, 1);

    setCart(updated);
  }

  function increaseQuantity(
    index
  ) {

    const updated =
      [...cart];

    updated[index].cantidad += 1;

    updated[index].subtotal =

      updated[index].cantidad *

      updated[index].precio;

    setCart(updated);
  }

  function decreaseQuantity(
    index
  ) {

    const updated =
      [...cart];

    if (
      updated[index].cantidad > 1
    ) {

      updated[index].cantidad -= 1;

      updated[index].subtotal =

        updated[index].cantidad *

        updated[index].precio;

      setCart(updated);

    } else {

      removeFromCart(index);

    }
  }

  function clearCart() {

    setCart([]);
  }

  const total =

    cart.reduce(

      (acc, item) =>

        acc + item.subtotal,

      0

    );

  return (

    <CartContext.Provider
      value={{

        cart,

        addToCart,

        removeFromCart,

        increaseQuantity,

        decreaseQuantity,

        clearCart,

        total

      }}
    >

      {children}

    </CartContext.Provider>

  );
}

export function useCart() {

  return useContext(
    CartContext
  );
}