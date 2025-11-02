import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faArrowLeft, faTruck, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import "../assets/NotFound.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-wrapper">
      <div className="notfound-container">
        <div className="notfound-icon-wrapper">
          <FontAwesomeIcon icon={faExclamationTriangle} className="notfound-icon" />
        </div>
        
        <h1 className="notfound-title">404</h1>
        <h2 className="notfound-subtitle">Página no encontrada</h2>
        <p className="notfound-message">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        
        <div className="notfound-illustration">
          <FontAwesomeIcon icon={faTruck} className="notfound-truck" />
          <div className="notfound-road"></div>
        </div>
        
        <div className="notfound-actions">
          <button onClick={() => navigate(-1)} className="notfound-btn notfound-btn-secondary">
            <FontAwesomeIcon icon={faArrowLeft} />
            Volver atrás
          </button>
          <a href="/" className="notfound-btn notfound-btn-primary">
            <FontAwesomeIcon icon={faHouse} />
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
