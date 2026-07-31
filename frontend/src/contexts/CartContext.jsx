import { createContext, useContext, useState, useEffect } from 'react';
import { getCart } from '../api/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getCart();
      const items = Array.isArray(res.data) ? res.data : res.data.items || res.data.cartItems || [];
      const normalized = items.map((item) => ({
        id: item.cart_item_id || item.id,
        quantity: item.quantity,
        product: {
          id: item.product_id,
          name_ar: item.name,
          price: item.price,
          discount_price: item.discount_price,
          offer_end_at: item.offer_end_at,
          offer_until_stock_out: item.offer_until_stock_out,
          offer_max_quantity: item.offer_max_quantity,
          product_image: item.product_image,
          unit_ar: item.unit,
          effective_price: item.effective_price || item.price,
        },
      }));
      setCartItems(normalized);
    } catch {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 1) * parseFloat(item.price || item.Product?.price || 0),
    0
  );

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, fetchCart, cartCount, cartTotal, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
