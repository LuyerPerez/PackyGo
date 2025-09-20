import React, { useEffect, useState } from "react";
import RegistroVehiculo from "./RegistroVehiculo";
import { obtenerVehiculosPorCamionero, eliminarVehiculo, getImagenUrl } from "../api";
import "./../assets/TableVehiculos.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

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
    const vehiculo = vehiculos.find(v => v.id === id);
    const identificador = vehiculo ? `${vehiculo.placa} (${vehiculo.modelo})` : `ID ${id}`;
    
    if (window.confirm(`¿Seguro que deseas eliminar el vehículo ${identificador}?`)) {
      try {
        await eliminarVehiculo(id);
        if (setReload) setReload((r) => !r);
      } catch (error) {
        alert("Error al eliminar el vehículo: " + error.message);
      }
    }
  };

  const obtenerIdentificadorVehiculo = (vehiculo) => {
    return `${vehiculo.placa} - ${vehiculo.modelo} (${vehiculo.ano_modelo})`;
  };

  return (
    <div className="table-container">
      <div className="table-header">
        <h2>Mis Vehículos</h2>
        <button 
          className="btn-crear" 
          onClick={handleOpen}
          title="Registrar un nuevo vehículo en tu flota"
        >
          <FontAwesomeIcon icon={faPlus} /> Registrar
        </button>
      </div>
      
      {loading ? (
        <div className="table-loader" title="Cargando información de tus vehículos...">
          Cargando vehículos...
        </div>
      ) : error ? (
        <div className="table-error" title="Ha ocurrido un error al cargar los datos">
          {error}
        </div>
      ) : vehiculos.length === 0 ? (
        <div className="table-empty" title="Puedes registrar tu primer vehículo haciendo clic en 'Registrar'">
          No tienes vehículos registrados.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="vehiculos-table">
            <thead>
              <tr>
                <th title="Tipo de vehículo registrado">Tipo</th>
                <th title="Placa de identificación del vehículo">Placa</th>
                <th title="Modelo y marca del vehículo">Modelo</th>
                <th title="Año de fabricación del vehículo">Año</th>
                <th title="Fotografía del vehículo">Imagen</th>
                <th title="Precio por día de alquiler">Tarifa diaria</th>
                <th title="Acciones disponibles para este vehículo">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v) => (
                <tr key={v.id}>
                  <td title={`Vehículo tipo: ${v.tipo_vehiculo}`}>
                    {v.tipo_vehiculo}
                  </td>
                  <td title={`Placa: ${v.placa}`}>
                    {v.placa}
                  </td>
                  <td title={`Modelo: ${v.modelo}`}>
                    {v.modelo}
                  </td>
                  <td title={`Año de fabricación: ${v.ano_modelo}`}>
                    {v.ano_modelo}
                  </td>
                  <td>
                    {v.imagen_url ? (
                      <img
                        src={getImagenUrl(v.imagen_url)}
                        alt="vehículo"
                        style={{ width: 100, borderRadius: 8 }}
                        title={`Imagen del vehículo ${v.placa} - ${v.modelo}`}
                      />
                    ) : (
                      <span 
                        style={{ color: "#888" }}
                        title="Este vehículo no tiene imagen registrada"
                      >
                        Sin imagen
                      </span>
                    )}
                  </td>
                  <td title={`Tarifa por día: $${v.tarifa_diaria.toLocaleString("es-CO")} COP`}>
                    ${v.tarifa_diaria.toLocaleString("es-CO", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    COP
                  </td>
                  <td>
                    <button
                      className="btn-accion-vehiculo btn-editar"
                      onClick={() => handleEdit(v)}
                      title={`Editar información de ${obtenerIdentificadorVehiculo(v)}`}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="btn-accion-vehiculo btn-eliminar"
                      onClick={() => handleDelete(v.id)}
                      title={`Eliminar ${obtenerIdentificadorVehiculo(v)} de tu flota`}
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
            <button 
              className="modal-close" 
              onClick={handleClose}
              title="Cerrar formulario"
            >
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