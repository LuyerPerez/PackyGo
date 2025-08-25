import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
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
  return data
}
