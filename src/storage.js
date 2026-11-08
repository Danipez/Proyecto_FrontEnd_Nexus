import { SEED } from "./seed";
import { validProduct, reconcile } from "./domain";
export const STATE_KEY = "nexus_state_v2";
export function read(storage, key, fallback) {
  try {
    return JSON.parse(storage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
export function loadState(storage) {
  const saved = read(storage, STATE_KEY, null);
  const products = saved?.products ?? read(storage, "nexus_products", SEED);
  const safe =
    Array.isArray(products) && products.every(validProduct)
      ? products
      : structuredClone(SEED);
  return {
    products: safe,
    cart: reconcile(safe, saved?.cart ?? read(storage, "nexus_cart", [])),
    receipt: saved?.receipt ?? read(storage, "nexus_last_order", null),
  };
}
// Una escritura conserva conjuntamente inventario, carrito y comprobante.
export function saveState(storage, state) {
  storage.setItem(STATE_KEY, JSON.stringify(state));
}
export function readPhoto(file) {
  return new Promise((resolve, reject) => {
    if (
      !file ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 1048576
    ) {
      reject(Error("Selecciona JPG, PNG o WebP de hasta 1 MB."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(Error("No se pudo leer el archivo."));
    reader.onload = async () => {
      try {
        const img = new Image();
        img.src = reader.result;
        await img.decode();
        resolve(reader.result);
      } catch {
        reject(Error("El archivo no es una imagen válida."));
      }
    };
    reader.readAsDataURL(file);
  });
}
