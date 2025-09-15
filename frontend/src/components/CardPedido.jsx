import React from "react";
import { getImagenUrl } from "../api";

export default function CardPedido({ pedido, onFinalizar, onCancelar }) {
  const { reserva, vehiculo, cliente } = pedido;

  const estadoClass = {
    activa: "estado-activa",
    cancelada: "estado-cancelada",
    finalizada: "estado-finalizada"
  }[reserva.estado_reserva] || "";

  return (
    <div className="card-pedido">
      <div>
        <img src={getImagenUrl(vehiculo.imagen_url)} alt={vehiculo.modelo} />
        <h3>{vehiculo.modelo} ({vehiculo.ano_modelo})</h3>
        <p><b>Tipo:</b> {vehiculo.tipo_vehiculo}</p>
        <p><b>Placa:</b> {vehiculo.placa}</p>
      </div>
      <div>
        <p><b>Reserva:</b></p>
        <p>Inicio: {new Date(reserva.fecha_inicio).toLocaleString()}</p>
        <p>Fin: {new Date(reserva.fecha_fin).toLocaleString()}</p>
        <p>Origen: {reserva.direccion_inicio}</p>
        <p>Destino: {reserva.direccion_destino}</p>
        <p>
          Estado:{" "}
          <span className={estadoClass}>
            {reserva.estado_reserva.charAt(0).toUpperCase() + reserva.estado_reserva.slice(1)}
          </span>
        </p>
      </div>
      <div>
        <p><b>Cliente:</b></p>
        <p>Nombre: {cliente.nombre}</p>
        <p>Correo: {cliente.correo}</p>
        <p>Teléfono: {cliente.telefono}</p>
        <p className="calificacion">
          Calificación:{" "}
          {cliente.calificacion !== null && cliente.calificacion !== undefined
            ? <>
                {Array.from({ length: 5 }, (_, i) => {
                  const val = cliente.calificacion;
                  if (val >= i + 1) {
                    return <span key={i} className="star filled">★</span>;
                  } else if (val > i) {
                    return <span key={i} className="star half">★</span>;
                  } else {
                    return <span key={i} className="star">★</span>;
                  }
                })}
                <span className="promedio">({cliente.calificacion.toFixed(1)})</span>
              </>
            : <span className="sin-calificacion">No tiene calificación</span>
          }
        </p>
        {reserva.estado_reserva === "activa" && (
          <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
            <button
              className="btn-finalizar"
              onClick={onFinalizar}
            >
              Finalizar
            </button>
            <button
              className="btn-cancelar"
              onClick={onCancelar}
            >
              Cancelar reserva
            </button>
          </div>
        )}
      </div>
    </div>
  );
}