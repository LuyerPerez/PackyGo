import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faTruck,
  faClipboardList,
  faFlag,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import "../assets/Administracion.css";

const SideBar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
      >
        <FontAwesomeIcon icon={faBars} size="2x" />
      </button>
      <aside className={`sidebar${open ? " sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <FontAwesomeIcon icon={faClipboardList} size="2x" />
          <h2>Admin</h2>
          <button
            className="sidebar-close"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
        <nav>
          <ul>
            <li>
              <NavLink
                to="/administracion"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
                onClick={() => setOpen(false)}
              >
                <FontAwesomeIcon icon={faHome} /> Inicio
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/usuarios"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
                onClick={() => setOpen(false)}
              >
                <FontAwesomeIcon icon={faUser} /> Usuarios
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/vehiculos"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
                onClick={() => setOpen(false)}
              >
                <FontAwesomeIcon icon={faTruck} /> Vehículos
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/reservas"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
                onClick={() => setOpen(false)}
              >
                <FontAwesomeIcon icon={faClipboardList} /> Reservas
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/reportes"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
                onClick={() => setOpen(false)}
              >
                <FontAwesomeIcon icon={faFlag} /> Reportes
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      {open && (
        <div
          className="sidebar-backdrop"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default SideBar;