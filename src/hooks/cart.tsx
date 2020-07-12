import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cartItems = await AsyncStorage.getItem("@GoMarket:cart");

      if (cartItems) {
        setProducts([...JSON.parse(cartItems)]);
      }
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const index = products.findIndex((x) => x.id == product.id);
    if (index === -1) {
      setProducts([...products, { ...product, quantity: 1 }]);
    } else {
      products[index].quantity++;
      setProducts([...products]);
    }
    await AsyncStorage.setItem("@GoMarket:cart", JSON.stringify(products));
  }, [products]);

  const increment = useCallback(async id => {
    const index = products.findIndex(x => x.id == id);
    if (index === -1) return;
    products[index].quantity++;
    setProducts([...products]);
    await AsyncStorage.setItem("@GoMarket:cart", JSON.stringify(products));
  }, [products]);

  const decrement = useCallback(async id => {
    const index = products.findIndex(x => x.id == id);
    if (index === -1) return;
    if (products[index].quantity > 0) {
      products[index].quantity--;
      setProducts([...products]);
    }

    await AsyncStorage.setItem("@GoMarket:cart", JSON.stringify(products));
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
