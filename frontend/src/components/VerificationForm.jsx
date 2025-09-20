import { useState, useRef, useEffect } from "react"
import { Verify } from "../api"
import "../assets/VerificationForm.css"

export default function VerificationForm({ correo, tipo, onVerified, onCancel }) {
  const [code, setCode] = useState(Array(6).fill(""))
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const inputs = useRef([])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    if (!value) return setCode(prev => {
      const newCode = [...prev]
      newCode[index] = ""
      return newCode
    })
    setCode(prev => {
      const newCode = [...prev]
      newCode[index] = value
      return newCode
    })
    if (value && index < code.length - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "")
    if (paste.length === code.length) {
      setCode(paste.split("").slice(0, code.length))
      inputs.current[code.length - 1]?.focus()
      e.preventDefault()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const data = await Verify({ correo, code: code.join(""), tipo })
      setSuccess(data.message || "Verificado correctamente")
      if (onVerified) onVerified(data)
    } catch (err) {
      setError(err.response?.data?.error || "Código incorrecto")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await Verify({ correo, code: "", tipo, resend: true })
      setSuccess("Código reenviado correctamente")
      setResendTimer(30)
    } catch {
      setError("No se pudo reenviar el código")
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
      <div className="verification-progress">
        <div className="step active">1</div>
        <div className="progress-line"></div>
        <div className="step active">2</div>
      </div>
      <form onSubmit={handleSubmit} className="verification-form" autoComplete="off">
        <div className="code-inputs">
          {code.map((num, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={num}
              ref={el => inputs.current[index] = el}
              onChange={e => handleChange(e, index)}
              onKeyDown={e => handleKeyDown(e, index)}
              onPaste={handlePaste}
              disabled={loading}
              className={error ? "error" : ""}
              style={{ overflow: "hidden" }}
              autoComplete="off"
            />
          ))}
        </div>
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <span>  </span>
        <button type="submit" className="btn-verify" disabled={loading}>
          {loading ? <span className="spinner"></span> : "Verificar"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
      <p className="resend-text">
        ¿No recibiste el código?{" "}
        <button
          type="button"
          className="btn-link"
          onClick={handleResend}
          disabled={resendTimer > 0 || loading}
          style={{
            background: "none",
            border: "none",
            color: "#083c5d",
            fontWeight: "bold",
            cursor: resendTimer > 0 ? "not-allowed" : "pointer",
            textDecoration: "underline"
          }}
        >
          Reenviar {resendTimer > 0 && `(${resendTimer}s)`}
        </button>
      </p>
    </div>
  )
}
