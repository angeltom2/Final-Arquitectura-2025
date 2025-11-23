import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../styles/AuxComprasPanel.css";

export default function AuxComprasPanel() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [form, setForm] = useState({
    solicitudId: "",
    proveedor: "",
    fecha_limite: "",
    productos: [],
    notas: "",
  });
  const [activeTab, setActiveTab] = useState("crear"); // "crear" | "listar"
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchSolicitudes();
    fetchCotizaciones();
    // eslint-disable-next-line
  }, []);

  // ---------- Fetchers ----------
  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4000/api/solicitudes", config);
      // esperamos que cada solicitud tenga .productos (si no, será undefined)
      setSolicitudes(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar las solicitudes", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCotizaciones = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4000/api/cotizaciones", config);
      setCotizaciones(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar las cotizaciones", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Form handlers ----------
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Nuevo: cuando el usuario selecciona una solicitud, precargar productos
  const handleSolicitudChange = async (e) => {
    const solicitudId = e.target.value;
    const solicitudObj = solicitudes.find((s) => String(s.id) === String(solicitudId));

    // si no seleccionó (vacío)
    if (!solicitudId) {
      setForm({ ...form, solicitudId: "", productos: [] });
      return;
    }

    // si ya hay productos en el form, preguntar si reemplazar
    if (form.productos && form.productos.length > 0) {
      const result = await Swal.fire({
        title: "La solicitud tiene productos",
        text: "Ya hay productos en el formulario. ¿Deseas reemplazarlos con los de la solicitud seleccionada?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Reemplazar",
        cancelButtonText: "Conservar",
      });

      if (!result.isConfirmed) {
        // solo actualizamos la solicitudId pero conservamos productos
        setForm((prev) => ({ ...prev, solicitudId }));
        return;
      }
    }

    // Si la solicitud existe y tiene productos, mapearlos al formato del formulario
    if (solicitudObj && Array.isArray(solicitudObj.productos) && solicitudObj.productos.length > 0) {
      const mapped = solicitudObj.productos.map((p) => ({
        productoId: p.productoId ?? null,
        nombre: p.nombre ?? "",
        cantidad: p.cantidad ?? "",
        unidad: p.unidad ?? "", // si tu solicitud no trae unidad, queda vacío y se validará
      }));

      setForm({ ...form, solicitudId, productos: mapped });
    } else {
      // no trae productos: solo setear solicitudId y vaciar productos
      setForm({ ...form, solicitudId, productos: [] });
      Swal.fire("Info", "La solicitud no contiene productos predefinidos.", "info");
    }
  };

  const handleAddProducto = () => {
    setForm({
      ...form,
      productos: [...form.productos, { nombre: "", cantidad: "", unidad: "" }],
    });
  };

  const handleProductoChange = (index, field, value) => {
    const newProductos = [...form.productos];
    newProductos[index][field] = value;
    setForm({ ...form, productos: newProductos });
  };

  const handleRemoveProducto = (index) => {
    const newProductos = [...form.productos];
    newProductos.splice(index, 1);
    setForm({ ...form, productos: newProductos });
  };

  // ---------- Validaciones ----------
  const validateForm = () => {
    if (!form.solicitudId) {
      Swal.fire("Validación", "Debe seleccionar una solicitud", "warning");
      return false;
    }
    if (!form.proveedor || form.proveedor.trim().length < 3) {
      Swal.fire("Validación", "Proveedor inválido (mínimo 3 caracteres)", "warning");
      return false;
    }
    if (!form.fecha_limite) {
      Swal.fire("Validación", "Debe indicar fecha límite", "warning");
      return false;
    }
    if (form.productos.length === 0) {
      Swal.fire("Validación", "Debe agregar al menos un producto", "warning");
      return false;
    }
    for (let i = 0; i < form.productos.length; i++) {
      const p = form.productos[i];
      if (!p.nombre || p.nombre.trim().length < 2) {
        Swal.fire("Validación", `Producto #${i + 1}: nombre inválido`, "warning");
        return false;
      }
      if (p.cantidad === "" || p.cantidad === null || Number(p.cantidad) <= 0) {
        Swal.fire("Validación", `Producto #${i + 1}: cantidad inválida`, "warning");
        return false;
      }
      if (!p.unidad) {
        Swal.fire("Validación", `Producto #${i + 1}: debe seleccionar unidad`, "warning");
        return false;
      }
    }
    return true;
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        solicitudId: Number(form.solicitudId),
        proveedor: form.proveedor.trim(),
        fecha_limite: form.fecha_limite,
        productos: form.productos.map((p) => ({
          productoId: p.productoId ?? null,
          nombre: p.nombre.trim(),
          cantidad: Number(p.cantidad),
          unidad: p.unidad,
        })),
        notas: form.notas?.trim() || "",
      };

      await axios.post("http://localhost:4000/api/cotizaciones", payload, config);

      Swal.fire({
        icon: "success",
        title: "Cotización creada",
        timer: 1400,
        showConfirmButton: false,
      });

      setForm({ solicitudId: "", proveedor: "", fecha_limite: "", productos: [], notas: "" });
      fetchCotizaciones();
      fetchSolicitudes();
      setActiveTab("listar");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err?.response?.data?.message || "Error creando cotización", "error");
    }
  };

  // ---------- UI helpers ----------
  const formatDate = (iso) => {
    if (!iso) return "";
    return iso.split("T")[0];
  };

  const toggleDetails = (id) => {
    setCotizaciones((prev) => prev.map((c) => (c.id === id ? { ...c, _show: !c._show } : c)));
  };

  const confirmRefresh = () => {
    fetchSolicitudes();
    fetchCotizaciones();
    Swal.fire({ icon: "success", title: "Datos actualizados", timer: 900, showConfirmButton: false });
  };

  return (
    <div className="aux-layout">
      <aside className="aux-sidebar">
        <div>
          <div className="aux-sidebar-title">Auxiliar de Compras</div>
          <nav>
            <ul>
              <li className={activeTab === "crear" ? "active" : ""} onClick={() => setActiveTab("crear")}>
                Crear Cotización
              </li>
              <li className={activeTab === "listar" ? "active" : ""} onClick={() => setActiveTab("listar")}>
                Listado de Cotizaciones
              </li>
            </ul>
          </nav>
        </div>

        <div className="aux-sidebar-footer">
          <button className="aux-small-btn" onClick={confirmRefresh}>Recargar</button>
          <button
            className="aux-logout-btn"
            onClick={async () => {
              const result = await Swal.fire({
                title: "¿Deseas cerrar sesión?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, cerrar sesión",
                cancelButtonText: "Cancelar",
              });

              if (result.isConfirmed) {
                localStorage.clear();
                window.location.href = "/";
              }
            }}
          >
            Cerrar Sesión
          </button>
        </div>

      </aside>

      <main className="aux-main-content">
        {activeTab === "crear" && (
          <>
            <header className="aux-header">
              <h1>Crear Cotización</h1>
              <p className="aux-sub">Selecciona una solicitud y arma la cotización para envío al proveedor.</p>
            </header>

            <form className="aux-form card" onSubmit={handleSubmit}>
              <div className="row">
                <div className="col">
                  <label>Solicitud</label>
                  <select name="solicitudId" value={form.solicitudId} onChange={handleSolicitudChange}>
                    <option value="">-- Seleccionar solicitud --</option>
                    {solicitudes
                      .filter((s) => s.estado === "pendiente")
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          #{s.id} — {s.observaciones || "sin observaciones"}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="col">
                  <label>Proveedor</label>
                  <input type="text" name="proveedor" value={form.proveedor} onChange={handleChange} placeholder="Nombre proveedor" />
                </div>

                <div className="col">
                  <label>Fecha límite</label>
                  <input type="date" name="fecha_limite" value={form.fecha_limite} onChange={handleChange} />
                </div>
              </div>

              <div className="aux-products">
                <div className="products-header">
                  <strong>Productos</strong>
                  <button type="button" className="aux-add-btn" onClick={handleAddProducto}>
                    + Agregar Producto
                  </button>
                </div>

                {form.productos.length === 0 && <p className="muted">No hay productos agregados.</p>}

                {form.productos.map((p, i) => (
                  <div className="aux-product-row card-sm" key={i}>
                    <div className="prod-left">
                      <input
                        type="text"
                        placeholder="Nombre del producto"
                        value={p.nombre}
                        onChange={(e) => handleProductoChange(i, "nombre", e.target.value)}
                      />
                      <div className="prod-meta">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="Cantidad"
                          value={p.cantidad}
                          onChange={(e) => handleProductoChange(i, "cantidad", e.target.value)}
                        />
                        <select value={p.unidad} onChange={(e) => handleProductoChange(i, "unidad", e.target.value)}>
                          <option value="">Unidad</option>
                          <option value="kg">kg</option>
                          <option value="gr">gr</option>
                          <option value="L">L</option>
                          <option value="ml">ml</option>
                          <option value="unidades">unidades</option>
                        </select>
                      </div>
                    </div>

                    <div className="prod-actions">
                      <button type="button" className="aux-remove-btn" onClick={() => handleRemoveProducto(i)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="aux-form-group">
                <label>Notas (opcional)</label>
                <textarea name="notas" value={form.notas} onChange={handleChange} rows="3" />
              </div>

              <div className="form-actions">
                <button type="submit" className="aux-submit-btn">Crear Cotización</button>
                <button
                  type="button"
                  className="aux-secondary-btn"
                  onClick={() => setForm({ solicitudId: "", proveedor: "", fecha_limite: "", productos: [], notas: "" })}
                >
                  Limpiar
                </button>
              </div>
            </form>
          </>
        )}

        {activeTab === "listar" && (
          <>
            <header className="aux-header">
              <h1>Listado de Cotizaciones</h1>
              <p className="aux-sub">Revisa las cotizaciones creadas. Haz clic en "Ver" para ver los productos.</p>
            </header>

            <section className="card">
              <div className="table-actions">
                <button className="aux-small-btn" onClick={fetchCotizaciones}>Refrescar</button>
              </div>

              <table className="aux-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Solicitud</th>
                    <th>Proveedor</th>
                    <th>Fecha Límite</th>
                    <th>Estado</th>
                    <th>Notas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cotizaciones.length === 0 && (
                    <tr>
                      <td colSpan="7" className="muted">No hay cotizaciones</td>
                    </tr>
                  )}

                  {cotizaciones.map((c) => (
                    <React.Fragment key={c.id}>
                      <tr>
                        <td>{c.id}</td>
                        <td>#{c.solicitudId}</td>
                        <td>{c.proveedor}</td>
                        <td>{formatDate(c.fecha_limite)}</td>
                        <td>{c.estado}</td>
                        <td>{c.notas || "-"}</td>
                        <td>
                          <button className="aux-small-btn" onClick={() => toggleDetails(c.id)}>
                            {c._show ? "Ocultar" : "Ver"}
                          </button>
                        </td>
                      </tr>
                      {c._show && (
                        <tr className="detail-row">
                          <td colSpan="7">
                            <div className="detail-card">
                              <strong>Productos:</strong>
                              <ul>
                                {(c.productos || []).map((p, idx) => (
                                  <li key={idx}>
                                    {p.nombre} — {p.cantidad} {p.unidad}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
