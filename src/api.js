const base = (import.meta.env?.VITE_API_URL || "/api").replace(/\/$/, "");
async function request(route, method = "GET", data, token) {
  let response;
  try {
    response = await fetch(base + route, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw Error(
      "No se pudo conectar con la API. Inicia el proyecto con npm run dev e inténtalo nuevamente.",
    );
  }
  if (response.status === 204) return null;
  let result;
  try {
    result = await response.json();
  } catch {
    throw Error(
      "La API no está disponible. Comprueba que JSON Server esté iniciado.",
    );
  }
  if (!response.ok)
    throw Error(result.error || "No se pudo completar la operación.");
  return result;
}
export const apiClient = {
  products: () => request("/products"),
  login: (user, password) => request("/login", "POST", { user, password }),
  register: (data) => request("/register", "POST", data),
  logout: (token) => request("/logout", "POST", {}, token),
  saveProduct: (p, token) =>
    request(
      p.id ? `/products/${p.id}` : "/products",
      p.id ? "PUT" : "POST",
      p,
      token,
    ),
  deleteProduct: (id, token) =>
    request(`/products/${id}`, "DELETE", undefined, token),
  checkout: (data) => request("/checkout", "POST", data),
};
