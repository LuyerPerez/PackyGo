import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEdit, 
  faTrash, 
  faPlus, 
  faSearch, 
  faChevronLeft, 
  faChevronRight,
  faAngleDoubleLeft,
  faAngleDoubleRight
} from "@fortawesome/free-solid-svg-icons";
import "../assets/Administracion.css";
import { getImagenUrl } from "../api";

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
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  const datosFiltrados = datos.filter((item) =>
    columnas.some((col) =>
      String(item[col.key] || "")
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    )
  );

  const totalPaginas = Math.ceil(datosFiltrados.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const datosPaginados = datosFiltrados.slice(indiceInicio, indiceFin);

  const columnasTabla = columnas.filter(col => !col.formOnly);

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

  const obtenerNombreElemento = (item) => {
    if (item.nombre) return item.nombre;
    if (item.correo) return item.correo;
    if (item.placa) return item.placa;
    if (item.modelo) return item.modelo;
    return `ID ${item.id}`;
  };

  React.useEffect(() => {
    setBusqueda("");
    setPaginaActual(1);
  }, [datos]);

  return (
    <div className="tabla-admin">
      <div className="tabla-admin-header">
        <h2 className="tabla-admin-titulo">{titulo}</h2>
        <button className="btn-crear" onClick={onCrear} title={`Crear nuevo ${titulo.slice(0, -1).toLowerCase()}`}>
          <FontAwesomeIcon icon={faPlus} /> Crear
        </button>
      </div>

      <div className="tabla-controles">
        {buscador && (
          <div className="buscador">
            <FontAwesomeIcon icon={faSearch} className="buscador-icon" />
            <input
              type="text"
              className="buscador-input"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              title="Buscar en todos los campos de la tabla"
            />
          </div>
        )}

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
            <option value={100}>100</option>
          </select>
          <span>elementos</span>
        </div>
      </div>

      <div className="tabla-info">
        <span>
          Mostrando {indiceInicio + 1} a {Math.min(indiceFin, datosFiltrados.length)} de {datosFiltrados.length} registros
          {busqueda && ` (filtrados de ${datos.length} registros totales)`}
        </span>
      </div>

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
            {datosPaginados.length === 0 ? (
              <tr>
                <td colSpan={columnasTabla.length + 1} className="tabla-vacia">
                  {busqueda ? "No se encontraron resultados" : "No hay datos para mostrar"}
                </td>
              </tr>
            ) : (
              datosPaginados.map((item) => (
                <tr className="tabla-admin-tr" key={item.id}>
                  {columnasTabla.map((col) => (
                    <td className="tabla-admin-td" key={col.key}>
                      {col.key === "imagen_url" && item[col.key] ? (
                        <img
                          className="tabla-admin-img"
                          src={getImagenUrl(item[col.key])}
                          alt="Vehículo"
                          title="Imagen del vehículo"
                        />
                      ) : (
                        item[col.key]
                      )}
                    </td>
                  ))}
                  <td className="tabla-admin-td">
                    <button 
                      className="btn-editar" 
                      onClick={() => onEditar(item)}
                      title={`Editar ${obtenerNombreElemento(item)}`}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="btn-eliminar" 
                      onClick={() => onEliminar(item)}
                      title={`Eliminar ${obtenerNombreElemento(item)}`}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
    </div>
  );
};

export default TablaAdmin;