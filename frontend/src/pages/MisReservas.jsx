import { useEffect, useState } from "react";
import { obtenerReservasPorCliente } from "../api";
import ListaReservas from "../components/ListaReservas";
import "./../assets/MisReservas.css";

const opcionesFiltro = [
  { label: "Todas", value: "todas" },
  { label: "Activas", value: "activa" },
  { label: "Canceladas", value: "cancelada" }
];

export default function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todas");

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
        <ListaReservas reservas={reservasFiltradas} />
      )}
    </div>
  );
}