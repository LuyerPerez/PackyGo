import "../assets/NotFound.css";

export default function NotFound() {
  return (
    <div className="notfound-container">
      <h1 className="notfound-title">404</h1>
      <p className="notfound-message">Página no encontrada</p>
      <a className="notfound-link" href="/">Volver al inicio</a>
    </div>
  );
}
