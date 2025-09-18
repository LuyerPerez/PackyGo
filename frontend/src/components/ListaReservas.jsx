import { useState, useEffect } from "react";
import ReservaCard from "./ReservaCard";

const RESERVAS_POR_PAGINA = 4;

export default function ListaReservas({ reservas, onCalificar, calificadas }) {
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    setPagina(1);
  }, [reservas]);

  const totalPaginas = Math.ceil(reservas.length / RESERVAS_POR_PAGINA);
  const reservasPagina = reservas.slice(
    (pagina - 1) * RESERVAS_POR_PAGINA,
    pagina * RESERVAS_POR_PAGINA
  );

  return (
    <div>
      <div className="lista-reservas">
        {reservasPagina.map(reserva => (
          <ReservaCard
            key={reserva.id}
            reserva={reserva}
            // onCancel eliminado porque no está definido ni usado aquí
            onCalificar={(res, cbLocal) => onCalificar(res, cbLocal)}
            yaCalificadoProp={calificadas && typeof calificadas === 'object' ? calificadas[reserva.id] : undefined}
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