// Archivo preview-script.js para la página de vista previa del CV

document.addEventListener('DOMContentLoaded', function() {
    // Obtener datos del CV del sessionStorage
    const cvDataString = sessionStorage.getItem('cvData');
    
    if (!cvDataString) {
        // Si no hay datos, redirigir a la página de entrevista
        alert('No se encontraron datos del CV. Por favor, complete la entrevista primero.');
        window.location.href = 'interview.html';
        return;
    }
    
    const cvData = JSON.parse(cvDataString);
    const cvDocument = document.getElementById('cv-document');
    
    // Generar el CV en HTML
    generateCV(cvData, cvDocument);
    
    // Botón para editar el CV
    document.getElementById('edit-cv').addEventListener('click', function() {
        window.location.href = 'interview.html';
    });
    
    // Botón para descargar como PDF
    document.getElementById('download-cv').addEventListener('click', function() {
        // En un entorno real, usaríamos una biblioteca como html2pdf.js o jsPDF
        // Para este ejemplo, solo simularemos la descarga
        alert('Funcionalidad de descarga: En un entorno real, aquí se generaría un PDF para descargar.');
        window.print(); // Usar la función de impresión del navegador como alternativa
    });
});

// Función para generar el HTML del CV
function generateCV(data, container) {
    // Eliminar mensaje de carga
    container.innerHTML = '';
    
    // Cabecera con nombre y datos de contacto
    const header = document.createElement('div');
    header.className = 'cv-header';
    header.innerHTML = `
        <h1>${data.nombre}</h1>
        <div class="cv-contact">
            <div class="cv-contact-item">
                <span>📧</span> ${data.email}
            </div>
            <div class="cv-contact-item">
                <span>📱</span> ${data.telefono}
            </div>
            ${data.direccion ? `<div class="cv-contact-item"><span>🏠</span> ${data.direccion}</div>` : ''}
        </div>
    `;
    container.appendChild(header);
    
    // Perfil profesional
    const profile = document.createElement('div');
    profile.className = 'cv-profile';
    profile.textContent = data.perfil;
    container.appendChild(profile);
    
    // Experiencia laboral
    if (data.puesto && data.puesto.length > 0) {
        const experienceSection = document.createElement('div');
        experienceSection.className = 'cv-section';
        experienceSection.innerHTML = '<h2>Experiencia Laboral</h2>';
        
        for (let i = 0; i < data.puesto.length; i++) {
            if (!data.puesto[i]) continue; // Saltar si está vacío
            
            const item = document.createElement('div');
            item.className = 'cv-item';
            
            // Fechas de trabajo
            let dateText = '';
            if (data['fecha-inicio-exp'] && data['fecha-inicio-exp'][i]) {
                const startDate = formatDate(data['fecha-inicio-exp'][i]);
                let endDate = 'Actualidad';
                
                if (data['fecha-fin-exp'] && data['fecha-fin-exp'][i] && 
                    (!data['trabajo-actual'] || !data['trabajo-actual'][i])) {
                    endDate = formatDate(data['fecha-fin-exp'][i]);
                }
                
                dateText = `${startDate} - ${endDate}`;
            }
            
            item.innerHTML = `
                <h3>${data.puesto[i]}</h3>
                <h4>${data.empresa[i]}</h4>
                ${dateText ? `<div class="cv-dates">${dateText}</div>` : ''}
                ${data.descripcion && data.descripcion[i] ? 
                    `<div class="cv-description">${data.descripcion[i]}</div>` : ''}
            `;
            
            experienceSection.appendChild(item);
        }
        
        container.appendChild(experienceSection);
    }
    
    // Formación académica
    if (data.titulo && data.titulo.length > 0) {
        const educationSection = document.createElement('div');
        educationSection.className = 'cv-section';
        educationSection.innerHTML = '<h2>Formación Académica</h2>';
        
        for (let i = 0; i < data.titulo.length; i++) {
            if (!data.titulo[i]) continue; // Saltar si está vacío
            
            const item = document.createElement('div');
            item.className = 'cv-item';
            
            // Fechas de educación
            let dateText = '';
            if (data['fecha-inicio-edu'] && data['fecha-inicio-edu'][i]) {
                const startDate = formatDate(data['fecha-inicio-edu'][i]);
                let endDate = 'Actualidad';
                
                if (data['fecha-fin-edu'] && data['fecha-fin-edu'][i]) {
                    endDate = formatDate(data['fecha-fin-edu'][i]);
                }
                
                dateText = `${startDate} - ${endDate}`;
            }
            
            item.innerHTML = `
                <h3>${data.titulo[i]}</h3>
                <h4>${data.institucion[i]}</h4>
                ${dateText ? `<div class="cv-dates">${dateText}</div>` : ''}
            `;
            
            educationSection.appendChild(item);
        }
        
        container.appendChild(educationSection);
    }
    
    // Habilidades
    if (data.habilidades) {
        const skillsSection = document.createElement('div');
        skillsSection.className = 'cv-section';
        skillsSection.innerHTML = '<h2>Habilidades</h2>';
        
        const skillsContainer = document.createElement('div');
        skillsContainer.className = 'cv-skills';
        
        // Dividir las habilidades por comas y crear elementos
        const skills = data.habilidades.split(',');
        skills.forEach(skill => {
            if (skill.trim()) {
                const skillItem = document.createElement('div');
                skillItem.className = 'cv-skill';
                skillItem.textContent = skill.trim();
                skillsContainer.appendChild(skillItem);
            }
        });
        
        skillsSection.appendChild(skillsContainer);
        container.appendChild(skillsSection);
    }
    
    // Idiomas
    if (data.idiomas) {
        const languagesSection = document.createElement('div');
        languagesSection.className = 'cv-section';
        languagesSection.innerHTML = '<h2>Idiomas</h2>';
        
        const languagesContainer = document.createElement('div');
        languagesContainer.className = 'cv-languages';
        
        // Dividir los idiomas por comas
        const languages = data.idiomas.split(',');
        languages.forEach(language => {
            if (language.trim()) {
                const langItem = document.createElement('div');
                langItem.className = 'cv-item';
                langItem.innerHTML = `<div class="cv-description">${language.trim()}</div>`;
                languagesContainer.appendChild(langItem);
            }
        });
        
        languagesSection.appendChild(languagesContainer);
        container.appendChild(languagesSection);
    }
}

// Función para formatear fechas (de formato YYYY-MM a formato legible)
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}