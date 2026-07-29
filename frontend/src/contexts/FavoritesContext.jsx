import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getFavorites, addFavorite, removeFavorite } from '../api/favorites';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const fetchFavorites = useCallback(async () => {
    if (!user) { setFavoriteIds(new Set()); return; }
    try {
      const res = await getFavorites();
      const items = Array.isArray(res.data) ? res.data : [];
      setFavoriteIds(new Set(items.map(f => f.product_id)));
    } catch { setFavoriteIds(new Set()); }
  }, [user]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const toggleFavorite = async (productId) => {
    if (!user) return;
    try {
      if (favoriteIds.has(productId)) {
        await removeFavorite(productId);
        setFavoriteIds(prev => { const next = new Set(prev); next.delete(productId); return next; });
      } else {
        await addFavorite({ product_id: productId });
        setFavoriteIds(prev => { const next = new Set(prev); next.add(productId); return next; });
      }
    } catch {}
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, toggleFavorite, fetchFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};
