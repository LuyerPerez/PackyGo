import React from "react";
import "../assets/TerminosCondiciones.css";

export default function TerminosCondiciones() {
  return (
    <div className="terminos-wrapper">
      <div className="terminos-container">
        <h1 className="terminos-title">Términos y Condiciones de PackyGo</h1>
        <p className="terminos-date">Última actualización: 7 de septiembre de 2025</p>
        <section>
          <h2>1. Introducción</h2>
          <p>
            Bienvenido a PackyGo. Al registrarte y utilizar nuestros servicios, aceptas los siguientes términos y condiciones. Por favor, léelos cuidadosamente antes de continuar.
          </p>
        </section>
        <section>
          <h2>2. Registro de Usuario</h2>
          <p>
            Para acceder a ciertas funcionalidades, debes crear una cuenta proporcionando información veraz y actualizada. Eres responsable de mantener la confidencialidad de tus credenciales.
          </p>
        </section>
        <section>
          <h2>3. Uso de la Plataforma</h2>
          <ul>
            <li>No puedes utilizar PackyGo para actividades ilegales o fraudulentas.</li>
            <li>Debes respetar a otros usuarios y no realizar acciones que afecten negativamente la experiencia de la comunidad.</li>
            <li>PackyGo se reserva el derecho de suspender cuentas que incumplan estos términos.</li>
          </ul>
        </section>
        <section>
          <h2>4. Protección de Datos</h2>
          <p>
            Tu información personal será tratada conforme a nuestra <a href="/privacidad">Política de Privacidad</a>. No compartiremos tus datos sin tu consentimiento, salvo requerimiento legal.
          </p>
        </section>
        <section>
          <h2>5. Responsabilidad</h2>
          <p>
            PackyGo no se responsabiliza por daños directos o indirectos derivados del uso de la plataforma. El usuario asume toda responsabilidad por el uso de los servicios.
          </p>
        </section>
        <section>
          <h2>6. Modificaciones</h2>
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán publicados en esta página y el uso continuado implica aceptación de los mismos.
          </p>
        </section>
        <section>
          <h2>7. Contacto</h2>
          <p>
            Si tienes dudas sobre estos términos, puedes contactarnos en <a href="mailto:packygonotificaciones@gmail.com">packygonotificaciones@gmail.com</a>.
          </p>
        </section>
        <div className="terminos-footer">
          <img src="/rocket-login.png" alt="PackyGo Rocket" className="terminos-img" />
          <p>PackyGo &copy; 2025</p>
        </div>
      </div>
    </div>
  );
}