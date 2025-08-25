import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function Logout() {
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.removeItem("user") // Elimina el usuario guardado
    navigate("/login") // Redirige al login
  }, [navigate])

  return (
    <div>
      <h2>Cerrando sesión...</h2>
    </div>
  )
}