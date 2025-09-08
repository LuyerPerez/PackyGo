import React, { useState } from "react";
import TableVehiculos from "../components/TableVehiculos";

function Vehiculos() {
  const [reload, setReload] = useState(false);

  return (
    <div>
      <TableVehiculos reload={reload} setReload={setReload} />
    </div>
  );
}

export default Vehiculos;