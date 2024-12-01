const API_BASE = "http://localhost:8080";
let usuarioLogueado = null;

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const usuarioId = params.get("usuarioId");

  if (usuarioId) {
    usuarioLogueado = parseInt(usuarioId);
    document.getElementById("registerForm").style.display = "none"; // Ocultar formulario de registro
    actualizarTabla(usuarioLogueado);
  }

  // Configurar el calendario con Flatpickr
  const fechaInput = document.getElementById("fechaAccionInput");
  flatpickr(fechaInput, {
    dateFormat: "Y-m-d", // Formato de fecha
    maxDate: "today", // Fecha máxima
    disable: [
      function (date) {
        // Deshabilitar sábados (6) y domingos (0)
        return date.getDay() === 0 || date.getDay() === 6;
      },
    ],
    onChange: function (selectedDates, dateStr) {
      if (!dateStr) {
        showModal("El mercado cierra los sábados y domingos. Seleccione otra fecha.");
      }
    },
  });
});

// **Registrar usuario**
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreUsuario").value.trim();

  if (!nombre) {
    showModal("Por favor, ingresa un nombre de usuario.");
    return;
  }

  try {
    const response = await axios.post(`${API_BASE}/usuarios`, { nombre });
    usuarioLogueado = response.data.idUsuario;

    showModal("Usuario registrado con éxito.");
    document.getElementById("registerForm").style.display = "none";
    actualizarTabla(usuarioLogueado);
  } catch (error) {
    console.error(error);
    showModal("Error al registrar el usuario. Intenta nuevamente.");
  }
});

// **Registrar acción**
document.getElementById("compraForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fechaInput = document.getElementById("fechaAccionInput");
  const fechaSeleccionada = new Date(fechaInput.value);
  const diaSemana = fechaSeleccionada.getDay();

  if (diaSemana === 0 || diaSemana === 6) {
    showModal("El mercado cierra los sábados y domingos. Seleccione otra fecha.");
    fechaInput.value = ""; // Limpiar la fecha seleccionada
    return;
  }

  if (!usuarioLogueado) {
    showModal("Debes registrar un usuario primero.");
    return;
  }

  const simbolo = document.getElementById("simboloAccion").value.trim();
  const cantidad = parseInt(document.getElementById("cantidadAccion").value);
  const fecha = fechaInput.value;
  const precio = parseFloat(document.getElementById("precioAccionInput").value);

  if (cantidad <= 0) {
    showModal("La cantidad debe ser un número positivo.");
    return;
  }

  if (precio <= 0) {
    showModal("El precio debe ser mayor a 0.");
    return;
  }

  try {
    await axios.post(`${API_BASE}/acciones/comprar`, {
      nombreAccion: simbolo,
      cantidad: cantidad,
      precio: precio,
      fecha: fecha,
      usuario: { idUsuario: usuarioLogueado },
    });
    showModal("Acción registrada con éxito.");
    actualizarTabla(usuarioLogueado);
  } catch (error) {
    console.error(error);

    if (error.response && error.response.data && error.response.data.message) {
      showModal(error.response.data.message);
    } else {
      showModal("Error al registrar la acción. Intenta nuevamente.");
    }
  }
});

// **Actualizar tabla**
async function actualizarTabla(usuarioId) {
  try {
    const response = await axios.get(`${API_BASE}/acciones/usuario/${usuarioId}`);
    const tbody = document.getElementById("tablaAcciones").querySelector("tbody");
    tbody.innerHTML = "";

    response.data.forEach((accion) => {
      if (accion.cantidad > 0) {
        const precioTotal = (accion.cantidad * accion.precio).toFixed(2);

        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${accion.nombreAccion}</td>
          <td>${accion.cantidad}</td>
          <td>${accion.precio.toFixed(2)}</td>
          <td>${precioTotal}</td>
          <td>${accion.fecha}</td>
        `;
        fila.addEventListener("click", () => {
          window.location.href = `detalle.html?accionId=${accion.idAccion}&usuarioId=${usuarioId}`;
        });
        tbody.appendChild(fila);
      }
    });
  } catch (error) {
    console.error(error);
    alert("Error al cargar las acciones.");
  }
}

// **Reiniciar aplicación**
document.getElementById("reiniciarApp").addEventListener("click", () => {
  usuarioLogueado = null;
  document.getElementById("registerForm").style.display = "block";
  document.getElementById("tablaAcciones").querySelector("tbody").innerHTML = "";

  // Limpiar todos los campos del formulario
  document.getElementById("registerForm").reset();
  document.getElementById("compraForm").reset();
});

// **Mostrar modal**
function showModal(message) {
  const modal = document.getElementById("notificationModal");
  const modalMessage = document.getElementById("modalMessage");

  modalMessage.textContent = message;
  modal.classList.remove("hidden");

  document.getElementById("closeModal").addEventListener("click", () => {
    modal.classList.add("hidden");
  });
}
