export const categories = ["Componentes", "Periféricos", "Consolas"];
export const money = (n) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
export const photo = (p) =>
  /^data:image\/(jpeg|png|webp);base64,/.test(p.image || "")
    ? p.image
    : `./assets/photos/${{ gpu: "gpu.png", cpu: "cpu.jpg", keyboard: "keyboard.jpg", console: "console.jpg", mouse: "mouse.jpg", memory: "memory.jpg" }[p.image] || "setup.jpg"}`;
export function validProduct(p) {
  return (
    p &&
    Number.isInteger(p.id) &&
    typeof p.code === "string" &&
    typeof p.name === "string" &&
    categories.includes(p.category) &&
    Number.isInteger(p.price) &&
    p.price > 0 &&
    Number.isInteger(p.stock) &&
    p.stock >= 0 &&
    typeof p.active === "boolean"
  );
}
export function filterProducts(products, query = "", category = "", sort = "") {
  const q = query.trim().toLocaleLowerCase("es");
  return products
    .filter(
      (p) =>
        p.active &&
        (!category || p.category === category) &&
        `${p.name} ${p.code} ${p.category}`.toLocaleLowerCase("es").includes(q),
    )
    .sort((a, b) =>
      sort === "asc"
        ? a.price - b.price
        : sort === "desc"
          ? b.price - a.price
          : 0,
    );
}
export function reconcile(products, cart) {
  return Array.isArray(cart)
    ? cart
        .filter(
          (i) =>
            i &&
            Number.isInteger(i.qty) &&
            i.qty > 0 &&
            products.some((p) => p.id === i.id && p.active && p.stock > 0),
        )
        .map((i) => ({
          ...i,
          qty: Math.min(i.qty, products.find((p) => p.id === i.id).stock),
        }))
    : [];
}
export function addItem(products, cart, id) {
  const p = products.find((p) => p.id === id && p.active);
  if (!p) throw Error("Producto no disponible.");
  const old = cart.find((i) => i.id === id);
  if ((old?.qty || 0) >= p.stock)
    throw Error("No hay más unidades disponibles.");
  return old
    ? cart.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
    : [...cart, { id, qty: 1 }];
}
export function prepareSale(products, cart) {
  if (!Array.isArray(cart) || !cart.length)
    throw Error("El carrito está vacío.");
  const counts = new Map();
  for (const i of cart) {
    if (!Number.isInteger(i.qty) || i.qty < 1)
      throw Error("Cantidad inválida.");
    counts.set(i.id, (counts.get(i.id) || 0) + i.qty);
  }
  const lines = Array.from(counts, ([id, qty]) => {
    const p = products.find((x) => x.id === id && x.active);
    if (!p || qty > p.stock)
      throw Error("Stock insuficiente o producto no disponible.");
    return { id, name: p.name, qty, price: p.price, subtotal: p.price * qty };
  });
  return {
    products: products.map((p) => ({
      ...p,
      stock: p.stock - (counts.get(p.id) || 0),
    })),
    lines,
    total: lines.reduce((n, i) => n + i.subtotal, 0),
  };
}
export function validateProduct(v, products = []) {
  const e = {};
  if (!/^[a-z0-9-]{3,20}$/i.test(v.code.trim()))
    e.code = "Usa entre 3 y 20 letras, números o guiones.";
  else if (
    products.some(
      (p) =>
        p.id !== v.id && p.code.toLowerCase() === v.code.trim().toLowerCase(),
    )
  )
    e.code = "El código ya existe.";
  if (v.name.trim().length < 3 || v.name.trim().length > 80)
    e.name = "El nombre debe tener entre 3 y 80 caracteres.";
  if (!categories.includes(v.category))
    e.category = "Selecciona una categoría válida.";
  for (const [key, min, max] of [
    ["price", 1, 99999999],
    ["stock", 0, 9999],
  ])
    if (
      String(v[key]).trim() === "" ||
      !Number.isInteger(Number(v[key])) ||
      Number(v[key]) < min ||
      Number(v[key]) > max
    )
      e[key] = `Debe ser un entero entre ${min} y ${max}.`;
  return e;
}
export function validateContact(v) {
  const e = {};
  for (const [key, min, max] of [
    ["name", 3, 80],
    ["topic", 3, 60],
    ["message", 20, 1000],
  ])
    if (v[key].trim().length < min || v[key].trim().length > max)
      e[key] = `Escribe entre ${min} y ${max} caracteres.`;
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()) ||
    v.email.length > 120
  )
    e.email = "Escribe un correo válido.";
  if (!v.consent) e.consent = "Debes autorizar la revisión de los datos.";
  return e;
}
export function validSession(s, now = Date.now()) {
  return s && ["admin", "user"].includes(s.role) && s.expires > now ? s : null;
}
export function authenticate(user, password, now = Date.now()) {
  const name = user.trim().toLowerCase();
  const role =
    name === "admin" && password === "Admin123"
      ? "admin"
      : name === "jperez" && password === "User123"
        ? "user"
        : null;
  if (!role) throw Error("Usuario o contraseña incorrectos.");
  return { user: name, role, expires: now + 1800000 };
}
