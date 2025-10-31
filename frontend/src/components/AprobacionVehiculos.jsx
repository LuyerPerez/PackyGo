import React, { useEffect, useState } from "react";
import { getImagenUrl } from "../api";
import api from "../api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faEye } from "@fortawesome/free-solid-svg-icons";

function AprobacionVehiculos() {
  const [vehiculosPendientes, setVehiculosPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(false);

  useEffect(() => {
    cargarVehiculosPendientes();
  }, [reload]);

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

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#1976d2" }}>
        Solicitudes de Vehículos Pendientes
      </h2>
      
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
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            overflow: "hidden"
          }}>
            <thead>
              <tr style={{ backgroundColor: "#1976d2", color: "white" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Tipo</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Placa</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Modelo</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Año</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Propietario</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Imagen</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Documentos</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculosPendientes.map((v, index) => (
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AprobacionVehiculos;
