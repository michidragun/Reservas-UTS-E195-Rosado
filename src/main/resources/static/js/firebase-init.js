const firebaseConfig = {
  apiKey: "AIzaSyDCFjvJMbjasi9btZDvVgPIqFNS61w3oPQ",
  authDomain: "reservas-aulas.firebaseapp.com",
  projectId: "reservas-aulas",
  storageBucket: "reservas-aulas.firebasestorage.app",
  messagingSenderId: "667985800579",
  appId: "1:667985800579:web:110361acfc8c2f71ad5ab6"
};

// Inicializa Firebase (solo una vez)
if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

// ============================================================
// FUNCIONES COMPARTIDAS DE AUTENTICACIÓN
// ============================================================

// Llama a esta función después del login para crear la sesión en el servidor
async function crearSesionServidor(user) {
    const token = await user.getIdToken();
    
    const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    });
    
    const data = await response.json();
    return data;
}

// Formatea un timestamp en fecha legible
function formatearFecha(timestamp) {
    return new Date(timestamp).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Muestra un mensaje de alerta en un elemento
function mostrarAlerta(elementId, mensaje, tipo = 'danger') {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = mensaje;
    el.className = `alert alert-${tipo}`;
    el.classList.remove('hidden');
    
    if (tipo === 'success') {
        setTimeout(() => el.classList.add('hidden'), 4000);
    }
}

// Oculta una alerta
function ocultarAlerta(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.classList.add('hidden');
}