import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faLock, faEye, faEyeSlash, faHome, faTruck, faRightFromBracket} from "@fortawesome/free-solid-svg-icons";

function NavBar() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const userStorage = localStorage.getItem("user");
    if (userStorage) {
      setUser(JSON.parse(userStorage));
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img
            src="../../public/logo.png"
            alt="logo"
            className="logo-img"
          />
        </Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/">
            <FontAwesomeIcon icon={faHome} style={{ marginRight: "6px" }} />
            Inicio
          </Link>
        </li>
        <li>
          <Link to="/explorar">
            <FontAwesomeIcon icon={faTruck} style={{ marginRight: "6px" }} />
            Explorar Camiones
          </Link>
        </li>
        {user ? (
          <li ref={dropdownRef} style={{ position: "relative" }}>
            <button
              className="navbar-link"
              style={{
                background: "none",
                border: "none",
                fontWeight: "600",
                color: "black",
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
                  background: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
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
                    color: "#0097a7",
                    textDecoration: "none",
                    fontWeight: "500",
                  }}
                  onClick={() => setOpen(false)}
                >
                  <FontAwesomeIcon icon={faUser} style={{ marginRight: "6px" }} />
                  Perfil
                </Link>
                <Link
                  to="/logout"
                  style={{
                    display: "block",
                    padding: "10px 16px",
                    color: "#0097a7",
                    textDecoration: "none",
                    fontWeight: "500",
                  }}
                  onClick={() => setOpen(false)}
                >
                  <FontAwesomeIcon icon={faRightFromBracket} style={{ marginRight: "6px" }} />
                  Cerrar sesión
                </Link>
              </div>
            )}
          </li>
        ) : (
          <li>
            <Link to="/login">
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