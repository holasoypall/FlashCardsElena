let flashcardsData = [];
let currentIndex = 0;
let currentMode = 'study'; // Puede ser 'study' o 'quiz'
let quizAnswered = false;  // Para bloquear clics tras responder

// Elementos del DOM
const studyContainer = document.getElementById('study-container');
const quizContainer = document.getElementById('quiz-container');
const btnStudy = document.getElementById('btn-mode-study');
const btnQuiz = document.getElementById('btn-mode-quiz');

const cardElement = document.getElementById('flashcard');

// Elementos Estudio
const studyImg = document.getElementById('study-img');
const studyTitle = document.getElementById('study-title');
const studyAuthor = document.getElementById('study-author');

// Elementos Quiz
const quizImg = document.getElementById('quiz-img');
const quizOptionsDiv = document.getElementById('quiz-options');
const quizFeedback = document.getElementById('quiz-feedback');

// 1. CARGA INICIAL
async function iniciarApp() {
    try {
        const respuesta = await fetch('json.json');
        if(!respuesta.ok) throw new Error("No se encontró data.json");
        flashcardsData = await respuesta.json();
        
        // Necesitamos al menos 4 cartas para el modo quiz
        if(flashcardsData.length < 4) {
            alert("Aviso: Necesitas al menos 4 obras en data.json para que el Quiz funcione bien.");
        }

        barajarArray(flashcardsData);
        cargarContenido();
    } catch (error) {
        console.error(error);
        alert("Error cargando: " + error.message);
    }
}

// 2. CAMBIO DE MODO
function cambiarModo(modo) {
    currentMode = modo;
    
    // Actualizamos botones del menú
    if (modo === 'study') {
        btnStudy.classList.add('active');
        btnQuiz.classList.remove('active');
        studyContainer.classList.remove('hidden');
        quizContainer.classList.add('hidden');
    } else {
        btnQuiz.classList.add('active');
        btnStudy.classList.remove('active');
        quizContainer.classList.remove('hidden');
        studyContainer.classList.add('hidden');
    }
    
    // Recargamos el contenido para adaptarlo al modo
    cargarContenido();
}

// 3. RENDERIZADO DE CONTENIDO (Centralizado)
function cargarContenido() {
    if (flashcardsData.length === 0) return;
    const data = flashcardsData[currentIndex];

    if (currentMode === 'study') {
        // Lógica Estudio
        studyImg.src = data.image;
        studyTitle.textContent = data.title;
        studyAuthor.textContent = data.author;
        // Asegurarse de que la carta empieza sin girar
        cardElement.classList.remove('is-flipped');
    } else {
        // Lógica Quiz
        quizAnswered = false;
        quizImg.src = data.image;
        quizFeedback.textContent = "Elige la respuesta correcta";
        generarOpcionesQuiz(data);
    }
}

// 4. LÓGICA ESPECÍFICA DEL QUIZ (Generar respuestas falsas)
function generarOpcionesQuiz(correcta) {
    quizOptionsDiv.innerHTML = ''; // Limpiar botones anteriores

    // a) Crear array con la respuesta correcta
    let opciones = [correcta];

    // b) Buscar 3 respuestas incorrectas al azar
    // Filtramos para no coger la correcta repetida
    let resto = flashcardsData.filter(item => item !== correcta);
    barajarArray(resto); // Mezclamos las incorrectas
    
    // Cogemos las 3 primeras del resto mezclado
    opciones = opciones.concat(resto.slice(0, 3));

    // c) Mezclamos las 4 opciones para que la correcta no esté siempre primera
    barajarArray(opciones);

    // d) Dibujar los botones
    opciones.forEach(opcion => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = `${opcion.title} - ${opcion.author}`;
        
        // Al hacer click...
        btn.onclick = () => verificarRespuesta(btn, opcion, correcta);
        
        quizOptionsDiv.appendChild(btn);
    });
}

function verificarRespuesta(btn, opcionElegida, correcta) {
    if (quizAnswered) return; // Evitar pulsar dos veces
    quizAnswered = true;

    if (opcionElegida === correcta) {
        // ACIERTO
        btn.classList.add('correct');
        quizFeedback.textContent = "¡Correcto! 🎉";
    } else {
        // FALLO
        btn.classList.add('wrong');
        quizFeedback.textContent = "¡Ups! Era: " + correcta.title;
        
        // Buscar el botón correcto para marcarlo en verde (para que aprendas)
        const botones = quizOptionsDiv.querySelectorAll('.option-btn');
        botones.forEach(boton => {
            if (boton.textContent.includes(correcta.title)) {
                boton.classList.add('correct');
            }
        });
    }
}

// 5. FUNCIONES COMUNES
function voltearTarjeta() {
    if(currentMode === 'study') {
        cardElement.classList.toggle('is-flipped');
    }
}

function siguienteTarjeta() {
    // Si estamos en estudio y la carta está girada, la enderezamos antes de cambiar
    if (currentMode === 'study' && cardElement.classList.contains('is-flipped')) {
        cardElement.classList.remove('is-flipped');
        setTimeout(() => avanzarIndice(), 300);
    } else {
        avanzarIndice();
    }
}

function avanzarIndice() {
    currentIndex++;
    if (currentIndex >= flashcardsData.length) {
        currentIndex = 0;
        barajarArray(flashcardsData);
    }
    cargarContenido();
}

function barajarArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// INICIAR
iniciarApp();