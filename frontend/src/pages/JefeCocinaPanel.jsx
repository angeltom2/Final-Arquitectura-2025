import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import "../styles/JefeCocina.css";

export default function JefeCocinaPanel() {
  // ==================== STATE ====================
  const [inventario, setInventario] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [platos, setPlatos] = useState([]);
  const [activeSection, setActiveSection] = useState("inventario");

  // Para registrar/editar plato
  const [nuevoPlato, setNuevoPlato] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    ingredientes: [{ productId: "", cantidad: "", unidad: "" }],
    precioVenta: "",
  });

  // Para registrar solicitud
  const [nuevaSolicitud, setNuevaSolicitud] = useState({
    productos: [{ nombre: "", cantidad: "", unidad: "" }],
    observaciones: "",
  });

  const [loadingInventario, setLoadingInventario] = useState(false);

  // ==================== FUNCIONES AUXILIARES ====================
  const getJefeId = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch {
      return null;
    }
  };

  // ==================== FETCH ====================
  const fetchInventario = async () => {
    try {
      setLoadingInventario(true);
      const res = await api.get("/inventario");
      setInventario(res.data || []);
    } catch {
      Swal.fire("Error", "No se pudo cargar el inventario", "error");
    } finally {
      setLoadingInventario(false);
    }
  };

  const fetchSolicitudes = async () => {
    try {
      const res = await api.get("/solicitudes");
      setSolicitudes(res.data || []);
    } catch {
      Swal.fire("Error", "No se pudieron cargar las solicitudes", "error");
    }
  };

  const fetchPlatos = async () => {
    try {
      const res = await api.get("/platos");
      setPlatos(res.data || []);
    } catch {
      Swal.fire("Error", "No se pudieron cargar los platos", "error");
    }
  };

  useEffect(() => {
    fetchInventario();
    fetchSolicitudes();
    fetchPlatos();
  }, []);

  // ==================== FUNCIONES SOLICITUD ====================
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
      if (!p.nombre.trim()) {
        Swal.fire("Error", `El producto #${i + 1} necesita un nombre`, "error");
        return false;
      }
      if (!/^\d+(\.\d+)?$/.test(p.cantidad) || Number(p.cantidad) <= 0) {
        Swal.fire("Cantidad inválida", `La cantidad del producto #${i + 1} debe ser mayor que 0`, "error");
        return false;
      }
      if (!p.unidad.trim() || !/^[a-zA-Z]+$/.test(p.unidad)) {
        Swal.fire("Unidad inválida", `La unidad del producto #${i + 1} debe contener solo letras`, "error");
        return false;
      }
    }
    return true;
  };

  const enviarSolicitud = async (e) => {
    e.preventDefault();
    if (!validarProductos()) return;
    try {
      await api.post("/solicitudes", nuevaSolicitud);
      Swal.fire("Solicitud enviada", "El Auxiliar de Compras la revisará", "success");
      setNuevaSolicitud({ productos: [{ nombre: "", cantidad: "", unidad: "" }], observaciones: "" });
      fetchSolicitudes();
      setActiveSection("solicitudes");
    } catch {
      Swal.fire("Error", "No se pudo enviar la solicitud", "error");
    }
  };

  // ==================== FUNCIONES PLATOS ====================
  const addIngrediente = () => {
    setNuevoPlato({
      ...nuevoPlato,
      ingredientes: [...nuevoPlato.ingredientes, { productId: "", cantidad: "", unidad: "" }],
    });
  };

  const removeIngrediente = (index) => {
    const arr = nuevoPlato.ingredientes.filter((_, i) => i !== index);
    setNuevoPlato({ ...nuevoPlato, ingredientes: arr });
  };

  const handleIngredienteChange = (index, field, value) => {
    const arr = [...nuevoPlato.ingredientes];
    arr[index][field] = value;
    setNuevoPlato({ ...nuevoPlato, ingredientes: arr });
  };

  const validarPlato = () => {
    if (!nuevoPlato.nombre.trim()) {
      Swal.fire("Validación", "El nombre del plato es obligatorio", "warning");
      return false;
    }
    if (!nuevoPlato.precioVenta || Number(nuevoPlato.precioVenta) <= 0) {
      Swal.fire("Validación", "El precio de venta debe ser mayor que 0", "warning");
      return false;
    }
    if (!nuevoPlato.ingredientes.length) {
      Swal.fire("Validación", "Agrega al menos un ingrediente", "warning");
      return false;
    }
    for (let i = 0; i < nuevoPlato.ingredientes.length; i++) {
      const ing = nuevoPlato.ingredientes[i];
      if (!ing.productId) {
        Swal.fire("Validación", `Selecciona un producto para el ingrediente #${i + 1}`, "warning");
        return false;
      }
      if (!/^\d+(\.\d+)?$/.test(String(ing.cantidad)) || Number(ing.cantidad) <= 0) {
        Swal.fire("Validación", `Cantidad inválida en ingrediente #${i + 1}`, "warning");
        return false;
      }
      if (!ing.unidad.trim()) {
        Swal.fire("Validación", `La unidad es obligatoria en ingrediente #${i + 1}`, "warning");
        return false;
      }
      const producto = inventario.find((p) => Number(p.id) === Number(ing.productId));
      if (!producto) {
        Swal.fire("Validación", `Producto no encontrado para ingrediente #${i + 1}`, "warning");
        return false;
      }
      if (producto.stock_actual < Number(ing.cantidad)) {
        Swal.fire("Stock insuficiente", `Ingrediente "${producto.nombre}" tiene stock ${producto.stock_actual} pero se solicitó ${ing.cantidad}.`, "warning");
        return false;
      }
    }
    return true;
  };

  const submitNuevoPlato = async (e) => {
    e.preventDefault();

    // Valores seguros
    const nombre = nuevoPlato.nombre ?? "";
    const descripcion = nuevoPlato.descripcion ?? "";
    const precioVenta = nuevoPlato.precioVenta ?? "";
    const ingredientes = (nuevoPlato.ingredientes ?? []).map((ing) => ({
      productId: ing.productId ?? "",
      cantidad: ing.cantidad ?? "",
      unidad: ing.unidad ?? "",
    }));

    // Validaciones
    if (!nombre.trim()) {
      Swal.fire("Validación", "El nombre del plato es obligatorio", "warning");
      return;
    }
    if (!precioVenta || Number(precioVenta) <= 0) {
      Swal.fire("Validación", "El precio de venta debe ser mayor que 0", "warning");
      return;
    }
    if (!ingredientes.length) {
      Swal.fire("Validación", "Agrega al menos un ingrediente", "warning");
      return;
    }

    // Validar cada ingrediente y convertir productId a número
    for (let i = 0; i < ingredientes.length; i++) {
      const ing = ingredientes[i];
      const productIdNum = Number(ing.productId);
      const producto = inventario.find((p) => Number(p.id) === productIdNum);

      if (!ing.productId || !producto) {
        Swal.fire("Error", `Ingrediente #${i + 1} no encontrado en inventario`, "error");
        return;
      }
      if (!/^\d+(\.\d+)?$/.test(String(ing.cantidad)) || Number(ing.cantidad) <= 0) {
        Swal.fire("Validación", `Cantidad inválida en ingrediente #${i + 1}`, "warning");
        return;
      }
      if (!ing.unidad.trim()) {
        Swal.fire("Validación", `La unidad es obligatoria en ingrediente #${i + 1}`, "warning");
        return;
      }

      // Actualizar productId y unidad en el array para enviar al backend
      ing.productId = productIdNum;
      ing.unidad = ing.unidad.trim();
      ing.cantidad = Number(ing.cantidad);
    }

    const jefeId = getJefeId();
    if (!jefeId) {
      Swal.fire("Error", "No se pudo obtener el ID del jefe de cocina", "error");
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio_venta: Number(precioVenta),
      jefe_id: jefeId,
      ingredientes: ingredientes.map((ing) => ({
        productId: ing.productId,
        cantidad: ing.cantidad,
        unidad: ing.unidad,
      })),
    };

    try {
      if (nuevoPlato.id) {
        // ================== ACTUALIZAR PLATO ==================
        // Revertir inventario del plato anterior
        const platoAnt = platos.find((p) => p.id === nuevoPlato.id);
        if (platoAnt?.ingredientes) {
          for (let ing of platoAnt.ingredientes) {
            await api.post("/inventario/movimiento", {
              productoId: Number(ing.producto_id ?? ing.productId),
              tipo: "entrada",
              cantidad: Number(ing.cantidad),
              descripcion: `Reversión por actualización del plato "${platoAnt.nombre}"`,
            });
          }
        }

        // Actualizar plato
        await api.put(`/platos/${nuevoPlato.id}`, payload);

        // Salida de inventario para los nuevos ingredientes
        for (let ing of payload.ingredientes) {
          await api.post("/inventario/movimiento", {
            productoId: ing.productId,
            tipo: "salida",
            cantidad: ing.cantidad,
            descripcion: `Usado en plato "${nombre}"`,
          });
        }

        Swal.fire("Éxito", "Plato actualizado correctamente y stock ajustado", "success");
      } else {
        // ================== NUEVO PLATO ==================
        await api.post("/platos", payload);

        for (let ing of payload.ingredientes) {
          await api.post("/inventario/movimiento", {
            productoId: ing.productId,
            tipo: "salida",
            cantidad: ing.cantidad,
            descripcion: `Usado en plato "${nombre}"`,
          });
        }

        Swal.fire("Éxito", "Plato registrado correctamente y stock actualizado", "success");
      }

      // Resetear formulario
      setNuevoPlato({
        id: null,
        nombre: "",
        descripcion: "",
        ingredientes: [{ productId: "", cantidad: "", unidad: "" }],
        precioVenta: "",
      });

      fetchInventario();
      fetchPlatos();
      setActiveSection("listaPlatos");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err?.response?.data?.message || "Error creando/actualizando plato", "error");
    }
  };


  const editarPlato = (plato) => {
    setNuevoPlato({
      id: plato.id ?? null,
      nombre: plato.nombre ?? "",
      descripcion: plato.descripcion ?? "",
      precioVenta: plato.precio_venta ?? "",
      ingredientes: (plato.ingredientes ?? []).map((ing) => ({
        // Para <select> se usa string en React, pero convertimos a Number al enviar
        productId: ing.productId != null ? String(ing.productId) : "",
        cantidad: ing.cantidad ?? "",
        unidad: ing.unidad ?? (ing.producto?.unidad ?? ""),
      })),
    });
    setActiveSection("platos");
  };

  const eliminarPlato = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar plato?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#b33a2c",
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/platos/${id}`);
        Swal.fire("Eliminado", "El plato fue eliminado", "success");
        fetchPlatos();
      } catch {
        Swal.fire("Error", "No se pudo eliminar el plato", "error");
      }
    }
  };

  // ==================== LOGOUT ====================
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

  // ==================== RENDER ====================
  return (
    <div className="chef-layout">
      {/* SIDEBAR */}
      <aside className="chef-sidebar">
        <h2 className="chef-title">👨‍🍳 Jefe de Cocina</h2>
        <ul>
          <li className={activeSection === "inventario" ? "active" : ""} onClick={() => setActiveSection("inventario")}>📦 Inventario</li>
          <li className={activeSection === "nueva" ? "active" : ""} onClick={() => setActiveSection("nueva")}>📝 Nueva Solicitud</li>
          <li className={activeSection === "solicitudes" ? "active" : ""} onClick={() => setActiveSection("solicitudes")}>📄 Mis Solicitudes</li>
          <li className={activeSection === "platos" ? "active" : ""} onClick={() => { setActiveSection("platos"); fetchInventario(); }}>🍽 Registrar Plato</li>
          <li className={activeSection === "listaPlatos" ? "active" : ""} onClick={() => setActiveSection("listaPlatos")}>📋 Platos Registrados</li>
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
                <tr><th>Producto</th><th>Stock</th><th>Mínimo</th><th>Unidad</th></tr>
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
                  <input type="text" placeholder="Producto" value={p.nombre} onChange={(e) => {
                    const arr = [...nuevaSolicitud.productos]; arr[i].nombre = e.target.value; setNuevaSolicitud({ ...nuevaSolicitud, productos: arr });
                  }} />
                  <input type="text" placeholder="Cantidad" value={p.cantidad} onChange={(e) => {
                    const arr = [...nuevaSolicitud.productos]; arr[i].cantidad = e.target.value; setNuevaSolicitud({ ...nuevaSolicitud, productos: arr });
                  }} />
                  <input type="text" placeholder="Unidad" value={p.unidad} onChange={(e) => {
                    const arr = [...nuevaSolicitud.productos]; arr[i].unidad = e.target.value; setNuevaSolicitud({ ...nuevaSolicitud, productos: arr });
                  }} />
                  <button type="button" className="remove-btn" onClick={() => quitarProducto(i)}>❌</button>
                </div>
              ))}
              <button type="button" className="add-btn" onClick={agregarProducto}>➕ Agregar Producto</button>
              <textarea placeholder="Observaciones" value={nuevaSolicitud.observaciones} onChange={(e) => setNuevaSolicitud({ ...nuevaSolicitud, observaciones: e.target.value })} />
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
                <tr><th>ID</th><th>Fecha</th><th>Estado</th><th>Observaciones</th></tr>
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

        {/* REGISTRAR/EDITAR PLATO */}
        {activeSection === "platos" && (
          <section>
            <h1>🍽 {nuevoPlato.id ? "Editar Plato" : "Registrar Plato"}</h1>
            <form className="chef-form" onSubmit={submitNuevoPlato}>
              <input type="text" placeholder="Nombre del plato" value={nuevoPlato.nombre}
                onChange={(e) => setNuevoPlato({ ...nuevoPlato, nombre: e.target.value })} />
              <textarea placeholder="Descripción (opcional)" value={nuevoPlato.descripcion}
                onChange={(e) => setNuevoPlato({ ...nuevoPlato, descripcion: e.target.value })} />

              <div className="ingredientes-block">
                <label className="label-strong">Ingredientes</label>
                {nuevoPlato.ingredientes.map((ing, idx) => {
                  const producto = inventario.find(p => p.id === Number(ing.productId));
                  return (
                    <div className="ingrediente-row" key={idx}>
                      <select value={ing.productId}
                        onChange={(e) => handleIngredienteChange(idx, "productId", e.target.value)} required>
                        <option value="">-- Seleccionar producto --</option>
                        {inventario.map((p) => (
                          <option key={p.id} value={p.id}>{`${p.nombre} (${p.unidad}) — Stock: ${p.stock_actual ?? 0}`}</option>
                        ))}
                      </select>

                      <input type="number" placeholder="Cantidad" min="0.01" step="0.01" value={ing.cantidad}
                        onChange={(e) => handleIngredienteChange(idx, "cantidad", e.target.value)} />

                      <select value={ing.unidad}
                        onChange={(e) => handleIngredienteChange(idx, "unidad", e.target.value)} required>
                        <option value="">-- Seleccionar unidad --</option>
                        {producto ? <option value={producto.unidad}>{producto.unidad}</option> : null}
                      </select>

                      <button type="button" className="remove-btn" onClick={() => removeIngrediente(idx)}>❌</button>
                    </div>
                  );
                })}
                <button type="button" className="add-btn" onClick={addIngrediente}>➕ Agregar Ingrediente</button>
              </div>

              <input type="number" min="0.01" step="0.01" placeholder="Precio de venta" value={nuevoPlato.precioVenta}
                onChange={(e) => setNuevoPlato({ ...nuevoPlato, precioVenta: e.target.value })} />

              <div style={{ display: "flex", gap: 10 }}>
                <button className="submit-btn" type="submit">{nuevoPlato.id ? "Actualizar Plato" : "Guardar Plato"}</button>
                <button type="button" className="dir-secondary"
                  onClick={() => setNuevoPlato({ id: null, nombre: "", descripcion: "", ingredientes: [{ productId: "", cantidad: "", unidad: "" }], precioVenta: "" })}>
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}


        {/* LISTA DE PLATOS */}
        {activeSection === "listaPlatos" && (
          <section>
            <h1>📋 Platos Registrados</h1>
            <table className="chef-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Ingredientes</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {platos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td>{p.precio_venta}</td>
                    <td>
                      <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                        {p.ingredientes.map((ing, idx) => (
                          <li key={idx}>{`${ing.cantidad} ${ing.unidad} de ${ing.producto?.nombre || "?"}`}</li>
                        ))}
                      </ul>
                    </td>
                    <td style={{ display: "flex", gap: "5px" }}>
                      <button className="submit-btn" style={{ padding: "4px 10px", fontSize: "0.9rem" }} onClick={() => editarPlato(p)}>✏️ Editar</button>
                      <button className="remove-btn" style={{ padding: "4px 10px", fontSize: "0.9rem" }} onClick={() => eliminarPlato(p.id)}>🗑️ Eliminar</button>
                    </td>
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
