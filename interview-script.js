document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("cv-form");

    // Navegación entre secciones
    document.querySelectorAll(".next-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            const nextId = btn.dataset.next;
            document.querySelectorAll(".form-section").forEach(section => section.classList.remove("active"));
            document.getElementById(nextId).classList.add("active");
        });
    });

    document.querySelectorAll(".prev-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            const prevId = btn.dataset.prev;
            document.querySelectorAll(".form-section").forEach(section => section.classList.remove("active"));
            document.getElementById(prevId).classList.add("active");
        });
    });

    // Agregar más educación
    document.getElementById("add-education").addEventListener("click", function () {
        const container = document.getElementById("education-container");
        const item = container.querySelector(".education-item").cloneNode(true);
        item.querySelectorAll("input").forEach(input => input.value = "");
        container.appendChild(item);
    });

    // Agregar más experiencia
    document.getElementById("add-experience").addEventListener("click", function () {
        const container = document.getElementById("experience-container");
        const item = container.querySelector(".experience-item").cloneNode(true);
        item.querySelectorAll("input, textarea").forEach(input => {
            if (input.type === "checkbox") input.checked = false;
            else input.value = "";
        });
        container.appendChild(item);
    });

    // Generar PDF
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let y = 10;

        const addLine = (text, bold = false) => {
            if (bold) doc.setFont(undefined, 'bold');
            else doc.setFont(undefined, 'normal');
            doc.text(text, 10, y);
            y += 10;
        };

        // Datos personales
        addLine("Datos Personales", true);
        addLine(`Nombre: ${form.nombre.value}`);
        addLine(`Correo: ${form.email.value}`);
        addLine(`Teléfono: ${form.telefono.value}`);
        addLine(`Dirección: ${form.direccion.value}`);
        addLine(`Perfil: ${form.perfil.value}`);
        y += 5;

        // Educación
        addLine("Formación Académica", true);
        const titulos = form.querySelectorAll("input[name='titulo[]']");
        const instituciones = form.querySelectorAll("input[name='institucion[]']");
        const inicioEdu = form.querySelectorAll("input[name='fecha-inicio-edu[]']");
        const finEdu = form.querySelectorAll("input[name='fecha-fin-edu[]']");

        for (let i = 0; i < titulos.length; i++) {
            addLine(`- ${titulos[i].value}, ${instituciones[i].value} (${inicioEdu[i].value} - ${finEdu[i].value})`);
        }
        y += 5;

        // Experiencia
        addLine("Experiencia Laboral", true);
        const puestos = form.querySelectorAll("input[name='puesto[]']");
        const empresas = form.querySelectorAll("input[name='empresa[]']");
        const inicioExp = form.querySelectorAll("input[name='fecha-inicio-exp[]']");
        const finExp = form.querySelectorAll("input[name='fecha-fin-exp[]']");
        const actuales = form.querySelectorAll("input[name='trabajo-actual[]']");
        const descripciones = form.querySelectorAll("textarea[name='descripcion[]']");

        for (let i = 0; i < puestos.length; i++) {
            const periodo = actuales[i].checked ? `${inicioExp[i].value} - Actual` : `${inicioExp[i].value} - ${finExp[i].value}`;
            addLine(`- ${puestos[i].value} en ${empresas[i].value} (${periodo})`);
            if (descripciones[i].value.trim() !== "") {
                addLine(`  ${descripciones[i].value}`);
            }
        }
        y += 5;

        // Habilidades
        addLine("Habilidades", true);
        addLine(form.habilidades.value);
        y += 5;

        // Idiomas
        addLine("Idiomas", true);
        addLine(form.idiomas.value);

        doc.save("cv.pdf");

        // Reset y volver a primera sección
        form.reset();
        document.querySelectorAll(".form-section").forEach(section => section.classList.remove("active"));
        document.getElementById("section-1").classList.add("active");
    });
});
