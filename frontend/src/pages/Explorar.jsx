import React, { useEffect, useState } from 'react';
import CardVehiculo from '../components/CardVehiculo';
import ModalVehiculo from '../components/ModalVehiculo';
import '../assets/Explorar.css';
import { obtenerTodosLosVehiculos } from '../api';

const Explorar = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const vehiculosPorPagina = 8;
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    const fetchVehiculos = async () => {
      const vehiculos = await obtenerTodosLosVehiculos();
      setVehiculos(vehiculos);
    };
    fetchVehiculos();
  }, []);

  const indexOfLastVehiculo = currentPage * vehiculosPorPagina;
  const indexOfFirstVehiculo = indexOfLastVehiculo - vehiculosPorPagina;
  const currentVehiculos = vehiculos.slice(indexOfFirstVehiculo, indexOfLastVehiculo);

  const totalPages = Math.ceil(vehiculos.length / vehiculosPorPagina);

  const handleShowModal = (vehiculo) => setModalData(vehiculo);
  const handleCloseModal = () => setModalData(null);

  return (
    <div className="explorar-container">
      <h1 className="explorar-title">Explora Los Vehículos Disponibles</h1>
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