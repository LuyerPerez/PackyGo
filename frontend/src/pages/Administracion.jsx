import React, { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import { Link } from "react-router-dom";
import "../assets/Administracion.css";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, RadialLinearScale } from "chart.js";
import api from "../api";

// Importación de FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faCar,
  faClipboardList,
  faFileAlt,
  faChartBar,
  faChartPie,
  faUserCheck,
  faBell
} from "@fortawesome/free-solid-svg-icons";

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, RadialLinearScale);

const Administracion = () => {
  const [stats, setStats] = useState({
    usuarios: 0,
    vehiculos: 0,
    reservas: 0,
    reportes: 0,
    roles: { admin: 0, camionero: 0, cliente: 0 },
    reservasEstado: { activa: 0, cancelada: 0, finalizada: 0 }
  });

  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    async function fetchStats() {
      const usuariosRes = await api.get("/usuarios");
      const vehiculosRes = await api.get("/vehiculos");
      const reservasRes = await api.get("/reservas-todas");
      const reportesRes = await api.get("/reportes");
      const roles = { admin: 0, camionero: 0, cliente: 0 };
      (usuariosRes.data.usuarios || []).forEach(u => {
        if (roles[u.rol] !== undefined) roles[u.rol]++;
      });
      const reservasEstado = { activa: 0, cancelada: 0, finalizada: 0 };
      (reservasRes.data.reservas || []).forEach(r => {
        if (reservasEstado[r.estado_reserva] !== undefined) reservasEstado[r.estado_reserva]++;
      });
      setStats({
        usuarios: usuariosRes.data.usuarios.length,
        vehiculos: vehiculosRes.data.vehiculos.length,
        reservas: reservasRes.data.reservas.length,
        reportes: reportesRes.data.reportes.length,
        roles,
        reservasEstado
      });
    }
    fetchStats();
  }, []);

  // Porcentajes usuarios por rol
  const totalUsuarios = stats.usuarios || 1;
  const adminPct = Math.round((stats.roles.admin / totalUsuarios) * 100);
  const camioneroPct = Math.round((stats.roles.camionero / totalUsuarios) * 100);
  const clientePct = Math.round((stats.roles.cliente / totalUsuarios) * 100);

  // Porcentajes reservas por estado
  const totalReservas = stats.reservas || 1;
  const activaPct = Math.round((stats.reservasEstado.activa / totalReservas) * 100);
  const canceladaPct = Math.round((stats.reservasEstado.cancelada / totalReservas) * 100);
  const finalizadaPct = Math.round((stats.reservasEstado.finalizada / totalReservas) * 100);

  const rolesData = {
    labels: ["Admin", "Camionero", "Cliente"],
    datasets: [
      {
        label: "Usuarios por rol",
        data: [stats.roles.admin, stats.roles.camionero, stats.roles.cliente],
        backgroundColor: ["#1976d2", "#0097a7", "#42a5f5"],
        borderWidth: 1,
      },
    ],
  };

  const reservasEstadoData = {
    labels: ["Activa", "Cancelada", "Finalizada"],
    datasets: [
      {
        label: "Reservas por estado",
        data: [
          stats.reservasEstado.activa,
          stats.reservasEstado.cancelada,
          stats.reservasEstado.finalizada,
        ],
        backgroundColor: ["#43a047", "#e53935", "#fbc02d"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <SideBar />
      <div className="admin-dashboard-bg">
        <div className="admin-dashboard-panel">
          <div className="admin-dashboard-header">
            <h2>Panel de Administración</h2>
            <div className="buscador">
              <input
                type="text"
                placeholder="Buscar en el panel..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
              <span className="admin-dashboard-user">
                <FontAwesomeIcon icon={faUserCheck} /> Admin
              </span>
            </div>
          </div>
          <div className="admin-dashboard-main">
            <div className="admin-dashboard-center">
              {/* Título KPIs */}
              <h3 className="panel-section-title">
                <FontAwesomeIcon icon={faChartBar} style={{ marginRight: "8px" }} />
                Indicadores principales
              </h3>
              <div className="admin-dashboard-kpis-grid">
                <div className="admin-dashboard-kpis-row">
                  <div className="admin-dashboard-kpi">
                    <FontAwesomeIcon icon={faUsers} className="kpi-icon" />
                    <span className="admin-dashboard-kpi-label">Usuarios</span>
                    <span className="admin-dashboard-kpi-value">{stats.usuarios}</span>
                    <div className="admin-dashboard-kpi-bar-group">
                      <div className="admin-dashboard-kpi-bar admin-dashboard-kpi-bar-admin" style={{ width: `${adminPct}%` }} />
                      <div className="admin-dashboard-kpi-bar admin-dashboard-kpi-bar-camionero" style={{ width: `${camioneroPct}%` }} />
                      <div className="admin-dashboard-kpi-bar admin-dashboard-kpi-bar-cliente" style={{ width: `${clientePct}%` }} />
                    </div>
                    <div className="admin-dashboard-kpi-pct-group">
                      <span className="admin-dashboard-kpi-pct admin-dashboard-kpi-pct-admin">Admin: {adminPct}%</span>
                      <span className="admin-dashboard-kpi-pct admin-dashboard-kpi-pct-camionero">Camionero: {camioneroPct}%</span>
                      <span className="admin-dashboard-kpi-pct admin-dashboard-kpi-pct-cliente">Cliente: {clientePct}%</span>
                    </div>
                  </div>
                  <div className="admin-dashboard-kpi">
                    <FontAwesomeIcon icon={faCar} className="kpi-icon" />
                    <span className="admin-dashboard-kpi-label">Vehículos</span>
                    <span className="admin-dashboard-kpi-value">{stats.vehiculos}</span>
                  </div>
                </div>
                <div className="admin-dashboard-kpis-row">
                  <div className="admin-dashboard-kpi">
                    <FontAwesomeIcon icon={faClipboardList} className="kpi-icon" />
                    <span className="admin-dashboard-kpi-label">Reservas</span>
                    <span className="admin-dashboard-kpi-value">{stats.reservas}</span>
                    <div className="admin-dashboard-kpi-bar-group">
                      <div className="admin-dashboard-kpi-bar admin-dashboard-kpi-bar-activa" style={{ width: `${activaPct}%` }} />
                      <div className="admin-dashboard-kpi-bar admin-dashboard-kpi-bar-cancelada" style={{ width: `${canceladaPct}%` }} />
                      <div className="admin-dashboard-kpi-bar admin-dashboard-kpi-bar-finalizada" style={{ width: `${finalizadaPct}%` }} />
                    </div>
                    <div className="admin-dashboard-kpi-pct-group">
                      <span className="admin-dashboard-kpi-pct admin-dashboard-kpi-pct-activa">Activas: {activaPct}%</span>
                      <span className="admin-dashboard-kpi-pct admin-dashboard-kpi-pct-cancelada">Canceladas: {canceladaPct}%</span>
                      <span className="admin-dashboard-kpi-pct admin-dashboard-kpi-pct-finalizada">Finalizadas: {finalizadaPct}%</span>
                    </div>
                  </div>
                  <div className="admin-dashboard-kpi">
                    <FontAwesomeIcon icon={faFileAlt} className="kpi-icon" />
                    <span className="admin-dashboard-kpi-label">Reportes</span>
                    <span className="admin-dashboard-kpi-value">{stats.reportes}</span>
                  </div>
                </div>
              </div>
              {/* Título Gráficas */}
              <h3 className="panel-section-title">
                <FontAwesomeIcon icon={faChartPie} style={{ marginRight: "8px" }} />
                Gráficas
              </h3>
              <div className="admin-dashboard-charts">
                <div className="admin-dashboard-chart">
                  <h4>
                    <FontAwesomeIcon icon={faChartBar} style={{ marginRight: "6px" }} />
                    Usuarios por rol
                  </h4>
                  <Bar data={rolesData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </div>
                <div className="admin-dashboard-chart">
                  <h4>
                    <FontAwesomeIcon icon={faChartPie} style={{ marginRight: "6px" }} />
                    Reservas por estado
                  </h4>
                  <Doughnut data={reservasEstadoData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
                </div>
              </div>
              {/* Título Navegación */}
              <h3 className="panel-section-title">
                <FontAwesomeIcon icon={faBell} style={{ marginRight: "8px" }} />
                Navegación rápida
              </h3>
              <div className="admin-dashboard-cards">
                <Link to="/admin/usuarios" className="admin-card">
                  <FontAwesomeIcon icon={faUsers} className="card-icon" />
                  <h3>Usuarios</h3>
                  <p>Gestiona los usuarios del sistema</p>
                </Link>
                <Link to="/admin/vehiculos" className="admin-card">
                  <FontAwesomeIcon icon={faCar} className="card-icon" />
                  <h3>Vehículos</h3>
                  <p>Gestiona los vehículos registrados</p>
                </Link>
                <Link to="/admin/reservas" className="admin-card">
                  <FontAwesomeIcon icon={faClipboardList} className="card-icon" />
                  <h3>Reservas</h3>
                  <p>Consulta y administra reservas</p>
                </Link>
                <Link to="/admin/reportes" className="admin-card">
                  <FontAwesomeIcon icon={faFileAlt} className="card-icon" />
                  <h3>Reportes</h3>
                  <p>Gestiona reportes del sistema</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Administracion;