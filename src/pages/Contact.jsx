import React, { useState } from "react";
import { validateContact } from "../domain";
import { Field } from "../components/Field";
export function Contact() {
  const [v, setV] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
    consent: false,
  });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  return (
    <div className="row justify-content-center">
      <section className="col-lg-8">
        <p className="eyebrow">HABLEMOS DE TU SETUP</p>
        <h1>Contacto</h1>
        <form
          className="panel p-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const next = validateContact(v);
            setErrors(next);
            setDone(!Object.keys(next).length);
          }}
        >
          {[
            ["name", "Nombre"],
            ["email", "Correo"],
            ["topic", "Asunto"],
            ["message", "Mensaje"],
          ].map(([key, label]) => (
            <Field
              key={key}
              name={key}
              label={label}
              as={key === "message" ? "textarea" : "input"}
              type={key === "email" ? "email" : undefined}
              value={v[key]}
              error={errors[key]}
              onChange={(e) => {
                setV({ ...v, [key]: e.target.value });
                setDone(false);
              }}
            />
          ))}
          <label className="mb-2">
            <input
              type="checkbox"
              className="form-check-input me-2"
              checked={v.consent}
              onChange={(e) => {
                setV({ ...v, consent: e.target.checked });
                setDone(false);
              }}
            />
            Autorizo la revisión de los datos ingresados
          </label>
          {errors.consent && (
            <p role="alert" className="text-danger">
              {errors.consent}
            </p>
          )}
          <div>
            <button className="btn btn-primary">Validar consulta</button>
          </div>
          {done && (
            <p role="status" className="mt-3">
              Consulta validada correctamente.
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
