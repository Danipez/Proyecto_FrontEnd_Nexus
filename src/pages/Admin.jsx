import React, { useState } from "react";
import { useStore } from "../Store";
import { money } from "../domain";
import { ProductForm } from "../components/ProductForm";
export function Admin() {
  const { session, products, saveProduct, deleteProduct } = useStore();
  const [editing, setEditing] = useState(undefined);
  const [error, setError] = useState("");
  if (session?.role !== "admin")
    return (
      <section className="panel p-5">
        <h1>Administración</h1>
        <p>
          Inicia sesión con una cuenta de administrador para gestionar
          productos.
        </p>
        <a href="#/login" className="btn btn-primary">
          Iniciar sesión
        </a>
      </section>
    );
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Inventario</h1>
        <button className="btn btn-primary" onClick={() => setEditing(null)}>
          Nuevo producto
        </button>
      </div>
      {editing !== undefined && (
        <ProductForm
          key={editing?.id || "new"}
          product={editing}
          products={products}
          onSave={async (p) => {
            await saveProduct(p);
            setEditing(undefined);
          }}
          onCancel={() => setEditing(undefined)}
        />
      )}
      {error && <p role="alert">{error}</p>}
      <div className="table-responsive panel p-3">
        <table className="table align-middle">
          <caption>Productos del inventario</caption>
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.code}</td>
                <td>{p.name}</td>
                <td>{money(p.price)}</td>
                <td>{p.stock}</td>
                <td>{p.active ? "Visible" : "Oculto"}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-light"
                      onClick={() => setEditing(p)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={async () => {
                        if (window.confirm(`¿Eliminar ${p.name}?`)) {
                          try {
                            await deleteProduct(p.id);
                            if (editing?.id === p.id) setEditing(undefined);
                          } catch (e) {
                            setError(e.message);
                          }
                        }
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!products.length && <p>No hay productos. Crea el primero.</p>}
      </div>
    </>
  );
}
