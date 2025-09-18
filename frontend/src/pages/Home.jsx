import "../assets/Home.css";
import { useState, useEffect } from "react";
import { obtenerTodosLosVehiculos, getImagenUrl, obtenerReservasPorVehiculo } from "../api";

const FILTROS = ["Destacados", "Más recientes", "Mejor valorados"];

export default function Home() {
  const [filtro, setFiltro] = useState("Destacados");
  const [camiones, setCamiones] = useState([]);
  const [reservasPorCamion, setReservasPorCamion] = useState({});

  useEffect(() => {
    async function fetchCamionesYReservas() {
      try {
        const data = await obtenerTodosLosVehiculos();
        const adaptados = data.map(c => ({
          id: c.id,
          nombre: c.nombre || c.tipo_vehiculo || "Camión",
          imagen: c.imagen_url || "public/plataforma.jpg",
          tipo: c.tipo_vehiculo,
          precio: c.tarifa_diaria ? `$${c.tarifa_diaria}/h` : "$--/h",
          precioAnt: null,
          destacado: c.destacado || false,
          calificacion: c.calificacion ?? null,
          fecha: c.fecha_creacion || c.fecha || "2025-09-01"
        }));
        setCamiones(adaptados);

        const reservasPromises = adaptados.map(camion => obtenerReservasPorVehiculo(camion.id));
        const reservasArrays = await Promise.all(reservasPromises);
        const reservasCount = {};
        adaptados.forEach((camion, idx) => {
          reservasCount[camion.id] = reservasArrays[idx]?.length || 0;
        });
        setReservasPorCamion(reservasCount);
      } catch (err) {
        console.error("Error al cargar los camiones o reservas:", err);
        setCamiones([]);
        setReservasPorCamion({});
      }
    }
    fetchCamionesYReservas();
  }, []);

  let camionesFiltrados = [];
  if (filtro === "Destacados") {
    
    camionesFiltrados = [...camiones]
      .sort((a, b) => (reservasPorCamion[b.id] || 0) - (reservasPorCamion[a.id] || 0))
      .slice(0, 3);
  } else if (filtro === "Más recientes") {
    
    camionesFiltrados = [...camiones]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 3);
  } else if (filtro === "Mejor valorados") {
    
    camionesFiltrados = [...camiones]
      .sort((a, b) => (b.calificacion ?? 0) - (a.calificacion ?? 0))
      .slice(0, 3);
  }

  return (
    <div>
      <section className="banner">
        <div className="content-banner">
          <p>Alquiler de Camiones</p>
          <h2>Reserva tu mudanza <br />Rápido y Seguro</h2>
          <a href="#" className="banner-btn" onClick={() => window.location.href = "/explorar"}>Reservar ahora</a>
        </div>
      </section>
      <main className="main-content">
        <section className="container container-features">
          <div className="card-feature">
            <i className="fa-solid fa-truck-fast"></i>
            <div className="feature-content">
              <span>Entrega puntual</span>
              <p>Camiones disponibles en todo momento</p>
            </div>
          </div>
          <div className="card-feature">
            <i className="fa-solid fa-wallet"></i>
            <div className="feature-content">
              <span>Paga al recibir</span>
              <p>Garantía de devolución de dinero</p>
            </div>
          </div>
          <div className="card-feature">
            <i className="fa-solid fa-gift"></i>
            <div className="feature-content">
              <span>Descuentos especiales</span>
              <p>Ofertas en reservas anticipadas</p>
            </div>
          </div>
          <div className="card-feature">
            <i className="fa-solid fa-headset"></i>
            <div className="feature-content">
              <span>Soporte 24/7</span>
              <p>Contáctanos en cualquier momento</p>
            </div>
          </div>
        </section>
        <section className="container top-categories">
          <h1 className="heading-1">Tipos de Camiones</h1>
          <div className="container-categories">
            <div className="card-category pequeño-category">
              <p>Camión Pequeño</p>
              <span onClick={() => window.location.href = "/explorar"}>Ver más</span>
            </div>
            <div className="card-category mediano-category">
              <p>Camión Mediano</p>
              <span onClick={() => window.location.href = "/explorar"}>Ver más</span>
            </div>
            <div className="card-category grande-category">
              <p>Camión Grande</p>
              <span onClick={() => window.location.href = "/explorar"}>Ver más</span>
            </div>
          </div>
        </section>
        <section className="container top-products">
          <h1 className="heading-1">Camiones Disponibles</h1>
          <div className="container-options">
            {FILTROS.map(f => (
              <span
                key={f}
                className={filtro === f ? "active" : ""}
                onClick={() => setFiltro(f)}
                style={{ cursor: "pointer" }}
              >
                {f}
              </span>
            ))}
          </div>
          <div className="container-products">
            {camionesFiltrados.length === 0 ? (
              <p style={{textAlign: 'center', width: '100%'}}>No hay camiones destacados.</p>
            ) : camionesFiltrados.map(camion => {
              let calificacion = camion.calificacion;
              if (calificacion !== null && calificacion !== undefined) {
                calificacion = Number(calificacion);
              }
              const renderStars = (calificacion) => {
                const stars = [];
                for (let i = 1; i <= 5; i++) {
                  if (calificacion >= i) {
                    stars.push(<span key={i} className="star filled">★</span>);
                  } else if (calificacion > i - 1) {
                    stars.push(<span key={i} className="star half">★</span>);
                  } else {
                    stars.push(<span key={i} className="star">★</span>);
                  }
                }
                return stars;
              };

              return (
                <div className="card-product" key={camion.id}>
                  <div className="container-img">
                    <img src={getImagenUrl(camion.imagen)} alt={camion.nombre} />
                    <div className="button-group"></div>
                  </div>
                  <div className="content-card-product">
                    <div className="stars" style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                      {calificacion !== null && calificacion !== undefined
                        ? <>
                            {renderStars(calificacion)}
                            <span className="promedio" style={{marginLeft: '6px', fontWeight: 'bold', fontSize: '1rem'}}>({calificacion.toFixed(1)})</span>
                          </>
                        : <span className="no-rating">No tiene calificación</span>
                      }
                    </div>
                    <h3>{camion.nombre}</h3>
                    <p className="price">{camion.precio} {camion.precioAnt && <span>{camion.precioAnt}</span>}</p>
                    <p style={{fontSize: '0.95rem', color: '#555'}}>Reservas: <b>{reservasPorCamion[camion.id] || 0}</b></p>
                    <button className="btn-info">Más información</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="gallery">
          <img src="public/gallery1.jpg" alt="Camión 1" className="gallery-img-1" />
          <img src="public/gallery2.jpg" alt="Camión 2" className="gallery-img-2" />
          <img src="public/gallery3.jpg" alt="Camión 3" className="gallery-img-3" />
          <img src="public/gallery4.jpg" alt="Camión 4" className="gallery-img-4" />
          <img src="public/gallery5.jpg" alt="Camión 5" className="gallery-img-5" />
        </section>
        <section className="container blogs">
          <h1 className="heading-1">Últimos Consejos de Mudanza</h1>
          <div className="container-blogs">
            <div className="card-blog">
              <div className="container-img">
                <img src="public/blog-1.jpg" alt="Blog Mudanza 1" />
              </div>
              <div className="content-blog">
                <h3>Trucos para empacar y ahorrar espacio</h3>
                <span>15 Sept 2025</span>
                <p>Aprovecha cada caja colocando los objetos más pesados al fondo. Usa bolsas al vacío para ropa y mantas. Marca cada caja con el cuarto al que pertenece.</p>
              </div>
            </div>
            <div className="card-blog">
              <div className="container-img">
                <img src="public/blog-2.jpg" alt="Blog Mudanza 2" />
              </div>
              <div className="content-blog">
                <h3>¿Cómo elegir el camión ideal?</h3>
                <span>15 Sept 2025</span>
                <p>Piensa en el tamaño de tu mudanza. Si tienes pocas cosas, como ropa y algunas cajas, un camión pequeño es suficiente.</p>
              </div>
            </div>
            <div className="card-blog">
              <div className="container-img">
                <img src="public/blog-3.jpg" alt="Blog Mudanza 3" />
              </div>
              <div className="content-blog">
                <h3>Cómo proteger tus muebles durante la mudanza</h3>
                <span>15 Sept 2025</span>
                <p>Protege tus muebles envolviéndolos con mantas, cartón y plástico de burbujas. Desarma lo que sea posible para evitar daños y facilitar el transporte.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* Modal eliminada */}
      <footer className="footer">
        <div className="container container-footer">
          <div className="menu-footer">
            <div className="contact-info">
              <p className="title-footer">Información de Contacto</p>
              <ul>
                <li>Teléfono: 123-456-789</li>
                <li>Email: info@packygo.com</li>
                <li>Dirección: Bogotá, Colombia</li>
              </ul>
              <div className="social-icons">
                <span className="facebook"><i className="fa-brands fa-facebook"></i></span>
                <span className="twitter"><i className="fa-brands fa-twitter"></i></span>
                <span className="youtube"><i className="fa-brands fa-youtube"></i></span>
                <span className="pinterest"><i className="fa-brands fa-pinterest"></i></span>
                <span className="instagram"><i className="fa-brands fa-instagram"></i></span>
              </div>
            </div>
            <div className="information">
              <p className="title-footer">Información</p>
              <ul>
                <li><a href="#">Política de Privacidad</a></li>
                <li><a href="#">Términos y Condiciones</a></li>
                <li><a href="#">Preguntas Frecuentes</a></li>
                <li><a href="#">Blog</a></li>
              </ul>
            </div>
            <div className="my-account">
              <p className="title-footer">Mi cuenta</p>
              <ul>
                <li><a href="#">Iniciar sesión</a></li>
                <li><a href="#">Registrarse</a></li>
                <li><a href="#">Mis reservas</a></li>
                <li><a href="#">Reportar incidencia</a></li>
              </ul>
            </div>
            <div className="form-footer">
              <p className="title-footer">Reportar Incidencia</p>
              <form>
                <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                  <li className="form-group">
                    <label htmlFor="reserva_id">ID Reserva</label>
                    <input type="number" id="reserva_id" name="reserva_id" required />
                  </li>
                  <li className="form-group">
                    <label htmlFor="usuario_id">ID Usuario</label>
                    <input type="number" id="usuario_id" name="usuario_id" required />
                  </li>
                  <li className="form-group">
                    <label htmlFor="descripcion">Descripción</label>
                    <textarea id="descripcion" name="descripcion" placeholder="Escribe tu incidencia..." required></textarea>
                  </li>
                  <li className="form-group">
                    <button type="submit">Enviar</button>
                  </li>
                </ul>
              </form>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
