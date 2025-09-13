import { useState } from 'react'
import "../assets/LoginForm.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faEnvelope, faLock, faIdCard, faPhone, faUserShield, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { Register } from '../api'
import VerificationForm from './VerificationForm'
import { GoogleLogin } from '@react-oauth/google'
import { GoogleRegister as GoogleRegisterAPI } from '../api'

function validarContrasena(str) {
  return (
    str.length >= 8 &&
    /[A-Z]/.test(str) &&
    /[a-z]/.test(str) &&
    /\d/.test(str) &&
    /[^A-Za-z0-9]/.test(str)
  )
}

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
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setPasswordError(null)
    if (!aceptaTerminos) {
      setError("Debes aceptar los términos y condiciones para registrarte.")
      return
    }
    if (!validarContrasena(contrasena)) {
      setPasswordError("La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.")
      return
    }
    setLoading(true)
    try {
      await Register({ nombre, noDocumento, correo, telefono, contrasena, rol })
      setShowVerification(true)
    } catch (e) {
      setError(
        e.response?.data?.error ||
        e.message ||
        JSON.stringify(e)
      )
    } finally {
      setLoading(false)
    }
  }

  const handleVerified = () => {
    setSuccess("Registro exitoso. ¡Ahora puedes iniciar sesión!")
    setShowVerification(false)
  }

  const handleGoogleRegister = async (credentialResponse) => {
    setError(null)
    setLoading(true)
    try {
      const token = credentialResponse.credential
      const res = await GoogleRegisterAPI(token, rol)
      setSuccess("Registro exitoso con Google. ¡Ahora puedes iniciar sesión!")
      localStorage.setItem("user", JSON.stringify(res.user))
      window.location.href = "/"
    } catch (e) {
      setError(
        e.response?.data?.error ||
        e.message ||
        JSON.stringify(e)
      )
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
                <span>Registro</span>
              </h2>

              {success && (
                <p style={{ color: "green", fontSize: "15px", textAlign: "center", marginBottom: "12px" }}>
                  {success}
                </p>
              )}
              {error && (
                <p style={{ color: "red", fontSize: "15px", textAlign: "center", marginBottom: "12px" }}>
                  {error}
                </p>
              )}

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
                <div className="terms-container">
                  <input
                    type="checkbox"
                    id="terminos"
                    checked={aceptaTerminos}
                    onChange={e => setAceptaTerminos(e.target.checked)}
                    required
                  />
                  <label htmlFor="terminos" className="terms-label">
                    Acepto los <a href="/terminos">Términos y Condiciones</a> y la <a href="/privacidad">Política de Privacidad</a>
                  </label>
                </div>
                <button type="submit" className="btn-submit" disabled={loading || !aceptaTerminos}>
                  {loading ? <span className="spinner"></span> : "Registrarse"}
                </button>
              </form>

              <div className="extra-links">
                <span>¿YA TIENES CUENTA?</span>
                <Link to="/login">Iniciar Sesión</Link>
              </div>
              <p className="divider">o continuar con</p>
              <div className="social-login">
                <GoogleLogin
                  onSuccess={handleGoogleRegister}
                  onError={() => setError("Error al registrar con Google")}
                  text="continue_with"
                />
              </div>
            </>
          ) : (
            <VerificationForm
              correo={correo}
              tipo="register"
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
