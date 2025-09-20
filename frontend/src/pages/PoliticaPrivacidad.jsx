import React from "react";
import "../assets/TerminosCondiciones.css";

export default function PoliticaPrivacidad() {
  return (
    <div className="terminos-wrapper">
      <div className="terminos-container">
        <h1 className="terminos-title">Política de Privacidad de PackyGo</h1>
        <p className="terminos-date">Última actualización: 7 de septiembre de 2025</p>
        <section className="terminos-section">
          <h2>1. Información que recopilamos</h2>
          <p>
            Recopilamos información personal como nombre, correo electrónico, número de documento, teléfono y datos de uso de la plataforma para mejorar nuestros servicios.
          </p>
        </section>
        <section className="terminos-section">
          <h2>2. Uso de la información</h2>
          <ul>
            <li>Gestionar tu cuenta y acceso a la plataforma.</li>
            <li>Mejorar la experiencia de usuario y personalizar servicios.</li>
            <li>Enviar notificaciones importantes relacionadas con tu cuenta.</li>
          </ul>
        </section>
        <section className="terminos-section">
          <h2>3. Compartir información</h2>
          <p>
            No compartimos tu información personal con terceros, salvo requerimiento legal o para el funcionamiento esencial del servicio.
          </p>
        </section>
        <section className="terminos-section">
          <h2>4. Seguridad</h2>
          <p>
            Implementamos medidas de seguridad para proteger tus datos contra accesos no autorizados, alteraciones o destrucción.
          </p>
        </section>
        <section className="terminos-section">
          <h2>5. Derechos del usuario</h2>
          <ul>
            <li>Acceder, rectificar o eliminar tus datos personales.</li>
            <li>Solicitar la limitación u oposición al tratamiento de tus datos.</li>
            <li>Ejercer estos derechos escribiendo a <a href="mailto:packygonotificaciones@gmail.com">packygonotificaciones@gmail.com</a>.</li>
          </ul>
        </section>
        <section className="terminos-section">
          <h2>6. Cambios en la política</h2>
          <p>
            Nos reservamos el derecho de modificar esta política en cualquier momento. Los cambios se publicarán en esta página.
          </p>
        </section>
        <section className="terminos-section">
          <h2>7. Contacto</h2>
          <p>
            Para cualquier consulta sobre privacidad, contáctanos en <a href="mailto:packygonotificaciones@gmail.com">packygonotificaciones@gmail.com</a>.
          </p>
        </section>
        <div className="terminos-footer">
          <img src="/logo.svg" alt="PackyGo Rocket" className="terminos-img" />
          <p>PackyGo &copy; 2025</p>
        </div>
      </div>
    </div>
  );
}