import React from 'react';
import '../assets/CardVehiculo.css';
import { getImagenUrl } from "../api"; // o "../utils"

const CardVehiculo = ({ vehiculo, onShowModal }) => {
  let calificacion = vehiculo.calificacion;
  if (calificacion !== null && calificacion !== undefined) {
    calificacion = Number(calificacion);
  }

  const renderStars = (calificacion) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (calificacion >= i) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (calificacion > i - 1) {
        stars.push(
          <span key={i} className="star half">
            ★
          </span>
        );
      } else {
        stars.push(<span key={i} className="star">★</span>);
      }
    }
    return stars;
  };

  return (
    <div className="card-vehiculo">
      {vehiculo.imagen_url ? (
        <img
          src={getImagenUrl(vehiculo.imagen_url)}
          alt="Vehículo"
          className="vehiculo-imagen"
        />
      ) : (
        <div className="card-vehiculo-img-placeholder">Sin imagen</div>
      )}
      <div className="vehiculo-info">
        <h3>{vehiculo.modelo} <span className="vehiculo-ano">({vehiculo.ano_modelo})</span></h3>
        <p className="vehiculo-tipo">{vehiculo.tipo_vehiculo}</p>
        <p><strong>Placa:</strong> {vehiculo.placa}</p>
        <p><strong>Tarifa diaria:</strong> <span className="tarifa">
          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(vehiculo.tarifa_diaria)}
        </span>
        <span className="moneda"></span></p>
        <div className="rating">
          {calificacion !== null && calificacion !== undefined
            ? <>
                {renderStars(calificacion)}
                <span className="promedio">({calificacion.toFixed(1)})</span>
              </>
            : <span className="no-rating">No tiene calificación</span>
          }
        </div>
        <button className="button-more-info" onClick={() => onShowModal(vehiculo)}>
          Más información
        </button>
      </div>
    </div>
  );
};

export default CardVehiculo;