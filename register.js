const API_BASE = "http://localhost:8080/auth";

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const userData = {
    cedula: document.getElementById("cedula").value,
    nombre: document.getElementById("nombre").value,
    email: document.getElementById("email").value,
    username: document.getElementById("username").value,
    password: document.getElementById("password").value
  };

  try {
    const response = await axios.post(`${API_BASE}/register`, userData);
    localStorage.setItem("token", response.data.token);
    alert("Registro exitoso");
    window.location.href = "registroAcciones.html";
  } catch (error) {
    alert("Error en el registro");
    console.error(error);
  }
});
