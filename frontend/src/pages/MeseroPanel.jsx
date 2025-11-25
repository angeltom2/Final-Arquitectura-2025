import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import "../styles/MeseroPanel.css";

export default function MeseroPanel() {
  const [activeTab, setActiveTab] = useState("registrar");

  const [platos, setPlatos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);

  // registrar
  const [mesa, setMesa] = useState("");
  const [detalleActual, setDetalleActual] = useState({ platoId: "", cantidad: 1 });
  const [detalles, setDetalles] = useState([]);

  // edición
  const [pedidoEditando, setPedidoEditando] = useState(null);

  useEffect(() => {
    cargarPlatos();
    cargarPedidos();
  }, []);

  // -------------------------
  // Helpers para respuesta flexible
  // -------------------------
  const normalizePlatosResponse = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.platos)) return data.platos;
    return [];
  };

  const normalizePedidosResponse = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.pedidos)) return data.pedidos;
    return [];
  };

  // ===========================================================
  // Cargar platos
  // ===========================================================
  const cargarPlatos = async () => {
    try {
      const res = await api.get("/platos", {
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache", Expires: "0" },
      });
      setPlatos(normalizePlatosResponse(res.data));
    } catch (err) {
      console.error("Error platos:", err);
      Swal.fire("Error", "No se pudieron cargar los platos", "error");
    }
  };

  // ===========================================================
  // Cargar pedidos
  // ===========================================================
  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const res = await api.get("/pedidos");
      setPedidos(normalizePedidosResponse(res.data));
    } catch (err) {
      console.error("Error pedidos:", err);
      Swal.fire("Error", "No se pudieron cargar los pedidos", "error");
    } finally {
      setLoading(false);
    }
  };

  // ===========================================================
  // Registrar (UI)
  // ===========================================================
  const agregarDetalle = () => {
    if (!detalleActual.platoId) return Swal.fire("Error", "Seleccione un plato", "error");
    if (Number(detalleActual.cantidad) < 1) return Swal.fire("Error", "Cantidad inválida", "error");

    const nuevo = {
      id: Date.now(),
      platoId: Number(detalleActual.platoId),
      cantidad: Number(detalleActual.cantidad),
    };

    setDetalles((d) => [...d, nuevo]);
    setDetalleActual({ platoId: "", cantidad: 1 });
    Swal.fire("Agregado", "Plato añadido al pedido", "success");
  };

  const quitarDetalleLocal = (tempId) => {
    setDetalles((d) => d.filter((x) => x.id !== tempId));
  };

  const registrarPedido = async () => {
    if (!mesa.trim()) return Swal.fire("Error", "Ingrese el código de la mesa", "error");
    if (detalles.length === 0) return Swal.fire("Error", "Debe agregar al menos un plato", "error");

    const payload = {
      mesa,
      detalles: detalles.map((d) => ({ platoId: d.platoId, cantidad: d.cantidad })),
    };

    try {
      setLoading(true);
      await api.post("/pedidos", payload);
      Swal.fire("Éxito", "Pedido registrado correctamente", "success");
      setMesa("");
      setDetalles([]);
      cargarPedidos();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err?.response?.data?.message || "No se pudo registrar el pedido", "error");
    } finally {
      setLoading(false);
    }
  };

  // ===========================================================
  // Editar pedido: abrir modal con datos normalizados
  // ===========================================================
  const abrirEdicion = (pedido) => {
    // Build safe estructura: pedido.detalle o pedido.DetallePedidos
    const detalleRaw = pedido.detalle || pedido.DetallePedidos || pedido.detalles || [];
    // map to uniform: { id, platoId, cantidad, precio_unitario, plato: { nombre... } }
    const detalleUniforme = detalleRaw.map((d) => ({
      id: d.id ?? Date.now() + Math.random(),
      platoId: Number(d.platoId ?? d.plato_id),
      cantidad: Number(d.cantidad ?? d.cantidad),
      precio_unitario: d.precio_unitario ?? d.precio_unitario,
      plato: d.plato ?? d.Plato ?? d.plato, // may be nested
    }));

    setPedidoEditando({
      ...pedido,
      detalle: detalleUniforme,
    });
    // switch to lista tab to keep context (or keep same)
    setActiveTab("lista");
  };

  // ===========================================================
  // En el modal: agregar / eliminar / cambiar plato / cantidad
  // ===========================================================
  const edAgregarDetalle = () => {
    if (!pedidoEditando) return;
    const nuevo = {
      id: Date.now(),
      platoId: platos.length ? Number(platos[0].id) : "",
      cantidad: 1,
    };
    setPedidoEditando({
      ...pedidoEditando,
      detalle: [...(pedidoEditando.detalle || []), nuevo],
    });
  };

  const edEliminarDetalle = (id) => {
    setPedidoEditando({
      ...pedidoEditando,
      detalle: (pedidoEditando.detalle || []).filter((x) => x.id !== id),
    });
  };

  const edChangeDetalle = (id, field, value) => {
    setPedidoEditando({
      ...pedidoEditando,
      detalle: (pedidoEditando.detalle || []).map((d) =>
        d.id === id ? { ...d, [field]: field === "platoId" ? Number(value) : Number(value) } : d
      ),
    });
  };

  // ===========================================================
  // Guardar edición (no tocar estado)
  // ===========================================================
  const guardarEdicion = async () => {
    if (!pedidoEditando) return;
    if (!pedidoEditando.mesa || !pedidoEditando.mesa.trim())
      return Swal.fire("Error", "La mesa no puede estar vacía", "error");

    const payload = {
      mesa: pedidoEditando.mesa,
      detalles: (pedidoEditando.detalle || []).map((d) => ({
        platoId: d.platoId,
        cantidad: d.cantidad,
      })),
      // estado no se envía para respetar la regla
    };

    try {
      setLoading(true);
      await api.put(`/pedidos/${pedidoEditando.id}`, payload);
      Swal.fire("Éxito", "Pedido actualizado", "success");
      setPedidoEditando(null);
      cargarPedidos();
    } catch (err) {
      console.error("Error actualizar pedido:", err);
      Swal.fire("Error", "No se pudo actualizar el pedido", "error");
    } finally {
      setLoading(false);
    }
  };

  // ===========================================================
  // Eliminar pedido
  // ===========================================================
  const eliminarPedido = (id) => {
    Swal.fire({
      title: "¿Confirmar eliminación?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "#b33a2c",
    }).then(async (r) => {
      if (!r.isConfirmed) return;
      try {
        await api.delete(`/pedidos/${id}`);
        Swal.fire("Eliminado", "Pedido eliminado", "success");
        cargarPedidos();
      } catch (err) {
        console.error("Error eliminar:", err);
        Swal.fire("Error", "No se pudo eliminar", "error");
      }
    });
  };

  // ===========================================================
  // Badge por estado
  // ===========================================================
  const EstadoBadge = ({ estado }) => {
    const key = (estado || "pendiente").toLowerCase();
    let cls = "badge-pendiente";
    if (key === "aprobado" || key === "aprove" || key === "aproveado") cls = "badge-aprobado";
    if (key === "rechazado" || key === "rechazada") cls = "badge-rechazado";
    return <span className={`estado-badge ${cls}`}>{estado}</span>;
  };

  // ===========================================================
  // Render
  // ===========================================================
  return (
    <div className="mesero-layout">
      {/* SIDEBAR */}
      <aside className="mesero-sidebar">
        <h2 className="sidebar-title">Panel Mesero</h2>

        <ul>
          <li className={activeTab === "registrar" ? "active" : ""} onClick={() => setActiveTab("registrar")}>Registrar Pedido</li>
          <li className={activeTab === "lista" ? "active" : ""} onClick={() => setActiveTab("lista")}>Pedidos Registrados</li>
        </ul>

        <button className="logout-btn" onClick={() => {
          Swal.fire({
            title: "¿Cerrar sesión?",
            text: "Tu sesión será cerrada",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, salir",
            cancelButtonText: "Cancelar",
          }).then((r) => {
            if (r.isConfirmed) { localStorage.clear(); window.location.href = "/"; }
          });
        }}>Cerrar Sesión</button>
      </aside>

      {/* MAIN */}
      <main className="mesero-main">
        <div className="top-bar">
          <div className="top-left">
            <h3 className="page-title">Mesero</h3>
          </div>
          <div className="top-right">
            <button className="refresh-btn" onClick={() => { cargarPlatos(); cargarPedidos(); }}>Refrescar</button>
          </div>
        </div>

        {/* REGISTRAR */}
        {activeTab === "registrar" && (
          <section className="panel-container">
            <h2>Registrar Pedido</h2>

            <div className="form-row">
              <label>Mesa</label>
              <input type="text" value={mesa} onChange={(e) => setMesa(e.target.value)} placeholder="Ej: M1" />
            </div>

            <div className="detalle-box">
              <h4>Agregar plato</h4>
              <div className="inline-controls">
                <select value={detalleActual.platoId} onChange={(e) => setDetalleActual({ ...detalleActual, platoId: e.target.value })}>
                  <option value="">-- Seleccione un plato --</option>
                  {platos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre} — ${Number(p.precio_venta)}</option>
                  ))}
                </select>
                <input type="number" min="1" value={detalleActual.cantidad} onChange={(e) => setDetalleActual({ ...detalleActual, cantidad: e.target.value })} />
                <button className="add-btn" onClick={agregarDetalle}>Agregar</button>
              </div>

              <div className="detalles-list">
                {detalles.length === 0 ? <p className="muted">No hay detalles añadidos</p> :
                  detalles.map((d) => (
                    <div key={d.id} className="detalle-item">
                      <div>
                        <strong>{platos.find(p => p.id === d.platoId)?.nombre || "Desconocido"}</strong>
                        <div className="muted small">Cantidad: {d.cantidad}</div>
                      </div>
                      <div className="detalle-actions">
                        <button className="mini-remove" onClick={() => quitarDetalleLocal(d.id)}>Eliminar</button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            <div className="actions-bottom">
              <button className="guardar-btn" onClick={registrarPedido}>Registrar Pedido</button>
            </div>
          </section>
        )}

        {/* LISTA */}
        {activeTab === "lista" && (
          <section className="panel-container">
            <h2>Pedidos Registrados</h2>

            {loading ? <p>Cargando pedidos...</p> :
              pedidos.length === 0 ? <p>No hay pedidos registrados</p> :
                <div className="pedidos-grid">
                  {pedidos.map((p) => (
                    <article key={p.id} className="pedido-card">
                      <div className="pedido-header">
                        <div>
                          <h3>Mesa: {p.mesa}</h3>
                          <div className="muted">ID: {p.id} • {new Date(p.createdAt).toLocaleString()}</div>
                        </div>
                        <div>
                          <EstadoBadge estado={p.estado || "pendiente"} />
                        </div>
                      </div>

                      <div className="pedido-body">
                        <table className="detalle-table">
                          <thead>
                            <tr>
                              <th>Plato</th>
                              <th>Cantidad</th>
                              <th>Precio unit.</th>
                            </tr>
                          </thead>
                          <tbody>
                            { (p.detalle || p.DetallePedidos || []).map((d) => (
                              <tr key={d.id}>
                                <td>{(d.plato && d.plato.nombre) || platos.find(x => x.id === d.platoId)?.nombre || "Plato eliminado"}</td>
                                <td>{d.cantidad}</td>
                                <td>{d.precio_unitario ?? (platos.find(x => x.id === d.platoId)?.precio_venta ?? "-")}</td>
                              </tr>
                            )) }
                          </tbody>
                        </table>
                      </div>

                      <div className="card-actions">
                        <button className="btn edit-btn" onClick={() => abrirEdicion(p)}>✏️ Editar</button>
                        <button className="btn delete-btn" onClick={() => eliminarPedido(p.id)}>🗑️ Eliminar</button>
                      </div>
                    </article>
                  ))}
                </div>
            }
          </section>
        )}

        {/* MODAL EDICIÓN */}
        {pedidoEditando && (
          <div className="modal-bg">
            <div className="modal card">
              <header className="modal-header">
                <h3>Editar Pedido #{pedidoEditando.id}</h3>
                <button className="close-x" onClick={() => setPedidoEditando(null)}>✕</button>
              </header>

              <div className="modal-body">
                <div className="form-row">
                  <label>Mesa</label>
                  <input value={pedidoEditando.mesa} onChange={(e) => setPedidoEditando({ ...pedidoEditando, mesa: e.target.value })} />
                </div>

                <div className="muted">Estado: <strong>{pedidoEditando.estado}</strong> (no editable)</div>

                <h4 className="mt-12">Detalles</h4>
                <div className="ed-detalles">
                  {(pedidoEditando.detalle || []).map((d) => (
                    <div key={d.id} className="ed-row">
                      <select value={d.platoId} onChange={(e) => edChangeDetalle(d.id, "platoId", e.target.value)}>
                        {platos.map((pl) => <option key={pl.id} value={pl.id}>{pl.nombre} — ${Number(pl.precio_venta)}</option>)}
                      </select>

                      <input type="number" min="1" value={d.cantidad} onChange={(e) => edChangeDetalle(d.id, "cantidad", e.target.value)} />

                      <button className="mini-remove" onClick={() => edEliminarDetalle(d.id)}>Eliminar</button>
                    </div>
                  ))}

                  <div className="ed-actions">
                    <button className="add-btn" onClick={edAgregarDetalle}>Agregar detalle</button>
                  </div>
                </div>
              </div>

              <footer className="modal-footer">
                <button className="guardar-btn" onClick={guardarEdicion}>Guardar cambios</button>
                <button className="cancelar-btn" onClick={() => setPedidoEditando(null)}>Cancelar</button>
              </footer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
