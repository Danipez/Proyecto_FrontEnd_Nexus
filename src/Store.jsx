import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  addItem,
  authenticate,
  prepareSale,
  reconcile,
  validSession,
} from "./domain";
import { loadState, read, saveState, STATE_KEY } from "./storage";
const Context = createContext(null);
export const useStore = () => useContext(Context);
export function StoreProvider({
  children,
  storage = localStorage,
  sessionStore = sessionStorage,
}) {
  const [state, setState] = useState(() => loadState(storage));
  const stateRef = useRef(state);
  const [session, setSession] = useState(() =>
    validSession(read(sessionStore, "nexus_session", null)),
  );
  const [message, setMessage] = useState("");
  const pending = useRef(false);
  const commit = (next) => {
    try {
      saveState(storage, next);
    } catch {
      throw Error(
        "No se pudo guardar. Revisa el espacio y permisos del navegador.",
      );
    }
    stateRef.current = next;
    setState(next);
  };
  useEffect(() => {
    const sync = (e) => {
      if (e.key === STATE_KEY) {
        const next = loadState(storage);
        stateRef.current = next;
        setState(next);
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [storage]);
  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(
      () => {
        sessionStore.removeItem("nexus_session");
        setSession(null);
      },
      Math.max(0, session.expires - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [session, sessionStore]);
  const add = (id) => {
    const s = stateRef.current;
    commit({ ...s, cart: addItem(s.products, s.cart, id) });
    setMessage("Producto agregado al carrito.");
  };
  const change = (id, qty) => {
    const s = stateRef.current;
    const p = s.products.find((p) => p.id === id);
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > p.stock)
      throw Error("Cantidad fuera del stock disponible.");
    commit({
      ...s,
      cart: s.cart.map((i) => (i.id === id ? { ...i, qty } : i)),
    });
  };
  const remove = (id) => {
    const s = stateRef.current;
    commit({ ...s, cart: s.cart.filter((i) => i.id !== id) });
  };
  const login = (user, password) => {
    const attempts = read(storage, "nexus_attempts", { count: 0, until: 0 });
    if (attempts.until > Date.now())
      throw Error("Demasiados intentos. Espera un minuto.");
    let s;
    try {
      s = authenticate(user, password);
    } catch (error) {
      const count = (attempts.until ? 0 : attempts.count || 0) + 1;
      storage.setItem(
        "nexus_attempts",
        JSON.stringify(
          count >= 5
            ? { count: 0, until: Date.now() + 60000 }
            : { count, until: 0 },
        ),
      );
      throw error;
    }
    sessionStore.setItem("nexus_session", JSON.stringify(s));
    storage.removeItem("nexus_attempts");
    setSession(s);
    return s;
  };
  const logout = () => {
    sessionStore.removeItem("nexus_session");
    setSession(null);
  };
  const ensureAdmin = () => {
    if (
      validSession(read(sessionStore, "nexus_session", null))?.role !== "admin"
    )
      throw Error("Inicia sesión como administrador.");
  };
  const saveProduct = (p) => {
    ensureAdmin();
    const s = stateRef.current;
    const products = p.id
      ? s.products.map((x) => (x.id === p.id ? p : x))
      : [
          ...s.products,
          { ...p, id: Math.max(0, ...s.products.map((x) => x.id)) + 1 },
        ];
    commit({ ...s, products, cart: reconcile(products, s.cart) });
    setMessage("Producto guardado.");
  };
  const deleteProduct = (id) => {
    ensureAdmin();
    const s = stateRef.current;
    const products = s.products.filter((p) => p.id !== id);
    commit({ ...s, products, cart: reconcile(products, s.cart) });
  };
  const checkout = async () => {
    if (pending.current) return;
    pending.current = true;
    const expected = JSON.stringify(stateRef.current.cart);
    try {
      const finish = () => {
        const fresh = loadState(storage);
        if (JSON.stringify(fresh.cart) !== expected)
          throw Error(
            "El carrito cambió. Recarga y revisa antes de confirmar.",
          );
        const sale = prepareSale(fresh.products, fresh.cart);
        if (
          sale.lines.some(
            (i) =>
              stateRef.current.products.find((p) => p.id === i.id)?.price !==
              i.price,
          )
        )
          throw Error("Cambió un precio. Recarga y revisa el total.");
        const receipt = {
          id: "NX-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
          date: new Date().toISOString(),
          lines: sale.lines,
          total: sale.total,
        };
        commit({ products: sale.products, cart: [], receipt });
        setMessage("Compra registrada correctamente.");
      };
      if (navigator.locks)
        await navigator.locks.request("nexus-demo-purchase", finish);
      else finish();
    } finally {
      pending.current = false;
    }
  };
  return (
    <Context.Provider
      value={{
        ...state,
        session,
        message,
        setMessage,
        add,
        change,
        remove,
        login,
        logout,
        saveProduct,
        deleteProduct,
        checkout,
      }}
    >
      {children}
    </Context.Provider>
  );
}
