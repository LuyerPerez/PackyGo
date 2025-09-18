import React, { useEffect, useState } from "react";
import "../assets/ReservaForm.css";
import { obtenerReservasPorVehiculo, getImagenUrl, debugReserva } from "../api";
import { useNavigate } from "react-router-dom";

function addHours(date, h) {
  const d = new Date(date);
  d.setHours(d.getHours() + h, 0, 0, 0);
  return d;
}

function formatHourOption(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function redondearHora(date) {
  const d = new Date(date);
  d.setMinutes(0, 0, 0);
  return d;
}

function isRangoOcupado(rangos, inicio, fin) {
  const ini = redondearHora(inicio);
  const f = redondearHora(fin);
  return rangos.some(r => {
    const rIni = redondearHora(new Date(r.fecha_inicio.replace(" ", "T")));
    const rFin = redondearHora(new Date(r.fecha_fin.replace(" ", "T")));
    return (
      (ini < rFin && f > rIni)
    );
  });
}

export default function Reserva() {
  const [vehiculo, setVehiculo] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [anio, setAnio] = useState("");
  const [mes, setMes] = useState("");
  const [dia, setDia] = useState("");
  const [hora, setHora] = useState("");
  const [direccionInicio, setDireccionInicio] = useState("");
  const [direccionDestino, setDireccionDestino] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mensajeTipo, setMensajeTipo] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // Eliminado debugInfo

  useEffect(() => {
    const v = localStorage.getItem("vehiculoSeleccionado");
    if (v) {
      setVehiculo(JSON.parse(v));
    } else {
      navigate("/explorar", { replace: true });
    }
    const u = localStorage.getItem("usuario");
    if (u) {
      const usuarioObj = JSON.parse(u);
      setUsuario(usuarioObj);
      console.log("Usuario cargado desde localStorage:", usuarioObj);
      console.log("Valor de usuario.user.id:", usuarioObj?.user?.id);
    } else {
      setUsuario(null);
      console.log("No hay usuario en localStorage");
    }
  }, [navigate]);

  useEffect(() => {
    if (vehiculo) {
      obtenerReservasPorVehiculo(vehiculo.id).then(setReservas);
    }
  }, [vehiculo]);

  const minDateObj = addHours(new Date(), 3);
  const maxDateObj = addHours(minDateObj, 24 * 365);

  const minYear = minDateObj.getFullYear();
  const maxYear = maxDateObj.getFullYear();
  const years = [];
  for (let y = minYear; y <= maxYear; y++) years.push(y);

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  let mesesDisponibles = [];
  if (anio) {
    const startMonth = (Number(anio) === minDateObj.getFullYear()) ? minDateObj.getMonth() : 0;
    for (let i = startMonth; i < 12; i++) {
      mesesDisponibles.push({ value: i, label: months[i] });
    }
  }

  let diasDisponibles = [];
  if (anio && mes !== "") {
    const monthIndex = Number(mes);
    const lastDay = new Date(anio, monthIndex + 1, 0);
    let startDay = 1;
    if (
      Number(anio) === minDateObj.getFullYear() &&
      monthIndex === minDateObj.getMonth()
    ) {
      startDay = minDateObj.getDate();
    }
    for (let d = startDay; d <= lastDay.getDate(); d++) {
      const fechaDia = new Date(anio, monthIndex, d);
      if (fechaDia >= minDateObj && fechaDia <= maxDateObj) {
        let horasDisponiblesEnDia = [];
        for (let h = 6; h <= 19; h += 4) {
          const inicio = new Date(`${anio}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}T${String(h).padStart(2, "0")}:00:00`);
          if (inicio < minDateObj) continue;
          const fin = addHours(inicio, 3);
          if (fin.getHours() > 22) continue;
          if (!isRangoOcupado(reservas, inicio, fin)) {
            horasDisponiblesEnDia.push(h);
          }
        }
        if (horasDisponiblesEnDia.length > 0) {
          diasDisponibles.push({ dia: d, horas: horasDisponiblesEnDia });
        }
      }
    }
  }

  let horasDisponibles = [];
  if (anio && mes !== "" && dia) {
    const diaObj = diasDisponibles.find(dObj => dObj.dia === Number(dia));
    if (diaObj) {
      const fechaStr = `${anio}-${String(Number(mes) + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
      horasDisponibles = diaObj.horas.map(h => {
        const inicio = new Date(`${fechaStr}T${String(h).padStart(2, "0")}:00:00`);
        const fin = addHours(inicio, 3);
        return {
          value: `${String(h).padStart(2, "0")}:00`,
          label: `${formatHourOption(inicio)} - ${formatHourOption(fin)}`
        };
      });
    }
  }

  const fecha =
    anio && mes !== "" && dia
      ? `${anio}-${String(Number(mes) + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
      : "";
  const fechaInicio = fecha && hora ? `${fecha}T${hora}` : "";
  const fechaFinObj = fechaInicio ? addHours(new Date(fechaInicio), 3) : null;
  const fechaFin = fechaFinObj
    ? `${fechaFinObj.getFullYear()}-${String(fechaFinObj.getMonth() + 1).padStart(2, "0")}-${String(fechaFinObj.getDate()).padStart(2, "0")}T${String(fechaFinObj.getHours()).padStart(2, "0")}:${String(fechaFinObj.getMinutes()).padStart(2, "0")}`
    : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setMensajeTipo("");
    if (!usuario) {
      setMensaje("Debes iniciar sesión para reservar.");
      setMensajeTipo("error");
      return;
    }
  console.log("Usuario en handleSubmit:", usuario);
  console.log("Valor de usuario.user.id:", usuario?.user?.id);
    if (!fechaInicio || !fechaFin) {
      setMensaje("Debes seleccionar fecha y hora.");
      setMensajeTipo("error");
      return;
    }
    if (!direccionInicio || !direccionDestino) {
      setMensaje("Debes ingresar ambas direcciones.");
      setMensajeTipo("error");
      return;
    }
    setLoading(true);
    try {
      await debugReserva({
        cliente_id: usuario.user.id,
        vehiculo_id: vehiculo.id,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        direccion_inicio: direccionInicio,
        direccion_destino: direccionDestino,
      });
      setMensaje("¡Reserva realizada con éxito! Se ha enviado un correo al conductor.");
      setMensajeTipo("exito");
      setDireccionInicio("");
      setDireccionDestino("");
      setAnio("");
      setMes("");
      setDia("");
      setHora("");
    } catch (err) {
      setMensaje("Error al reservar: " + (err.response?.data?.error || err.message));
      setMensajeTipo("error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="reserva-container" style={{ display: "flex", gap: "32px", justifyContent: "center", alignItems: "flex-start", padding: "32px 0" }}>
      <div className="reserva-form bloque-form" style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 2px 16px #0002",
        padding: "32px",
        minWidth: "340px",
        maxWidth: "400px"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "18px", color: "#083c5d" }}>Reservar vehículo</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div style={{ marginBottom: "12px" }}>
            <label>Año:</label>
            <select
              value={anio}
              onChange={e => { setAnio(e.target.value); setMes(""); setDia(""); setHora(""); }}
              required
            >
              <option value="">Selecciona año</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label>Mes:</label>
            <select
              value={mes}
              onChange={e => { setMes(e.target.value); setDia(""); setHora(""); }}
              required
              disabled={!anio}
            >
              <option value="">Selecciona mes</option>
              {mesesDisponibles.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label>Día:</label>
            <select
              value={dia}
              onChange={e => { setDia(e.target.value); setHora(""); }}
              required
              disabled={!anio || mes === ""}
            >
              <option value="">Selecciona día</option>
              {diasDisponibles.map(dObj => (
                <option key={dObj.dia} value={dObj.dia}>
                  {dObj.dia}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label>Hora (bloques de 3 horas):</label>
            <select
              value={hora}
              onChange={e => setHora(e.target.value)}
              required
              disabled={!anio || mes === "" || !dia}
            >
              <option value="">Selecciona un bloque</option>
              {horasDisponibles.length === 0 && anio && mes !== "" && dia &&
                <option value="" disabled>No hay bloques disponibles</option>
              }
              {horasDisponibles.map(h => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>
          </div>
          <div className="fecha-fin-block" style={{ marginBottom: "12px", fontSize: "14px", color: "#555" }}>
            <span><b>Fecha y hora fin:</b> {fechaFinObj ? fechaFinObj.toLocaleString() : "--"}</span>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label>Dirección de inicio:</label>
            <input
              type="text"
              value={direccionInicio}
              onChange={e => setDireccionInicio(e.target.value)}
              required
              placeholder="Ej: Calle 123 #45-67"
              autoComplete="off"
            />
          </div>
          <div style={{ marginBottom: "18px" }}>
            <label>Dirección de destino:</label>
            <input
              type="text"
              value={direccionDestino}
              onChange={e => setDireccionDestino(e.target.value)}
              required
              placeholder="Ej: Carrera 89 #12-34"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={
              loading ||
              !fechaInicio ||
              !fechaFin ||
              !direccionInicio ||
              !direccionDestino
            }
            style={{
              width: "100%",
              padding: "10px",
              background: loading ? "#b5c7d6" : "#083c5d",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "8px"
            }}
          >
            {loading ? <span className="spinner"></span> : "Confirmar reserva"}
          </button>
        </form>
        {/* Eliminado bloque de debugInfo */}
        <div className="aviso-finalizacion" style={{ fontSize: "13px", color: "#666", margin: "12px 0 0 0" }}>
          <b>Nota:</b> Al finalizar tu mudanza, podrás calificar al conductor y al vehículo. Recuerda avisarle al conductor finalizar la reserva.
        </div>
        {mensaje && (
          <div
            className={mensajeTipo === "exito" ? "mensaje-exito" : "mensaje-error"}
            style={{
              marginTop: "16px",
              color: mensajeTipo === "exito" ? "#1b883a" : "#c0392b",
              background: mensajeTipo === "exito" ? "#eafaf1" : "#fdecea",
              border: `1px solid ${mensajeTipo === "exito" ? "#b7e4c7" : "#f5c6cb"}`,
              borderRadius: "6px",
              padding: "10px",
              textAlign: "center"
            }}
          >
            {mensaje} <a href="/" style={{ color: mensajeTipo === "exito" ? "#1b883a" : "#c0392b" }}>Regresar</a>
          </div>
        )}
      </div>
      <div className="reserva-info bloque-form" style={{
        background: "#f8fafc",
        borderRadius: "16px",
        boxShadow: "0 2px 16px #0001",
        padding: "28px 24px",
        minWidth: "320px",
        maxWidth: "350px"
      }}>
        {vehiculo && (
          <>
            <img src={getImagenUrl(vehiculo.imagen_url)} alt={vehiculo.modelo} className="reserva-img" style={{
              width: "100%",
              borderRadius: "12px",
              marginBottom: "16px",
              objectFit: "cover",
              maxHeight: "180px"
            }} />
            <h3 style={{ marginBottom: "6px", color: "#083c5d" }}>
              {vehiculo.modelo} <span style={{ color: "#888", fontWeight: "normal" }}>({vehiculo.ano_modelo})</span>
            </h3>
            <p><b>Tipo:</b> {vehiculo.tipo_vehiculo}</p>
            <p><b>Placa:</b> {vehiculo.placa}</p>
            <p><b>Tarifa diaria:</b> <span style={{ color: "#1b883a" }}>${vehiculo.tarifa_diaria}</span></p>
            <hr style={{ margin: "16px 0" }} />
            <h4 style={{ color: "#083c5d", marginBottom: "6px" }}>Conductor</h4>
            <p><b>Nombre:</b> {vehiculo.conductor?.nombre}</p>
            <p><b>Correo:</b> {vehiculo.conductor?.correo}</p>
            <p><b>Teléfono:</b> {vehiculo.conductor?.telefono}</p>
          </>
        )}
      </div>
    </div>
  );
}