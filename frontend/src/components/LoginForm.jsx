import { useState } from 'react'
import { Login } from '../api'
import "../assets/LoginForm.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import VerificationForm from './VerificationForm'

export default function LoginForm() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showVerification, setShowVerification] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    try {
      await Login(correo, contrasena)
      setShowVerification(true)
    } catch (error) { 
      setError(
        error.response?.data?.error ||
        error.message ||
        "Error de conexión"
      )
    }
  }

  const handleVerified = (user) => {
    localStorage.setItem("user", JSON.stringify(user))
    window.location.href = "/"
  }

  if (showVerification) {
    return <VerificationForm correo={correo} tipo="login" onVerified={handleVerified} onCancel={() => setShowVerification(false)} />
  }

  return (
    <div className="login-container">
      <h2 className="login-title">
        <FontAwesomeIcon icon={faUser} />
        Inicio de Sesion
      </h2>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-group">
          <FontAwesomeIcon icon={faEnvelope} />
          <input
            type="email"
            placeholder="Correo Electronico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <FontAwesomeIcon icon={faLock} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
          <button
            type="button"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              marginLeft: "8px"
            }}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        </div>

        <button type="submit" className="btn-submit">
          Ingresar
        </button>

        {error && <p className="error">{error}</p>}
      </form>

      <div className="extra-links">
        <span>¿NO TIENES CUENTA?</span>
        <a href="/register">Registrate</a>
      </div>

      <p className="divider">o continuar con</p>

      <div className="social-login">
        <button className="google-btn">Google</button>
        <button className="facebook-btn">Facebook</button>
      </div>

      <a href="/" className="back-link">Volver</a>
    </div>
  )
}
