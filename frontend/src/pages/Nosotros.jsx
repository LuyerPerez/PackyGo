import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTruck, 
  faUsers, 
  faShieldHalved, 
  faStar, 
  faCalendarDays,
  faUserShield,
  faHandshake,
  faBullseye,
  faEye,
  faHeart,
  faCheckCircle
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
    <div className="nosotros-page-wrapper">
      {/* Hero Section */}
      <section className="nosotros-hero-section">
        <div className="nosotros-hero-content">
          <div className="nosotros-hero-text">
            <h1 className="nosotros-hero-title">
              <FontAwesomeIcon icon={faTruck} className="nosotros-hero-icon" />
              Sobre PackyGo
            </h1>
            <p className="nosotros-hero-subtitle">
              La plataforma líder en gestión de transporte y logística
            </p>
            <p className="nosotros-hero-description">
              PackyGo es una solución integral desarrollada con tecnologías modernas para conectar 
              clientes con camioneros, facilitando el proceso de reserva y alquiler de vehículos 
              de transporte de manera segura y eficiente.
            </p>
          </div>
          <div className="nosotros-stats-container">
            <div className="nosotros-stat-item">
              <FontAwesomeIcon icon={faUsers} className="nosotros-stat-icon" />
              <h3 className="nosotros-stat-number">1000+</h3>
              <p className="nosotros-stat-label">Usuarios Activos</p>
            </div>
            <div className="nosotros-stat-item">
              <FontAwesomeIcon icon={faTruck} className="nosotros-stat-icon" />
              <h3 className="nosotros-stat-number">500+</h3>
              <p className="nosotros-stat-label">Vehículos Registrados</p>
            </div>
            <div className="nosotros-stat-item">
              <FontAwesomeIcon icon={faHandshake} className="nosotros-stat-icon" />
              <h3 className="nosotros-stat-number">2000+</h3>
              <p className="nosotros-stat-label">Reservas Completadas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Vision Values */}
      <section className="nosotros-mvv-section">
        <div className="nosotros-container-centered">
          <div className="nosotros-mvv-grid">
            <div className="nosotros-mvv-item nosotros-mvv-mission">
              <div className="nosotros-mvv-icon-wrapper">
                <FontAwesomeIcon icon={faBullseye} className="nosotros-mvv-icon" />
              </div>
              <h3 className="nosotros-mvv-title">Nuestra Misión</h3>
              <p className="nosotros-mvv-text">
                Facilitar el acceso al transporte de carga mediante una plataforma digital 
                que conecte de manera eficiente a clientes con camioneros, garantizando 
                transparencia, seguridad y calidad en cada transacción.
              </p>
            </div>
            <div className="nosotros-mvv-item nosotros-mvv-vision">
              <div className="nosotros-mvv-icon-wrapper">
                <FontAwesomeIcon icon={faEye} className="nosotros-mvv-icon" />
              </div>
              <h3 className="nosotros-mvv-title">Nuestra Visión</h3>
              <p className="nosotros-mvv-text">
                Ser la plataforma de referencia en América Latina para el alquiler y 
                gestión de vehículos de transporte, revolucionando la industria logística 
                a través de la tecnología y la innovación.
              </p>
            </div>
            <div className="nosotros-mvv-item nosotros-mvv-values">
              <div className="nosotros-mvv-icon-wrapper">
                <FontAwesomeIcon icon={faHeart} className="nosotros-mvv-icon" />
              </div>
              <h3 className="nosotros-mvv-title">Nuestros Valores</h3>
              <ul className="nosotros-values-list">
                <li className="nosotros-value-item">
                  <FontAwesomeIcon icon={faCheckCircle} className="nosotros-value-check" />
                  <div>
                    <strong>Seguridad:</strong> Protegemos la información de nuestros usuarios
                  </div>
                </li>
                <li className="nosotros-value-item">
                  <FontAwesomeIcon icon={faCheckCircle} className="nosotros-value-check" />
                  <div>
                    <strong>Confianza:</strong> Construimos relaciones duraderas
                  </div>
                </li>
                <li className="nosotros-value-item">
                  <FontAwesomeIcon icon={faCheckCircle} className="nosotros-value-check" />
                  <div>
                    <strong>Eficiencia:</strong> Optimizamos procesos y tiempos
                  </div>
                </li>
                <li className="nosotros-value-item">
                  <FontAwesomeIcon icon={faCheckCircle} className="nosotros-value-check" />
                  <div>
                    <strong>Innovación:</strong> Utilizamos tecnología de vanguardia
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="nosotros-features-section">
        <div className="nosotros-container-centered">
          <div className="nosotros-section-header">
            <h2 className="nosotros-section-title">¿Qué nos hace diferentes?</h2>
            <p className="nosotros-section-subtitle">Descubre las características que hacen de PackyGo la mejor opción</p>
          </div>
          <div className="nosotros-features-grid">
            {features.map((feature, index) => (
              <div key={index} className="nosotros-feature-item">
                <div className="nosotros-feature-icon-circle">
                  <FontAwesomeIcon icon={feature.icon} />
                </div>
                <h3 className="nosotros-feature-title">{feature.title}</h3>
                <p className="nosotros-feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="nosotros-team-section">
        <div className="nosotros-container-centered">
          <div className="nosotros-section-header">
            <h2 className="nosotros-section-title">Nuestro Equipo</h2>
            <p className="nosotros-section-subtitle">Profesionales comprometidos con la excelencia</p>
          </div>
          <div className="nosotros-team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="nosotros-team-member">
                <div className="nosotros-team-avatar">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <h3 className="nosotros-team-name">{member.name}</h3>
                <p className="nosotros-team-position">{member.role}</p>
                <p className="nosotros-team-bio">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="nosotros-cta-section">
        <div className="nosotros-container-centered">
          <div className="nosotros-cta-content">
            <h2 className="nosotros-cta-title">¿Listo para comenzar?</h2>
            <p className="nosotros-cta-text">Únete a PackyGo y forma parte de la revolución del transporte</p>
            <div className="nosotros-cta-buttons">
              <a href="/register" className="nosotros-btn nosotros-btn-primary">
                Registrarse Ahora
              </a>
              <a href="/explorar" className="nosotros-btn nosotros-btn-secondary">
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