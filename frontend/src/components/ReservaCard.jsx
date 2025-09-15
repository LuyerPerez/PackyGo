import { useEffect, useState } from "react";
import { obtenerTodosLosVehiculos, cancelarReserva, obtenerCalificacionesVehiculoPorUsuario } from "../api";
import { getImagenUrl } from "../api"; // o "../utils"
import ModalCalificarVehiculo from "./ModalCalificarVehiculo"; // crea este componente abajo

export default function ReservaCard({ reserva, onCancel, onCalificar }) {
  const [vehiculo, setVehiculo] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const [yaCalifico, setYaCalifico] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    obtenerTodosLosVehiculos().then(vehiculos => {
      const v = vehiculos.find(v => v.id === reserva.vehiculo_id);
      if (mounted) setVehiculo(v);
    });
    // Verificar si ya calificó este vehículo en esta reserva
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario && reserva.estado_reserva === "finalizada") {
      obtenerCalificacionesVehiculoPorUsuario({
        usuario_id: usuario.id,
        vehiculo_id: reserva.vehiculo_id
      }).then(calificaciones => {
        // Si alguna calificación tiene el mismo reserva_id, ya calificó
        const ya = calificaciones.some(c => c.reserva_id === reserva.id);
        setYaCalifico(ya);
      });
    }
    return () => { mounted = false; };
  }, [reserva.vehiculo_id, reserva.id, reserva.estado_reserva]);

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
          {/* Botón calificar solo si está finalizada y no ha calificado */}
          {reserva.estado_reserva === "finalizada" && !yaCalifico && (
            <button
              className="reserva-card-calificar"
              onClick={() => onCalificar(reserva)}
            >
              Calificar
            </button>
          )}
        </div>
      </div>
      <ModalCalificarVehiculo
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        vehiculo={vehiculo}
        reserva={reserva}
        onCalificado={() => {
          setYaCalifico(true);
          setModalOpen(false);
        }}
      />
    </div>
  );
}