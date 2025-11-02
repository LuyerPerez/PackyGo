import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faHome, faTruck, faRightFromBracket, faUserLock, faCalendarDays, faUserShield, faSearch, faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import { getImagenUrl } from "../api";

function NavBar() {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const closeTimerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const userStorage = localStorage.getItem("user");
    setUser(userStorage ? JSON.parse(userStorage) : null);

    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user");
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    const handleRouteChange = () => {
      const updatedUser = localStorage.getItem("user");
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
      setIsMenuOpen(false);
    };

    window.addEventListener("storage", handleStorageChange);
    const handleUserUpdated = () => {
      const updatedUser = localStorage.getItem("user");
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };
    window.addEventListener('userUpdated', handleUserUpdated);
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdated);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    try {
      if (isDropdownOpen) {
        document.body.classList.add('nav-dropdown-open');
      } else {
        document.body.classList.remove('nav-dropdown-open');
      }
    } catch (err) {
      console.debug('nav body class toggle failed', err);
    }
    return () => {
      try { document.body.classList.remove('nav-dropdown-open'); } catch (e) { console.debug('nav body class cleanup failed', e); }
    };
  }, [isDropdownOpen]);

  const debugLogUnderCursor = (e, context) => {
    try {
      if (!window || !window.__NAV_DEBUG) return;
      const x = e?.clientX ?? (window.event && window.event.clientX) ?? null;
      const y = e?.clientY ?? (window.event && window.event.clientY) ?? null;
      if (x === null || y === null) return;
      const el = document.elementFromPoint(x, y);
      const styles = el ? window.getComputedStyle(el) : null;
      console.log('[NAV-DEBUG]', context, { x, y, element: el, tag: el?.tagName, classes: el?.className, zIndex: styles?.zIndex, pointerEvents: styles?.pointerEvents });
    } catch (err) {
      console.log('[NAV-DEBUG] error', err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar${isScrolled ? " scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <img src="/logo_title.png" alt="logo" className="logo-img" />
          </Link>
        </div>

        <div ref={menuRef} className={`navbar-center${isMenuOpen ? ' show-mobile' : ''}`}>
          <ul className="navbar-links">
            <li>
              <Link to="/" className={`nav-link${isActive("/") ? " active" : ""}`} onClick={() => setIsMenuOpen(false)}>
                <FontAwesomeIcon icon={faHome} />
                <span className="nav-label">Inicio</span>
              </Link>
            </li>
            <li>
              {user && user.rol === "camionero" ? (
                <Link to="/pedidos" className={`nav-link${isActive("/pedidos") ? " active" : ""}`} onClick={() => setIsMenuOpen(false)}>
                  <FontAwesomeIcon icon={faTruck} />
                  <span className="nav-label">Pedidos</span>
                </Link>
              ) : user && user.rol === "admin" ? (
                <Link to="/administracion" className={`nav-link${isActive("/administracion") ? " active" : ""}`} onClick={() => setIsMenuOpen(false)}>
                  <FontAwesomeIcon icon={faUserLock} />
                  <span className="nav-label">Administración</span>
                </Link>
              ) : (
                <Link to="/explorar" className={`nav-link${isActive("/explorar") ? " active" : ""}`} onClick={() => setIsMenuOpen(false)}>
                  <FontAwesomeIcon icon={faSearch} />
                  <span className="nav-label">Explorar</span>
                </Link>
              )}
            </li>

            <li>
              <Link to="/nosotros" className={`nav-link${isActive("/nosotros") ? " active" : ""}`} onClick={() => setIsMenuOpen(false)}>
                <FontAwesomeIcon icon={faInfoCircle} />
                <span className="nav-label">Nosotros</span>
              </Link>
            </li>

            {user && user.rol === "cliente" && (
              <li>
                <Link to="/mis-reservas" className={`nav-link${isActive("/mis-reservas") ? " active" : ""}`} onClick={() => setIsMenuOpen(false)}>
                  <FontAwesomeIcon icon={faCalendarDays} />
                  <span className="nav-label">Mis Reservas</span>
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div className="navbar-right">

          {user ? (
            <div
              className={`user-pill${isDropdownOpen ? " active" : ""}`}
              ref={dropdownRef}
              onMouseEnter={() => {
                if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
                setIsDropdownOpen(true);
                debugLogUnderCursor(window.event || {}, 'user-pill mouseenter');
              }}
              onMouseLeave={() => {
                if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                closeTimerRef.current = setTimeout(() => setIsDropdownOpen(false), 300);
                debugLogUnderCursor(window.event || {}, 'user-pill mouseleave');
              }}
              onFocus={() => {
                if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
                setIsDropdownOpen(true);
                debugLogUnderCursor(window.event || {}, 'user-pill focus');
              }}
              onBlur={() => {
                if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                closeTimerRef.current = setTimeout(() => setIsDropdownOpen(false), 300);
                debugLogUnderCursor(window.event || {}, 'user-pill blur');
              }}
            >
              <button
                className="user-btn"
                onClick={() => {
                  if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
                  setIsDropdownOpen((p) => !p);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
                    setIsDropdownOpen((p) => !p);
                  }
                }}
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
                tabIndex={0}
              >
                {user.foto ? (
                  <img
                    src={getImagenUrl(user.foto) || user.foto}
                    alt="avatar"
                    className="user-avatar"
                    style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <FontAwesomeIcon icon={faUser} />
                )}
                <span className="user-name">{user.primer_nombre} {user.primer_apellido}</span>
                <span className="user-arrow">▾</span>
              </button>
              <div
                className={`dropdown-menu${isDropdownOpen ? " show" : ""}`}
                onMouseEnter={() => {
                  if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
                  setIsDropdownOpen(true);
                  debugLogUnderCursor(window.event || {}, 'dropdown mouseenter');
                }}
                onMouseLeave={() => {
                  if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                  closeTimerRef.current = setTimeout(() => setIsDropdownOpen(false), 300);
                  debugLogUnderCursor(window.event || {}, 'dropdown mouseleave');
                }}
                onFocus={() => {
                  if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
                  setIsDropdownOpen(true);
                  debugLogUnderCursor(window.event || {}, 'dropdown focus');
                }}
                onBlur={() => {
                  if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                  closeTimerRef.current = setTimeout(() => setIsDropdownOpen(false), 300);
                  debugLogUnderCursor(window.event || {}, 'dropdown blur');
                }}
                tabIndex={-1}
              >
                <div className="dropdown-header">
                  <div className="user-info">
                    <span className="user-fullname">{user.primer_nombre} {user.primer_apellido}</span>
                    <span className="user-email">{user.correo}</span>
                  </div>
                </div>

                <div className="dropdown-section">
                  <Link
                    to={`/${user.primer_nombre}-${user.primer_apellido}/perfil`}
                    className={`menu-item${location.pathname.includes('/perfil') ? " active" : ""}`}
                    onClick={() => { setIsDropdownOpen(false); }}
                  >
                    <FontAwesomeIcon icon={faUser} />
                    <div className="item-content">
                      <span className="item-title">Perfil</span>
                      <span className="item-description">Información personal y preferencias</span>
                    </div>
                  </Link>

                  {user.rol === "camionero" && (
                    <Link
                      to="/mis-vehiculos"
                      className={`menu-item${isActive("/mis-vehiculos") ? " active" : ""}`}
                      onClick={() => { setIsDropdownOpen(false); }}
                    >
                      <FontAwesomeIcon icon={faTruck} />
                      <div className="item-content">
                        <span className="item-title">Mis Vehículos</span>
                        <span className="item-description">Gestiona tus vehículos registrados</span>
                      </div>
                    </Link>
                  )}

                  {user.rol === "cliente" && (
                    <Link
                      to="/mis-reservas"
                      className={`menu-item${isActive("/mis-reservas") ? " active" : ""}`}
                      onClick={() => { setIsDropdownOpen(false); }}
                    >
                      <FontAwesomeIcon icon={faTruck} />
                      <div className="item-content">
                        <span className="item-title">Mis Reservas</span>
                        <span className="item-description">Historial y estado de reservas</span>
                      </div>
                    </Link>
                  )}

                  {user.rol === "admin" && (
                    <Link
                      to="/administracion"
                      className={`menu-item${isActive("/administracion") ? " active" : ""}`}
                      onClick={() => { setIsDropdownOpen(false); }}
                    >
                      <FontAwesomeIcon icon={faUserShield} />
                      <div className="item-content">
                        <span className="item-title">Administración</span>
                        <span className="item-description">Panel de administración</span>
                      </div>
                    </Link>
                  )}
                </div>

                <div className="dropdown-section">
                  <div className="section-title">Sesión</div>
                  <Link 
                    to="/logout" 
                    className="menu-item menu-item-danger" 
                    onClick={() => { setIsDropdownOpen(false); }}
                  >
                    <FontAwesomeIcon icon={faRightFromBracket} />
                    <div className="item-content">
                      <span className="item-title">Cerrar sesión</span>
                      <span className="item-description">Salir de la cuenta</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className={`nav-link login-link${isActive("/login") ? " active" : ""}`} onClick={() => setIsMenuOpen(false)}>
              <FontAwesomeIcon icon={faUser} />
              <span className="nav-label">Iniciar Sesión</span>
            </Link>
          )}
          <button
            className={`menu-button${isMenuOpen ? ' active' : ''}`}
            onClick={() => { setIsDropdownOpen(false); setIsMenuOpen(p => !p); }}
            aria-label="Abrir menú"
            aria-expanded={isMenuOpen}
          >
            <span />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;