import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createApi } from "../server/index.mjs";

test("API completa: permisos, CRUD, compra, concurrencia y persistencia", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-api-"));
  const file = path.join(dir, "db.json");
  fs.copyFileSync(new URL("../server/db.json", import.meta.url), file);
  let server;
  const start = async () => {
    server = createApi(file).listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    return `http://127.0.0.1:${server.address().port}/api`;
  };
  let base = await start();
  const call = async (route, method = "GET", body, token) => {
    const r = await fetch(base + route, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return { status: r.status, data: await r.json() };
  };
  try {
    const list = await call("/products");
    assert.equal(list.data.length, 6);
    assert.equal(
      (await call("/products/1", "PATCH", { stock: 1 })).status,
      401,
    );
    assert.equal(
      (await call("/login", "POST", { user: "admin", password: "bad" })).status,
      401,
    );
    const { data: admin } = await call("/login", "POST", {
      user: "admin",
      password: "Admin123",
    });
    const { data: user } = await call("/login", "POST", {
      user: "jperez",
      password: "User123",
    });
    assert.equal(
      (await call("/products/1", "PATCH", { stock: 1 }, user.token)).status,
      401,
    );
    assert.equal(
      (await call("/products/1", "PATCH", { stock: -1 }, admin.token)).status,
      400,
    );
    const newProduct = {
      ...list.data[0],
      id: undefined,
      code: "QA-001",
      name: "Producto de prueba API",
      image: "data:image/png;base64,AAAA",
    };
    const created = await call("/products", "POST", newProduct, admin.token);
    assert.equal(created.status, 201);
    const id = created.data.id;
    assert.equal(
      (
        await call(
          `/products/${id}`,
          "PATCH",
          { name: "Nombre actualizado" },
          admin.token,
        )
      ).data.name,
      "Nombre actualizado",
    );
    assert.equal(
      (await call(`/products/${id}`, "DELETE", undefined, admin.token)).status,
      200,
    );
    const purchase = {
      cart: [{ id: 1, qty: 1 }],
      prices: { 1: 599990 },
      requestId: "purchase-one",
    };
    const sale = await call("/checkout", "POST", purchase);
    assert.equal(sale.status, 201);
    assert.equal(sale.data.products[0].stock, 7);
    assert.equal(
      (await call("/checkout", "POST", purchase)).data.receipt.id,
      sale.data.receipt.id,
    );
    assert.equal(
      (
        await call("/checkout", "POST", {
          ...purchase,
          requestId: "wrong-price",
          prices: { 1: 1 },
        })
      ).status,
      409,
    );
    assert.equal(
      (
        await call("/checkout", "POST", {
          ...purchase,
          requestId: "wrong-stock",
          cart: [{ id: 1, qty: 99 }],
        })
      ).status,
      400,
    );
    await call("/products/1", "PATCH", { stock: 1 }, admin.token);
    const results = await Promise.all(
      ["last-a", "last-b"].map((requestId) =>
        call("/checkout", "POST", { ...purchase, requestId }),
      ),
    );
    assert.deepEqual(results.map((r) => r.status).sort(), [201, 400]);
    await new Promise((resolve) => server.close(resolve));
    base = await start();
    assert.equal((await call("/products/1")).data.stock, 0);
    const stored = JSON.parse(fs.readFileSync(file));
    assert.equal(stored.orders.length, 2);
    console.log(
      "Verificados: catálogo, acceso, permisos, validación, crear/editar/eliminar, imagen, stock, precio, doble envío, última unidad y persistencia tras reiniciar.",
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
