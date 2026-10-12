export default function FirstPhaseSolvedPage() {
  return (
    <main className="phase-reward-page">
      <div className="ambient-gradient" />
      <div className="grain" />
      <section className="phase-reward-shell" aria-labelledby="phase-reward-title">
        <div className="phase-reward-copy">
          <p className="phase-reward-code">clave CR7 aceptada</p>
          <h2 id="phase-reward-title">Primera fase resuelta.</h2>
          <p>
            Esta puerta ya quedó abierta. La recompensa inicial es la primera medalla y el primer
            audio del archivo.
          </p>
          <a className="button button-primary" href="/">
            Volver al archivo
          </a>
        </div>

        <div className="phase-reward-artifact">
          <img alt="Primera medalla desbloqueada" src="/365-assets/medals/medal-1.png" />
          <div className="phase-audio">
            <span>Audio I</span>
            <audio controls preload="metadata" src="/365-assets/audio/phase-1.m4a">
              Tu navegador no puede reproducir este audio.
            </audio>
          </div>
        </div>
      </section>
    </main>
  );
}
