import React, { useEffect, useState, useMemo, useCallback } from "react";
import "../assets/ReservaForm.css";
import { obtenerReservasPorVehiculo, getImagenUrl, debugReserva } from "../api";
import { useNavigate } from "react-router-dom";
import RouteMap from "../components/RouteMap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faLocationDot,
  faTruck,
  faTag,
  faMoneyBillWave,
  faUser,
  faEnvelope,
  faPhone,
  faWandMagicSparkles,
  faClock,
  faLightbulb,
  faRocket,
  faCircleInfo,
  faMap
} from "@fortawesome/free-solid-svg-icons";

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
  const [distanceKm, setDistanceKm] = useState(0);
  const navigate = useNavigate();
  // Eliminado debugInfo

  useEffect(() => {
    const v = localStorage.getItem("vehiculoSeleccionado");
    if (v) {
      const vehiculoData = JSON.parse(v);
      console.log("Vehículo cargado desde localStorage:", vehiculoData);
      console.log("Datos del conductor:", vehiculoData?.conductor);
      setVehiculo(vehiculoData);
    } else {
      navigate("/explorar", { replace: true });
    }
    const u = localStorage.getItem("user");
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
    // Si usuario tiene .user, usar ese objeto, si no, usar usuario directamente
    const usuarioId = usuario.user?.id || usuario.id;
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
        cliente_id: usuarioId,
        vehiculo_id: vehiculo.id,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        direccion_inicio: direccionInicio,
        direccion_destino: direccionDestino,
        total_pago: Number((estimatedPrice || 0).toFixed(2)),
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
  // Tarifa por km: asumimos tarifa_diaria como tarifa/km si no hay un campo específico en el backend
  const ratePerKm = useMemo(() => {
    if (!vehiculo) return 0;
    const t = Number(vehiculo.tarifa_diaria) || 0;
    return t; // Interpretado como COP por km para el cálculo en el mapa
  }, [vehiculo]);

  const handleDistanceChange = useCallback((km) => {
    setDistanceKm(km || 0);
  }, []);

  const handleOriginChange = useCallback((address) => {
    setDireccionInicio(address);
  }, []);

  const handleDestinationChange = useCallback((address) => {
    setDireccionDestino(address);
  }, []);

  const estimatedPrice = useMemo(() => {
    return distanceKm > 0 && ratePerKm > 0 ? distanceKm * ratePerKm : 0;
  }, [distanceKm, ratePerKm]);
  return (
    <div className="pgx-reserva reserva-container">
      {/* Sidebar con información del vehículo */}
      <aside className="pgx-reserva-aside reserva-info">
        {vehiculo && (
          <div className="pgx-vehicle-card vehicle-card">
            <img src={getImagenUrl(vehiculo.imagen_url)} alt={vehiculo.modelo} className="pgx-reserva-img reserva-img" />
            <div className="pgx-vehicle-card-content vehicle-card-content">
              <h3>
                {vehiculo.modelo}
                <span>{vehiculo.ano_modelo}</span>
              </h3>
              <div className="pgx-info-item info-item">
                <b><FontAwesomeIcon icon={faTruck} /> Tipo:</b>
                <span>{vehiculo.tipo_vehiculo}</span>
              </div>
              <div className="pgx-info-item info-item">
                <b><FontAwesomeIcon icon={faTag} /> Placa:</b>
                <span>{vehiculo.placa}</span>
              </div>
              <div className="pgx-info-item info-item pgx-tarifa tarifa-destacada">
                <b><FontAwesomeIcon icon={faMoneyBillWave} /> Tarifa/km:</b>
                <span>{Number(vehiculo.tarifa_diaria).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</span>
              </div>
              <hr />
              <h4><FontAwesomeIcon icon={faUser} /> Conductor</h4>
              <div className="pgx-info-item info-item">
                <b><FontAwesomeIcon icon={faUser} /> Nombre:</b>
                <span>
                  {vehiculo.conductor?.primer_nombre || ''} {vehiculo.conductor?.segundo_nombre || ''} {vehiculo.conductor?.primer_apellido || ''} {vehiculo.conductor?.segundo_apellido || ''}
                </span>
              </div>
              <div className="pgx-info-item info-item">
                <b><FontAwesomeIcon icon={faEnvelope} /> Correo:</b>
                <span>{vehiculo.conductor?.correo}</span>
              </div>
              <div className="pgx-info-item info-item">
                <b><FontAwesomeIcon icon={faPhone} /> Teléfono:</b>
                <span>{vehiculo.conductor?.telefono}</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Formulario de reserva */}
      <main className="pgx-reserva-form reserva-form">
  <h2><FontAwesomeIcon icon={faWandMagicSparkles} /> Crear Reserva</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Sección: Fecha y Hora */}
          <div className="pgx-section form-section">
            <div className="pgx-section-title form-section-title"><FontAwesomeIcon icon={faCalendarDays} /> Fecha y Hora</div>
            
            <div className="pgx-date-grid fecha-grid">
              <div className="pgx-input input-group">
                <label>Año</label>
                <select
                  value={anio}
                  onChange={e => { setAnio(e.target.value); setMes(""); setDia(""); setHora(""); }}
                  required
                >
                  <option value="">Seleccionar</option>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="pgx-input input-group">
                <label>Mes</label>
                <select
                  value={mes}
                  onChange={e => { setMes(e.target.value); setDia(""); setHora(""); }}
                  required
                  disabled={!anio}
                >
                  <option value="">Seleccionar</option>
                  {mesesDisponibles.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="pgx-input input-group">
                <label>Día</label>
                <select
                  value={dia}
                  onChange={e => { setDia(e.target.value); setHora(""); }}
                  required
                  disabled={!anio || mes === ""}
                >
                  <option value="">Seleccionar</option>
                  {diasDisponibles.map(dObj => (
                    <option key={dObj.dia} value={dObj.dia}>
                      {dObj.dia}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pgx-input input-group">
              <label>Horario (bloques de 3 horas)</label>
              <select
                value={hora}
                onChange={e => setHora(e.target.value)}
                required
                disabled={!anio || mes === "" || !dia}
              >
                <option value="">Selecciona un bloque horario</option>
                {horasDisponibles.length === 0 && anio && mes !== "" && dia &&
                  <option value="" disabled>❌ No hay bloques disponibles</option>
                }
                {horasDisponibles.map(h => (
                  <option key={h.value} value={h.value}>{h.label}</option>
                ))}
              </select>
            </div>

            {fechaFinObj && (
              <div className="pgx-endtime fecha-fin-block">
                <FontAwesomeIcon icon={faClock} />
                <b>Finaliza:</b> {fechaFinObj.toLocaleString('es-CO', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            )}
          </div>

          {/* Sección: Ubicaciones */}
          <div className="pgx-section form-section">
            <div className="pgx-section-title form-section-title"><FontAwesomeIcon icon={faLocationDot} /> Ubicaciones</div>
            
            <div className="pgx-input input-group">
              <label>Punto de origen</label>
              <input
                type="text"
                value={direccionInicio}
                onChange={e => setDireccionInicio(e.target.value)}
                required
                placeholder="Ej: Calle 26 # 13-19, Bogotá"
                autoComplete="off"
              />
              <small className="pgx-hint input-hint">
                <FontAwesomeIcon icon={faLightbulb} /> Incluye ciudad/municipio para mejor precisión
              </small>
            </div>

            <div className="pgx-input input-group">
              <label>Punto de destino</label>
              <input
                type="text"
                value={direccionDestino}
                onChange={e => setDireccionDestino(e.target.value)}
                required
                placeholder="Ej: Carrera 89 # 12-34, Medellín"
                autoComplete="off"
              />
              <small className="pgx-hint input-hint">
                <FontAwesomeIcon icon={faLightbulb} /> Haz clic en el mapa para seleccionar ubicaciones
              </small>
            </div>
          </div>

          {/* Resumen de precio */}
          {vehiculo && estimatedPrice > 0 && (
            <div className="pgx-price-summary price-summary">
              <div className="pgx-price-row price-summary-row">
                <span className="pgx-price-label price-label">Tarifa por km:</span>
                <span className="pgx-price-value price-value">
                  {ratePerKm.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                </span>
              </div>
              <div className="pgx-price-row price-summary-row">
                <span className="pgx-price-label price-label">Distancia estimada:</span>
                <span className="pgx-price-value price-value">{distanceKm.toFixed(2)} km</span>
              </div>
              <div className="pgx-price-row price-summary-row">
                <span className="pgx-price-label price-label"><FontAwesomeIcon icon={faMoneyBillWave} /> TOTAL ESTIMADO:</span>
                <span className="pgx-price-value price-value">
                  {estimatedPrice.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                </span>
              </div>
              <small>
                <FontAwesomeIcon icon={faCircleInfo} /> Precio calculado en base a la ruta más corta. Puede variar según tráfico y condiciones reales.
              </small>
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              !fechaInicio ||
              !fechaFin ||
              !direccionInicio ||
              !direccionDestino
            }
          >
            {loading ? <span className="pgx-spinner spinner"></span> : <><FontAwesomeIcon icon={faRocket} /> Confirmar Reserva</>}
          </button>
        </form>

        <div className="pgx-notice aviso-finalizacion">
          Al finalizar tu mudanza, podrás calificar al conductor y al vehículo. Recuerda avisar al conductor para finalizar la reserva.
        </div>
        <br />
        {mensaje && (
          
          <div className={mensajeTipo === "exito" ? "pgx-msg-success mensaje-exito" : "pgx-msg-error mensaje-error"}>
            {mensaje}
          </div>
        )}
      </main>

      {/* Mapa de ruta */}
      <section className="pgx-reserva-map reserva-mapa">
        <h3><FontAwesomeIcon icon={faMap} /> Visualización de Ruta</h3>
        <div className="pgx-map-wrapper map-wrapper">
          <RouteMap
            originAddress={direccionInicio}
            destinationAddress={direccionDestino}
            ratePerKm={ratePerKm}
            onDistanceChange={handleDistanceChange}
            onOriginChange={handleOriginChange}
            onDestinationChange={handleDestinationChange}
          />
        </div>
      </section>
    </div>
  );
}