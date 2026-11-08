import React, { useState } from "react";
import { useStore } from "../Store";
import { ProductCard } from "../components/ProductCard";
import { VideoGuide } from "../components/VideoGuide";
export function Home() {
  const { products, add } = useStore();
  const [error, setError] = useState("");
  return (
    <>
      <section className="row g-0 hero overflow-hidden rounded">
        <div className="col-lg-6 p-4 p-md-5">
          <p className="eyebrow">HARDWARE DE ALTO RENDIMIENTO</p>
          <h1 className="display-3 fw-bold">
            Tu setup.
            <br />
            Tu mundo.
            <br />
            <span>Tu siguiente nivel.</span>
          </h1>
          <p className="my-4">
            Componentes, periféricos y consolas para jugar a tu manera.
          </p>
          <a className="btn btn-primary btn-lg" href="#/productos">
            Explorar catálogo ↗
          </a>
        </div>
        <div className="col-lg-6">
          <img
            className="hero-photo"
            src="./assets/photos/setup.jpg"
            alt="Setup gamer con iluminación violeta"
          />
        </div>
      </section>
      <section className="my-5">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <h2>Equipa tu siguiente nivel</h2>
          <a href="#/productos">Ver todos los productos ↗</a>
        </div>
        {error && <p role="alert">{error}</p>}
        <div className="row g-4">
          {products
            .filter((p) => p.active)
            .slice(0, 4)
            .map((p) => (
              <div className="col-sm-6 col-xl-3" key={p.id}>
                <ProductCard
                  product={p}
                  onAdd={(id) => {
                    try {
                      add(id);
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                />
              </div>
            ))}
        </div>
      </section>
      <VideoGuide />
    </>
  );
}
