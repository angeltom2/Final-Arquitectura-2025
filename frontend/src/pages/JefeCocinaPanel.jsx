import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import "../styles/JefeCocina.css";

export default function JefeCocinaPanel() {
  const [inventario, setInventario] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [activeSection, setActiveSection] = useState("inventario");

  const [nuevaSolicitud, setNuevaSolicitud] = useState({
    productos: [{ nombre: "", cantidad: "", unidad: "" }],
    observaciones: "",
  });

  const fetchInventario = async () => {
    try {
      const res = await api.get("/inventario");
      setInventario(res.data);
    } catch {
      Swal.fire("Error", "No se pudo cargar el inventario", "error");
    }
  };

  const fetchSolicitudes = async () => {
    try {
      const res = await api.get("/solicitudes");
      setSolicitudes(res.data);
    } catch {
      Swal.fire("Error", "No se pudieron cargar las solicitudes", "error");
    }
  };

  useEffect(() => {
    fetchInventario();
    fetchSolicitudes();
  }, []);

  const agregarProducto = () => {
    setNuevaSolicitud({
      ...nuevaSolicitud,
      productos: [...nuevaSolicitud.productos, { nombre: "", cantidad: "", unidad: "" }],
    });
  };

  const quitarProducto = (index) => {
    const arr = nuevaSolicitud.productos.filter((_, i) => i !== index);
    setNuevaSolicitud({ ...nuevaSolicitud, productos: arr });
  };

  const validarProductos = () => {
    for (let i = 0; i < nuevaSolicitud.productos.length; i++) {
      const p = nuevaSolicitud.productos[i];

      // 🔴 VALIDAR NOMBRE
      if (!p.nombre.trim()) {
        Swal.fire("Error", `El producto #${i + 1} necesita un nombre`, "error");
        return false;
      }

      // 🔴 VALIDAR CANTIDAD → solo números mayores a 0
      if (!/^\d+(\.\d+)?$/.test(p.cantidad)) {
        Swal.fire(
          "Cantidad inválida",
          `La cantidad del producto #${i + 1} debe ser un número válido`,
          "error"
        );
        return false;
      }

      if (parseFloat(p.cantidad) <= 0) {
        Swal.fire(
          "Cantidad inválida",
          `La cantidad del producto #${i + 1} debe ser mayor que 0`,
          "error"
        );
        return false;
      }

      // 🔴 VALIDAR UNIDAD → solo letras (kg, g, L, ml…)
      if (!/^[a-zA-Z]+$/.test(p.unidad)) {
        Swal.fire(
          "Unidad inválida",
          `La unidad del producto #${i + 1} debe contener solo letras (ej: kg, g, L, ml)`,
          "error"
        );
        return false;
      }
    }

    return true;
  };

  const enviarSolicitud = async (e) => {
    e.preventDefault();

    if (!validarProductos()) return; // ⛔ Detiene el proceso si algo está mal

    try {
      await api.post("/solicitudes", nuevaSolicitud);

      Swal.fire("Solicitud enviada", "El Auxiliar de Compras la revisará", "success");

      setNuevaSolicitud({
        productos: [{ nombre: "", cantidad: "", unidad: "" }],
        observaciones: "",
      });

      fetchSolicitudes();
      setActiveSection("solicitudes");
    } catch {
      Swal.fire("Error", "No se pudo enviar la solicitud", "error");
    }
  };

  const logout = () => {
    Swal.fire({
      title: "¿Seguro que deseas cerrar sesión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#b33a2c",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        window.location.href = "/";
      }
    });
  };

  return (
    <div className="chef-layout">

      {/* SIDEBAR */}
      <aside className="chef-sidebar">
        <h2 className="chef-title">👨‍🍳 Jefe de Cocina</h2>

        <ul>
          <li className={activeSection === "inventario" ? "active" : ""} onClick={() => setActiveSection("inventario")}>
            📦 Inventario
          </li>

          <li className={activeSection === "nueva" ? "active" : ""} onClick={() => setActiveSection("nueva")}>
            📝 Nueva Solicitud
          </li>

          <li className={activeSection === "solicitudes" ? "active" : ""} onClick={() => setActiveSection("solicitudes")}>
            📄 Mis Solicitudes
          </li>
        </ul>

        <button className="logout-btn" onClick={logout}>🚪 Cerrar Sesión</button>
      </aside>

      {/* MAIN */}
      <main className="chef-main">

        {/* INVENTARIO */}
        {activeSection === "inventario" && (
          <section>
            <h1>📦 Inventario</h1>

            <table className="chef-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock</th>
                  <th>Mínimo</th>
                  <th>Unidad</th>
                </tr>
              </thead>

              <tbody>
                {inventario.map((p) => (
                  <tr key={p.id} className={p.stock_actual <= p.stock_minimo ? "low" : ""}>
                    <td>{p.nombre}</td>
                    <td>{p.stock_actual}</td>
                    <td>{p.stock_minimo}</td>
                    <td>{p.unidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* NUEVA SOLICITUD */}
        {activeSection === "nueva" && (
          <section>
            <h1>📝 Registrar Solicitud</h1>

            <form className="chef-form" onSubmit={enviarSolicitud}>

              {nuevaSolicitud.productos.map((p, i) => (
                <div className="producto-row" key={i}>
                  <input
                    type="text"
                    placeholder="Producto"
                    value={p.nombre}
                    onChange={(e) => {
                      const arr = [...nuevaSolicitud.productos];
                      arr[i].nombre = e.target.value;
                      setNuevaSolicitud({ ...nuevaSolicitud, productos: arr });
                    }}
                  />

                  <input
                    type="text"
                    placeholder="Cantidad"
                    value={p.cantidad}
                    onChange={(e) => {
                      const arr = [...nuevaSolicitud.productos];
                      arr[i].cantidad = e.target.value;
                      setNuevaSolicitud({ ...nuevaSolicitud, productos: arr });
                    }}
                  />

                  <input
                    type="text"
                    placeholder="Unidad"
                    value={p.unidad}
                    onChange={(e) => {
                      const arr = [...nuevaSolicitud.productos];
                      arr[i].unidad = e.target.value;
                      setNuevaSolicitud({ ...nuevaSolicitud, productos: arr });
                    }}
                  />

                  <button type="button" className="remove-btn" onClick={() => quitarProducto(i)}>
                    ❌
                  </button>
                </div>
              ))}

              <button type="button" className="add-btn" onClick={agregarProducto}>
                ➕ Agregar Producto
              </button>

              <textarea
                placeholder="Observaciones"
                value={nuevaSolicitud.observaciones}
                onChange={(e) => setNuevaSolicitud({ ...nuevaSolicitud, observaciones: e.target.value })}
              />

              <button className="submit-btn">Enviar Solicitud</button>
            </form>
          </section>
        )}

        {/* MIS SOLICITUDES */}
        {activeSection === "solicitudes" && (
          <section>
            <h1>📄 Mis Solicitudes</h1>

            <table className="chef-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Observaciones</th>
                </tr>
              </thead>

              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{new Date(s.fechaSolicitud).toLocaleString()}</td>
                    <td className={`estado ${s.estado}`}>{s.estado}</td>
                    <td>{s.observaciones || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

      </main>
    </div>
  );
}
