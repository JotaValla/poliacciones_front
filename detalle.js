const API_BASE = "http://localhost:8080";
const params = new URLSearchParams(window.location.search);
const accionId = params.get("accionId");
const usuarioId = params.get("usuarioId");

// Referencias a los elementos HTML
const detalleCantidad = document.getElementById("detalleCantidad");
const detalleFecha = document.getElementById("detalleFecha");
const detalleValor = document.getElementById("detalleValor");
const detalleNombre = document.getElementById("detalleNombre");

const tablaVentas = document
  .getElementById("tablaVentas")
  .querySelector("tbody");

async function cargarDetalleAccion() {
  try {
    const response = await axios.get(`${API_BASE}/acciones/${accionId}`);
    const accion = response.data;

    detalleCantidad.textContent = accion.cantidad;
    detalleFecha.textContent = accion.fecha;
    detalleValor.textContent = accion.precio.toFixed(2);
    detalleNombre.textContent = accion.nombreAccion;

    if (accion.cantidad === 0) {
      document.getElementById("venderForm").style.display = "none";
    }

    cargarHistorialVentas(accionId); // Cargar historial de ventas
  } catch (error) {
    console.error(error);
    alert("Error al cargar los detalles de la acción.");
  }
}

async function cargarHistorialVentas() {
  try {
    const response = await axios.get(`${API_BASE}/ventas/${accionId}`);
    const ventas = response.data;

    const tbody = tablaVentas;
    tbody.innerHTML = ""; // Limpiar tabla

    if (ventas.length === 0) {
      const fila = document.createElement("tr");
      fila.innerHTML = `<td colspan="3">No hay ventas registradas.</td>`;
      tbody.appendChild(fila);
      return;
    }

    ventas.forEach((venta) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
          <td>${venta.cantidad}</td>
          <td>${venta.precioVenta.toFixed(2)}</td>
          <td>${venta.fechaVenta}</td>
          <td>${venta.ganancia ? venta.ganancia.toFixed(2) : "-"}</td>
          <td>${venta.perdida ? venta.perdida.toFixed(2) : "-"}</td>
      `;
      tbody.appendChild(fila);
    });
  } catch (error) {
    console.error("Error al cargar el historial de ventas:", error);
    alert("Error al cargar el historial de ventas.");
  }
}

// Llamar a cargarHistorialVentas al cargar la página
cargarHistorialVentas();

document.getElementById("verGanancia").addEventListener("click", async () => {
  try {
    const response = await axios.get(
      `${API_BASE}/acciones/ver-ganancia/${accionId}`
    );
    const data = response.data;

    document.getElementById("ganancia").textContent = data.ganancia
      ? data.ganancia.toFixed(2)
      : "-";
    document.getElementById("perdida").textContent = data.perdida
      ? data.perdida.toFixed(2)
      : "-";
    document.getElementById("fechaActual").textContent = data.fechaActual;
    document.getElementById("valorActual").textContent =
      data.valorActual.toFixed(2);
  } catch (error) {
    console.error(error);
    alert("Error al calcular ganancia/pérdida.");
  }
});

document.getElementById("venderForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const cantidadVender = parseInt(
    document.getElementById("cantidadVender").value
  );

  if (!cantidadVender || cantidadVender <= 0) {
    alert("La cantidad debe ser positiva.");
    return;
  }

  if (cantidadVender > parseInt(detalleCantidad.textContent)) {
    alert("No puedes vender más de la cantidad disponible.");
    return;
  }

  try {
    await axios.post(`${API_BASE}/ventas`, {
      accion: {
        idAccion: parseInt(accionId), // Convertir a número
      },
      cantidad: cantidadVender,
    });
    alert("Acción vendida con éxito.");
    await cargarDetalleAccion(); // Refresca los detalles
    await cargarHistorialVentas(); // Actualiza el historial de ventas
    cargarDetalleAccion(); // Actualizar los detalles
  } catch (error) {
    console.error(error);
    alert("Error al vender la acción.");
  }
});

document.getElementById("btnRegresar").addEventListener("click", () => {
  window.location.href = `index.html?usuarioId=${usuarioId}`;
});

cargarDetalleAccion();
