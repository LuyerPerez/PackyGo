import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faHome, faTruck, faRightFromBracket, faUserLock } from "@fortawesome/free-solid-svg-icons";


function NavBar() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const userStorage = localStorage.getItem("user");
    setUser(userStorage ? JSON.parse(userStorage) : null);

    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user");
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };
    window.addEventListener("storage", handleStorageChange);

    const handleRouteChange = () => {
      const updatedUser = localStorage.getItem("user");
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);
    window.addEventListener("popstate", closeMenu);
    return () => window.removeEventListener("popstate", closeMenu);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img
            src="../../public/logo.svg"
            alt="logo"
            className="logo-img"
          />
        </Link>
        <button
          className="navbar-toggle"
          aria-label="Abrir menú"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <ul className={`navbar-links${menuOpen ? " open" : ""}`}>
        <li>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            <FontAwesomeIcon icon={faHome} style={{ marginRight: "6px" }} />
            Inicio
          </Link>
        </li>
        <li>
          {user && user.rol === "camionero" ? (
            <Link to="/pedidos" onClick={() => setMenuOpen(false)}>
              <FontAwesomeIcon icon={faTruck} style={{ marginRight: "6px" }} />
              Pedidos
            </Link>
          ) : user && user.rol === "admin" ? (
            <Link to="/administracion" onClick={() => setMenuOpen(false)}>
              <FontAwesomeIcon icon={faUserLock} style={{ marginRight: "6px" }} />
              Administracion
            </Link>
          ) : (
            <Link to="/explorar" onClick={() => setMenuOpen(false)}>
              <FontAwesomeIcon icon={faTruck} style={{ marginRight: "6px" }} />
              Explorar Camiones
            </Link>
          )}
        </li>
        {user ? (
          <li ref={dropdownRef} style={{ position: "relative" }}>
            <button
              className="navbar-link"
              style={{
                background: "none",
                border: "none",
                fontWeight: "600",
                color: "white",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "inherit", 
                textDecoration: "none"
              }}
              onClick={() => setOpen((prev) => !prev)}
            >
              <FontAwesomeIcon icon={faUser} style={{ marginRight: "6px" }} />
              {user.nombre} ▼
            </button>
            {open && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  background: "#083c5d",
                  borderRadius: "6px",
                  minWidth: "140px",
                  zIndex: 10,
                }}
              >
                <Link
                  to="/perfil"
                  style={{
                    display: "block",
                    padding: "10px 16px",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: "500",
                  }}
                  onClick={() => { setOpen(false); setMenuOpen(false); }}
                >
                  <FontAwesomeIcon icon={faUser} style={{ marginRight: "6px" }} />
                  Perfil
                </Link>
                {user.rol === "camionero" && (
                  <Link
                    to="/mis-vehiculos"
                    style={{
                      display: "block",
                      padding: "10px 16px",
                      color: "#fff",
                      textDecoration: "none",
                      fontWeight: "500",
                    }}
                    onClick={() => { setOpen(false); setMenuOpen(false); }}
                  >
                    <FontAwesomeIcon icon={faTruck} style={{ marginRight: "6px" }} />
                    Mis Vehículos
                  </Link>
                )}
                {user.rol === "cliente" && (
                  <Link
                    to="/mis-reservas"
                    style={{
                      display: "block",
                      padding: "10px 16px",
                      color: "#fff",
                      textDecoration: "none",
                      fontWeight: "500",
                    }}
                    onClick={() => { setOpen(false); setMenuOpen(false); }}
                  >
                    <FontAwesomeIcon icon={faTruck} style={{ marginRight: "6px" }} />
                    Mis Reservas
                  </Link>
                )}
                <Link
                  to="/logout"
                  style={{
                    display: "block",
                    padding: "10px 16px",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: "500",
                  }}
                  onClick={() => { setOpen(false); setMenuOpen(false); }}
                >
                  <FontAwesomeIcon icon={faRightFromBracket} style={{ marginRight: "6px" }} />
                  Cerrar sesión
                </Link>
              </div>
            )}
          </li>
        ) : (
          <li>
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              <FontAwesomeIcon icon={faUser} style={{ marginRight: "6px" }} />
              Iniciar Sesion
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;