const API_BASE = "http://localhost:8080/auth";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await axios.post(`${API_BASE}/login`, { username, password });
    console.log('Respuesta del login:', response.data); // Para depuración
    
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("usuarioCedula", response.data.cedula);
    
    console.log('Datos guardados en localStorage:', {
      token: localStorage.getItem("token"),
      cedula: localStorage.getItem("usuarioCedula")
    }); // Para depuración
    
    alert("Inicio de sesión exitoso");
    window.location.href = "registroAcciones.html";
  } catch (error) {
    console.error('Error completo:', error); // Para ver el error completo
    alert("Error en el inicio de sesión: " + error.message);
  }
});