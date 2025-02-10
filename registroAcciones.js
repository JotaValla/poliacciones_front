const API_BASE = "http://localhost:8080";
const token = localStorage.getItem("token");
const usuarioCedula = localStorage.getItem("usuarioCedula");

console.log("Datos en registroAcciones:", { token, usuarioCedula }); // Para depuración

if (!token) {
  showCustomModal("Debes iniciar sesión primero.", "error");
  window.location.href = "index.html";
}

const headers = { Authorization: `Bearer ${token}` };

document.addEventListener("DOMContentLoaded", () => {
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
  });
});

let ordenarAscendente = true;
let ordenamientoActivo = false;

// Event listener para el botón de ordenar
document
  .getElementById("ordenarAcciones")
  .addEventListener("click", async () => {
    ordenamientoActivo = !ordenamientoActivo; // Toggle el ordenamiento
    if (ordenamientoActivo) {
      ordenarAscendente = true;
    }
    await actualizarTabla(0);
  });

async function actualizarTabla(page = 0) {
  if (!usuarioCedula) {
    showCustomModal("No se encuentra la información del usuario.", "error");
    window.location.href = "index.html";
    return;
  }

  try {
    console.log(`Cargando página ${page} de acciones...`);

    // Construir la URL base
    let url = `${API_BASE}/acciones/usuario/${usuarioCedula}?page=${page}&size=5`;

    // Agregar parámetro de ordenamiento solo si está activo
    if (ordenamientoActivo) {
      url += `&ordenar=true`;
    }

    const response = await axios.get(url, { headers });

    const tbody = document.querySelector("#tablaAcciones tbody");
    tbody.innerHTML = "";

    if (response.data.content.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No hay acciones registradas.</td></tr>`;
      return;
    }

    response.data.content.forEach((accion) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${accion.nombreAccion}</td>
        <td>${accion.cantidad}</td>
        <td>${accion.precio.toFixed(2)}</td>
        <td>${(accion.cantidad * accion.precio).toFixed(2)}</td>
        <td>${accion.fecha}</td>
      `;
      fila.addEventListener("click", () => {
        window.location.href = `detalle.html?accionId=${accion.idAccion}&usuarioId=${usuarioCedula}`;
      });
      tbody.appendChild(fila);
    });

    generarPaginacion(
      response.data.pageable.pageNumber,
      response.data.totalPages
    );
    actualizarTablaConsolidados();
  } catch (error) {
    console.error("Error al cargar acciones:", error);
    showCustomModal("Hubo un problema al cargar tus acciones.", "error");
  }
}

async function actualizarTablaConsolidados() {
  if (!usuarioCedula) {
    console.error("No se encuentra la información del usuario.");
    return;
  }

  try {
    const response = await axios.get(
      `${API_BASE}/acciones/consolidado/${usuarioCedula}`,
      { headers }
    );

    const tbody = document.querySelector("#tablaConsolidados tbody");
    tbody.innerHTML = "";

    if (response.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No hay acciones consolidadas.</td></tr>`;
      return;
    }

    response.data.forEach((consolidado) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${consolidado.accion}</td>
        <td>${consolidado.cantidadTotal}</td>
        <td>$${consolidado.valorUSD.toFixed(2)}</td>
        <td>$${consolidado.precioCosto.toFixed(2)}</td>
        <td class="${
          consolidado.porcentajeGananciaPerdida >= 0 ? "ganancia" : "perdida"
        }">
          ${consolidado.porcentajeGananciaPerdida.toFixed(2)}%
        </td>
        <td class="${
          consolidado.gananciaPerdidaUSD >= 0 ? "ganancia" : "perdida"
        }">
          $${Math.abs(consolidado.gananciaPerdidaUSD).toFixed(2)}
        </td>
      `;
      tbody.appendChild(fila);
    });
  } catch (error) {
    console.error("Error al cargar consolidados:", error);
    const tbody = document.querySelector("#tablaConsolidados tbody");
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Error al cargar los consolidados.</td></tr>`;
  }
}

// Función para generar la paginación
function generarPaginacion(paginaActual, totalPaginas) {
  const paginacionDiv = document.getElementById("paginacion");
  paginacionDiv.innerHTML = "";

  for (let i = 0; i < totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i + 1;
    btn.disabled = i === paginaActual;
    btn.addEventListener("click", () => actualizarTabla(i));
    paginacionDiv.appendChild(btn);
  }
}

// **Registrar acción**
document.getElementById("compraForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Obtener la fecha seleccionada y validar que no sea fin de semana
  const fechaInput = document.getElementById("fechaAccionInput");
  const fechaSeleccionada = new Date(fechaInput.value);
  const diaSemana = fechaSeleccionada.getDay();

  if (diaSemana === 5 || diaSemana === 6) {
    showCustomModal(
      "El mercado cierra los sábados y domingos. Seleccione otra fecha.",
      "error"
    );
    fechaInput.value = "";
    return;
  }

  // Obtener los datos del formulario
  const simbolo = document.getElementById("simboloAccion").value.trim();
  const cantidad = parseInt(document.getElementById("cantidadAccion").value);
  const fecha = fechaInput.value;
  const precio = parseFloat(document.getElementById("precioAccionInput").value);

  // Validar que la cantidad sea positiva
  if (cantidad <= 0) {
    showCustomModal("La cantidad debe ser un número positivo.", "error");
    return;
  }

  // Validar que el precio sea mayor que 0
  if (precio <= 0) {
    showCustomModal("El precio debe ser mayor a 0.", "error");
    return;
  }

  // Validación del símbolo de la acción (solo letras)
  const regexSimbolo = /^[A-Za-z]+$/;
  if (!regexSimbolo.test(simbolo)) {
    showCustomModal(
      "El símbolo de la acción debe contener solo letras.",
      "error"
    );
    return;
  }

  try {
    // Agregamos los headers con el token en la petición POST
    const response = await axios.post(
      `${API_BASE}/acciones/comprar`,
      {
        nombreAccion: simbolo,
        cantidad: cantidad,
        precio: precio,
        fecha: fecha,
        usuario: { cedula: usuarioCedula },
      },
      { headers } // Agregamos los headers aquí
    );

    console.log("Respuesta del registro:", response.data); // Para depuración
    showCustomModal("Acción registrada con éxito.", 'success');

    // Limpiamos el formulario
    document.getElementById("compraForm").reset();

    ordenamientoActivo = false;
    await Promise.all([actualizarTabla(0), actualizarTablaConsolidados()]);
  } catch (error) {
    console.error("Error completo:", error);
    console.error("Respuesta del servidor:", error.response?.data);

    if (error.response && error.response.data && error.response.data.message) {
      showCustomModal(error.response.data.message, 'error');
    } else {
      showCustomModal("Error al registrar la acción. Intenta nuevamente.", 'error');
    }
  }
});

// Función para mostrar un modal con un mensaje
function showModal(message) {
  const modal = document.getElementById("notificationModal");
  const modalMessage = document.getElementById("modalMessage");

  modalMessage.textContent = message;
  modal.classList.remove("hidden");

  document.getElementById("closeModal").addEventListener("click", () => {
    modal.classList.add("hidden");
  });
}

// Función para mostrar modales personalizados
function showCustomModal(message, type = "success") {
  // Crear el modal
  const modal = document.createElement("div");
  modal.className = `custom-modal ${
    type === "success" ? "modal-success" : "modal-error"
  }`;

  // Contenido del modal
  modal.innerHTML = `
    <div class="custom-modal-content">
      <div class="modal-header">
        <div class="modal-icon">
          ${type === "success" ? "✓" : "✕"}
        </div>
      </div>
      <div class="modal-message">${message}</div>
      <button class="modal-button">Aceptar</button>
    </div>
  `;

  // Agregar el modal al DOM
  document.body.appendChild(modal);

  // Mostrar el modal con animación
  setTimeout(() => modal.classList.add("show"), 10);

  // Manejar el cierre del modal
  const closeModal = () => {
    modal.classList.remove("show");
    setTimeout(() => modal.remove(), 300);
  };

  // Evento para el botón de cerrar
  modal.querySelector(".modal-button").addEventListener("click", closeModal);

  // Cerrar al hacer clic fuera del modal
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

// Funcion limpiar datos de los inputs del form al dar click al boton Limpiar campos
document.getElementById("limpiarCampos").addEventListener("click", () => {
  document.getElementById("compraForm").reset();
});

document.addEventListener("DOMContentLoaded", () => {
  ordenamientoActivo = false; // Asegurarse de que inicie sin ordenamiento
  actualizarTabla(0);
  actualizarTablaConsolidados();
});
