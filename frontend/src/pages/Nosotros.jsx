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
  

  // Diferenciales clave que nos distinguen
  const advantages = [
    {
      icon: faCalendarDays,
      title: 'Puntualidad garantizada',
      description:
        'Compromisos de tiempo (SLA) claros y seguimiento de cada etapa para cumplir tus plazos.'
    },
    {
      icon: faUserShield,
      title: 'Verificación y confianza',
      description:
        'Conductores y vehículos verificados, historial de calificaciones y procesos antifraude.'
    },
    {
      icon: faShieldHalved,
      title: 'Seguridad de la carga',
      description:
        'Buenas prácticas operativas y cobertura de seguros según el tipo de servicio requerido.'
    },
    {
      icon: faHandshake,
      title: 'Transparencia total',
      description:
        'Tarifas claras sin costos ocultos y comunicación directa entre cliente y camionero.'
    },
    {
      icon: faTruck,
      title: 'Cobertura y disponibilidad',
      description:
        'Red amplia de camioneros para diferentes tipos de carga y rutas a nivel nacional.'
    },
    {
      icon: faStar,
      title: 'Experiencia superior',
      description:
        'Soporte dedicado y una plataforma rápida, simple y pensada para tu día a día.'
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

      

      {/* Differentiators Section */}
      <section className="nosotros-team-section">
        <div className="nosotros-container-centered">
          <div className="nosotros-section-header">
            <h2 className="nosotros-section-title">Lo que nos diferencia</h2>
            <p className="nosotros-section-subtitle">Ventajas reales frente a alternativas tradicionales</p>
          </div>
          <div className="nosotros-team-grid">
            {advantages.map((adv, index) => (
              <div key={index} className="nosotros-team-member">
                <div className="nosotros-team-avatar">
                  <FontAwesomeIcon icon={adv.icon} />
                </div>
                <h3 className="nosotros-team-name">{adv.title}</h3>
                <p className="nosotros-team-bio">{adv.description}</p>
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