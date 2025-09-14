import React, { useEffect, useState } from "react";
import { obtenerPedidosCamionero, finalizarReserva, calificarCliente, cancelarReserva } from "../api";
import CardPedido from "../components/CardPedido";
import ModalCalificarUsuario from "../components/ModalCalificarUsuario";
import "../assets/Pedido.css";

const PEDIDOS_POR_PAGINA = 10;

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [pagina, setPagina] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [pedidoAcalificar, setPedidoAcalificar] = useState(null);
  const [calificando, setCalificando] = useState(false);

  useEffect(() => {
    recargarPedidos();
  }, []);

  const recargarPedidos = () => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.rol !== "camionero") return;
    obtenerPedidosCamionero(user.id)
      .then(setPedidos)
      .finally(() => setLoading(false));
  };

  const pedidosFiltrados = pedidos.filter(
    p =>
      (filtroEstado === "" || p.reserva.estado_reserva === filtroEstado) &&
      (filtroCliente === "" ||
        p.cliente.nombre
          .toLowerCase()
          .includes(filtroCliente.toLowerCase()))
  );

  const totalPaginas = Math.ceil(pedidosFiltrados.length / PEDIDOS_POR_PAGINA);
  const pedidosPagina = pedidosFiltrados.slice(
    (pagina - 1) * PEDIDOS_POR_PAGINA,
    pagina * PEDIDOS_POR_PAGINA
  );

  useEffect(() => {
    setPagina(1);
  }, [filtroEstado, filtroCliente]);

  const abrirModalCalificar = (pedido) => {
    setPedidoAcalificar(pedido);
    setModalOpen(true);
  };

  const handleEnviarCalificacion = async (estrellas, comentario) => {
    if (!pedidoAcalificar) return;
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Debes iniciar sesión nuevamente.");
      return;
    }
    setCalificando(true);
    try {
      await finalizarReserva(pedidoAcalificar.reserva.id);
      await calificarCliente({
        usuario_destino_id: pedidoAcalificar.cliente.id,
        usuario_origen_id: user.id,
        estrellas,
        comentario
      });
      setModalOpen(false);
      setPedidoAcalificar(null);
      recargarPedidos();
    } catch (e) {
      console.error(e);
      alert("Error al finalizar/calificar");
    }
    setCalificando(false);
  };

  const handleCancelarReserva = async (pedido) => {
    if (!window.confirm("¿Seguro que deseas cancelar la reserva?")) return;
    setLoading(true);
    try {
      await cancelarReserva(pedido.reserva.id);
      recargarPedidos();
    } catch (e) {
      console.error(e);
      alert("Error al cancelar la reserva");
    }
    setLoading(false);
  };

  if (loading) return <div>Cargando pedidos...</div>;
  if (pedidos.length === 0) return <div>No tienes pedidos.</div>;

  return (
    <div className="pedidos-container">
      <h2 className="pedidos-title">Pedidos recibidos</h2>
      <form
        className="filtro-form"
        style={{
          marginBottom: 20,
          display: "flex",
          gap: 16,
          alignItems: "center"
        }}
      >
        <label>
          Estado:
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="activa">Activa</option>
            <option value="cancelada">Cancelada</option>
            <option value="finalizada">Finalizada</option>
          </select>
        </label>
        <label>
          Cliente:
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={filtroCliente}
            onChange={e => setFiltroCliente(e.target.value)}
          />
        </label>
      </form>

      <div className="pedidos-list">
        {pedidosPagina.length === 0 ? (
          <div>No hay pedidos que coincidan con el filtro.</div>
        ) : (
          pedidosPagina.map(pedido => (
            <CardPedido
              key={pedido.reserva.id}
              pedido={pedido}
              onFinalizar={() => abrirModalCalificar(pedido)}
              onCancelar={() => handleCancelarReserva(pedido)}
            />
          ))
        )}
      </div>
      <br />
      {totalPaginas > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              className={pagina === i + 1 ? "active" : ""}
              onClick={e => {
                e.preventDefault();
                setPagina(i + 1);
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <ModalCalificarUsuario
        open={modalOpen}
        onClose={() => { setModalOpen(false); setPedidoAcalificar(null); }}
        onSubmit={handleEnviarCalificacion}
        nombreUsuario={pedidoAcalificar?.cliente?.nombre || ""}
        rol="cliente"
        loading={calificando}
      />
    </div>
  );
}