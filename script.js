const API_BASE = "http://localhost:8080";
let usuarioLogueado = null;

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const usuarioId = params.get("usuarioId");

  if (usuarioId) {
    usuarioLogueado = parseInt(usuarioId);
    document.getElementById("registerForm").style.display = "none"; // Ocultar registro
    actualizarTabla(usuarioLogueado);
  }

  const hoy = new Date().toISOString().split("T")[0];
  document.getElementById("fechaAccionInput").setAttribute("max", hoy);
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreUsuario").value;

  try {
    const response = await axios.post(`${API_BASE}/usuarios`, { nombre });
    usuarioLogueado = response.data.idUsuario;
    showModal("Usuario registrado con éxito."); // Usar ventana modal
    document.getElementById("registerForm").style.display = "none";
    actualizarTabla(usuarioLogueado);
  } catch (error) {
    console.error(error);
    showModal("Error al registrar el usuario."); // Usar ventana modal
  }
});


document.getElementById("compraForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!usuarioLogueado) {
    showModal("Debes registrar un usuario primero.");
    return;
  }

  const simbolo = document.getElementById("simboloAccion").value.trim();
  const cantidad = parseInt(document.getElementById("cantidadAccion").value);
  const fecha = document.getElementById("fechaAccionInput").value;
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
    showModal("Error al registrar la acción.");
  }
});


async function actualizarTabla(usuarioId) {
  try {
    const response = await axios.get(
      `${API_BASE}/acciones/usuario/${usuarioId}`
    );
    const tbody = document
      .getElementById("tablaAcciones")
      .querySelector("tbody");
    tbody.innerHTML = "";

    response.data.forEach((accion) => {
      if (accion.cantidad > 0) {
        // Calcular el precio total
        const precioTotal = (accion.cantidad * accion.precio).toFixed(2);

        // Crear fila con la nueva columna
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


document.getElementById("reiniciarApp").addEventListener("click", () => {
  usuarioLogueado = null;
  document.getElementById("registerForm").style.display = "block";
  document.getElementById("tablaAcciones").querySelector("tbody").innerHTML =
    "";
});

// Función para mostrar la ventana modal con un mensaje
function showModal(message) {
  const modal = document.getElementById("notificationModal");
  const modalMessage = document.getElementById("modalMessage");

  modalMessage.textContent = message;
  modal.classList.remove("hidden");

  // Ocultar modal al hacer clic en "Aceptar"
  document.getElementById("closeModal").addEventListener("click", () => {
    modal.classList.add("hidden");
  });
}
