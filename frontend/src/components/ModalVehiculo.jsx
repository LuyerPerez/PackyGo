import React from 'react';
import '../assets/ModalVehiculo.css';

const ModalVehiculo = ({ vehiculo, onClose }) => {
  if (!vehiculo) return null;

  const calificacion = vehiculo.calificacion ? Number(vehiculo.calificacion) : null;

  const handleReservar = () => {
    alert('¡Reserva realizada!');
  };

  const renderStars = (calificacion) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (calificacion >= i) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (calificacion > i - 1) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star">★</span>);
      }
    }
    return stars;
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="close-modal" onClick={onClose} aria-label="Cerrar modal">×</button>
        <img
          src={vehiculo.imagen_url}
          alt={`Imagen de ${vehiculo.modelo} (${vehiculo.ano_modelo})`}
          className="modal-img"
        />
        <div className="modal-info">
          <h1>{vehiculo.modelo} <span className="modal-ano">({vehiculo.ano_modelo})</span></h1>
          <h2 className="info-title">Información del vehículo</h2>
          <p><strong>Tipo:</strong> {vehiculo.tipo_vehiculo}</p>
          <p><strong>Placa:</strong> {vehiculo.placa}</p>
          <p><strong>Tarifa diaria:</strong> {
            new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(vehiculo.tarifa_diaria)
          }</p>
          <div className="rating">
            <strong>Calificación:</strong>&nbsp;
            {calificacion !== null
              ? <>
                  {renderStars(calificacion)}
                  <span className="promedio">({calificacion.toFixed(1)})</span>
                </>
              : <span className="no-rating">No tiene calificación</span>
            }
          </div>
          <button onClick={handleReservar} className="button-reservar">Reservar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalVehiculo;