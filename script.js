// Archivo script.js para la página principal

document.addEventListener('DOMContentLoaded', function() {
    // Obtener el botón "Hacer entrevista"
    const entrevistaBtn = document.querySelector('.btn.primary');
    
    // Añadir evento de clic para redirigir a la página de entrevista
    if (entrevistaBtn) {
        entrevistaBtn.addEventListener('click', function() {
            window.location.href = 'interview.html';
        });
    }
});