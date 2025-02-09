const API_BASE = "http://localhost:8080";

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreUsuario").value.trim();

  if (!nombre) {
    alert("Por favor, ingresa un nombre de usuario.");
    return;
  }

  try {
    const response = await axios.post(`${API_BASE}/usuarios`, { nombre });
    const usuarioId = response.data.idUsuario;

    alert("Usuario registrado con éxito.");
    window.location.href = `registroAcciones.html?usuarioId=${usuarioId}`;
  } catch (error) {
    console.error(error);
    alert("Error al registrar el usuario. Intenta nuevamente.");
  }
});
