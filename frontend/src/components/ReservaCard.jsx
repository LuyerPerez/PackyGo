import { useEffect, useState } from "react";
import { obtenerTodosLosVehiculos, cancelarReserva } from "../api";
import { getImagenUrl } from "../api"; // o "../utils"
import ModalCalificarVehiculo from "./ModalCalificarVehiculo"; // crea este componente abajo

export default function ReservaCard({ reserva, onCancel, onCalificar, yaCalificadoProp }) {
  const [vehiculo, setVehiculo] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const [calificando, setCalificando] = useState(false);
  // Solo usar la prop yaCalificadoProp, el padre controla el estado
  const yaCalifico = !!yaCalificadoProp;
  const handleCalificadoLocal = () => {};

  useEffect(() => {
    let mounted = true;
    obtenerTodosLosVehiculos().then(vehiculos => {
      const v = vehiculos.find(v => v.id === reserva.vehiculo_id);
      if (mounted) setVehiculo(v);
    });

    return () => { mounted = false; };
  }, [reserva.vehiculo_id, reserva.id, reserva.estado_reserva, yaCalificadoProp]);

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
            <img
              src={getImagenUrl(vehiculo.imagen_url)}
              alt="Vehículo"
            />
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
          {reserva.total_pago !== undefined && reserva.total_pago !== null && (
            <div>
              <strong>Total pagado:</strong>{" "}
              <span style={{ color: "#1b883a", fontWeight: "bold" }}>
                {new Intl.NumberFormat('es-CO', { 
                  style: 'currency', 
                  currency: 'COP', 
                  minimumFractionDigits: 0, 
                  maximumFractionDigits: 0 
                }).format(reserva.total_pago)}
              </span>
            </div>
          )}
        </div>
        <div className="reserva-card-bottom">
          <span className={`reserva-card-estado-badge ${reserva.estado_reserva}`}>
            {reserva.estado_reserva}
          </span>
          {reserva.estado_reserva === "activa" && (
            <button
              className={`reserva-card-cancelar ${cancelando ? 'loading' : ''}`}
              onClick={handleCancelar}
              disabled={cancelando}
            >
              {cancelando ? (
                <>
                  <span className="btn-spinner"></span>
                  Cancelando...
                </>
              ) : (
                "Cancelar"
              )}
            </button>
          )}
          {/* Botón calificar solo si está finalizada y NO ha calificado (yaCalifico=false) */}
          {reserva.estado_reserva === "finalizada" && !yaCalifico ? (
            <button
              className={`reserva-card-calificar ${calificando ? 'loading' : ''}`}
              onClick={async () => {
                if (onCalificar) {
                  setCalificando(true);
                  try {
                    await onCalificar(reserva, handleCalificadoLocal);
                  } finally {
                    setCalificando(false);
                  }
                }
              }}
              disabled={calificando}
            >
              {calificando ? (
                <>
                  <span className="btn-spinner"></span>
                  Calificando...
                </>
              ) : (
                <>
                  ★ Calificar
                </>
              )}
            </button>
          ) : reserva.estado_reserva === "finalizada" && yaCalifico ? (
            <span className="reserva-card-calificado">
              ★ Calificado
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}