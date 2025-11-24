import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../styles/DirectorComprasPanel.css";

export default function DirectorComercialPanel() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [selected, setSelected] = useState(null); // cotizacion seleccionada
  const [valoresForm, setValoresForm] = useState([]); // [{ productoId, nombre, precioUnitario }]
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("listado"); // listado | detalle | registrar
  const [justRefreshed, setJustRefreshed] = useState(false); // indicador visual en sidebar

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    // carga inicial silenciosa
    fetchCotizaciones().catch(() => {
      Swal.fire("Error", "No se pudieron cargar las cotizaciones", "error");
    });
    // eslint-disable-next-line
  }, []);

  // ---------- Fetch cotizaciones ----------
  const fetchCotizaciones = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4000/api/cotizaciones", config);
      const data = (res.data || []).map((c) => ({ ...c, _show: false }));
      setCotizaciones(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  // wrapper que muestra toast + indicador en sidebar
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const data = await fetchCotizaciones();
      const count = data?.length ?? 0;

      // SweetAlert Toast en esquina (auto-close)
      Swal.fire({
        toast: true,
        position: "top-start",
        showConfirmButton: false,
        timer: 1600,
        icon: "success",
        title: `Actualización completa — ${count} cotización(es) ✓`,
        customClass: { popup: "swal-toast-custom" },
      });

      // indicador visual pequeño en sidebar (aparece 2.2s)
      setJustRefreshed(true);
      setTimeout(() => setJustRefreshed(false), 2200);

      // si hay una cotización seleccionada, la actualizamos
      if (selected) {
        try {
          const updated = (await axios.get(`http://localhost:4000/api/cotizaciones/${selected.id}`, config)).data;
          setSelected(updated);
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar las cotizaciones", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Seleccionar cotizacion ----------
  const openDetalle = (cot) => {
    setSelected(cot);
    setActiveTab("detalle");
    setValoresForm(
      (cot.productos || []).map((p) => ({
        productoId: p.productoId ?? null,
        nombre: p.nombre ?? "",
        precioUnitario: "",
      }))
    );
  };

  // ---------- Registrar valores ----------
  const handleValorChange = (index, field, value) => {
    const arr = [...valoresForm];
    arr[index][field] = value;
    setValoresForm(arr);
  };

  const submitRegistrarValores = async () => {
    if (!selected) return Swal.fire("Info", "Selecciona una cotización primero", "info");

    // Validaciones
    if (!valoresForm.length) return Swal.fire("Validación", "No hay valores para registrar", "warning");
    for (let i = 0; i < valoresForm.length; i++) {
      const v = valoresForm[i];
      if (!v.precioUnitario || Number(v.precioUnitario) <= 0) {
        return Swal.fire("Validación", `Producto #${i + 1} (${v.nombre}): precio inválido`, "warning");
      }
    }

    const confirm = await Swal.fire({
      title: "Registrar valores",
      text: `Vas a registrar ${valoresForm.length} valores para la cotización #${selected.id}. ¿Continuar?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Registrar",
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      const payload = {
        valores: valoresForm.map((v) => ({
          productoId: v.productoId,
          nombre: v.nombre,
          precioUnitario: Number(v.precioUnitario),
        })),
      };
      await axios.post(
        `http://localhost:4000/api/director/cotizacion/${selected.id}/registrar-valores`,
        payload,
        config
      );
      Swal.fire("Éxito", "Valores registrados correctamente", "success");
      await fetchCotizaciones();
      const updated = (await axios.get(`http://localhost:4000/api/cotizaciones/${selected.id}`, config)).data;
      setSelected(updated);
      setActiveTab("detalle");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err?.response?.data?.message || "Error registrando valores", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Validar cotizacion ----------
  const handleValidar = async (estadoWanted) => {
    if (!selected) return Swal.fire("Info", "Selecciona una cotización primero", "info");

    const confirm = await Swal.fire({
      title: "Validar cotización",
      text: `Vas a marcar la cotización #${selected.id} como "${estadoWanted}". ¿Confirmas?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      await axios.put(
        `http://localhost:4000/api/director/cotizacion/${selected.id}/validar`,
        { estado: estadoWanted },
        config
      );
      Swal.fire("Éxito", "Cotización validada", "success");
      await fetchCotizaciones();
      const updated = (await axios.get(`http://localhost:4000/api/cotizaciones/${selected.id}`, config)).data;
      setSelected(updated);
      setActiveTab("detalle");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err?.response?.data?.message || "Error validando cotización", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Generar Orden de Compra ----------
  const handleGenerarOC = async () => {
    if (!selected) return Swal.fire("Info", "Selecciona una cotización primero", "info");
    if (selected.estado !== "opcionada") {
      return Swal.fire("Error", "Solo se puede generar orden desde una cotización 'opcionada'", "error");
    }

    const confirm = await Swal.fire({
      title: "Generar Orden de Compra",
      text: `Generar orden a partir de cotización #${selected.id} (proveedor: ${selected.proveedor})?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Generar",
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      await axios.post("http://localhost:4000/api/director/orden-compra", { cotizacionId: selected.id }, config);
      Swal.fire("Éxito", "Orden de compra generada", "success");
      await fetchCotizaciones();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err?.response?.data?.message || "Error generando orden de compra", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Reset del formulario (con confirm) ----------
  const handleResetForm = async () => {
    if (!selected) return Swal.fire("Info", "No hay cotización seleccionada", "info");

    const confirm = await Swal.fire({
      title: "Resetear formulario",
      text: "¿Deseas limpiar los precios ingresados? Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, limpiar",
    });

    if (!confirm.isConfirmed) return;

    setValoresForm((selected.productos || []).map((p) => ({ productoId: p.productoId ?? null, nombre: p.nombre, precioUnitario: "" })));
    Swal.fire({ icon: "success", title: "Formulario reseteado", timer: 900, showConfirmButton: false });
  };

  // ---------- Logout con confirmación ----------
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Cerrar sesión",
      text: "¿Estás seguro que deseas cerrar sesión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;
    localStorage.clear();
    Swal.fire({ icon: "success", title: "Sesión cerrada", timer: 900, showConfirmButton: false });
    setTimeout(() => (window.location.href = "/"), 800);
  };

  // ---------- UI helpers ----------
  const formatDate = (iso) => (iso ? iso.split("T")[0] : "");

  // Header title dinámico según pestaña
  const headerTitle = (() => {
    if (activeTab === "listado") return "Listado de cotizaciones";
    if (activeTab === "detalle" && selected) return `Detalle — Cotización #${selected.id}`;
    if (activeTab === "registrar" && selected) return `Registrar valores — Cotización #${selected.id}`;
    return "Director de Compras";
  })();

  return (
    <div className="dir-layout">
      <aside className="dir-sidebar">
        <div>
          <div className="dir-title">Director</div>

          <nav>
            <ul>
              <li className={activeTab === "listado" ? "active" : ""} onClick={() => { setActiveTab("listado"); setSelected(null); }}>
                Listado de Cotizaciones
              </li>
              <li
                className={activeTab === "detalle" ? "active" : ""}
                onClick={() => (selected ? setActiveTab("detalle") : Swal.fire("Info", "Selecciona una cotización", "info"))}
              >
                Detalle / Acciones
              </li>
              <li
                className={activeTab === "registrar" ? "active" : ""}
                onClick={() => (selected ? setActiveTab("registrar") : Swal.fire("Info", "Selecciona una cotización", "info"))}
              >
                Registrar Valores
              </li>
            </ul>
          </nav>
        </div>

        <div className="dir-sidebar-footer">
          <div className="refresh-row">
            <button className="dir-small" onClick={handleRefresh} disabled={loading}>
              {loading ? "Actualizando..." : "Recargar"}
            </button>
            {justRefreshed && <span className="refresh-badge">Actualizado ✓</span>}
          </div>

          <button className="dir-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="dir-main">
        <header className="dir-header">
          <div>
            <h1 className="dir-app-title">{headerTitle}</h1>
            <p className="dir-sub"></p>
          </div>

          <div className="dir-actions">
            <button
              className="dir-small"
              onClick={() => {
                setSelected(null);
                setActiveTab("listado");
              }}
            >
              Volver al listado
            </button>
          </div>
        </header>

        <section className="dir-body">
          {activeTab === "listado" && (
            <div className="card">
              <div className="card-head">
                <h2>Lista de cotizaciones</h2>
                <div>
                  <button className="dir-small" onClick={handleRefresh} disabled={loading}>
                    {loading ? "..." : "Refrescar"}
                  </button>
                </div>
              </div>

              <table className="dir-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Solicitud</th>
                    <th>Proveedor</th>
                    <th>Fecha límite</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="6" className="muted">
                        Cargando...
                      </td>
                    </tr>
                  )}
                  {!loading && cotizaciones.length === 0 && (
                    <tr>
                      <td colSpan="6" className="muted">
                        No hay cotizaciones
                      </td>
                    </tr>
                  )}
                  {cotizaciones.map((c) => (
                    <tr key={c.id} className={selected && selected.id === c.id ? "row-selected" : ""}>
                      <td>#{c.id}</td>
                      <td>#{c.solicitudId}</td>
                      <td>{c.proveedor}</td>
                      <td>{formatDate(c.fecha_limite)}</td>
                      <td>
                        <span className={`badge badge-${c.estado}`}>{c.estado}</span>
                      </td>
                      <td className="actions">
                        <button className="dir-btn" onClick={() => openDetalle(c)}>
                          Ver
                        </button>
                        <button
                          className="dir-small"
                          onClick={async () => {
                            try {
                              const detail = (await axios.get(`http://localhost:4000/api/cotizaciones/${c.id}`, config)).data;
                              setSelected(detail);
                              setValoresForm((detail.productos || []).map((p) => ({ productoId: p.productoId ?? null, nombre: p.nombre, precioUnitario: "" })));
                              setActiveTab("registrar");
                            } catch (err) {
                              Swal.fire("Error", "No se pudo cargar la cotización", "error");
                            }
                          }}
                        >
                          Registrar valores
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "detalle" && selected && (
            <div className="card detail-card">
              <div className="card-head">
                <h2>Detalle — Cotización #{selected.id}</h2>
                <div className="meta-row">
                  <span>
                    <strong>Proveedor:</strong> {selected.proveedor}
                  </span>
                  <span>
                    <strong>Estado:</strong> <span className={`badge badge-${selected.estado}`}>{selected.estado}</span>
                  </span>
                  <span>
                    <strong>Fecha límite:</strong> {formatDate(selected.fecha_limite)}
                  </span>
                </div>
              </div>

              <div className="card-body">
                <div className="detail-grid">
                  <div className="detail-left">
                    <h3>Productos</h3>
                    <ul className="prod-list">
                      {(selected.productos || []).map((p, idx) => (
                        <li key={idx} className="prod-item">
                          <div className="prod-name">{p.nombre}</div>
                          <div className="prod-meta">
                            {p.cantidad} {p.unidad || ""}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-right">
                    <h3>Acciones</h3>
                    <div className="actions-stack">
                      <button className="dir-btn" onClick={() => setActiveTab("registrar")}>
                        Registrar valores
                      </button>

                      <div className="validate-group">
                        <button className="dir-accept" onClick={() => handleValidar("opcionada")}>
                          Opcionada
                        </button>
                        <button className="dir-warning" onClick={() => handleValidar("sospechosa")}>
                          Sospechosa
                        </button>
                        <button className="dir-reject" onClick={() => handleValidar("rechazada")}>
                          Rechazar
                        </button>
                      </div>

                      <button className="dir-secondary" onClick={handleGenerarOC}>
                        Generar Orden
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "registrar" && selected && (
            <div className="card">
              <div className="card-head">
                <h2>Registrar valores — Cotización #{selected.id}</h2>
                <div className="meta-row">
                  <span>
                    <strong>Proveedor:</strong> {selected.proveedor}
                  </span>
                  <span>
                    <strong>Estado:</strong> <span className={`badge badge-${selected.estado}`}>{selected.estado}</span>
                  </span>
                </div>
              </div>

              <div className="card-body">
                <p className="muted">Rellena los precios por producto. Todos los valores deben ser numéricos y mayores que cero.</p>

                <div className="valores-list">
                  {valoresForm.map((v, i) => (
                    <div className="valor-row" key={i}>
                      <div className="valor-info">
                        <div className="v-name">{v.nombre}</div>
                        <div className="v-meta">
                          Cantidad: {selected.productos?.[i]?.cantidad} {selected.productos?.[i]?.unidad || ""}
                        </div>
                      </div>
                      <div className="valor-inputs">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Precio unitario"
                          value={v.precioUnitario}
                          onChange={(e) => handleValorChange(i, "precioUnitario", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="form-actions">
                  <button className="dir-submit" onClick={submitRegistrarValores}>
                    Registrar Valores
                  </button>
                  <button className="dir-secondary" onClick={handleResetForm}>
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
