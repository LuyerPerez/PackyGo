import { useEffect, useState } from "react";
import { obtenerTodosLosVehiculos, cancelarReserva } from "../api";

export default function ReservaCard({ reserva, onCancel }) {
  const [vehiculo, setVehiculo] = useState(null);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    let mounted = true;
    obtenerTodosLosVehiculos().then(vehiculos => {
      const v = vehiculos.find(v => v.id === reserva.vehiculo_id);
      if (mounted) setVehiculo(v);
    });
    return () => { mounted = false; };
  }, [reserva.vehiculo_id]);

  const handleCancelar = async () => {
    if (!window.confirm("¿Seguro que deseas cancelar esta reserva?")) return;
    setCancelando(true);
    try {
      await cancelarReserva(reserva.id);
      onCancel && onCancel(reserva.id);
    } finally {
      setCancelando(false);
    }
  };

  return (
    <div className="reserva-card">
      <div className="reserva-card-left">
        <div className="reserva-card-header-img">
          {vehiculo?.imagen_url ? (
            <img src={vehiculo.imagen_url} alt="Vehículo" />
          ) : (
            <div className="reserva-card-img-placeholder">Sin imagen</div>
          )}
        </div>
        <div className="reserva-card-header-info">
          <span className="reserva-card-vehiculo">
            <strong>{vehiculo?.modelo || "Vehículo"}</strong>{" "}
            <span className="reserva-card-ano">
              ({vehiculo?.ano_modelo || ""})
            </span>
          </span>
          <span className="reserva-card-placa">{vehiculo?.placa}</span>
        </div>
      </div>
      <div className="reserva-card-right">
        <div className="reserva-card-body">
          <div>
            <strong>Inicio:</strong> {new Date(reserva.fecha_inicio).toLocaleString()}
          </div>
          <div>
            <strong>Fin:</strong> {new Date(reserva.fecha_fin).toLocaleString()}
          </div>
          <div>
            <strong>Origen:</strong> {reserva.direccion_inicio}
          </div>
          <div>
            <strong>Destino:</strong> {reserva.direccion_destino}
          </div>
        </div>
        <div className="reserva-card-bottom">
          <span className={`reserva-card-estado-badge ${reserva.estado_reserva}`}>
            {reserva.estado_reserva}
          </span>
          {reserva.estado_reserva === "activa" && (
            <button
              className="reserva-card-cancelar"
              onClick={handleCancelar}
              disabled={cancelando}
            >
              {cancelando ? "Cancelando..." : "Cancelar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}