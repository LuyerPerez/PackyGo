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
        <h2>{titulo}</h2>
        <button className="btn-crear" onClick={onCrear} style={{ color: 'white' }}>
          <FontAwesomeIcon icon={faPlus} /> Crear
        </button>
      </div>
      {buscador && (
        <div className="buscador">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      )}
      <table>
        <thead>
          <tr>
            {columnasTabla.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {datosFiltrados.map((item) => (
            <tr key={item.id}>
              {columnasTabla.map((col) => (
                <td key={col.key}>
                  {col.key === "imagen_url" && item[col.key] ? (
                    <img
                      src={
                        item[col.key].startsWith("http")
                          ? item[col.key]
                          : `http://192.168.0.13:5000/uploads/${item[col.key].replace(/^.*[\\/]/, "")}`
                      }
                      alt="Vehículo"
                      style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 6 }}
                    />
                  ) : (
                    item[col.key]
                  )}
                </td>
              ))}
              <td>
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
  );
};

export default TablaAdmin;