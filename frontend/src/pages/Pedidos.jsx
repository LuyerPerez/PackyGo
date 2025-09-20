import React, { useEffect, useState } from "react";
import { obtenerPedidosCamionero, finalizarReserva, calificarCliente, cancelarReserva } from "../api";
import CardPedido from "../components/CardPedido";
import ModalCalificarUsuario from "../components/ModalCalificarUsuario";
import "../assets/Pedido.css";


const PEDIDOS_POR_PAGINA = 6;

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
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

  const pedidosFiltrados = pedidos.filter(p => {
    const cumpleEstado = filtroEstado === "" || p.reserva.estado_reserva === filtroEstado;
    const cumpleCliente = filtroCliente === "" || 
      p.cliente.nombre.toLowerCase().includes(filtroCliente.toLowerCase());
    
    let cumpleFechaInicio = true;
    
    if (filtroFechaInicio) {
      const fechaReserva = new Date(p.reserva.fecha_inicio);
      const fechaFiltro = new Date(filtroFechaInicio);
      cumpleFechaInicio = fechaReserva >= fechaFiltro;
    }

    return cumpleEstado && cumpleCliente && cumpleFechaInicio;
  });

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

  const limpiarFiltros = () => {
    setFiltroEstado("");
    setFiltroCliente("");
    setFiltroFechaInicio("");
  };

  const PedidosLoading = () => (
    <div className="pedidos-loading">
      <span className="pedidos-empty-icon" role="img" aria-label="Cargando">🚚</span>
      Cargando pedidos...
    </div>
  );

  const PedidosSinDatos = () => (
    <div className="pedidos-empty">
      <span className="pedidos-empty-icon" role="img" aria-label="Sin pedidos">📦</span>
      <div>No tienes reservas.</div>
      <div style={{fontSize: "1rem", color: "#1976d2", marginTop: 6}}>
        Cuando recibas reservas aparecerán aquí
      </div>
    </div>
  );

  // Función para cambiar página
  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPagina(nuevaPagina);
      // Scroll suave hacia arriba al cambiar página
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generar números de página visibles
  const generarPaginasVisibles = () => {
    const paginas = [];
    const maxPaginasVisibles = 5;
    
    if (totalPaginas <= maxPaginasVisibles) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Lógica para mostrar páginas con puntos suspensivos
      if (pagina <= 3) {
        // Mostrar: 1 2 3 4 ... última
        for (let i = 1; i <= 4; i++) {
          paginas.push(i);
        }
        if (totalPaginas > 4) {
          paginas.push('...');
          paginas.push(totalPaginas);
        }
      } else if (pagina >= totalPaginas - 2) {
        // Mostrar: 1 ... antepenúltima penúltima última
        paginas.push(1);
        if (totalPaginas > 4) {
          paginas.push('...');
        }
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) {
          if (i > 1) paginas.push(i);
        }
      } else {
        // Mostrar: 1 ... anterior actual siguiente ... última
        paginas.push(1);
        paginas.push('...');
        for (let i = pagina - 1; i <= pagina + 1; i++) {
          paginas.push(i);
        }
        paginas.push('...');
        paginas.push(totalPaginas);
      }
    }
    
    return paginas;
  };

  if (loading) return <PedidosLoading />;

  if (pedidos.length === 0) return <PedidosSinDatos />;

  return (
    <div className="pedidos-container">
      <h2 className="pedidos-title">Pedidos recibidos</h2>
      
      <div className="filtro-form">
        <label>
          Estado:
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="activa">Activa</option>
            <option value="cancelada">Cancelada</option>
            <option value="finalizada">Finalizada</option>
          </select>
        </label>
        
        <label>
          Cliente:
          <input
            type="text"
            placeholder="Buscar por nombre del cliente"
            value={filtroCliente}
            onChange={e => setFiltroCliente(e.target.value)}
          />
        </label>
        
        <label>
          Fecha desde:
          <input
            type="date"
            value={filtroFechaInicio}
            onChange={e => setFiltroFechaInicio(e.target.value)}
          />
        </label>
        
        <div className="filtro-acciones">
          <button
            type="button"
            className="btn-filtro secondary"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="pedidos-list">
        {pedidosPagina.length === 0 ? (
          <PedidosSinDatos />
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

      {totalPaginas <= 1 && pedidosFiltrados.length > 0 && (
        <div className="resultados-info-single">
          Mostrando {pedidosFiltrados.length} reserva{pedidosFiltrados.length !== 1 ? 's' : ''}
          {pedidosFiltrados.length !== pedidos.length && ` (filtradas de ${pedidos.length} total)`}
        </div>
      )}

      {/* Paginación mejorada con información de resultados */}
      {totalPaginas > 1 && (
        <div className="pagination-container">
          <div className="pagination">
            {/* Botón Anterior */}
            <button
              className="pagination-nav"
              onClick={() => cambiarPagina(pagina - 1)}
              disabled={pagina === 1}
              title="Página anterior"
            >
              ‹
            </button>

            {/* Números de página */}
            {generarPaginasVisibles().map((numeroPagina, index) => (
              <React.Fragment key={index}>
                {numeroPagina === '...' ? (
                  <span className="pagination-dots">...</span>
                ) : (
                  <button
                    className={pagina === numeroPagina ? "active" : ""}
                    onClick={() => cambiarPagina(numeroPagina)}
                  >
                    {numeroPagina}
                  </button>
                )}
              </React.Fragment>
            ))}

            {/* Botón Siguiente */}
            <button
              className="pagination-nav"
              onClick={() => cambiarPagina(pagina + 1)}
              disabled={pagina === totalPaginas}
              title="Página siguiente"
            >
              ›
            </button>
          </div>

          {/* Información de resultados movida aquí */}
          <div className="pagination-info-extended">
            <div className="pagination-info">
              Página {pagina} de {totalPaginas}
            </div>
            <div className="resultados-info-bottom">
              Mostrando {pedidosPagina.length} de {pedidosFiltrados.length} reservas
              {pedidosFiltrados.length !== pedidos.length && ` (filtradas de ${pedidos.length} total)`}
            </div>
          </div>
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