const API_BASE = "http://localhost:8080"; // Cambia si usas otro puerto
let usuarioLogueado = null;

// Configurar el campo de fecha para no permitir fechas futuras
document.addEventListener("DOMContentLoaded", () => {
  const hoy = new Date().toISOString().split("T")[0];
  document.getElementById("fechaAccionInput").setAttribute("max", hoy);
});

// Registrar un usuario
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombreUsuario").value;

    try {
        const response = await axios.post(`${API_BASE}/usuarios`, { nombre });
        usuarioLogueado = response.data.idUsuario;
        alert(`Usuario registrado con ID: ${usuarioLogueado}`);
        document.getElementById("nombreUsuario").value = "";

        // Ocultar el formulario de registro
        document.getElementById("registerForm").style.display = "none";

        actualizarTabla(usuarioLogueado); // Cargar acciones del usuario
    } catch (error) {
        console.error(error);
        alert("Error al registrar el usuario");
    }
});

// Buscar precio de la acción según el símbolo y la fecha
document.getElementById("buscarAccion").addEventListener("click", async () => {
    const simbolo = document.getElementById("simboloAccion").value.trim().toUpperCase();
    const fecha = document.getElementById("fechaAccionInput").value;

    if (!fecha) {
        alert("Por favor, selecciona una fecha.");
        return;
    }

    try {
        const response = await axios.get(`${API_BASE}/acciones/buscar`, {
            params: { simbolo, fecha },
        });

        const precio = response.data.precio.toFixed(2);
        const fechaReal = response.data.fecha;

        document.getElementById("precioAccion").textContent = precio;
        document.getElementById("fechaAccion").textContent = fechaReal;

        if (fecha !== fechaReal) {
            alert(`No se encontraron datos para la fecha seleccionada. Mostrando datos del ${fechaReal}.`);
        }
    } catch (error) {
        console.error(error);
        alert("Error al consultar la API. Verifica el símbolo y la fecha.");

        document.getElementById("precioAccion").textContent = "-";
        document.getElementById("fechaAccion").textContent = "-";
    }
});

// Comprar una acción
document.getElementById("compraForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!usuarioLogueado) {
        alert("Debes registrar un usuario antes de comprar acciones.");
        return;
    }

    const simbolo = document.getElementById("simboloAccion").value;
    const cantidad = parseInt(document.getElementById("cantidadAccion").value);
    const fecha = document.getElementById("fechaAccionInput").value;

    if (!fecha) {
        alert("Por favor, selecciona una fecha.");
        return;
    }

    try {
        const response = await axios.post(`${API_BASE}/acciones/comprar`, {
            nombreAccion: simbolo,
            cantidad,
            fecha,
            usuario: { idUsuario: usuarioLogueado },
        });

        alert("Acción comprada con éxito");
        actualizarTabla(usuarioLogueado); // Actualizar tabla de acciones
    } catch (error) {
        console.error(error);
        alert("Error al comprar la acción");
    }
});

// Actualizar la tabla de acciones compradas
// Actualizar la tabla de acciones compradas
async function actualizarTabla(usuarioId) {
  try {
      const response = await axios.get(`${API_BASE}/acciones/usuario/${usuarioId}`);
      const tbody = document.getElementById("tablaAcciones").querySelector("tbody");
      tbody.innerHTML = "";

      response.data.forEach((accion) => {
          const fila = document.createElement("tr");
          fila.innerHTML = `
              <td>${accion.nombreAccion}</td>
              <td>${accion.cantidad}</td>
              <td>${accion.precio.toFixed(2)}</td>
              <td>${accion.fecha}</td>
          `;

          // Agregar evento para redirigir al hacer clic en una fila
          fila.addEventListener("click", () => {
              window.location.href = `detalle.html?accionId=${accion.idAccion}`;
          });

          tbody.appendChild(fila);
      });
  } catch (error) {
      console.error(error);
      alert("Error al cargar las acciones compradas");
  }
}


// Refrescar los campos del formulario de compra
document.getElementById("refrescarCampos").addEventListener("click", () => {
    document.getElementById("simboloAccion").value = "";
    document.getElementById("fechaAccionInput").value = "";
    document.getElementById("cantidadAccion").value = "";
    document.getElementById("precioAccion").textContent = "-";
    document.getElementById("fechaAccion").textContent = "-";
    alert("Campos del formulario limpiados.");
});

// Reiniciar la aplicación
document.getElementById("reiniciarApp").addEventListener("click", () => {
    document.getElementById("registerForm").style.display = "block"; // Mostrar el formulario de registro
    document.getElementById("simboloAccion").value = "";
    document.getElementById("fechaAccionInput").value = "";
    document.getElementById("cantidadAccion").value = "";
    document.getElementById("precioAccion").textContent = "-";
    document.getElementById("fechaAccion").textContent = "-";
    const tbody = document.getElementById("tablaAcciones").querySelector("tbody");
    tbody.innerHTML = ""; // Limpiar tabla
    usuarioLogueado = null;
    alert("La aplicación se ha reiniciado.");
});
