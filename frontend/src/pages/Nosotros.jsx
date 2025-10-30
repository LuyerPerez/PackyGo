import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTruck, 
  faUsers, 
  faShieldHalved, 
  faStar, 
  faCalendarDays,
  faUserShield,
  faMapLocationDot,
  faHandshake,
  faGears,
  faBullseye,
  faEye,
  faHeart
} from '@fortawesome/free-solid-svg-icons';
import '../assets/Nosotros.css';

function Nosotros() {
  const features = [
    {
      icon: faTruck,
      title: "Gestión de Vehículos",
      description: "Registro y administración completa de flotas de transporte con detalles técnicos y tarifas."
    },
    {
      icon: faUsers,
      title: "Múltiples Roles",
      description: "Sistema diferenciado para clientes, camioneros y administradores con permisos específicos."
    },
    {
      icon: faCalendarDays,
      title: "Reservas Inteligentes",
      description: "Sistema de reservaciones con cálculo automático de tarifas y disponibilidad en tiempo real."
    },
    {
      icon: faStar,
      title: "Sistema de Calificaciones",
      description: "Calificaciones y comentarios bidireccionales entre usuarios y proveedores de servicio."
    },
    {
      icon: faShieldHalved,
      title: "Seguridad Avanzada",
      description: "Encriptación de datos, autenticación segura y verificación por correo electrónico."
    },
    {
      icon: faUserShield,
      title: "Administración Completa",
      description: "Panel administrativo para gestión de usuarios, vehículos, reservas y reportes."
    }
  ];

  const teamMembers = [
    {
      name: "Equipo de Desarrollo",
      role: "Full Stack Developers",
      description: "Desarrolladores especializados en React, Flask y MySQL"
    },
    {
      name: "Equipo de Diseño",
      role: "UI/UX Designers",
      description: "Especialistas en experiencia de usuario y diseño responsivo"
    },
    {
      name: "Equipo de Calidad",
      role: "QA Engineers",
      description: "Garantizamos la máxima calidad y seguridad de la plataforma"
    }
  ];

  return (
    <div className="nosotros-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <FontAwesomeIcon icon={faTruck} className="hero-icon" />
              Sobre PackyGo
            </h1>
            <p className="hero-subtitle">
              La plataforma líder en gestión de transporte y logística
            </p>
            <p className="hero-description">
              PackyGo es una solución integral desarrollada con tecnologías modernas para conectar 
              clientes con camioneros, facilitando el proceso de reserva y alquiler de vehículos 
              de transporte de manera segura y eficiente.
            </p>
          </div>
          <div className="hero-stats">
            <div className="stat-card">
              <FontAwesomeIcon icon={faUsers} className="stat-icon" />
              <h3>1000+</h3>
              <p>Usuarios Activos</p>
            </div>
            <div className="stat-card">
              <FontAwesomeIcon icon={faTruck} className="stat-icon" />
              <h3>500+</h3>
              <p>Vehículos Registrados</p>
            </div>
            <div className="stat-card">
              <FontAwesomeIcon icon={faHandshake} className="stat-icon" />
              <h3>2000+</h3>
              <p>Reservas Completadas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Vision Values */}
      <section className="mvv-section">
        <div className="container">
          <div className="mvv-grid">
            <div className="mvv-card mission">
              <FontAwesomeIcon icon={faBullseye} className="mvv-icon" />
              <h3>Nuestra Misión</h3>
              <p>
                Facilitar el acceso al transporte de carga mediante una plataforma digital 
                que conecte de manera eficiente a clientes con camioneros, garantizando 
                transparencia, seguridad y calidad en cada transacción.
              </p>
            </div>
            <div className="mvv-card vision">
              <FontAwesomeIcon icon={faEye} className="mvv-icon" />
              <h3>Nuestra Visión</h3>
              <p>
                Ser la plataforma de referencia en América Latina para el alquiler y 
                gestión de vehículos de transporte, revolucionando la industria logística 
                a través de la tecnología y la innovación.
              </p>
            </div>
            <div className="mvv-card values">
              <FontAwesomeIcon icon={faHeart} className="mvv-icon" />
              <h3>Nuestros Valores</h3>
              <ul>
                <li>🔒 <strong>Seguridad:</strong> Protegemos la información de nuestros usuarios</li>
                <li>🤝 <strong>Confianza:</strong> Construimos relaciones duraderas</li>
                <li>⚡ <strong>Eficiencia:</strong> Optimizamos procesos y tiempos</li>
                <li>💡 <strong>Innovación:</strong> Utilizamos tecnología de vanguardia</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>¿Qué nos hace diferentes?</h2>
            <p>Descubre las características que hacen de PackyGo la mejor opción</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <FontAwesomeIcon icon={feature.icon} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="tech-section">
        <div className="container">
          <div className="section-header">
            <h2>
              <FontAwesomeIcon icon={faGears} className="section-icon" />
              Tecnología de Vanguardia
            </h2>
            <p>Construido con las mejores tecnologías del mercado</p>
          </div>
          <div className="tech-grid">
            <div className="tech-category">
              <h3>Frontend</h3>
              <div className="tech-items">
                <span className="tech-item">React 18</span>
                <span className="tech-item">Vite</span>
                <span className="tech-item">CSS3</span>
                <span className="tech-item">FontAwesome</span>
              </div>
            </div>
            <div className="tech-category">
              <h3>Backend</h3>
              <div className="tech-items">
                <span className="tech-item">Python Flask</span>
                <span className="tech-item">MySQL</span>
                <span className="tech-item">JWT Auth</span>
                <span className="tech-item">Email Service</span>
              </div>
            </div>
            <div className="tech-category">
              <h3>Seguridad</h3>
              <div className="tech-items">
                <span className="tech-item">Werkzeug</span>
                <span className="tech-item">OAuth 2.0</span>
                <span className="tech-item">Encriptación</span>
                <span className="tech-item">Validaciones</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <h2>Nuestro Equipo</h2>
            <p>Profesionales comprometidos con la excelencia</p>
          </div>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-avatar">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-description">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>¿Listo para comenzar?</h2>
            <p>Únete a PackyGo y forma parte de la revolución del transporte</p>
            <div className="cta-buttons">
              <a href="/register" className="btn btn-primary">
                Registrarse Ahora
              </a>
              <a href="/explorar" className="btn btn-secondary">
                Explorar Vehículos
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Nosotros;