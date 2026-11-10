import React, { useRef, useState } from "react";
import { categories, photo, validateProduct } from "../domain";
import { readPhoto } from "../storage";
import { Field } from "./Field";
export function ProductForm({ product, products, onSave, onCancel }) {
  const [v, setV] = useState(
    product || {
      code: "",
      name: "",
      category: "Componentes",
      price: "",
      stock: "",
      active: true,
      image: "",
      description: "Producto del catálogo NEXUS",
    },
  );
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const request = useRef(0);
  const update = (e) => setV({ ...v, [e.target.name]: e.target.value });
  return (
    <form
      className="panel p-4 mb-4"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        const next = validateProduct(v, products);
        if (errors.image) next.image = errors.image;
        setErrors(next);
        if (Object.keys(next).length || loading || saving) return;
        setSaving(true);
        setFailure("");
        try {
          await onSave({
            ...v,
            code: v.code.trim().toUpperCase(),
            name: v.name.trim(),
            price: Number(v.price),
            stock: Number(v.stock),
          });
        } catch (err) {
          setFailure(err.message);
        } finally {
          setSaving(false);
        }
      }}
    >
      <h2 className="h4">{product ? "Editar producto" : "Nuevo producto"}</h2>
      <div className="row">
        <div className="col-md-6">
          <Field
            name="code"
            label="Código"
            value={v.code}
            onChange={update}
            error={errors.code}
          />
        </div>
        <div className="col-md-6">
          <Field
            name="name"
            label="Nombre"
            value={v.name}
            onChange={update}
            error={errors.name}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="category">
            Categoría
          </label>
          <select
            id="category"
            name="category"
            className="form-select"
            value={v.category}
            onChange={update}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <Field
            name="price"
            label="Precio CLP"
            type="number"
            value={v.price}
            onChange={update}
            error={errors.price}
          />
        </div>
        <div className="col-md-4">
          <Field
            name="stock"
            label="Stock"
            type="number"
            value={v.stock}
            onChange={update}
            error={errors.stock}
          />
        </div>
      </div>
      <Field
        name="image"
        label="Imagen JPG PNG o WebP de hasta 1 MB"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        error={errors.image}
        onChange={async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const id = ++request.current;
          setLoading(true);
          try {
            const image = await readPhoto(file);
            if (id === request.current) {
              setV((prev) => ({ ...prev, image }));
              setErrors((prev) => ({ ...prev, image: "" }));
            }
          } catch (err) {
            if (id === request.current)
              setErrors((prev) => ({ ...prev, image: err.message }));
          } finally {
            if (id === request.current) setLoading(false);
          }
        }}
      />
      {v.image && (
        <img className="photo-preview" alt="Vista previa" src={photo(v)} />
      )}
      <button
        type="button"
        className="btn btn-outline-light ms-2"
        onClick={() => {
          request.current++;
          setLoading(false);
          setV({ ...v, image: "" });
          setErrors({ ...errors, image: "" });
        }}
      >
        Quitar imagen
      </button>
      <div className="form-check my-3">
        <input
          className="form-check-input"
          id="active"
          type="checkbox"
          checked={v.active}
          onChange={(e) => setV({ ...v, active: e.target.checked })}
        />
        <label className="form-check-label" htmlFor="active">
          Visible en el catálogo
        </label>
      </div>
      {failure && (
        <p role="alert" className="text-danger">
          {failure}
        </p>
      )}
      <button className="btn btn-primary" disabled={loading || saving}>
        {saving
          ? "Guardando…"
          : loading
            ? "Cargando imagen…"
            : "Guardar producto"}
      </button>
      <button
        type="button"
        className="btn btn-outline-light ms-2"
        onClick={() => {
          request.current++;
          onCancel();
        }}
      >
        Cancelar
      </button>
    </form>
  );
}
