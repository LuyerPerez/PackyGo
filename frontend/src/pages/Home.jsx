import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

export default function Home() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userStorage = localStorage.getItem("user")
    if (userStorage) {
      setUser(JSON.parse(userStorage))
    }
  }, [])

  return (
    <div>
      <h1>Bienvenido</h1>
      {user ? (
        <p>
          Estás logueado como <strong>{user.nombre}</strong>.{" "}
        </p>
      ) : (
        <p>
          No estás logueado. <Link to="/login">Ir a login</Link>
        </p>
      )}
    </div>
  )
}
