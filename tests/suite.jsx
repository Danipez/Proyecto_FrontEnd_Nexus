import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { App } from "../src/App";
import { StoreProvider, useStore } from "../src/Store";
import { ProductCard } from "../src/components/ProductCard";
import { ProductForm } from "../src/components/ProductForm";
import { VideoGuide } from "../src/components/VideoGuide";
import { Catalog } from "../src/pages/Catalog";
import { Cart, Receipt } from "../src/pages/Cart";
import { Login } from "../src/pages/Login";
import { Admin } from "../src/pages/Admin";
import { Contact } from "../src/pages/Contact";
import { SEED } from "../src/seed";
import {
  addItem,
  authenticate,
  filterProducts,
  money,
  photo,
  prepareSale,
  reconcile,
  validProduct,
  validSession,
  validateContact,
  validateProduct,
} from "../src/domain";
import {
  loadState,
  read,
  readPhoto,
  saveState,
  STATE_KEY,
} from "../src/storage";
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
import { apiClient } from "../src/api";
function memory(initial = {}) {
  const data = { ...initial };
  return {
    getItem: jasmine.createSpy("getItem").and.callFake((k) => data[k] ?? null),
    setItem: jasmine.createSpy("setItem").and.callFake((k, v) => (data[k] = v)),
    removeItem: jasmine
      .createSpy("removeItem")
      .and.callFake((k) => delete data[k]),
  };
}
let box, root, store, session, api;
function Probe() {
  api = useStore();
  return null;
}
async function mount(node) {
  await act(async () => root.render(node));
}
async function wrapped(node) {
  await mount(
    <StoreProvider storage={store} sessionStore={session} backend={null}>
      <Probe />
      {node}
    </StoreProvider>,
  );
}
async function online(node, backend) {
  await mount(
    <StoreProvider storage={store} sessionStore={session} backend={backend}>
      <Probe />
      {node}
    </StoreProvider>,
  );
}
describe("Conexión del frontend con la API", () => {
  it("A01 muestra error de conexión y permite reintentar", async () => {
    const backend = {
      products: jasmine.createSpy().and.rejectWith(Error("API desconectada")),
    };
    await online(<App />, backend);
    expect(box.textContent).toContain("API desconectada");
    backend.products.and.resolveTo(structuredClone(SEED));
    await click(
      [...box.querySelectorAll("button")].find(
        (b) => b.textContent === "Reintentar conexión",
      ),
    );
    expect(api.products.length).toBe(6);
    expect(api.connectionError).toBe("");
  });
  it("A02 login y CRUD esperan la respuesta del servidor", async () => {
    const backend = {
      products: async () => structuredClone(SEED),
      login: async () => ({
        ...authenticate("admin", "Admin123"),
        token: "test-token",
      }),
      saveProduct: jasmine.createSpy().and.resolveTo({ ...product, id: 10 }),
      deleteProduct: jasmine.createSpy().and.resolveTo({}),
    };
    await online(<Admin />, backend);
    await act(async () => api.login("admin", "Admin123"));
    await act(async () => api.saveProduct({ ...product, id: undefined }));
    expect(api.products.length).toBe(7);
    expect(backend.saveProduct.calls.mostRecent().args[1]).toBe("test-token");
    await act(async () => api.deleteProduct(10));
    expect(api.products.length).toBe(6);
  });
  it("A03 un error de compra conserva el carrito y reintenta con la misma clave", async () => {
    const checkout = jasmine.createSpy().and.rejectWith(Error("Sin conexión"));
    await online(<Cart />, {
      products: async () => structuredClone(SEED),
      checkout,
    });
    await act(async () => api.add(1));
    await act(async () => {
      await expectAsync(api.checkout()).toBeRejectedWithError("Sin conexión");
    });
    const first = checkout.calls.mostRecent().args[0].requestId;
    const sale = prepareSale(SEED, [{ id: 1, qty: 1 }]);
    checkout.and.resolveTo({
      products: sale.products,
      receipt: {
        id: "NX-API",
        date: new Date().toISOString(),
        lines: sale.lines,
        total: sale.total,
      },
    });
    await act(async () => api.checkout());
    expect(checkout.calls.mostRecent().args[0].requestId).toBe(first);
    expect(api.products[0].stock).toBe(7);
    expect(api.cart.length).toBe(0);
  });
  it("A04 el cliente HTTP envía token y muestra los errores de la API", async () => {
    spyOn(window, "fetch").and.resolveTo(
      new Response(JSON.stringify({ error: "Acceso denegado" }), {
        status: 401,
      }),
    );
    await expectAsync(
      apiClient.saveProduct(product, "token"),
    ).toBeRejectedWithError("Acceso denegado");
    const [url, options] = window.fetch.calls.mostRecent().args;
    expect(url).toBe("/api/products/10");
    expect(options.headers.Authorization).toBe("Bearer token");
  });
});
async function click(el) {
  expect(el).not.toBeNull();
  await act(async () => el.click());
}
async function fill(id, value) {
  const el = box.querySelector("#" + id);
  await act(async () => {
    const proto =
      el.tagName === "TEXTAREA"
        ? HTMLTextAreaElement.prototype
        : el.tagName === "SELECT"
          ? HTMLSelectElement.prototype
          : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
    el.dispatchEvent(
      new Event(el.tagName === "SELECT" ? "change" : "input", {
        bubbles: true,
      }),
    );
  });
}
async function submit() {
  await act(async () =>
    box
      .querySelector("form")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
}
const product = {
  id: 10,
  code: "TEST-10",
  name: "Teclado de prueba",
  category: "Periféricos",
  price: 1000,
  stock: 3,
  active: true,
  image: "keyboard",
  description: "Mecánico",
};
beforeEach(() => {
  if (navigator.locks)
    spyOn(navigator.locks, "request").and.callFake((name, fn) =>
      Promise.resolve().then(fn),
    );
  box = document.createElement("div");
  document.body.append(box);
  root = createRoot(box);
  store = memory();
  session = memory();
  location.hash = "/";
});
afterEach(async () => {
  await act(async () => root.unmount());
  box.remove();
});
describe("Componentes React y DOM", () => {
  it("C01 ProductCard muestra datos y emite el id mediante props", async () => {
    const add = jasmine.createSpy();
    await mount(<ProductCard product={product} onAdd={add} />);
    expect(box.textContent).toContain(product.name);
    expect(box.querySelector("img").alt).toBe(product.name);
    await click(box.querySelector("button"));
    expect(add).toHaveBeenCalledWith(10);
  });
  it("C02 ProductCard deshabilita la compra sin stock", async () => {
    await mount(
      <ProductCard product={{ ...product, stock: 0 }} onAdd={() => {}} />,
    );
    expect(box.querySelector("button").disabled).toBeTrue();
    expect(box.textContent).toContain("Sin stock");
  });
  it("C03 Catalog filtra búsqueda y limpia filtros", async () => {
    await wrapped(<Catalog />);
    await fill("search", "Ryzen");
    expect(box.querySelectorAll("article").length).toBe(1);
    await click(box.querySelector("button"));
    expect(box.querySelectorAll("article").length).toBe(6);
    await fill("search", "inexistente");
    expect(box.textContent).toContain("No encontramos");
  });
  it("C04 Catalog combina categoría y precio", async () => {
    await wrapped(<Catalog />);
    await fill("filter-category", "Periféricos");
    await fill("sort", "asc");
    expect(box.querySelectorAll("article").length).toBe(2);
    expect(box.querySelector("article").textContent).toContain("Mouse");
  });
  it("C05 Contact muestra errores en DOM al enviar vacío", async () => {
    await mount(<Contact />);
    await submit();
    expect(box.querySelectorAll('[role="alert"]').length).toBe(5);
    expect(box.querySelector("#name").getAttribute("aria-invalid")).toBe(
      "true",
    );
  });
  it("C06 Contact valida y limpia la confirmación al editar", async () => {
    await mount(<Contact />);
    for (const [id, v] of Object.entries({
      name: "Juan Pérez",
      email: "juan@example.com",
      topic: "Consulta",
      message: "Necesito información sobre este teclado.",
    }))
      await fill(id, v);
    await click(box.querySelector('[type="checkbox"]'));
    await submit();
    expect(box.textContent).toContain("Consulta validada");
    await fill("topic", "Otra consulta");
    expect(box.querySelector('[role="status"]')).toBeNull();
  });
  it("C07 Login rechaza datos vacíos y credenciales incorrectas", async () => {
    await wrapped(<Login />);
    await submit();
    expect(box.textContent).toContain("Completa usuario");
    await fill("username", "admin");
    await fill("password", "incorrecta");
    await submit();
    expect(box.textContent).toContain("Usuario o contraseña incorrectos");
    expect(api.session).toBeNull();
  });
  it("C08 Login inicia sesión y muestra la cuenta existente", async () => {
    await wrapped(<Login />);
    await fill("username", "admin");
    await fill("password", "Admin123");
    await click(box.querySelector('[type="checkbox"]'));
    expect(box.querySelector("#password").type).toBe("text");
    await submit();
    expect(api.session.role).toBe("admin");
    expect(box.textContent).toContain("Sesión iniciada");
    await click(box.querySelector("button"));
    expect(api.session).toBeNull();
  });
  it("C09 Admin impide gestionar sin rol administrativo", async () => {
    await wrapped(<Admin />);
    expect(box.textContent).toContain("Inicia sesión");
    expect(box.querySelector("table")).toBeNull();
  });
  it("C10 ProductForm rechaza stock negativo y código repetido", async () => {
    const save = jasmine.createSpy();
    await mount(
      <ProductForm
        product={{ ...product, stock: -1 }}
        products={[{ ...product, id: 11 }]}
        onSave={save}
        onCancel={() => {}}
      />,
    );
    await submit();
    expect(save).not.toHaveBeenCalled();
    expect(box.textContent).toContain("El código ya existe");
    expect(box.querySelector("#stock-error")).not.toBeNull();
  });
  it("C11 ProductForm guarda valores numéricos y cancela", async () => {
    const save = jasmine.createSpy(),
      cancel = jasmine.createSpy();
    await mount(
      <ProductForm
        product={product}
        products={[product]}
        onSave={save}
        onCancel={cancel}
      />,
    );
    await fill("stock", "5");
    await submit();
    expect(save.calls.mostRecent().args[0].stock).toBe(5);
    await click(
      [...box.querySelectorAll("button")].find(
        (b) => b.textContent === "Cancelar",
      ),
    );
    expect(cancel).toHaveBeenCalled();
  });
  it("C12 Cart agrega cambia y elimina unidades respetando stock", async () => {
    await wrapped(<Cart />);
    await act(async () => api.add(1));
    expect(box.textContent).toContain("GeForce");
    await click(box.querySelector('[aria-label^="Sumar"]'));
    expect(api.cart[0].qty).toBe(2);
    await click(box.querySelector('[aria-label^="Restar"]'));
    expect(api.cart[0].qty).toBe(1);
    await click(
      [...box.querySelectorAll("button")].find(
        (b) => b.textContent === "Eliminar",
      ),
    );
    expect(api.cart.length).toBe(0);
  });
  it("C13 Checkout descuenta stock guarda comprobante y vacía carrito", async () => {
    await wrapped(<Cart />);
    await act(async () => {
      api.add(1);
      api.add(1);
    });
    await click(
      [...box.querySelectorAll("button")].find(
        (b) => b.textContent === "Confirmar compra",
      ),
    );
    expect(api.products[0].stock).toBe(6);
    expect(api.cart).toEqual([]);
    expect(box.textContent).toContain("Última compra");
    expect(loadState(store).receipt.total).toBe(1199980);
  });
  it("C14 Fallo de almacenamiento no muestra éxito ni cambia inventario", async () => {
    await wrapped(<Cart />);
    await act(async () => api.add(1));
    store.setItem.and.throwError("quota");
    await click(
      [...box.querySelectorAll("button")].find(
        (b) => b.textContent === "Confirmar compra",
      ),
    );
    expect(api.products[0].stock).toBe(8);
    expect(api.cart.length).toBe(1);
    expect(box.textContent).toContain("No se pudo guardar");
  });
  it("C15 Receipt muestra total y no dibuja un comprobante vacío", async () => {
    await mount(<Receipt receipt={null} />);
    expect(box.textContent).toBe("");
    await mount(
      <Receipt
        receipt={{
          id: "NX-1",
          date: "2026-11-08",
          lines: [{ id: 1, name: "CPU", qty: 2, subtotal: 2000 }],
          total: 2000,
        }}
      />,
    );
    expect(box.textContent).toContain("CPU");
    expect(box.querySelectorAll("tbody tr").length).toBe(1);
  });
  it("C16 App navega con hash y permite abrir menú móvil", async () => {
    await wrapped(<App />);
    await click(box.querySelector(".navbar-toggler"));
    expect(
      box.querySelector(".navbar-toggler").getAttribute("aria-expanded"),
    ).toBe("true");
    await act(async () => {
      location.hash = "/productos";
      window.dispatchEvent(new Event("hashchange"));
    });
    expect(box.querySelector("h1").textContent).toBe("Catálogo gaming");
    await act(async () => {
      location.hash = "/no-existe";
      window.dispatchEvent(new Event("hashchange"));
    });
    expect(box.textContent).toContain("Página no encontrada");
  });
  it("C17 Video actualiza estado y restaura póster al finalizar", async () => {
    await mount(<VideoGuide />);
    const v = box.querySelector("video");
    spyOn(v, "load").and.stub();
    await act(async () => v.dispatchEvent(new Event("play")));
    expect(box.textContent).toContain("Pausar");
    await act(async () => v.dispatchEvent(new Event("ended")));
    expect(v.load).toHaveBeenCalled();
    expect(box.textContent).toContain("Video finalizado");
    await act(async () => v.dispatchEvent(new Event("error")));
    expect(box.textContent).toContain("No se pudo cargar");
  });
  it("C18 Admin crea edita y elimina un producto", async () => {
    session.setItem(
      "nexus_session",
      JSON.stringify(authenticate("admin", "Admin123")),
    );
    await wrapped(<Admin />);
    await click(
      [...box.querySelectorAll("button")].find(
        (b) => b.textContent === "Nuevo producto",
      ),
    );
    for (const [id, v] of Object.entries({
      code: "NEW-1",
      name: "Nuevo teclado",
      price: "1500",
      stock: "4",
    }))
      await fill(id, v);
    await submit();
    expect(api.products.length).toBe(7);
    const rows = box.querySelectorAll("tbody tr");
    await click(rows[6].querySelector("button"));
    await fill("name", "Teclado editado");
    await submit();
    expect(api.products[6].name).toBe("Teclado editado");
    spyOn(window, "confirm").and.returnValue(true);
    await click(
      box.querySelectorAll("tbody tr")[6].querySelectorAll("button")[1],
    );
    expect(api.products.length).toBe(6);
  });
  it("C19 ProductForm muestra errores persistentes para imagen inválida", async () => {
    const save = jasmine.createSpy();
    await mount(
      <ProductForm
        product={product}
        products={[]}
        onSave={save}
        onCancel={() => {}}
      />,
    );
    const input = box.querySelector("#image");
    Object.defineProperty(input, "files", {
      value: [new File(["x"], "bad.txt", { type: "text/plain" })],
    });
    await act(async () =>
      input.dispatchEvent(new Event("change", { bubbles: true })),
    );
    await submit();
    await submit();
    expect(save).not.toHaveBeenCalled();
    expect(box.textContent).toContain("hasta 1 MB");
    await click(
      [...box.querySelectorAll("button")].find(
        (b) => b.textContent === "Quitar imagen",
      ),
    );
    await submit();
    expect(save).toHaveBeenCalled();
  });
});
describe("Reglas almacenamiento y mocks", () => {
  it("L01 format precios y rutas de imagen", () => {
    expect(money(1000)).toContain("1.000");
    expect(photo(product)).toContain("keyboard.jpg");
    expect(photo({ ...product, image: "" })).toContain("setup.jpg");
    expect(photo({ ...product, image: "data:image/png;base64,AAA" })).toContain(
      "data:",
    );
  });
  it("L02 valida la estructura del producto", () => {
    expect(validProduct(product)).toBeTrue();
    expect(validProduct({ ...product, stock: -1 })).toBeFalse();
  });
  it("L03 filtros no modifican el catálogo original", () => {
    const before = JSON.stringify(SEED);
    expect(filterProducts(SEED, "", "Componentes", "desc")[0].price).toBe(
      599990,
    );
    expect(JSON.stringify(SEED)).toBe(before);
  });
  it("L04 carrito rechaza sobrestock y producto inexistente", () => {
    expect(addItem([product], [], 10)).toEqual([{ id: 10, qty: 1 }]);
    expect(() => addItem([product], [{ id: 10, qty: 3 }], 10)).toThrow();
    expect(() => addItem([product], [], 99)).toThrow();
  });
  it("L05 reconciliación limita stock y elimina ocultos", () => {
    expect(
      reconcile(
        [product],
        [
          { id: 10, qty: 9 },
          { id: 99, qty: 1 },
        ],
      ),
    ).toEqual([{ id: 10, qty: 3 }]);
    expect(reconcile([], null)).toEqual([]);
  });
  it("L06 venta calcula totales sin mutar y permite última unidad", () => {
    const sale = prepareSale([product], [{ id: 10, qty: 3 }]);
    expect(sale.total).toBe(3000);
    expect(sale.products[0].stock).toBe(0);
    expect(product.stock).toBe(3);
  });
  it("L07 venta rechaza vacío cantidades inválidas y duplicados excesivos", () => {
    for (const cart of [
      [],
      [{ id: 10, qty: 0 }],
      [
        { id: 10, qty: 2 },
        { id: 10, qty: 2 },
      ],
      [{ id: 99, qty: 1 }],
    ])
      expect(() => prepareSale([product], cart)).toThrow();
  });
  it("L08 validación completa de producto y contacto", () => {
    expect(validateProduct(product)).toEqual({});
    expect(
      Object.keys(
        validateProduct({
          ...product,
          code: "!",
          name: "",
          category: "X",
          price: "",
          stock: 1.5,
        }),
      ).length,
    ).toBe(5);
    expect(
      Object.keys(
        validateContact({
          name: "",
          topic: "",
          message: "",
          email: "bad",
          consent: false,
        }),
      ).length,
    ).toBe(5);
  });
  it("L09 sesión vence a los treinta minutos", () => {
    const s = authenticate(" ADMIN ", "Admin123", 1000);
    expect(validSession(s, 1001).role).toBe("admin");
    expect(validSession(s, 1801000)).toBeNull();
    expect(authenticate("jperez", "User123", 1000).role).toBe("user");
    expect(() => authenticate("x", "x")).toThrow();
  });
  it("L10 recuperación de datos corruptos y migración de almacenamiento anterior", () => {
    store.setItem(STATE_KEY, "invalid");
    expect(loadState(store).products.length).toBe(6);
    store.setItem("nexus_products", JSON.stringify([product]));
    store.setItem("nexus_cart", JSON.stringify([{ id: 10, qty: 2 }]));
    expect(loadState(store).cart.length).toBe(1);
    saveState(store, { products: [product], cart: [], receipt: null });
    expect(read(store, STATE_KEY, null).products[0].id).toBe(10);
  });
  it("L11 almacenamiento falla de forma explícita", () => {
    store.setItem.and.throwError("quota");
    expect(() => saveState(store, {})).toThrow();
    store.getItem.and.throwError("denied");
    expect(read(store, "key", [])).toEqual([]);
  });
  it("L12 foto rechaza tipo y tamaño no permitido", async () => {
    await expectAsync(
      readPhoto(new File(["x"], "x.txt", { type: "text/plain" })),
    ).toBeRejected();
    await expectAsync(
      readPhoto(
        new File([new Uint8Array(1048577)], "x.png", { type: "image/png" }),
      ),
    ).toBeRejected();
  });
  it("L13 foto usa FileReader y decodificación con mocks", async () => {
    spyOn(window, "FileReader").and.callFake(function () {
      return {
        result: "data:image/png;base64,AAA",
        readAsDataURL() {
          this.onload();
        },
      };
    });
    spyOn(window, "Image").and.callFake(function () {
      return { decode: () => Promise.resolve() };
    });
    await expectAsync(
      readPhoto(new File(["x"], "x.png", { type: "image/png" })),
    ).toBeResolvedTo("data:image/png;base64,AAA");
  });
  it("L14 bloqueo después de cinco intentos fallidos", async () => {
    await wrapped(<Probe />);
    for (let i = 0; i < 5; i++)
      expect(() => api.login("admin", "wrong")).toThrow();
    expect(() => api.login("admin", "Admin123")).toThrowError(/Espera/);
  });
  it("L15 acciones administrativas sin sesión son rechazadas", async () => {
    await wrapped(<Probe />);
    expect(() => api.saveProduct(product)).toThrow();
    expect(() => api.deleteProduct(1)).toThrow();
  });
  it("L16 cambio de carrito entre pestañas evita una compra obsoleta", async () => {
    await wrapped(<Cart />);
    await act(async () => api.add(1));
    saveState(store, { products: SEED, cart: [], receipt: null });
    await expectAsync(api.checkout()).toBeRejectedWithError(/carrito cambió/);
    expect(api.products[0].stock).toBe(8);
  });
});
