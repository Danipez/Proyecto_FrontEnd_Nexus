import jsonServer from "json-server";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import {
  authenticate,
  prepareSale,
  validateProduct,
  validProduct,
  validateRegister,
} from "../src/domain.js";

const hashPassword = (password, salt = randomBytes(16).toString("hex")) => ({
  salt,
  hash: scryptSync(password, salt, 64).toString("hex"),
});
const samePassword = (password, u) =>
  timingSafeEqual(
    Buffer.from(hashPassword(password, u.salt).hash, "hex"),
    Buffer.from(u.hash, "hex"),
  );

export function createApi(dbFile) {
  const app = jsonServer.create();
  const router = jsonServer.router(dbFile);
  const sessions = new Map();
  const attempts = new Map();
  app.use(jsonServer.defaults({ noStatic: true, logger: false }));
  app.use(jsonServer.bodyParser);
  app.get("/api/health", (_, res) =>
    res.json({ status: "ok", service: "NEXUS API" }),
  );
  const users = () => router.db.getState().users || [];
  const openSession = (user, role) => {
    const session = {
      user,
      role,
      expires: Date.now() + 1800000,
      token: randomUUID(),
    };
    for (const [token, s] of sessions)
      if (s.expires <= Date.now()) sessions.delete(token);
    sessions.set(session.token, session);
    return session;
  };
  const signups = new Map();
  app.post("/api/register", (req, res) => {
    const key = req.ip;
    const recent = (signups.get(key) || []).filter((t) => t > Date.now() - 600000);
    if (recent.length >= 10)
      return res
        .status(429)
        .json({ error: "Demasiados registros. Inténtalo más tarde." });
    signups.set(key, [...recent, Date.now()]);
    const b = req.body || {};
    if (
      ["name", "user", "email", "password"].some((k) => typeof b[k] !== "string")
    )
      return res.status(400).json({ error: "Completa todos los campos." });
    const current = users();
    const errors = validateRegister(
      { ...b, confirm: b.password, consent: true },
      current.map((u) => u.user),
    );
    if (Object.keys(errors).length)
      return res
        .status(Object.keys(errors).includes("user") ? 409 : 400)
        .json({ error: Object.values(errors)[0], fields: errors });
    const name = b.user.trim().toLowerCase();
    const record = {
      id: Math.max(0, ...current.map((u) => u.id)) + 1,
      name: b.name.trim(),
      user: name,
      email: b.email.trim(),
      ...hashPassword(b.password),
      createdAt: new Date().toISOString(),
    };
    const state = router.db.getState();
    router.db.setState({ ...state, users: [...current, record] }).write();
    res.status(201).json(openSession(name, "user"));
  });
  app.post("/api/login", (req, res) => {
    const key = req.ip;
    const previous = attempts.get(key) || { count: 0, until: 0 };
    if (previous.until > Date.now())
      return res
        .status(429)
        .json({ error: "Demasiados intentos. Espera un minuto." });
    try {
      if (
        typeof req.body.user !== "string" ||
        typeof req.body.password !== "string"
      )
        throw Error("Completa usuario y contraseña.");
      const name = req.body.user.trim().toLowerCase();
      const found = users().find((u) => u.user === name);
      let session;
      if (found && samePassword(req.body.password, found))
        session = openSession(found.user, "user");
      else {
        const base = authenticate(req.body.user, req.body.password);
        session = openSession(base.user, base.role);
      }
      attempts.delete(key);
      res.json(session);
    } catch (e) {
      const count = previous.until ? 1 : previous.count + 1;
      attempts.set(key, { count, until: count >= 5 ? Date.now() + 60000 : 0 });
      res.status(401).json({ error: e.message });
    }
  });
  app.post("/api/logout", (req, res) => {
    sessions.delete(req.headers.authorization?.replace(/^Bearer /, ""));
    res.status(204).end();
  });
  const admin = (req, res, next) => {
    const session = sessions.get(
      req.headers.authorization?.replace(/^Bearer /, ""),
    );
    if (!session || session.expires <= Date.now() || session.role !== "admin")
      return res
        .status(401)
        .json({ error: "Inicia sesión como administrador." });
    next();
  };
  // Stock y comprobante se escriben juntos para no dejar compras a medias.
  app.post("/api/checkout", (req, res) => {
    const before = structuredClone(router.db.getState());
    try {
      const { cart, prices, requestId } = req.body;
      if (
        typeof requestId !== "string" ||
        requestId.length > 80 ||
        !requestId.length
      )
        throw Error("Identificador de compra inválido.");
      const old = before.orders.find((o) => o.requestId === requestId);
      if (old) return res.json({ products: before.products, receipt: old });
      const sale = prepareSale(before.products, cart);
      if (sale.lines.some((line) => prices?.[line.id] !== line.price))
        return res
          .status(409)
          .json({ error: "Cambió un precio. Recarga y revisa el total." });
      const receipt = {
        id: "NX-" + randomUUID().slice(0, 8).toUpperCase(),
        requestId,
        date: new Date().toISOString(),
        lines: sale.lines,
        total: sale.total,
      };
      router.db
        .setState({
          ...before,
          products: sale.products,
          orders: [...before.orders, receipt],
        })
        .write();
      res.status(201).json({ products: sale.products, receipt });
    } catch (e) {
      router.db.setState(before);
      res.status(400).json({ error: e.message });
    }
  });
  app.use("/api", (req, res, next) => {
    if (!/^\/products(?:\/\d+)?\/?$/.test(req.path))
      return res.status(404).json({ error: "Recurso no encontrado." });
    if (req.method === "GET") return next();
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method))
      return res.status(405).end();
    admin(req, res, () => {
      if (req.method === "DELETE") return next();
      try {
        const id = Number(req.path.split("/")[2]);
        const products = router.db.get("products").value();
        const existing = products.find((p) => p.id === id);
        if (req.method !== "POST" && !existing)
          return res.status(404).json({ error: "Producto no encontrado." });
        const v = { ...(req.method === "PATCH" ? existing : {}), ...req.body };
        const clean = {
          id:
            req.method === "POST"
              ? Math.max(0, ...products.map((p) => p.id)) + 1
              : id,
          code: v.code,
          name: v.name,
          category: v.category,
          price: v.price,
          stock: v.stock,
          active: v.active,
          image: v.image || "",
          description: v.description || "",
        };
        if (
          !validProduct(clean) ||
          Object.keys(validateProduct(clean, products)).length
        )
          throw Error("Revisa los datos del producto.");
        if (
          typeof clean.image !== "string" ||
          clean.image.length > 1400000 ||
          (clean.image.startsWith("data:") &&
            !/^data:image\/(jpeg|png|webp);base64,/.test(clean.image))
        )
          throw Error("Imagen no válida o demasiado grande.");
        req.body = clean;
        next();
      } catch (e) {
        res.status(400).json({ error: e.message });
      }
    });
  });
  app.use("/api", router);
  app.use((err, req, res, next) =>
    res
      .status(err.status || 500)
      .json({ error: "No se pudo procesar la solicitud." }),
  );
  return app;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const root = path.dirname(fileURLToPath(import.meta.url));
  const dbFile = process.env.NEXUS_DB || path.join(root, "db.local.json");
  if (!fs.existsSync(dbFile))
    fs.copyFileSync(path.join(root, "db.json"), dbFile);
  createApi(dbFile).listen(
    Number(process.env.API_PORT || 3001),
    "127.0.0.1",
    () =>
      console.log(
        "API NEXUS: http://127.0.0.1:" +
          (process.env.API_PORT || 3001) +
          "/api/products",
      ),
  );
}
