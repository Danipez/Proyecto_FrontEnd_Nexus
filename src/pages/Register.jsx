import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../Store";
import { validateRegister } from "../domain";
import { Field } from "../components/Field";
const empty = {
  name: "",
  user: "",
  email: "",
  password: "",
  confirm: "",
  consent: false,
};
export function Register() {
  const { session, register, logout } = useStore();
  const navigate = useNavigate();
  const [v, setV] = useState(empty);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  if (session)
    return (
      <section className="panel p-5">
        <h1>Ya tienes una sesión activa</h1>
        <p>Sesión iniciada como {session.user}.</p>
        <Link className="btn btn-primary" to="/productos">
          Ir al catálogo
        </Link>
        <button className="btn btn-outline-light ms-2" onClick={logout}>
          Cerrar sesión
        </button>
      </section>
    );
  const set = (key, value) => {
    setV({ ...v, [key]: value });
    setFormError("");
  };
  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <form
          className="panel p-4"
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            const next = validateRegister(v);
            setErrors(next);
            // En el cliente no se conocen los usuarios existentes; eso lo valida el servidor.
            if (Object.keys(next).length) return;
            setBusy(true);
            try {
              await register(v);
              navigate("/productos");
            } catch (err) {
              setFormError(err.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <p className="eyebrow">ÚNETE A NEXUS</p>
          <h1>Crear cuenta</h1>
          <Field
            name="name"
            label="Nombre completo"
            autoComplete="name"
            value={v.name}
            error={errors.name}
            onChange={(e) => set("name", e.target.value)}
          />
          <Field
            name="user"
            label="Usuario"
            autoComplete="username"
            value={v.user}
            error={errors.user}
            onChange={(e) => set("user", e.target.value)}
          />
          <Field
            name="email"
            label="Correo"
            type="email"
            autoComplete="email"
            value={v.email}
            error={errors.email}
            onChange={(e) => set("email", e.target.value)}
          />
          <Field
            name="password"
            label="Contraseña"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            value={v.password}
            error={errors.password}
            onChange={(e) => set("password", e.target.value)}
          />
          <Field
            name="confirm"
            label="Confirmar contraseña"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            value={v.confirm}
            error={errors.confirm}
            onChange={(e) => set("confirm", e.target.value)}
          />
          <label className="d-block mb-3">
            <input
              className="form-check-input me-2"
              type="checkbox"
              checked={show}
              onChange={(e) => setShow(e.target.checked)}
            />
            Mostrar contraseñas
          </label>
          <label className="d-block mb-2">
            <input
              className="form-check-input me-2"
              type="checkbox"
              name="consent"
              checked={v.consent}
              onChange={(e) => set("consent", e.target.checked)}
            />
            Acepto los términos y el tratamiento de mis datos
          </label>
          {errors.consent && (
            <p role="alert" className="text-danger">
              {errors.consent}
            </p>
          )}
          {formError && (
            <p role="alert" className="text-danger">
              {formError}
            </p>
          )}
          <button className="btn btn-primary w-100" disabled={busy}>
            {busy ? "Creando cuenta…" : "Registrarme"}
          </button>
          <p className="mt-3 mb-0 text-center">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
