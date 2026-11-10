import React, { useEffect, useState } from "react";
import {
  HashRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useStore } from "./Store";
import { Home } from "./pages/Home";
import { Catalog } from "./pages/Catalog";
import { Cart } from "./pages/Cart";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Contact } from "./pages/Contact";
import { Admin } from "./pages/Admin";
const routes = {
  "/": Home,
  "/productos": Catalog,
  "/carrito": Cart,
  "/login": Login,
  "/registro": Register,
  "/contacto": Contact,
  "/admin": Admin,
};
export function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
function AppContent() {
  const { pathname: path } = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const {
    cart,
    session,
    logout,
    message,
    setMessage,
    loading,
    connectionError,
    refresh,
  } = useStore();
  useEffect(() => {
    setExpanded(false);
    window.scrollTo(0, 0);
  }, [path]);
  useEffect(() => {
    document.title = `NEXUS Gaming · ${path === "/" ? "Inicio" : path.slice(1)}`;
  }, [path]);
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
          <Link className="navbar-brand fw-bold" to="/">
            NEXUS <span>GAMING</span>
          </Link>
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
                <Link
                  className={`nav-link ${path === url ? "active" : ""}`}
                  aria-current={path === url ? "page" : undefined}
                  key={url}
                  to={url}
                >
                  {text}
                </Link>
              ))}
              <Link className="nav-link" to="/carrito">
                Carrito{" "}
                <span className="badge text-bg-light">
                  {cart.reduce((n, i) => n + i.qty, 0)}
                </span>
              </Link>
              {session && (
                <button
                  className="btn btn-outline-light"
                  onClick={() => {
                    logout();
                    navigate("/");
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
        {loading ? (
          <p role="status">Cargando productos…</p>
        ) : connectionError ? (
          <section className="panel p-4" role="alert">
            <h1>No pudimos conectar con el catálogo</h1>
            <p>{connectionError}</p>
            <button className="btn btn-primary" onClick={refresh}>
              Reintentar conexión
            </button>
          </section>
        ) : (
          <Routes>
            {Object.entries(routes).map(([url, Page]) => (
              <Route key={url} path={url} element={<Page />} />
            ))}
            <Route
              path="*"
              element={
                <section>
                  <h1>Página no encontrada</h1>
                  <Link to="/">Volver al inicio</Link>
                </section>
              }
            />
          </Routes>
        )}
      </main>
      <footer className="border-top py-4">
        <div className="container d-flex flex-wrap gap-4 justify-content-between">
          <strong>NEXUS GAMING</strong>
          <span>Componentes para tu próxima partida.</span>
          <Link to="/contacto">Contacto</Link>
        </div>
      </footer>
    </>
  );
}
