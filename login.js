const API_BASE = "http://localhost:8080/auth";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await axios.post(`${API_BASE}/login`, { username, password });
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("usuarioCedula", response.data.cedula);
    
    showCustomModal('Inicio de sesion exitoso.');
    window.location.href = "registroAcciones.html";
  } catch (error) {
    console.error('Error completo:', error);
    if (error.response && error.response.data) {
      showCustomModal(error.response.data.message || "Error en el inicio de sesion", 'error');
    } else {
      showCustomModal("Error al conectar con el servidor", 'error');
    }
  }
});

// Función para mostrar modales personalizados
function showCustomModal(message, type = 'success') {
  // Crear el modal
  const modal = document.createElement('div');
  modal.className = `custom-modal ${type === 'success' ? 'modal-success' : 'modal-error'}`;
  
  // Contenido del modal
  modal.innerHTML = `
    <div class="custom-modal-content">
      <div class="modal-header">
        <div class="modal-icon">
          ${type === 'success' 
            ? '✓' 
            : '✕'}
        </div>
      </div>
      <div class="modal-message">${message}</div>
      <button class="modal-button">Aceptar</button>
    </div>
  `;
  
  // Agregar el modal al DOM
  document.body.appendChild(modal);
  
  // Mostrar el modal con animación
  setTimeout(() => modal.classList.add('show'), 10);
  
  // Manejar el cierre del modal
  const closeModal = () => {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  };
  
  // Evento para el botón de cerrar
  modal.querySelector('.modal-button').addEventListener('click', closeModal);
  
  // Cerrar al hacer clic fuera del modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}
