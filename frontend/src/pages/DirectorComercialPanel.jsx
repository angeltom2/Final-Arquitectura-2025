import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import Chart from "react-apexcharts";
import "../styles/DirectorComercialPanel.css";

const mesesLista = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const años = ["2023", "2024", "2025", "2026"];

const DirectorComercialPanel = () => {
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState(null);
  const [mes, setMes] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [anio, setAnio] = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const cargarDatos = async (showAlert = false) => {
    try {
      setLoading(true);
      const res = await api.get("/analitica/dashboard", { params: { mes, anio } });

      if (!res?.data) throw new Error("Respuesta vacía del servidor");

      setData(res.data);

      if (showAlert) {
        Swal.fire({
          icon: "success",
          title: "Datos actualizados",
          timer: 1100,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Error en cargarDatos:", err);
      Swal.fire("Error", "No se pudieron cargar los datos del dashboard", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [mes, anio]);

  const handleRefresh = () => {
    setRefreshing(true);
    cargarDatos(true);
  };

  const cerrarSesion = () => {
    Swal.fire({
      title: "¿Deseas cerrar sesión?",
      text: "Esto cerrará tu sesión actual.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((res) => {
      if (res.isConfirmed) {
        Swal.fire("Sesión cerrada", "", "success");
        localStorage.clear();
        window.location.href = "/";
      }
    });
  };

  if (!data && loading) return <p className="loading">Cargando datos...</p>;
  if (!data) return <p className="loading">No hay datos disponibles</p>;

  // ======= SEGURIDAD EXTRA PARA QUE NUNCA FALLE =======
  const productoMasDemandadoPlato = data?.productoMasDemandadoPlato || {};
  const ingredienteMasUsado = data?.ingredienteMasUsado || {};
  const kpis = data?.kpis || {};

  const topPlatos = productoMasDemandadoPlato?.top10 || [];

  // ======= CHART PLATOS =======
  const chartPlatos = {
    series: [
      {
        name: "Vendidos",
        data: topPlatos.map((p) => p.total_vendido || 0),
      },
    ],
    options: {
      chart: { type: "bar", animations: { easing: "easeOutElastic" } },
      xaxis: { categories: topPlatos.map((p) => p.nombre || "—") },
      colors: ["#d18559"],
      dataLabels: { enabled: true },
      plotOptions: { bar: { borderRadius: 8, horizontal: false } },
      noData: { text: "No hay registros para este mes" },
    },
  };

  // ======= CHART INGREDIENTE =======
  const chartIngredientes = {
    series: ingredienteMasUsado?.total_usado ? [ingredienteMasUsado.total_usado] : [],
    options: {
      labels: [
        ingredienteMasUsado?.nombre ? ingredienteMasUsado.nombre : "Sin datos",
      ],
      chart: { type: "donut", animations: { easing: "easeOutCirc" } },
      colors: ["#b0613c"],
      noData: { text: "No hay registros para este mes" },
    },
  };

  // Valores seguros para mostrar
  const pedidosMes = kpis.totalPedidosMes ?? 0;
  const platosVendidosMes = kpis.totalPlatosVendidosMes ?? 0;
  const platoNombre = productoMasDemandadoPlato?.nombre ?? "—";
  const platoPrecio = productoMasDemandadoPlato?.precio_venta ?? "0.00";
  const platoTotalVendido = productoMasDemandadoPlato?.total_vendido ?? 0;

  return (
    <div className="admin-layout fade-in">
      {/* SIDEBAR */}
      <div className="sidebar slide-in-left">
        <h2 className="sidebar-title">Director Comercial</h2>

        <ul>
          <li
            className={tab === "dashboard" ? "active" : ""}
            onClick={() => setTab("dashboard")}
          >
            Dashboard
          </li>

          <li
            className={tab === "ingredientes" ? "active" : ""}
            onClick={() => setTab("ingredientes")}
          >
            Ingredientes
          </li>
        </ul>

        <div className="sidebar-bottom">
          <button
            className={`refresh-btn ${refreshing ? "loading-btn" : ""}`}
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            {refreshing ? <span className="spinner" /> : "🔄 Refrescar"}
          </button>

          <button className="logout-btn" onClick={cerrarSesion}>
            🚪 Cerrar sesión
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <div className="filtros-container">
          <div className="select-wrap">
            <label className="select-label">Mes</label>
            <select
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="select-input"
            >
              {mesesLista.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="select-wrap">
            <label className="select-label">Año</label>
            <select
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              className="select-input"
            >
              {años.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {tab === "dashboard" && (
          <div className="fade-in">
            <h1>📊 Dashboard General ({mes}/{anio})</h1>

            <div className="kpi-container">
              <div className="kpi-card pop">
                <h3>Pedidos</h3>
                <p>{pedidosMes}</p>
              </div>

              <div className="kpi-card pop">
                <h3>Platos Vendidos</h3>
                <p>{platosVendidosMes}</p>
              </div>

              <div className="kpi-card pop">
                <h3>Plato Estrella</h3>
                <p className="plato-estrella">{platoNombre}</p>
              </div>
            </div>

            <div className="chart-box zoom-soft">
              <h2>🍽️ Platos Más Vendidos</h2>
              <Chart
                options={chartPlatos.options}
                series={chartPlatos.series}
                type="bar"
                height={350}
              />
            </div>

            <div className="info-box pop">
              <h3>🔥 Plato más demandado</h3>
              <p>
                <b>Nombre:</b> {platoNombre}
              </p>
              <p>
                <b>Precio:</b> S/ {platoPrecio}
              </p>
              <p>
                <b>Total vendido:</b> {platoTotalVendido}
              </p>
            </div>
          </div>
        )}

        {tab === "ingredientes" && (
          <div className="fade-in">
            <h1>🥗 Ingrediente Más Usado ({mes}/{anio})</h1>

            <div className="chart-box zoom-soft">
              <Chart
                options={chartIngredientes.options}
                series={chartIngredientes.series}
                type="donut"
                height={350}
              />
            </div>

            <div className="ingrediente-info pop">
              <p>
                <strong>Ingrediente:</strong>{" "}
                {ingredienteMasUsado?.nombre ?? "—"}
              </p>
              <p>
                <strong>Unidad:</strong>{" "}
                {ingredienteMasUsado?.unidad ?? "—"}
              </p>
              <p>
                <strong>Total usado:</strong>{" "}
                {ingredienteMasUsado?.total_usado ?? 0}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorComercialPanel;
