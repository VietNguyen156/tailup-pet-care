"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
type CartItem = { productId: string; quantity: number };
type CartContext = {
  items: CartItem[];
  ready: boolean;
  count: number;
  add: (id: string) => void;
  update: (id: string, n: number) => void;
  clear: () => void;
};
const Context = createContext<CartContext | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("pawly-cart") ?? "[]");
      if (Array.isArray(saved))
        setItems(
          saved
            .filter(
              (x: CartItem) =>
                typeof x.productId === "string" &&
                Number.isInteger(x.quantity) &&
                x.quantity > 0 &&
                x.quantity <= 20,
            )
            .slice(0, 50),
        );
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem("pawly-cart", JSON.stringify(items));
  }, [items, ready]);
  function update(id: string, n: number) {
    setItems((prev) =>
      n <= 0
        ? prev.filter((i) => i.productId !== id)
        : prev.map((i) =>
            i.productId === id ? { ...i, quantity: Math.min(20, n) } : i,
          ),
    );
  }
  function add(id: string) {
    setItems((prev) => {
      const old = prev.find((i) => i.productId === id);
      return old
        ? prev.map((i) =>
            i.productId === id
              ? { ...i, quantity: Math.min(20, i.quantity + 1) }
              : i,
          )
        : [...prev, { productId: id, quantity: 1 }];
    });
  }
  return (
    <Context.Provider
      value={{
        items,
        ready,
        count: items.reduce((s, i) => s + i.quantity, 0),
        add,
        update,
        clear: () => setItems([]),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useCart() {
  const value = useContext(Context);
  if (!value) throw new Error("Missing CartProvider");
  return value;
}
