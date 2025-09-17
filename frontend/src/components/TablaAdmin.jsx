import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import "../assets/Administracion.css";

const TablaAdmin = ({
  titulo,
  columnas,
  datos = [],
  onCrear,
  onEditar,
  onEliminar,
  buscador = true,
}) => {
  const [busqueda, setBusqueda] = useState("");

  const datosFiltrados = datos.filter((item) =>
    columnas.some((col) =>
      String(item[col.key] || "")
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    )
  );

  const columnasTabla = columnas.filter(col => !col.formOnly);

  return (
    <div className="tabla-admin">
      <div className="tabla-admin-header">
        <h2 className="tabla-admin-titulo">{titulo}</h2>
        <button className="btn-crear" onClick={onCrear}>
          <FontAwesomeIcon icon={faPlus} /> Crear
        </button>
      </div>
      {buscador && (
        <div className="buscador">
          <FontAwesomeIcon icon={faSearch} className="buscador-icon" />
          <input
            type="text"
            className="buscador-input"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      )}
      <div className="tabla-scroll-wrapper">
        <table>
          <thead className="tabla-admin-thead">
            <tr className="tabla-admin-tr">
              {columnasTabla.map((col) => (
                <th className="tabla-admin-th" key={col.key}>{col.label}</th>
              ))}
              <th className="tabla-admin-th">Acciones</th>
            </tr>
          </thead>
          <tbody className="tabla-admin-tbody">
            {datosFiltrados.map((item) => (
              <tr className="tabla-admin-tr" key={item.id}>
                {columnasTabla.map((col) => (
                  <td className="tabla-admin-td" key={col.key}>
                    {col.key === "imagen_url" && item[col.key] ? (
                      <img
                        className="tabla-admin-img"
                        src={
                          item[col.key].startsWith("http")
                            ? item[col.key]
                            : `http://192.168.0.13:5000/uploads/${item[col.key].replace(/^.*[\\/]/, "")}`
                        }
                        alt="Vehículo"
                      />
                    ) : (
                      item[col.key]
                    )}
                  </td>
                ))}
                <td className="tabla-admin-td">
                  <button className="btn-editar" onClick={() => onEditar(item)}>
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button className="btn-eliminar" onClick={() => onEliminar(item)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaAdmin;