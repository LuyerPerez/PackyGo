import { useEffect, useState } from "react";
import { obtenerReservasPorUsuario, obtenerTodosLosVehiculos } from "../api";
import { obtenerCalificacionesVehiculoPorUsuario } from "../api";
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
  const [calificadas, setCalificadas] = useState({}); // { reservaId: true }
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todas");

  const [modalOpen, setModalOpen] = useState(false);
  const [reservaAcalificar, setReservaAcalificar] = useState(null);
  const [vehiculoAcalificar, setVehiculoAcalificar] = useState(null);

  useEffect(() => {
    // Soporta ambos formatos: 'usuario' y 'user'
    let usuario = null;
    const rawUsuario = localStorage.getItem("usuario");
    const rawUser = localStorage.getItem("user");
    if (rawUsuario) {
      const parsed = JSON.parse(rawUsuario);
      usuario = parsed.user ? parsed.user : parsed;
    } else if (rawUser) {
      usuario = JSON.parse(rawUser);
    }
    if (!usuario || !usuario.id) {
      setLoading(false);
      setReservas([]);
      return;
    }
    obtenerReservasPorUsuario(usuario.id)
      .then(async res => {
        setReservas(res);
        // Consultar calificaciones para reservas finalizadas
        const usuarioId = usuario.id;
        const promesas = res
          .filter(r => r.estado_reserva === "finalizada")
          .map(async r => {
            const calificaciones = await obtenerCalificacionesVehiculoPorUsuario({ usuario_id: usuarioId, vehiculo_id: r.vehiculo_id });
            const ya = Array.isArray(calificaciones) && calificaciones.some(c => c.reserva_id === r.id);
            return { id: r.id, ya };
          });
        const resultados = await Promise.all(promesas);
        const map = {};
        resultados.forEach(({ id, ya }) => { map[id] = ya; });
        setCalificadas(map);
      })
      .catch(err => {
        console.error(err);
        setReservas([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const reservasFiltradas =
    filtro === "todas"
      ? reservas
      : reservas.filter(r => r.estado_reserva === filtro);

  const handleAbrirModalCalificar = async (reserva, callbackLocal) => {
    const vehiculos = await obtenerTodosLosVehiculos();
    const vehiculo = vehiculos.find(v => v.id === reserva.vehiculo_id);
    setReservaAcalificar(reserva);
    setVehiculoAcalificar(vehiculo);
    setModalOpen(true);
    setCallbackLocal(() => callbackLocal);
  };

  // Nuevo estado para guardar el callback local
  const [callbackLocal, setCallbackLocal] = useState(null);

  const handleCalificado = () => {
    setModalOpen(false);
    setReservaAcalificar(null);
    setVehiculoAcalificar(null);
    if (callbackLocal) {
      callbackLocal(); // Actualiza el estado local de ReservaCard
      setCallbackLocal(null);
    }
    let usuario = null;
    const rawUsuario = localStorage.getItem("usuario");
    const rawUser = localStorage.getItem("user");
    if (rawUsuario) {
      const parsed = JSON.parse(rawUsuario);
      usuario = parsed.user ? parsed.user : parsed;
    } else if (rawUser) {
      usuario = JSON.parse(rawUser);
    }
    if (!usuario || !usuario.id) {
      setReservas([]);
      return;
    }
    obtenerReservasPorUsuario(usuario.id)
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
          calificadas={calificadas}
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