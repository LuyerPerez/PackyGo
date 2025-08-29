import { useState, useRef } from "react"
import { Verify } from "../api"
import "../assets/VerificationForm.css"

export default function VerificationForm({ correo, tipo, onVerified, onCancel }) {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false) // <-- Nuevo estado
  const inputs = useRef([])

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < code.length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (paste.length === code.length) {
      setCode(paste.split("").slice(0, code.length));
      // Opcional: enfocar el último input
      inputs.current[code.length - 1].focus();
      e.preventDefault();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1].focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await Verify({ correo, code: code.join(""), tipo })
      setSuccess(data.message || "Verificado correctamente")
      if (onVerified) onVerified(data)
    } catch (e) {
      setError(e.response?.data?.error || "Código incorrecto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="verification-container">
      <h2 className="verification-title">CÓDIGO DE VERIFICACIÓN</h2>
      <p className="verification-text">
        Por favor, introduce el código que enviamos a <b>{correo}</b>
      </p>
      <form onSubmit={handleSubmit} className="verification-form">
        <div className="code-inputs">
          {code.map((num, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={num}
              ref={(el) => (inputs.current[index] = el)}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              disabled={loading} // <-- Deshabilitar mientras carga
            />
          ))}
        </div>
        <button type="submit" className="btn-verify" disabled={loading}>
          {loading ? <span className="spinner"></span> : "Verificar"}
        </button>
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        {error && <p className="error">{error}</p>}
        {success && <p style={{ color: "green", fontSize: "13px" }}>{success}</p>}
      </form>
      <p className="resend-text">
        ¿No recibiste el código? <a href="#" onClick={() => window.location.reload()}>Reenviar</a>
      </p>
    </div>
  )
}
