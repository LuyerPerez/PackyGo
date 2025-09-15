import { useState, useEffect } from "react";
import ReservaCard from "./ReservaCard";

const RESERVAS_POR_PAGINA = 4;

export default function ListaReservas({ reservas, onCalificar }) {
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    setPagina(1);
  }, [reservas]);

  const totalPaginas = Math.ceil(reservas.length / RESERVAS_POR_PAGINA);
  const reservasPagina = reservas.slice(
    (pagina - 1) * RESERVAS_POR_PAGINA,
    pagina * RESERVAS_POR_PAGINA
  );

  // eslint-disable-next-line no-unused-vars
  const handleCancel = id => {
    // No modificar aquí, el padre debe actualizar la lista si es necesario
  };

  return (
    <div>
      <div className="lista-reservas">
        {reservasPagina.map(reserva => (
          <ReservaCard
            key={reserva.id}
            reserva={reserva}
            onCancel={handleCancel}
            onCalificar={onCalificar}
          />
        ))}
      </div>
      {totalPaginas > 1 && (
        <div className="reservas-paginacion">
          <button
            disabled={pagina === 1}
            onClick={() => setPagina(pagina - 1)}
          >
            Anterior
          </button>
          <span>
            Página {pagina} de {totalPaginas}
          </span>
          <button
            disabled={pagina === totalPaginas}
            onClick={() => setPagina(pagina + 1)}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}