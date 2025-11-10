import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import "../styles/Inventario.css";

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    categoria: "",
    unidad: "",
    stock_actual: "",
    stock_minimo: "",
    precio_unitario: "",
  });

  const [movimiento, setMovimiento] = useState({
    productoId: "",
    tipo: "entrada",
    cantidad: "",
    descripcion: "",
  });

  // 📦 Cargar productos
  const fetchProductos = async () => {
    try {
      const res = await api.get("/inventario");
      setProductos(res.data);
    } catch {
      Swal.fire("Error", "No se pudo cargar el inventario", "error");
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // ➕ Crear producto
  const handleCrearProducto = async (e) => {
    e.preventDefault();
    try {
      await api.post("/inventario", nuevoProducto);
      Swal.fire("Éxito", "Producto agregado correctamente", "success");
      setNuevoProducto({
        nombre: "",
        categoria: "",
        unidad: "",
        stock_actual: "",
        stock_minimo: "",
        precio_unitario: "",
      });
      fetchProductos();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "No se pudo crear el producto", "error");
    }
  };

  // 🔄 Registrar movimiento
  const handleMovimiento = async (e) => {
    e.preventDefault();
    try {
      await api.post("/inventario/movimiento", movimiento);
      Swal.fire("Movimiento registrado", "El stock fue actualizado", "success");
      setMovimiento({
        productoId: "",
        tipo: "entrada",
        cantidad: "",
        descripcion: "",
      });
      fetchProductos();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "No se pudo registrar el movimiento", "error");
    }
  };

  return (
    <div className="inventario-container">
      <h1>📦 Gestión de Inventario</h1>

      {/* Crear nuevo producto */}
      <section className="inventario-section">
        <h2>Agregar nuevo producto</h2>
        <form onSubmit={handleCrearProducto} className="inventario-form">
          <input
            type="text"
            placeholder="Nombre"
            value={nuevoProducto.nombre}
            onChange={(e) =>
              setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Categoría"
            value={nuevoProducto.categoria}
            onChange={(e) =>
              setNuevoProducto({ ...nuevoProducto, categoria: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Unidad (kg, L, etc.)"
            value={nuevoProducto.unidad}
            onChange={(e) =>
              setNuevoProducto({ ...nuevoProducto, unidad: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Stock inicial"
            value={nuevoProducto.stock_actual}
            onChange={(e) =>
              setNuevoProducto({ ...nuevoProducto, stock_actual: e.target.value })
            }
            required
          />
          <input
            type="number"
            placeholder="Stock mínimo"
            value={nuevoProducto.stock_minimo}
            onChange={(e) =>
              setNuevoProducto({ ...nuevoProducto, stock_minimo: e.target.value })
            }
            required
          />
          <input
            type="number"
            placeholder="Precio unitario"
            value={nuevoProducto.precio_unitario}
            onChange={(e) =>
              setNuevoProducto({
                ...nuevoProducto,
                precio_unitario: e.target.value,
              })
            }
          />
          <button type="submit">Agregar Producto</button>
        </form>
      </section>

      {/* Registrar movimiento */}
      <section className="inventario-section">
        <h2>Registrar entrada o salida</h2>
        <form onSubmit={handleMovimiento} className="inventario-form">
          <select
            value={movimiento.productoId}
            onChange={(e) =>
              setMovimiento({ ...movimiento, productoId: e.target.value })
            }
            required
          >
            <option value="">Seleccionar producto</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <select
            value={movimiento.tipo}
            onChange={(e) =>
              setMovimiento({ ...movimiento, tipo: e.target.value })
            }
          >
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
          </select>
          <input
            type="number"
            placeholder="Cantidad"
            value={movimiento.cantidad}
            onChange={(e) =>
              setMovimiento({ ...movimiento, cantidad: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Descripción (opcional)"
            value={movimiento.descripcion}
            onChange={(e) =>
              setMovimiento({ ...movimiento, descripcion: e.target.value })
            }
          />
          <button type="submit">Registrar Movimiento</button>
        </form>
      </section>

      {/* Tabla de productos */}
      <section className="inventario-section">
        <h2>Inventario actual</h2>
        <table className="inventario-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Unidad</th>
              <th>Stock Actual</th>
              <th>Stock Mínimo</th>
              <th>Precio Unitario</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr
                key={p.id}
                className={
                  p.stock_actual <= p.stock_minimo ? "low-stock" : "ok-stock"
                }
              >
                <td>{p.nombre}</td>
                <td>{p.categoria}</td>
                <td>{p.unidad}</td>
                <td>{p.stock_actual}</td>
                <td>{p.stock_minimo}</td>
                <td>${p.precio_unitario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
