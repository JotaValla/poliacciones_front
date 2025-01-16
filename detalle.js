const API_BASE = "http://localhost:8080";
const params = new URLSearchParams(window.location.search);
const accionId = params.get("accionId");
const usuarioId = params.get("usuarioId");

// Referencias a los elementos HTML
const detalleCantidad = document.getElementById("detalleCantidad");
const detalleFecha = document.getElementById("detalleFecha");
const detalleValor = document.getElementById("detalleValor");
const detalleValorTotal = document.getElementById("detalleValorTotal");
const detalleNombre = document.getElementById("detalleNombre");
const ganancia = document.getElementById("ganancia");
const perdida = document.getElementById("perdida");
const fechaActual = document.getElementById("fechaActual");
const valorActual = document.getElementById("valorActual");
const porcentajeGanancia = document.getElementById("porcentajeGanancia");
const porcentajePerdida = document.getElementById("porcentajePerdida");

async function cargarDetalleAccion() {
  try {
    // Obtener detalles de la acción
    const response = await axios.get(`${API_BASE}/acciones/${accionId}`);
    const accion = response.data;

    // Setear los valores básicos
    detalleCantidad.textContent = accion.cantidad;
    detalleFecha.textContent = accion.fecha;
    detalleValor.textContent = accion.precio.toFixed(2);
    detalleNombre.textContent = accion.nombreAccion;

    // Calcular y mostrar el valor total
    const valorTotal = (accion.cantidad * accion.precio).toFixed(2);
    detalleValorTotal.textContent = valorTotal;

  } catch (error) {
    console.error(error);
    alert("Error al cargar los detalles de la acción.");
  }
}

document.getElementById("verGanancia").addEventListener("click", async () => {
  try {
    // Obtener información de ganancia/pérdida
    const response = await axios.get(`${API_BASE}/acciones/ver-ganancia/${accionId}`);
    const data = response.data;

    // Setear datos de ganancia/pérdida
    const cantidad = parseInt(detalleCantidad.textContent); // Obtener la cantidad de acciones
    const valorTotal = parseFloat(detalleValorTotal.textContent); // Valor total inicial

    // Calcular ganancia total y pérdida total
    const valorActualTotal = cantidad * data.valorActual; // Valor actual total de todas las acciones
    const gananciaTotal = Math.max(valorActualTotal - valorTotal, 0).toFixed(2); // Ganancia total
    const perdidaTotal = Math.max(valorTotal - valorActualTotal, 0).toFixed(2); // Pérdida total

    // Mostrar ganancia/pérdida total
    ganancia.textContent = gananciaTotal;
    perdida.textContent = perdidaTotal;

    // Mostrar fecha y valor actual
    fechaActual.textContent = data.fechaActual;
    valorActual.textContent = data.valorActual.toFixed(2);

    // Calcular porcentajes
    const porcentajeGananciaValue =
      gananciaTotal > 0
        ? ((gananciaTotal / valorTotal) * 100).toFixed(2)
        : 0;
    const porcentajePerdidaValue =
      perdidaTotal > 0
        ? ((perdidaTotal / valorTotal) * 100).toFixed(2)
        : 0;

    // Mostrar porcentajes
    porcentajeGanancia.textContent = `${porcentajeGananciaValue}%`;
    porcentajePerdida.textContent = `${porcentajePerdidaValue}%`;

  } catch (error) {
    console.error(error);
    alert("Error al calcular ganancia/pérdida.");
  }
});

// Regresar a la página principal
document.getElementById("btnRegresar").addEventListener("click", () => {
  window.location.href = `index.html?usuarioId=${usuarioId}`;
});

// Cargar detalles de la acción al cargar la página
cargarDetalleAccion();
