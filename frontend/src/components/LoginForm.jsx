import { useState } from 'react'
import { Login } from '../api'
import "../assets/LoginForm.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faEnvelope, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"
import { GoogleLogin } from '@react-oauth/google'
import { GoogleLogin as GoogleLoginAPI } from '../api'
import VerificationForm from './VerificationForm'
import { Link } from 'react-router-dom'

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

  const handleGoogleLogin = async (credentialResponse) => {
    setError(null)
    setLoading(true)
    try {
      const token = credentialResponse.credential
      const res = await GoogleLoginAPI(token)
      localStorage.setItem("user", JSON.stringify(res.user))
      window.location.href = "/"
    } catch (e) {
      setError(e.response?.data?.error || "Error con Google Login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page-wrapper">
      <div className="login-left-panel">
        <div className="login-container">
          {!showVerification ? (
            <>
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
                <span>¿Olvidaste tu contraseña?</span>
                <a href="/recuperar-contrasena">Recuperar</a>
              </div>
              <div className="extra-links">
                <a href="/register">Registrate</a>
                <a href="/">Volver</a>
              </div>
              <p className="divider">o continuar con</p>
              <div className="social-login">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => setError("Error al iniciar con Google")}
                />
              </div>
            </>
          ) : (
            <VerificationForm
              correo={correo}
              tipo="login"
              onVerified={handleVerified}
              onCancel={() => setShowVerification(false)}
            />
          )}
        </div>
      </div>
      <div className="login-right-panel">
        <img src="../../public/rocket-login.png" alt="Rocket Illustration" />
      </div>
    </div>
  )
}