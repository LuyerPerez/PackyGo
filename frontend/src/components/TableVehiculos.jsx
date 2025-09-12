import React, { useEffect, useState } from "react";
import RegistroVehiculo from "./RegistroVehiculo";
import { obtenerVehiculosPorCamionero, eliminarVehiculo } from "../api";
import "./../assets/TableVehiculos.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

function TableVehiculos({ reload, setReload }) {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editVehiculo, setEditVehiculo] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.rol !== "camionero") {
      setError("Debes iniciar sesión como camionero.");
      setLoading(false);
      return;
    }
    obtenerVehiculosPorCamionero(user.id)
      .then((res) => {
        setVehiculos(res.vehiculos || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar vehículos.");
        setLoading(false);
      });
  }, [reload, showModal]);

  const handleOpen = () => {
    setEditVehiculo(null);
    setShowModal(true);
  };
  const handleClose = () => setShowModal(false);

  const handleSuccess = () => {
    setShowModal(false);
    if (setReload) setReload((r) => !r);
  };

  const handleEdit = (vehiculo) => {
    setEditVehiculo(vehiculo);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este vehículo?")) {
      await eliminarVehiculo(id);
      if (setReload) setReload((r) => !r);
    }
  };

  return (
    <div className="table-container">
      <div className="table-header">
        <h2>Mis Vehículos</h2>
        <button className="btn-crear" onClick={handleOpen}>
          + Registrar
        </button>
      </div>
      {loading ? (
        <div className="table-loader">Cargando vehículos...</div>
      ) : error ? (
        <div className="table-error">{error}</div>
      ) : vehiculos.length === 0 ? (
        <div className="table-empty">No tienes vehículos registrados.</div>
      ) : (
        <div className="table-responsive">
          <table className="vehiculos-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Placa</th>
                <th>Modelo</th>
                <th>Año</th>
                <th>Imagen</th>
                <th>Tarifa diaria</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v) => (
                <tr key={v.id}>
                  <td>{v.tipo_vehiculo}</td>
                  <td>{v.placa}</td>
                  <td>{v.modelo}</td>
                  <td>{v.ano_modelo}</td>
                  <td>
                    {v.imagen_url ? (
                      <img
                        src={v.imagen_url}
                        alt="vehículo"
                        style={{ width: 100, borderRadius: 8 }}
                      />
                    ) : (
                      <span style={{ color: "#888" }}>Sin imagen</span>
                    )}
                  </td>
                  <td>
                    ${v.tarifa_diaria.toLocaleString("es-CO", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    COP
                  </td>
                  <td>
                    <button
                      className="btn-accion"
                      style={{ marginRight: 8 }}
                      onClick={() => handleEdit(v)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="btn-accion btn-eliminar"
                      onClick={() => handleDelete(v.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div className="modal-bg" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleClose}>
              ×
            </button>
            <RegistroVehiculo
              onSuccess={handleSuccess}
              editVehiculo={editVehiculo}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default TableVehiculos;