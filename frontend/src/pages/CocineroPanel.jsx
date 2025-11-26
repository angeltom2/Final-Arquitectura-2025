import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import "../styles/CocineroPanel.css";

export default function CocineroPanel() {
  const [pedidos, setPedidos] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Cargar pedidos
  const fetchPedidos = async () => {
    try {
      const res = await api.get("/pedidos");
      setPedidos(res.data);
    } catch (err) {
      Swal.fire("Error", "No se pudieron cargar los pedidos", "error");
    }
  };

  // Actualización automática cada 5 segundos
  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 5000);
    return () => clearInterval(interval);
  }, []);

  // Marcar pedido como listo
  const marcarListo = async (pedidoId) => {
    const confirm = await Swal.fire({
      title: "¿Marcar pedido como listo?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, listo",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await api.put(`/cocinero/pedidos/${pedidoId}/listo`);
        Swal.fire("¡Listo!", res.data.message, "success");
        fetchPedidos();
      } catch (err) {
        Swal.fire(
          "Error",
          err.response?.data?.message || "No se pudo actualizar el pedido",
          "error"
        );
      }
    }
  };

  // Cerrar sesión
  const handleCerrarSesion = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    });
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div>
          <h2 className="sidebar-title">👨‍🍳 Cocinero</h2>
          <ul>
            <li className="active">Pedidos</li>
          </ul>
        </div>
        <div className="sidebar-buttons">
          <button className="logout-btn" onClick={handleCerrarSesion}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1>Pedidos Pendientes</h1>
        {pedidos.length === 0 ? (
          <p>No hay pedidos disponibles</p>
        ) : (
          <table className="pedidos-table">
            <thead>
              <tr>
                <th>Mesa</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Detalle</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => {
                const totalCalculado = p.detalle.reduce(
                  (acc, d) => acc + (d.precio_unitario || d.plato?.precio_venta || 0) * d.cantidad,
                  0
                );

                return (
                  <tr
                    key={p.id}
                    className={
                      p.estado === "pendiente"
                        ? "pedido-pendiente"
                        : p.estado === "listo"
                        ? "pedido-listo"
                        : "pedido-aceptado"
                    }
                  >
                    <td>{p.mesa}</td>
                    <td>{p.estado}</td>
                    <td>${totalCalculado}</td>
                    <td>
                      <ul>
                        {p.detalle.map((d) => (
                          <li key={d.id}>
                            {d.plato?.nombre || "Plato eliminado"} x {d.cantidad} - $
                            {d.precio_unitario || d.plato?.precio_venta || 0}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      <button
                        className="btn-listo"
                        onClick={() => marcarListo(p.id)}
                        disabled={p.estado === "listo"}
                      >
                        {p.estado === "listo" ? "✔ Listo" : "Marcar como listo"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

