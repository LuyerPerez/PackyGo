import { useState } from 'react'
import "../assets/LoginForm.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faEnvelope, faLock, faIdCard, faPhone, faUserShield } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { Register } from '../api'
import VerificationForm from './VerificationForm'

export default function RegisterForm() {
  const [nombre, setNombre] = useState('')
  const [noDocumento, setNoDocumento] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [rol, setRol] = useState('cliente')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showVerification, setShowVerification] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      await Register({ nombre, noDocumento, correo, telefono, contrasena, rol })
      setShowVerification(true)
    } catch (e) {
      setError(e.response?.data?.error || "Error al registrar. Intenta de nuevo.")
    }
  }

  const handleVerified = () => {
    setSuccess("Registro exitoso. ¡Ahora puedes iniciar sesión!")
    setShowVerification(false)
  }

  if (showVerification) {
    return <VerificationForm correo={correo} tipo="register" onVerified={handleVerified} onCancel={() => setShowVerification(false)} />
  }

  return (
    <div className="login-container">
      <h2 className="login-title">
        <FontAwesomeIcon icon={faUser} />
        Registro
      </h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-group">
          <FontAwesomeIcon icon={faUser} />
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <FontAwesomeIcon icon={faIdCard} />
          <input
            type="text"
            placeholder="No. Documento"
            value={noDocumento}
            onChange={(e) => setNoDocumento(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <FontAwesomeIcon icon={faEnvelope} />
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <FontAwesomeIcon icon={faPhone} />
          <input
            type="text"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <FontAwesomeIcon icon={faLock} />
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <FontAwesomeIcon icon={faUserShield} />
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            required
            style={{
              border: "none",
              outline: "none",
              flex: 1,
              fontSize: "18px",
              color: "#333",
              background: "transparent"
            }}
          >
            <option value="cliente">Cliente</option>
            <option value="camionero">Camionero</option>
          </select>
        </div>
        <button type="submit" className="btn-submit">
          Registrarse
        </button>
        {error && <p className="error">{error}</p>}
        {success && <p style={{ color: "green", fontSize: "13px" }}>{success}</p>}
      </form>
      <div className="extra-links">
        <span>¿YA TIENES CUENTA?</span>
        <Link to="/login">Iniciar Sesión</Link>
      </div>
      <a href="/" className="back-link">Volver</a>
    </div>
  )
}