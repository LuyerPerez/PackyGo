import { useState } from 'react';
import { requestPasswordReset, resetPassword } from '../api';
import VerificationForm from './VerificationForm';
import "../assets/LoginForm.css";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

export default function PasswordReset() {
  const [step, setStep] = useState(1);
  const [correo, setCorreo] = useState('');
  const [code, setCode] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(correo);
      setStep(2);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al solicitar código');
    } finally {
      setLoading(false);
    }
  };

  function validarContrasena(str) {
    return (
      str.length >= 8 &&
      /[A-Z]/.test(str) &&
      /[a-z]/.test(str) &&
      /\d/.test(str) &&
      /[^A-Za-z0-9]/.test(str)
    );
  }

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);
    if (nueva !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!validarContrasena(nueva)) {
      setError("La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ correo, code, nueva });
      setSuccess('Contraseña actualizada correctamente. ¡Ya puedes iniciar sesión!');
      setStep(4);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ maxWidth: "500px", width: "100%" }}>
      {error && <p style={{ color: 'red', fontSize: "15px", textAlign: "center", marginBottom: "12px" }}>{error}</p>}
      {success && <p style={{ color: 'green', fontSize: "15px", textAlign: "center", marginBottom: "12px" }}>{success}</p>}

      {step === 1 && (
        <form onSubmit={handleRequest} className="login-form">
          <h2 className="login-title" style={{ marginBottom: "20px" }}>
            Recuperar Contraseña
          </h2>
          <div className="input-group">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              required
              style={{ fontSize: "18px" }}
            />
          </div>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Solicitar código'}
          </button>
          <Link to="/login" style={{ color: "#007BFF", textDecoration: "none", fontSize: "15px" }}>Volver</Link>
        </form>
      )}

      {step === 2 && (
        <VerificationForm
          correo={correo}
          tipo="reset"
          onVerified={(data) => {
            setCode(data.code || code);
            setStep(3);
          }}
          onCancel={() => setStep(1)}
        />
      )}

      {step === 3 && (
        
        <form onSubmit={handleReset} className="login-form">
          <h2 className="login-title" style={{ marginBottom: "20px" }}>
            Recuperar Contraseña
          </h2>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nueva contraseña"
              value={nueva}
              onChange={e => setNueva(e.target.value)}
              required
              style={{ fontSize: "18px" }}
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
          <div className="input-group">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              required
              style={{ fontSize: "18px" }}
            />
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                marginLeft: "8px"
              }}
              onClick={() => setShowConfirm((prev) => !prev)}
              aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
            </button>
          </div>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Cambiar contraseña'}
          </button>
        </form>
      )}

      {step === 4 && (
        <a href="/login" className="btn-submit" style={{ textAlign: "center", textDecoration: "none", display: "inline-block" }}>
          Ir a Iniciar Sesión
        </a>
      )}
    </div>
  );
}