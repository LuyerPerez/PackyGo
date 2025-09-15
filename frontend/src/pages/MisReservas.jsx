import { useEffect, useState } from "react";
import { obtenerReservasPorCliente, obtenerTodosLosVehiculos } from "../api";
import ListaReservas from "../components/ListaReservas";
import ModalCalificarVehiculo from "../components/ModalCalificarVehiculo";
import "./../assets/MisReservas.css";

const opcionesFiltro = [
  { label: "Todas", value: "todas" },
  { label: "Activas", value: "activa" },
  { label: "Canceladas", value: "cancelada" },
  { label: "Finalizadas", value: "finalizada" }
];

export default function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todas");

  const [modalOpen, setModalOpen] = useState(false);
  const [reservaAcalificar, setReservaAcalificar] = useState(null);
  const [vehiculoAcalificar, setVehiculoAcalificar] = useState(null);

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) return;
    obtenerReservasPorCliente(usuario.id)
      .then(setReservas)
      .finally(() => setLoading(false));
  }, []);

  const reservasFiltradas =
    filtro === "todas"
      ? reservas
      : reservas.filter(r => r.estado_reserva === filtro);

  const handleAbrirModalCalificar = async (reserva) => {
    const vehiculos = await obtenerTodosLosVehiculos();
    const vehiculo = vehiculos.find(v => v.id === reserva.vehiculo_id);
    setReservaAcalificar(reserva);
    setVehiculoAcalificar(vehiculo);
    setModalOpen(true);
  };

  const handleCalificado = () => {
    setModalOpen(false);
    setReservaAcalificar(null);
    setVehiculoAcalificar(null);
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) return;
    obtenerReservasPorCliente(usuario.id)
      .then(setReservas);
  };

  return (
    <div className="mis-reservas-page">
      <h2>Mis Reservas</h2>
      <div className="filtro-reservas">
        {opcionesFiltro.map(op => (
          <button
            key={op.value}
            className={filtro === op.value ? "filtro-activo" : ""}
            onClick={() => setFiltro(op.value)}
          >
            {op.label}
          </button>
        ))}
      </div>
      {loading && <div className="reservas-loading">Cargando reservas...</div>}
      {!loading && reservasFiltradas.length === 0 && (
        <div className="reservas-vacio">No tienes reservas en este filtro.</div>
      )}
      {!loading && reservasFiltradas.length > 0 && (
        <ListaReservas
          reservas={reservasFiltradas}
          onCalificar={handleAbrirModalCalificar}
        />
      )}
      <ModalCalificarVehiculo
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        vehiculo={vehiculoAcalificar}
        reserva={reservaAcalificar}
        onCalificado={handleCalificado}
      />
    </div>
  );
}