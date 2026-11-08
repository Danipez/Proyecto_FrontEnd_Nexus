import React, { useRef, useState } from "react";
export function VideoGuide() {
  const ref = useRef(null);
  const [status, setStatus] = useState("Listo para reproducir");
  const [playing, setPlaying] = useState(false);
  return (
    <section className="row g-4 align-items-center my-5" id="guia-video">
      <div className="col-md-5">
        <p className="eyebrow">ANTES DE ARMAR TU PC</p>
        <h2>Conoce tus componentes</h2>
        <p>Una presentación breve de las piezas que dan vida a tu setup.</p>
      </div>
      <div className="col-md-7">
        <video
          ref={ref}
          className="w-100 rounded"
          controls
          playsInline
          preload="metadata"
          poster="./assets/photos/setup.jpg"
          onPlay={() => {
            setPlaying(true);
            setStatus("Reproduciendo");
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            ref.current.load();
            setPlaying(false);
            setStatus("Video finalizado");
          }}
          onError={() => setStatus("No se pudo cargar el video.")}
        >
          <source src="./assets/video/nexus-componentes.mp4" type="video/mp4" />
        </video>
        <button
          className="btn btn-outline-light mt-2"
          onClick={async () => {
            try {
              if (playing) ref.current.pause();
              else await ref.current.play();
            } catch {
              setStatus("Utiliza los controles del video.");
            }
          }}
        >
          {playing ? "Pausar" : "Reproducir video"}
        </button>
        <span className="ms-3" role="status">
          {status}
        </span>
      </div>
    </section>
  );
}
