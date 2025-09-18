import React, { useEffect, useState } from "react";
import "../assets/HomeCamionero.css";
import { obtenerVehiculosPorCamionero } from "../api";

function HomeCamionero() {
	// Estados para los datos
	const [reservasProximas, setReservasProximas] = useState([]);
	const [viajesCompletados, setViajesCompletados] = useState([]);
	const [calificaciones, setCalificaciones] = useState([]);
	const [promedioCalificacion, setPromedioCalificacion] = useState(0);
	const [debugMsg, setDebugMsg] = useState("");
	const [vehiculoMsg, setVehiculoMsg] = useState("");

	let user = null;
	const rawUser = localStorage.getItem("user");
	if (rawUser) {
		try {
			const parsed = JSON.parse(rawUser);
			user = parsed.user ? parsed.user : parsed;
		} catch (e) {
			console.log(e);
			user = null;
		}
	}
	const usuario_id = user && user.id ? user.id : null;

	useEffect(() => {
		let usuario = null;
		const rawUser = localStorage.getItem("user");
		if (rawUser) {
			try {
				const parsed = JSON.parse(rawUser);
				usuario = parsed.user ? parsed.user : parsed;
			} catch (e) {
				console.log(e);
				usuario = null;
			}
		}
		const id = usuario && usuario.id ? usuario.id : null;
		if (!id) {
			setDebugMsg("No se encontró el usuario en localStorage. Debes iniciar sesión.");
			return;
		}
		obtenerVehiculosPorCamionero(id)
			.then(resp => {
				const vehiculos = resp.vehiculos || [];
				if (!Array.isArray(vehiculos) || vehiculos.length === 0) {
					setVehiculoMsg(`No tienes vehículos registrados.\nID enviado: ${id}\nRespuesta API: ${JSON.stringify(resp, null, 2)}`);
					return;
				}
				// Para todos los vehículos, obtener reservas y calificaciones
				import("../api").then(api => {
					// Promesas para reservas y calificaciones
					const reservasPromises = vehiculos.map(v => api.obtenerTodasReservasPorVehiculo(v.id));
					const calificacionesPromises = vehiculos.map(v => api.obtenerCalificacionesPorVehiculo(v.id));

					Promise.all(reservasPromises).then(reservasArrays => {
						// Unir todas las reservas
						const todasReservas = reservasArrays.flat();
						if (!Array.isArray(todasReservas) || todasReservas.length === 0) {
							setDebugMsg("No tienes reservas registradas en la base de datos. Respuesta: " + JSON.stringify(todasReservas));
						}
						const futuras = todasReservas.filter(r => r.estado_reserva === 'pendiente' || r.estado_reserva === 'confirmada' || r.estado_reserva === 'activa');
						setReservasProximas(futuras.slice(0, 3));
						const completadas = todasReservas.filter(r => r.estado_reserva === 'finalizada');
						setViajesCompletados(completadas.slice(0, 3));
					}).catch(err => {
						setDebugMsg("Error al obtener reservas: " + err.message);
					});

					Promise.all(calificacionesPromises).then(calificacionesArrays => {
						// Unir todas las calificaciones
						const todasCalificaciones = calificacionesArrays.flat();
						setCalificaciones(Array.isArray(todasCalificaciones) ? todasCalificaciones.slice(0, 3) : []);
						if (Array.isArray(todasCalificaciones) && todasCalificaciones.length > 0) {
							const promedio = (todasCalificaciones.reduce((acc, c) => acc + c.estrellas, 0) / todasCalificaciones.length).toFixed(2);
							setPromedioCalificacion(promedio);
						}
						if (!Array.isArray(todasCalificaciones) || todasCalificaciones.length === 0) {
							setVehiculoMsg("Aún no tienes calificaciones. Espera a que los clientes califiquen tus servicios. Respuesta: " + JSON.stringify(todasCalificaciones));
						}
					}).catch(err => {
						setVehiculoMsg("Error al obtener calificaciones: " + err.message);
					});
				});
			})
			.catch(err => {
				setVehiculoMsg("Error al obtener vehículos: " + err.message);
			});
	}, []);

	if (!usuario_id) {
		return (
			<div className="camionero-root">
				<section className="camionero-banner">
					<div className="camionero-content-banner">
						<p>Alquiler de Camiones</p>
						<h2>Registra tu camión <br />Rápido y Seguro</h2>
					</div>
				</section>
				<div style={{padding: '2rem', textAlign: 'center', color: '#184e90', fontWeight: 600}}>
					Debes iniciar sesión para ver tu panel de camionero.<br />
					<span style={{color:'#d32f2f'}}>{debugMsg}</span>
				</div>
			</div>
		);
	}
	return (
		<div className="camionero-root">
			<section className="camionero-banner">
				<div className="camionero-content-banner">
					<p>Alquiler de Camiones</p>
					<h2>Registra tu camión <br />Rápido y Seguro</h2>
					<button className="camionero-btn-registrar">Registrar ahora</button>
				</div>
			</section>

			<div className="camionero-container">
				{debugMsg && (
					<div style={{color:'#d32f2f', fontWeight:600, marginBottom:'1rem', textAlign:'center'}}>
						{debugMsg}
					</div>
				)}
				<div className="camionero-dashboard">
					<div className="camionero-card camionero-card-reservas">
						<h2>Reservas próximas</h2>
						<p className="camionero-stat">{reservasProximas.length}</p>
						<ul className="camionero-lista">
							{reservasProximas.length === 0 ? (
								<li>No tienes reservas próximas</li>
							) : reservasProximas.map(r => (
								<li key={r.id}>{r.direccion_inicio} → {r.direccion_destino} ({new Date(r.fecha_inicio).toLocaleDateString()})</li>
							))}
						</ul>
						<a href="/pedidos" className="camionero-btn-detalle">Ver todas las reservas</a>
					</div>
					<div className="camionero-card camionero-card-viajes">
						<h2>Viajes completados</h2>
						<p className="camionero-stat">{viajesCompletados.length}</p>
						<ul className="camionero-lista">
							{viajesCompletados.length === 0 ? (
								<li>No tienes viajes completados</li>
							) : viajesCompletados.map(r => (
								<li key={r.id}>{r.direccion_inicio} → {r.direccion_destino}</li>
							))}
						</ul>
						<a href="/pedidos" className="camionero-btn-detalle">Ver historial completo</a>
					</div>
					<div className="camionero-card camionero-card-calificaciones">
						<h2>Calificaciones recibidas</h2>
						<p className="camionero-stat">{promedioCalificacion} <span style={{fontSize:'1rem',fontWeight:'400'}}>/ 5</span></p>
						<ul className="camionero-lista">
							{calificaciones.length === 0 ? (
								<li>No tienes calificaciones aún</li>
							) : calificaciones.map((c, idx) => (
								<li key={c.id || idx}>Cliente: "{c.comentario}" {'⭐'.repeat(c.estrellas)}</li>
							))}
						</ul>
						<a href="/pedidos" className="camionero-btn-detalle">Ver todas las calificaciones</a>
						{vehiculoMsg && (
							<div style={{color:'#d32f2f', fontWeight:600, marginTop:'0.7rem'}}>{vehiculoMsg}</div>
						)}
					</div>
				</div>
			</div>

			<section className="camionero-instrucciones">
				<div className="camionero-container">
					<h2>¿Cómo registrar tu vehículo?</h2>
					<p>Sigue estos sencillos pasos para registrar tu camión en la plataforma:</p>
					<div className="camionero-pasos">
						<div className="camionero-paso">
							<span className="camionero-numero">1</span>
							<h3>Completa el formulario</h3>
							<p>Ingresa los datos básicos de tu camión: placa, modelo, capacidad y tipo de carga.</p>
						</div>
						<div className="camionero-paso">
							<span className="camionero-numero">2</span>
							<h3>Sube tus documentos</h3>
							<p>Adjunta la tarjeta de propiedad, SOAT y revisión técnico-mecánica vigentes.</p>
						</div>
						<div className="camionero-paso">
							<span className="camionero-numero">3</span>
							<h3>Confirma y envía</h3>
							<p>Revisa la información, confirma y envía tu registro para validación.</p>
						</div>
					</div>
				</div>
			</section>

			<footer className="camionero-footer">
				<div className="camionero-footer-container">
					<div className="camionero-footer-column">
						<h3>INFORMACIÓN DE CONTACTO</h3>
						<p>Teléfono: +57 321 94237557</p>
						<p>Email: packynotificaciones@gmail.com</p>
					</div>
					<div className="camionero-footer-column">
						<h3>INFORMACIÓN</h3>
						<ul>
							<li><a href="/privacidad">Políticas de Privacidad</a></li>
							<li><a href="/terminos">Términos y condiciones</a></li>
						</ul>
					</div>
					<div className="camionero-footer-column">
						<h3>MI CUENTA</h3>
						<ul>
							<li><a href="/perfil">Mi cuenta</a></li>
							<li><a href="/pedidos">Historial de reservas</a></li>
						</ul>
					</div>
					<div className="camionero-footer-column camionero-formulario">
						<h3>REPORTAR INCIDENCIA</h3>
						<form className="camionero-incidencia-form">
							<input type="text" placeholder="ID Reserva" />
							<input type="text" placeholder="ID Usuario" />
							<textarea placeholder="Escribe tu incidencia..." />
							<button type="submit">Enviar</button>
						</form>
					</div>
				</div>
			</footer>
		</div>
    );
}

export default HomeCamionero;