import React from "react";
import SideBar from "../components/SideBar";
import AprobacionVehiculos from "../components/AprobacionVehiculos";

function AprobacionVehiculosPage() {
  return (
    <div>
      <SideBar />
      <div style={{ marginLeft: "250px", padding: "20px" }}>
        <AprobacionVehiculos />
      </div>
    </div>
  );
}

export default AprobacionVehiculosPage;
