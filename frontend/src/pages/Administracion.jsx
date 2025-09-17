import React from "react";
import SideBar from "../components/SideBar";
import { Link } from "react-router-dom";
import "../assets/Administracion.css";

const Administracion = () => (
  <div>
    <SideBar />
    <div className="tabla-admin">
      <h2>Panel de Administración</h2>
      <div
        style={{
          display: "flex",
          gap: "2rem",
          flexWrap: "wrap",
          marginTop: "2rem",
        }}
      >
        <Link to="/admin/usuarios" className="admin-card">
          <h3>Usuarios</h3>
          <p>Gestiona los usuarios del sistema</p>
        </Link>
        <Link to="/admin/vehiculos" className="admin-card">
          <h3>Vehículos</h3>
          <p>Gestiona los vehículos registrados</p>
        </Link>
        <Link to="/admin/reservas" className="admin-card">
          <h3>Reservas</h3>
          <p>Consulta y administra reservas</p>
        </Link>
        <Link to="/admin/calificaciones-usuario" className="admin-card">
          <h3>Calificaciones Usuario</h3>
          <p>Revisa calificaciones de usuarios</p>
        </Link>
        <Link to="/admin/calificaciones-vehiculo" className="admin-card">
          <h3>Calificaciones Vehículo</h3>
          <p>Revisa calificaciones de vehículos</p>
        </Link>
        <Link to="/admin/reportes" className="admin-card">
          <h3>Reportes</h3>
          <p>Gestiona reportes del sistema</p>
        </Link>
        <Link to="/admin/notificaciones" className="admin-card">
          <h3>Notificaciones</h3>
          <p>Administra notificaciones</p>
        </Link>
      </div>
    </div>
  </div>
);

export default Administracion;