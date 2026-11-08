import React, { useState } from "react";
import { useStore } from "../Store";
import { money, photo } from "../domain";
export function Receipt({ receipt }) {
  if (!receipt?.lines?.length) return null;
  return (
    <section className="panel p-4 mt-4">
      <h2>Última compra</h2>
      <p>
        Comprobante {receipt.id} ·{" "}
        {new Date(receipt.date).toLocaleString("es-CL")}
      </p>
      <div className="table-responsive">
        <table className="table">
          <caption>Detalle de productos comprados</caption>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Unidades</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {receipt.lines.map((i) => (
              <tr key={i.id}>
                <td>{i.name}</td>
                <td>{i.qty}</td>
                <td>{money(i.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <strong>Total {money(receipt.total)}</strong>
    </section>
  );
}
export function Cart() {
  const { products, cart, receipt, change, remove, checkout } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const act = (fn) => {
    try {
      fn();
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };
  const total = cart.reduce(
    (n, i) => n + i.qty * (products.find((p) => p.id === i.id)?.price || 0),
    0,
  );
  return (
    <>
      <h1>Tu carrito</h1>
      <div className="row g-4">
        <div className="col-lg-8">
          {!cart.length && (
            <div className="panel p-5">
              <h2 className="h4">Tu carrito está esperando un upgrade</h2>
              <a href="#/productos">Explorar catálogo</a>
            </div>
          )}
          {cart.map((i) => {
            const p = products.find((p) => p.id === i.id);
            if (!p) return null;
            return (
              <article
                key={i.id}
                className="panel p-3 mb-3 d-flex gap-3 flex-wrap"
              >
                <img className="cart-photo" src={photo(p)} alt={p.name} />
                <div className="flex-grow-1">
                  <h2 className="h5">{p.name}</h2>
                  <p>{money(p.price)} por unidad</p>
                  <div className="d-flex gap-3 align-items-center">
                    <button
                      className="btn btn-outline-light"
                      aria-label={`Restar ${p.name}`}
                      disabled={i.qty === 1 || busy}
                      onClick={() => act(() => change(i.id, i.qty - 1))}
                    >
                      −
                    </button>
                    <span>{i.qty}</span>
                    <button
                      className="btn btn-outline-light"
                      aria-label={`Sumar ${p.name}`}
                      disabled={i.qty >= p.stock || busy}
                      onClick={() => act(() => change(i.id, i.qty + 1))}
                    >
                      +
                    </button>
                    <button
                      className="btn btn-link"
                      disabled={busy}
                      onClick={() => act(() => remove(i.id))}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <strong>{money(i.qty * p.price)}</strong>
              </article>
            );
          })}
        </div>
        <aside className="col-lg-4">
          <div className="panel p-4">
            <h2 className="h4">Resumen</h2>
            <p>{cart.reduce((n, i) => n + i.qty, 0)} unidades</p>
            <p className="fs-3 fw-bold">{money(total)}</p>
            <button
              className="btn btn-primary w-100"
              disabled={!cart.length || busy}
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  await checkout();
                } catch (e) {
                  setError(e.message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Procesando…" : "Confirmar compra"}
            </button>
            {error && (
              <p className="text-danger mt-3" role="alert">
                {error}
              </p>
            )}
          </div>
        </aside>
      </div>
      <Receipt receipt={receipt} />
    </>
  );
}
