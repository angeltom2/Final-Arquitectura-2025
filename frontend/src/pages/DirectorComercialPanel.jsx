import React from "react";
import "../styles/DirectorComercial.css";

function DirectorComercialPanel() {
  return (
    <div className="director-comercial-container">
      <h1 className="director-comercial-title">Panel del Director Comercial</h1>

      <p className="director-comercial-description">
        Bienvenido al panel del Director Comercial. Aquí podrás gestionar compras, revisar proveedores,
        aprobar presupuestos y ver reportes estratégicos.
      </p>

      <div className="director-comercial-card">
        <h2>📊 Resumen del Área</h2>
        <p>Esta sección puede contener métricas, gráficas o accesos directos.</p>
      </div>
    </div>
  );
}

export default DirectorComercialPanel;
