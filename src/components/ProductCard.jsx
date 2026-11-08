import React from "react";
import { money, photo } from "../domain";
export function ProductCard({ product, onAdd }) {
  return (
    <article className="card h-100 product-card">
      <img
        className="card-img-top"
        src={photo(product)}
        alt={product.name}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "./assets/cpu.svg";
        }}
      />
      <div className="card-body d-flex flex-column">
        <span className="eyebrow">{product.category}</span>
        <h2 className="h5">{product.name}</h2>
        <p className="text-secondary">{product.description}</p>
        <p>{product.stock ? `Disponible · ${product.stock}` : "Agotado"}</p>
        <strong className="fs-4 mb-3">{money(product.price)}</strong>
        <button
          className="btn btn-primary mt-auto"
          disabled={!product.stock}
          onClick={() => onAdd(product.id)}
        >
          {product.stock ? "Agregar al carrito" : "Sin stock"}
        </button>
      </div>
    </article>
  );
}
