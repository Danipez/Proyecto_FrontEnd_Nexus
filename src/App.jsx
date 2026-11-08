import React, { useEffect, useState } from "react";
import { useStore } from "./Store";
import { Home } from "./pages/Home";
import { Catalog } from "./pages/Catalog";
import { Cart } from "./pages/Cart";
import { Login } from "./pages/Login";
import { Contact } from "./pages/Contact";
import { Admin } from "./pages/Admin";
const routes = {
  "/": Home,
  "/productos": Catalog,
  "/carrito": Cart,
  "/login": Login,
  "/contacto": Contact,
  "/admin": Admin,
};
export function App() {
  const [path, setPath] = useState(location.hash.slice(1) || "/");
  const [expanded, setExpanded] = useState(false);
  const { cart, session, logout, message, setMessage } = useStore();
  useEffect(() => {
    const change = () => {
      setPath(location.hash.slice(1) || "/");
      setExpanded(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    document.title = `NEXUS Gaming · ${path === "/" ? "Inicio" : path.slice(1)}`;
  }, [path]);
  const Page = routes[path];
  return (
    <>
      <a
        className="visually-hidden-focusable"
        href="#contenido"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("contenido").focus();
        }}
      >
        Saltar al contenido
      </a>
      <div className="announcement">TU PRÓXIMO NIVEL EMPIEZA AQUÍ</div>
      <header className="border-bottom">
        <nav
          className="navbar navbar-expand-lg navbar-dark container"
          aria-label="Principal"
        >
          <a className="navbar-brand fw-bold" href="#/">
            NEXUS <span>GAMING</span>
          </a>
          <button
            className="navbar-toggler"
            aria-label="Abrir menú"
            aria-expanded={expanded}
            aria-controls="navigation"
            onClick={() => setExpanded(!expanded)}
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div
            id="navigation"
            className={`collapse navbar-collapse ${expanded ? "show" : ""}`}
          >
            <div className="navbar-nav gap-lg-2 ms-auto">
              {[
                ["/", "Inicio"],
                ["/productos", "Catálogo"],
                ["/contacto", "Contacto"],
                ["/login", "Mi cuenta"],
                ...(session?.role === "admin"
                  ? [["/admin", "Administrar"]]
                  : []),
              ].map(([url, text]) => (
                <a
                  className={`nav-link ${path === url ? "active" : ""}`}
                  aria-current={path === url ? "page" : undefined}
                  key={url}
                  href={"#" + url}
                >
                  {text}
                </a>
              ))}
              <a className="nav-link" href="#/carrito">
                Carrito{" "}
                <span className="badge text-bg-light">
                  {cart.reduce((n, i) => n + i.qty, 0)}
                </span>
              </a>
              {session && (
                <button
                  className="btn btn-outline-light"
                  onClick={() => {
                    logout();
                    location.hash = "/";
                  }}
                >
                  Salir
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>
      <main id="contenido" tabIndex={-1} className="container py-5">
        {message && (
          <div
            className="alert alert-success d-flex justify-content-between"
            role="status"
          >
            {message}
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar aviso"
              onClick={() => setMessage("")}
            />
          </div>
        )}
        {Page ? (
          <Page />
        ) : (
          <section>
            <h1>Página no encontrada</h1>
            <a href="#/">Volver al inicio</a>
          </section>
        )}
      </main>
      <footer className="border-top py-4">
        <div className="container d-flex flex-wrap gap-4 justify-content-between">
          <strong>NEXUS GAMING</strong>
          <span>Componentes para tu próxima partida.</span>
          <a href="#/contacto">Contacto</a>
        </div>
      </footer>
    </>
  );
}
