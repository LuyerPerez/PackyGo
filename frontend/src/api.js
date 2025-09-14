import axios from 'axios'

const api = axios.create({
  baseURL: 'http://192.168.0.5:5000/api'
})

export default api

export async function Login(correo, contrasena) {
  const { data } = await api.post('/login', {
    correo,
    contrasena
  })
  return data
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
  localStorage.setItem("usuario", JSON.stringify(data));
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

export async function registrarVehiculo(data) {
  const res = await api.post("/vehiculos", data);
  return res.data;
}

export async function obtenerVehiculosPorCamionero(camionero_id) {
  const res = await api.get(`/vehiculos?camionero_id=${camionero_id}`);
  return res.data;
}

export async function editarVehiculo(id, data) {
  const res = await api.put(`/vehiculos/${id}`, data);
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