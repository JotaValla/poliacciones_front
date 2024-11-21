const API_BASE = "http://localhost:8080"; // Cambia si usas otro puerto

// Obtener los datos de la acción desde la URL
const params = new URLSearchParams(window.location.search);
const accionId = params.get("accionId");

// Referencias a los elementos HTML
const detalleCantidad = document.getElementById("detalleCantidad");
const detalleFecha = document.getElementById("detalleFecha");
const detalleValor = document.getElementById("detalleValor");
const detalleNombre = document.getElementById("detalleNombre");

const ganancia = document.getElementById("ganancia");
const perdida = document.getElementById("perdida");
const fechaActual = document.getElementById("fechaActual");
const valorActual = document.getElementById("valorActual");

const cantidadVenderInput = document.getElementById("cantidadVender");

// Cargar los detalles de la acción
async function cargarDetalleAccion() {
    try {
        const response = await axios.get(`${API_BASE}/acciones/${accionId}`);
        const accion = response.data;

        detalleCantidad.textContent = accion.cantidad;
        detalleFecha.textContent = accion.fecha;
        detalleValor.textContent = accion.precio.toFixed(2);
        detalleNombre.textContent = accion.nombreAccion;
    } catch (error) {
        console.error("Error al cargar los detalles de la acción:", error);
        alert("Error al cargar los detalles. Intenta de nuevo más tarde.");
    }
}

// Ver ganancia/pérdida
document.getElementById("verGanancia").addEventListener("click", async () => {
    try {
        const response = await axios.get(`${API_BASE}/acciones/ver-ganancia/${accionId}`);
        const data = response.data;

        ganancia.textContent = data.ganancia.toFixed(2);
        perdida.textContent = data.perdida.toFixed(2);
        fechaActual.textContent = data.fechaActual;
        valorActual.textContent = data.valorActual.toFixed(2);
    } catch (error) {
        console.error("Error al calcular ganancia/pérdida:", error);
        alert("Error al calcular ganancia/pérdida. Intenta de nuevo más tarde.");
    }
});


// Vender acción
document.getElementById("venderForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const cantidadVender = parseInt(cantidadVenderInput.value);

    if (!cantidadVender || cantidadVender <= 0) {
        alert("Por favor, ingresa una cantidad válida.");
        return;
    }

    try {
        const response = await axios.post(`${API_BASE}/acciones/vender`, {
            accionId,
            cantidad: cantidadVender,
        });

        alert("Acción vendida con éxito.");
        cargarDetalleAccion(); // Actualizar los detalles
    } catch (error) {
        console.error("Error al vender la acción:", error);
        alert("Error al vender la acción. Intenta de nuevo más tarde.");
    }
});

// Inicializar la página
cargarDetalleAccion();
