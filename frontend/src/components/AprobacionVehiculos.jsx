import React, { useEffect, useState } from "react";
import { getImagenUrl } from "../api";
import api from "../api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCheck, 
  faTimes, 
  faEye, 
  faSearch,
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft,
  faAngleDoubleRight
} from "@fortawesome/free-solid-svg-icons";
import "../assets/Administracion.css";

function AprobacionVehiculos() {
  const [vehiculosPendientes, setVehiculosPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  useEffect(() => {
    cargarVehiculosPendientes();
  }, [reload]);

  useEffect(() => {
    setBusqueda("");
    setPaginaActual(1);
  }, [vehiculosPendientes]);

  const cargarVehiculosPendientes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/vehiculos-pendientes");
      setVehiculosPendientes(response.data.vehiculos || []);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar vehículos pendientes:", err);
      setError("Error al cargar vehículos pendientes.");
      setLoading(false);
    }
  };

  const handleAprobar = async (vehiculoId) => {
    if (window.confirm("¿Está seguro de aprobar este vehículo?")) {
      try {
        await api.put(`/vehiculos/${vehiculoId}/aprobar`);
        alert("Vehículo aprobado exitosamente.");
        setReload(!reload);
      } catch (err) {
        alert("Error al aprobar el vehículo: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleDenegar = async (vehiculoId) => {
    if (window.confirm("¿Está seguro de denegar este vehículo?")) {
      try {
        await api.put(`/vehiculos/${vehiculoId}/denegar`);
        alert("Vehículo denegado.");
        setReload(!reload);
      } catch (err) {
        alert("Error al denegar el vehículo: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const abrirDocumento = (url) => {
    if (url) {
      window.open(getImagenUrl(url), "_blank");
    } else {
      alert("No hay documento disponible.");
    }
  };

  // Filtrado y paginación
  const vehiculosFiltrados = vehiculosPendientes.filter((v) =>
    [
      v.tipo_vehiculo,
      v.placa,
      v.modelo,
      v.ano_modelo,
      v.conductor?.primer_nombre,
      v.conductor?.primer_apellido,
      v.conductor?.correo,
      v.conductor?.telefono,
    ]
      .filter(Boolean)
      .some((campo) =>
        String(campo).toLowerCase().includes(busqueda.toLowerCase())
      )
  );

  const totalPaginas = Math.ceil(vehiculosFiltrados.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const vehiculosPaginados = vehiculosFiltrados.slice(indiceInicio, indiceFin);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const cambiarItemsPorPagina = (nuevaCantidad) => {
    setItemsPorPagina(nuevaCantidad);
    setPaginaActual(1);
  };

  const generarNumerosPagina = () => {
    const numeros = [];
    const maxVisibles = 5;
    let inicio = Math.max(1, paginaActual - 2);
    let fin = Math.min(totalPaginas, inicio + maxVisibles - 1);

    if (fin - inicio < maxVisibles - 1) {
      inicio = Math.max(1, fin - maxVisibles + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      numeros.push(i);
    }

    return numeros;
  };

  return (
    <div className="tabla-admin">
      <div className="tabla-admin-header">
        <h2 style={{ margin: 0, color: "#0097a7" }}>
          Solicitudes de Vehículos
        </h2>
      </div>
      
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          Cargando solicitudes...
        </div>
      ) : error ? (
        <div style={{ color: "red", padding: "20px", textAlign: "center" }}>
          {error}
        </div>
      ) : vehiculosPendientes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          No hay vehículos pendientes de aprobación.
        </div>
      ) : (
        <>
          {/* Controles de búsqueda y paginación */}
          <div className="tabla-controles">
            <div className="buscador">
              <FontAwesomeIcon icon={faSearch} className="buscador-icon" />
              <input
                type="text"
                className="buscador-input"
                placeholder="Buscar por tipo, placa, modelo, propietario..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                title="Buscar en todos los campos"
              />
            </div>

            <div className="items-por-pagina">
              <label>Mostrar:</label>
              <select
                value={itemsPorPagina}
                onChange={(e) => cambiarItemsPorPagina(Number(e.target.value))}
                className="select-items-pagina"
                title="Seleccionar cantidad de elementos por página"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>elementos</span>
            </div>
          </div>

          <div className="tabla-info">
            <span>
              Mostrando {indiceInicio + 1} a {Math.min(indiceFin, vehiculosFiltrados.length)} de {vehiculosFiltrados.length} registros
              {busqueda && ` (filtrados de ${vehiculosPendientes.length} registros totales)`}
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            overflow: "hidden"
          }}>
            <thead>
              <tr style={{ backgroundColor: "#0097a7", color: "white" }}>
                <th style={{ padding: "12px", textAlign: "left", whiteSpace: "nowrap" }}>Tipo</th>
                <th style={{ padding: "12px", textAlign: "left", whiteSpace: "nowrap" }}>Placa</th>
                <th style={{ padding: "12px", textAlign: "left", whiteSpace: "nowrap" }}>Modelo</th>
                <th style={{ padding: "12px", textAlign: "left", whiteSpace: "nowrap" }}>Año</th>
                <th style={{ padding: "12px", textAlign: "left", whiteSpace: "nowrap" }}>Propietario</th>
                <th style={{ padding: "12px", textAlign: "left", whiteSpace: "nowrap" }}>Imagen</th>
                <th style={{ padding: "12px", textAlign: "left", whiteSpace: "nowrap" }}>Documentos</th>
                <th style={{ padding: "12px", textAlign: "center", whiteSpace: "nowrap" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                    {busqueda ? "No se encontraron resultados con ese criterio" : "No hay vehículos pendientes"}
                  </td>
                </tr>
              ) : (
                vehiculosPaginados.map((v, index) => (
                <tr key={v.id} style={{
                  borderBottom: "1px solid #eee",
                  backgroundColor: index % 2 === 0 ? "#fafafa" : "white"
                }}>
                  <td style={{ padding: "12px" }}>{v.tipo_vehiculo}</td>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>{v.placa}</td>
                  <td style={{ padding: "12px" }}>{v.modelo}</td>
                  <td style={{ padding: "12px" }}>{v.ano_modelo}</td>
                  <td style={{ padding: "12px" }}>
                    <div>
                      <strong>
                        {v.conductor.primer_nombre} {v.conductor.primer_apellido}
                      </strong>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        {v.conductor.correo}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        {v.conductor.telefono}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    {v.imagen_url ? (
                      <img
                        src={getImagenUrl(v.imagen_url)}
                        alt="vehículo"
                        style={{ width: "80px", borderRadius: "5px", cursor: "pointer" }}
                        onClick={() => abrirDocumento(v.imagen_url)}
                      />
                    ) : (
                      <span style={{ color: "#888" }}>Sin imagen</span>
                    )}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      <button
                        onClick={() => abrirDocumento(v.tarjeta_propiedad)}
                        disabled={!v.tarjeta_propiedad}
                        style={{
                          padding: "5px 10px",
                          fontSize: "11px",
                          cursor: v.tarjeta_propiedad ? "pointer" : "not-allowed",
                          backgroundColor: v.tarjeta_propiedad ? "#2196f3" : "#ccc",
                          color: "white",
                          border: "none",
                          borderRadius: "3px"
                        }}
                        title="Ver tarjeta de propiedad"
                      >
                        <FontAwesomeIcon icon={faEye} /> Tarjeta
                      </button>
                      <button
                        onClick={() => abrirDocumento(v.soat)}
                        disabled={!v.soat}
                        style={{
                          padding: "5px 10px",
                          fontSize: "11px",
                          cursor: v.soat ? "pointer" : "not-allowed",
                          backgroundColor: v.soat ? "#2196f3" : "#ccc",
                          color: "white",
                          border: "none",
                          borderRadius: "3px"
                        }}
                        title="Ver SOAT"
                      >
                        <FontAwesomeIcon icon={faEye} /> SOAT
                      </button>
                      <button
                        onClick={() => abrirDocumento(v.revision_tecnomecanica)}
                        disabled={!v.revision_tecnomecanica}
                        style={{
                          padding: "5px 10px",
                          fontSize: "11px",
                          cursor: v.revision_tecnomecanica ? "pointer" : "not-allowed",
                          backgroundColor: v.revision_tecnomecanica ? "#2196f3" : "#ccc",
                          color: "white",
                          border: "none",
                          borderRadius: "3px"
                        }}
                        title="Ver revisión técnico-mecánica"
                      >
                        <FontAwesomeIcon icon={faEye} /> Rev. Téc.
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button
                        onClick={() => handleAprobar(v.id)}
                        style={{
                          padding: "8px 15px",
                          backgroundColor: "#4caf50",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "bold"
                        }}
                        title="Aprobar vehículo"
                      >
                        <FontAwesomeIcon icon={faCheck} /> Aprobar
                      </button>
                      <button
                        onClick={() => handleDenegar(v.id)}
                        style={{
                          padding: "8px 15px",
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "bold"
                        }}
                        title="Denegar vehículo"
                      >
                        <FontAwesomeIcon icon={faTimes} /> Denegar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="paginacion">
            <div className="paginacion-controles">
              <button
                className="btn-paginacion"
                onClick={() => cambiarPagina(1)}
                disabled={paginaActual === 1}
                title="Ir a la primera página"
              >
                <FontAwesomeIcon icon={faAngleDoubleLeft} />
              </button>
              
              <button
                className="btn-paginacion"
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                title="Ir a la página anterior"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>

              <div className="numeros-pagina">
                {generarNumerosPagina().map(numero => (
                  <button
                    key={numero}
                    className={`btn-numero-pagina ${numero === paginaActual ? 'activo' : ''}`}
                    onClick={() => cambiarPagina(numero)}
                    title={`Ir a la página ${numero}`}
                  >
                    {numero}
                  </button>
                ))}
              </div>

              <button
                className="btn-paginacion"
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                title="Ir a la página siguiente"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>

              <button
                className="btn-paginacion"
                onClick={() => cambiarPagina(totalPaginas)}
                disabled={paginaActual === totalPaginas}
                title="Ir a la última página"
              >
                <FontAwesomeIcon icon={faAngleDoubleRight} />
              </button>
            </div>

            <div className="paginacion-info">
              Página {paginaActual} de {totalPaginas}
            </div>
          </div>
        )}
      </>
      )}
    </div>
  );
}

export default AprobacionVehiculos;
