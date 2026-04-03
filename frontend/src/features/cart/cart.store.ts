// path: frontend/src/features/cart/cart.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Định nghĩa kiểu dữ liệu cho Căn hộ (Property)
export type CartItem = {
  id: string;
  code: string;
  title: string;
  price: string | number | null;
  projectSlug: string;
  thumbnailUrl: string | null;
};

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const exists = state.items.find((i) => i.id === item.id);
          if (exists) return state;
          return { items: [...state.items, item] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "property-cart-storage" } // Lưu vĩnh viễn căn hộ trong máy khách
  )
);