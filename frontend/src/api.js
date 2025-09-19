import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api'
})

export default api

export async function Login(correo, contrasena) {
  const { data } = await api.post('/login', {
    correo,
    contrasena
  });
  localStorage.setItem("user", JSON.stringify(data));
  return data;
}

export async function Register({ nombre, noDocumento, correo, telefono, contrasena, rol }) {
  const { data } = await api.post('/register', {
    nombre,
    noDocumento,
    correo,
    telefono,
    contrasena,
    rol
  })
  return data
}

export async function Verify({ correo, code, tipo }) {
  const { data } = await api.post('/verify', {
    correo,
    code,
    tipo
  })
  localStorage.setItem("user", JSON.stringify(data));
  return data
}

export async function requestPasswordReset(correo) {
  const { data } = await api.post('/request-reset', { correo });
  return data;
}

export async function resetPassword({ correo, code, nueva }) {
  const { data } = await api.post('/reset-password', { 
    correo, 
    code, 
    nueva });
  return data;
}

export async function GoogleLogin(token) {
  const { data } = await api.post('/google-login', { token });
  return data;
}

export async function GoogleRegister(token, rol) {
  const { data } = await api.post('/google-register', { token, rol });
  return data;
}

export async function registrarVehiculo(data, isFormData = false) {
  const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
  const res = await api.post('/vehiculos', data, config);
  return res.data;
}

export async function obtenerVehiculosPorCamionero(camionero_id) {
  const res = await api.get(`/vehiculos?camionero_id=${camionero_id}`);
  return res.data;
}

export async function editarVehiculo(id, data, isFormData = false) {
  const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
  const res = await api.put(`/vehiculos/${id}`, data, config);
  return res.data;
}

export async function eliminarVehiculo(id) {
  const res = await api.delete(`/vehiculos/${id}`);
  return res.data;
}

export async function obtenerTodosLosVehiculos() {
  const res = await api.get('/vehiculos');
  return res.data.vehiculos;
}

export async function crearReserva(data) {
  const res = await api.post("/reservas", data);
  return res.data;
}

export async function debugReserva(data) {
  const res = await api.post("/debug-reserva", data);
  return res.data;
}

export async function obtenerReservasPorVehiculo(vehiculo_id) {
  const res = await api.get(`/reservas?vehiculo_id=${vehiculo_id}`);
  return res.data.reservas;
}

export async function obtenerReservasPorCliente(cliente_id) {
  const res = await api.get(`/reservas?cliente_id=${cliente_id}`);
  return res.data.reservas;
}

export async function cancelarReserva(id) {
  const res = await api.put(`/reservas/${id}/cancelar`);
  return res.data;
}

export async function obtenerPedidosCamionero(camionero_id) {
  const res = await api.get(`/pedidos-camionero/${camionero_id}`);
  return res.data.pedidos;
}

export async function finalizarReserva(id) {
  const res = await api.put(`/reservas/${id}/finalizar`);
  return res.data;
}

export async function obtenerReservasPorUsuario(usuario_id) {
  const res = await api.get(`/reservas-usuario/${usuario_id}`);
  return res.data.reservas;
}

export async function calificarCliente({ usuario_destino_id, usuario_origen_id, estrellas, comentario }) {
  const res = await api.post(`/calificar-cliente`, {
    usuario_destino_id,
    usuario_origen_id,
    estrellas,
    comentario
  });
  return res.data;
}

export async function obtenerCalificacionesVehiculoPorUsuario({ usuario_id, vehiculo_id }) {
  const res = await api.get(`/calificaciones-vehiculo?autor_id=${usuario_id}&vehiculo_id=${vehiculo_id}`);
  return res.data.calificaciones;
}

export async function calificarVehiculo({ autor_id, vehiculo_destino_id, reserva_id, estrellas, comentario }) {
  const res = await api.post(`/calificar-vehiculo`, {
    autor_id,
    vehiculo_destino_id,
    reserva_id,
    estrellas,
    comentario
  });
  return res.data;
}

export function getImagenUrl(imagen_url) {
  if (!imagen_url) return null;
  if (imagen_url.startsWith("http")) return imagen_url;
  if (imagen_url.startsWith("/uploads")) {
    return `http://127.0.0.1:5000${imagen_url}`;
  }
  return `http://127.0.0.1:5000/uploads/${imagen_url}`;
}

export async function editarReserva(id, data) {
  const res = await api.put(`/reservas/${id}`, data);
  return res.data;
}

export async function eliminarReserva(id) {
  const res = await api.delete(`/reservas/${id}`);
  return res.data;
}

export async function crearReporte(data) {
  const res = await api.post("/reportes", data);
  return res.data;
}

export async function obtenerReportes() {
  const res = await api.get("/reportes");
  return res.data.reportes;
}

export async function editarReporte(id, data) {
  const res = await api.put(`/reportes/${id}`, data);
  return res.data;
}

export async function eliminarReporte(id) {
  const res = await api.delete(`/reportes/${id}`);
  return res.data;
}

export async function obtenerCalificacionesPorVehiculo(vehiculo_id) {
  const res = await api.get(`/calificaciones-vehiculo-todas?vehiculo_id=${vehiculo_id}`);
  return res.data.calificaciones;
}

export async function obtenerTodasReservasPorVehiculo(vehiculo_id) {
  const res = await api.get(`/reservas-vehiculo-todas/${vehiculo_id}`);
  return res.data.reservas;
}