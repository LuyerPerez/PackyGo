import { useState } from 'react'
import { Login } from '../api'
import "../assets/LoginForm.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faEnvelope, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"
import { faGoogle, faFacebook } from "@fortawesome/free-brands-svg-icons"
import { Link } from 'react-router-dom'
import VerificationForm from './VerificationForm'

// Función para validar características de la contraseña
function validarContrasena(str) {
  return (
    str.length >= 8 &&
    /[A-Z]/.test(str) &&
    /[a-z]/.test(str) &&
    /\d/.test(str) &&
    /[^A-Za-z0-9]/.test(str)
  )
}

export default function LoginForm() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [passwordError, setPasswordError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setPasswordError(null)
    if (!validarContrasena(contrasena)) {
      setPasswordError("La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.")
      return
    }
    setLoading(true)
    try {
      await Login(correo, contrasena)
      setShowVerification(true)
    } catch (error) { 
      setError(
        error.response?.data?.error ||
        error.message ||
        "Error de conexión"
      )
    } finally {
      setLoading(false)
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
      {error && <p style={{ color: "red", fontSize: "15px", textAlign: "center", marginBottom: "12px" }}>{error}</p>}
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
        {passwordError && <p className="error">{passwordError}</p>}

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? <span className="spinner"></span> : "Ingresar"}
        </button>
      </form>

      <div className="extra-links">
        <span>¿NO TIENES CUENTA?</span>
        <a href="/register">Registrate</a>
      </div>

      <p className="divider">o continuar con</p>

      <div className="social-login">
        <button className="google-btn">
          <FontAwesomeIcon icon={faGoogle} />
          Google
        </button>
        <button className="facebook-btn">
          <FontAwesomeIcon icon={faFacebook} />
          Facebook
        </button>
      </div>


      <a href="/" className="back-link">Volver</a>
    </div>
  )
}