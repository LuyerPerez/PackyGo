import React, { useEffect, useState } from 'react';
import CardVehiculo from '../components/CardVehiculo';
import ModalVehiculo from '../components/ModalVehiculo';
import '../assets/Explorar.css';
import { obtenerTodosLosVehiculos } from '../api';

function FiltroVehiculos({ filtros, setFiltros, vehiculos, minPrecio, maxPrecio }) {
  if (vehiculos.length === 0) return null;

  const tipos = Array.from(new Set(vehiculos.map(v => v.tipo_vehiculo)));

  return (
    <div className="filtro-vehiculos">
      <div className="filtro-chips">
        <select
          value={filtros.tipo_vehiculo}
          onChange={e => setFiltros(f => ({ ...f, tipo_vehiculo: e.target.value }))}
        >
          <option value="">Tipo</option>
          {tipos.map(tipo => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>
        <select
          value={filtros.calificacion}
          onChange={e => setFiltros(f => ({ ...f, calificacion: Number(e.target.value) }))}
        >
          <option value="">Calificación</option>
          {[5, 4, 3, 2, 1].map(n => (
            <option key={n} value={n}>{n} estrellas o más</option>
          ))}
        </select>
      </div>
      <div className="filtro-precio">
        <label>Precio/día: </label>
        <input
          type="range"
          min={minPrecio}
          max={maxPrecio}
          value={filtros.tarifa_diaria || maxPrecio}
          onChange={e => setFiltros(f => ({ ...f, tarifa_diaria: Number(e.target.value) }))}
        />
        <span>${filtros.tarifa_diaria || maxPrecio}</span>
      </div>
      <button
        className="btn-limpiar-filtros"
        onClick={() => setFiltros({ tipo_vehiculo: '', calificacion: '', tarifa_diaria: maxPrecio })}
      >
        Limpiar filtros
      </button>
    </div>
  );
}

const Explorar = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const vehiculosPorPagina = 8;
  const [modalData, setModalData] = useState(null);

  const [filtros, setFiltros] = useState({ tipo_vehiculo: '', calificacion: '', tarifa_diaria: null });

  const precios = vehiculos.map(v => v.tarifa_diaria || 0);
  const minPrecio = precios.length ? Math.min(...precios) : 0;
  const maxPrecio = precios.length ? Math.max(...precios) : 0;

  useEffect(() => {
    if (vehiculos.length > 0 && filtros.tarifa_diaria === null) {
      setFiltros(f => ({ ...f, tarifa_diaria: maxPrecio }));
    }
    // eslint-disable-next-line
  }, [vehiculos, maxPrecio]);

  useEffect(() => {
    const fetchVehiculos = async () => {
      const vehiculos = await obtenerTodosLosVehiculos();
      setVehiculos(vehiculos);
    };
    fetchVehiculos();
  }, []);

  const vehiculosFiltrados = vehiculos.filter(v => {
    const filtraTipo = filtros.tipo_vehiculo ? v.tipo_vehiculo === filtros.tipo_vehiculo : true;
    const filtraCalificacion = filtros.calificacion
      ? Number(v.calificacion || 0) >= Number(filtros.calificacion)
      : true;
    const filtraPrecio = filtros.tarifa_diaria ? v.tarifa_diaria <= filtros.tarifa_diaria : true;
    return filtraTipo && filtraCalificacion && filtraPrecio;
  });

  const indexOfLastVehiculo = currentPage * vehiculosPorPagina;
  const indexOfFirstVehiculo = indexOfLastVehiculo - vehiculosPorPagina;
  const currentVehiculos = vehiculosFiltrados.slice(indexOfFirstVehiculo, indexOfLastVehiculo);

  const totalPages = Math.ceil(vehiculosFiltrados.length / vehiculosPorPagina);

  const handleShowModal = (vehiculo) => setModalData(vehiculo);
  const handleCloseModal = () => setModalData(null);

  return (
    <div className="explorar-container">
      <h1 className="explorar-title">Explora Los Vehículos Disponibles</h1>
      <FiltroVehiculos
        filtros={filtros}
        setFiltros={setFiltros}
        vehiculos={vehiculos}
        minPrecio={minPrecio}
        maxPrecio={maxPrecio}
      />
      <div className="vehiculos-list">
        {currentVehiculos.length === 0 ? (
          <div className="no-vehiculos">No hay vehículos disponibles.</div>
        ) : (
          currentVehiculos.map((vehiculo) => (
            <CardVehiculo
              key={vehiculo.id}
              vehiculo={vehiculo}
              onShowModal={handleShowModal}
            />
          ))
        )}
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              className={currentPage === index + 1 ? 'active' : ''}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
      {modalData && (
        <ModalVehiculo
          vehiculo={modalData}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Explorar;