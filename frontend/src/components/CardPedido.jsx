import React from "react";
import { getImagenUrl } from "../api";

export default function CardPedido({ pedido, onFinalizar, onCancelar }) {
  const { reserva, vehiculo, cliente } = pedido;

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderEstrellas = (calificacion) => {
    if (calificacion === null || calificacion === undefined) {
      return <span className="sin-calificacion">Sin calificación</span>;
    }

    return (
      <div className="card-pedido-calificacion">
        <div className="calificacion-estrellas">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={`star ${calificacion >= i + 1 ? 'filled' : ''}`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="calificacion-numero">({calificacion.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="card-pedido">
      <img 
        src={getImagenUrl(vehiculo.imagen_url)} 
        alt={vehiculo.modelo}
        className="card-pedido-imagen"
      />
      
      <div className="card-pedido-content">
        <h3 className="card-pedido-titulo">
          {vehiculo.modelo} ({vehiculo.ano_modelo})
        </h3>
        
        <p className="card-pedido-subtitulo">
          {vehiculo.tipo_vehiculo}
        </p>
        
        <div className="card-pedido-info">
          <div className="card-pedido-info-item">
            <span className="card-pedido-info-label">Placa:</span>
            <span>{vehiculo.placa}</span>
          </div>
          <div className="card-pedido-info-item">
            <span className="card-pedido-info-label">Inicio:</span>
            <span>{formatearFecha(reserva.fecha_inicio)}</span>
          </div>
          <div className="card-pedido-info-item">
            <span className="card-pedido-info-label">Fin:</span>
            <span>{formatearFecha(reserva.fecha_fin)}</span>
          </div>
        </div>

        <div className="card-pedido-estado">
          <span className="card-pedido-info-label">Estado:</span>
          <span className={`estado-badge ${reserva.estado_reserva}`}>
            {reserva.estado_reserva}
          </span>
        </div>

        <div className="card-pedido-cliente">
          <div className="cliente-nombre">{cliente.nombre}</div>
          <div className="cliente-contacto">{cliente.correo}</div>
          <div className="cliente-contacto">{cliente.telefono}</div>
          {renderEstrellas(cliente.calificacion)}
        </div>

        <div style={{ fontSize: '0.85rem', color: '#666' }}>
          <div><strong>Origen:</strong> {reserva.direccion_inicio}</div>
          <div><strong>Destino:</strong> {reserva.direccion_destino}</div>
        </div>

        {reserva.estado_reserva === "activa" && (
          <div className="card-pedido-acciones">
            <button
              className="btn-accion danger"
              onClick={onCancelar}
            >
              Cancelar
            </button>
            <button
              className="btn-accion primary"
              onClick={onFinalizar}
            >
              Finalizar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}