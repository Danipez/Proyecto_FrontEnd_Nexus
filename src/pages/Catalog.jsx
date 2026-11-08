import React, { useState } from "react";
import { categories, filterProducts } from "../domain";
import { useStore } from "../Store";
import { ProductCard } from "../components/ProductCard";
export function Catalog() {
  const { products, add } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
  const [error, setError] = useState("");
  const visible = filterProducts(products, query, category, sort);
  return (
    <>
      <p className="eyebrow">ENCUENTRA TU UPGRADE</p>
      <h1>Catálogo gaming</h1>
      <div className="row g-3 my-3">
        <div className="col-md-4">
          <label htmlFor="search" className="form-label">
            Buscar producto
          </label>
          <input
            id="search"
            className="form-control"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="col-sm-6 col-md-3">
          <label htmlFor="filter-category" className="form-label">
            Categoría
          </label>
          <select
            id="filter-category"
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="col-sm-6 col-md-3">
          <label htmlFor="sort" className="form-label">
            Ordenar
          </label>
          <select
            id="sort"
            className="form-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="">Destacados</option>
            <option value="asc">Menor precio</option>
            <option value="desc">Mayor precio</option>
          </select>
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <button
            className="btn btn-outline-light"
            onClick={() => {
              setQuery("");
              setCategory("");
              setSort("");
            }}
          >
            Limpiar
          </button>
        </div>
      </div>
      <p role="status">{visible.length} productos encontrados</p>
      {error && <p role="alert">{error}</p>}
      <div className="row g-4">
        {visible.map((p) => (
          <div className="col-sm-6 col-lg-4" key={p.id}>
            <ProductCard
              product={p}
              onAdd={(id) => {
                try {
                  add(id);
                  setError("");
                } catch (e) {
                  setError(e.message);
                }
              }}
            />
          </div>
        ))}
      </div>
      {!visible.length && (
        <p>No encontramos productos. Prueba otra búsqueda.</p>
      )}
    </>
  );
}
