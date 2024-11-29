const API_BASE = "http://localhost:8080";
const params = new URLSearchParams(window.location.search);
const accionId = params.get("accionId");
const usuarioId = params.get("usuarioId");

// Referencias a los elementos HTML
const detalleCantidad = document.getElementById("detalleCantidad");
const detalleFecha = document.getElementById("detalleFecha");
const detalleValor = document.getElementById("detalleValor");
const detalleNombre = document.getElementById("detalleNombre");

async function cargarDetalleAccion() {
  try {
    const response = await axios.get(`${API_BASE}/acciones/${accionId}`);
    const accion = response.data;

    detalleCantidad.textContent = accion.cantidad;
    detalleFecha.textContent = accion.fecha;
    detalleValor.textContent = accion.precio.toFixed(2);
    detalleNombre.textContent = accion.nombreAccion;


  } catch (error) {
    console.error(error);
    alert("Error al cargar los detalles de la acción.");
  }
}

// Llamar a cargarHistorialVentas al cargar la página
cargarDetalleAccion();

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

document.getElementById("btnRegresar").addEventListener("click", () => {
  window.location.href = `index.html?usuarioId=${usuarioId}`;
});

cargarDetalleAccion();
