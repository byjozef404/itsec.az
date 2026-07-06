import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchCart, upsertCartItem, removeCartItem, clearCart, resolvePrice } from '@/services/api';
import { useAuth } from './AuthContext';
import type { CartItem } from '@/types/types';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  totalItems: number;
  subtotal: number;
  addToCart: (productId: string, qty?: number) => Promise<void>;
  updateQty: (itemId: string, productId: string, qty: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearAllCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  items: [],
  loading: false,
  totalItems: 0,
  subtotal: 0,
  addToCart: async () => {},
  updateQty: async () => {},
  removeItem: async () => {},
  clearAllCart: async () => {},
  refresh: async () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    try {
      const data = await fetchCart();
      setItems(data);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addToCart = async (productId: string, qty = 1) => {
    if (!user) { toast.error('Please sign in to add to cart'); return; }
    const existing = items.find(i => i.product_id === productId);
    await upsertCartItem(productId, (existing?.quantity ?? 0) + qty);
    await refresh();
    toast.success('Added to cart');
  };

  const updateQty = async (itemId: string, productId: string, qty: number) => {
    if (qty < 1) { await removeItem(itemId); return; }
    await upsertCartItem(productId, qty);
    await refresh();
  };

  const removeItem = async (itemId: string) => {
    await removeCartItem(itemId);
    await refresh();
  };

  const clearAllCart = async () => {
    await clearCart();
    setItems([]);
  };

  const role = profile?.role ?? 'customer';
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => {
    const price = resolvePrice(i.products ?? { price: 0 }, role);
    return s + price * i.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ items, loading, totalItems, subtotal, addToCart, updateQty, removeItem, clearAllCart, refresh }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
