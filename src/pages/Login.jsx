import React, { useState } from "react";
import { useStore } from "../Store";
import { Field } from "../components/Field";
export function Login() {
  const { session, login, logout } = useStore();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (session)
    return (
      <section className="panel p-5">
        <h1>Tu cuenta</h1>
        <p>Sesión iniciada como {session.user}.</p>
        <a
          className="btn btn-primary"
          href={session.role === "admin" ? "#/admin" : "#/productos"}
        >
          Continuar
        </a>
        <button className="btn btn-outline-light ms-2" onClick={logout}>
          Cerrar sesión
        </button>
      </section>
    );
  return (
    <div className="row justify-content-center">
      <div className="col-md-7 col-lg-5">
        <form
          className="panel p-4"
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            setBusy(true);
            try {
              if (!user.trim() || !password)
                throw Error("Completa usuario y contraseña.");
              const s = await login(user, password);
              location.hash = s.role === "admin" ? "#/admin" : "#/productos";
            } catch (err) {
              setError(err.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <p className="eyebrow">BIENVENIDO A NEXUS</p>
          <h1>Iniciar sesión</h1>
          <Field
            name="username"
            label="Usuario"
            value={user}
            autoComplete="username"
            onChange={(e) => setUser(e.target.value)}
          />
          <Field
            name="password"
            label="Contraseña"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label className="d-block mb-3">
            <input
              className="form-check-input me-2"
              type="checkbox"
              checked={show}
              onChange={(e) => setShow(e.target.checked)}
            />
            Mostrar contraseña
          </label>
          {error && (
            <p role="alert" className="text-danger">
              {error}
            </p>
          )}
          <button className="btn btn-primary w-100" disabled={busy}>
            {busy ? "Ingresando…" : "Ingresar"}
          </button>
          <p className="mt-3 mb-0 text-center">
            ¿Aún no tienes cuenta? <a href="#/registro">Regístrate</a>
          </p>
        </form>
      </div>
    </div>
  );
}
