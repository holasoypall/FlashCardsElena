let flashcardsData = []; // Ahora empieza vacío
let currentIndex = 0;

const cardElement = document.getElementById('flashcard');
const imgElement = document.getElementById('card-image');
const titleElement = document.getElementById('card-title');
const authorElement = document.getElementById('card-author');

// 1. FUNCIÓN PARA CARGAR EL JSON
async function iniciarApp() {
    try {
        // Pedimos el archivo data.json
        const respuesta = await fetch('json.json');
        
        // Convertimos la respuesta a datos usables
        flashcardsData = await respuesta.json();
        
        // Una vez tenemos los datos, barajamos y mostramos la primera
        barajarArray(flashcardsData);
        cargarTarjeta();
        
    } catch (error) {
        console.error("Error cargando el JSON:", error);
        alert("Error: No se pudieron cargar las tarjetas. Asegúrate de estar usando un Servidor Local (Live Server).");
    }
}

// Algoritmo de mezcla (Fisher-Yates)
function barajarArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function cargarTarjeta() {
    // Seguridad: si no hay datos, no hacemos nada
    if (flashcardsData.length === 0) return;

    const data = flashcardsData[currentIndex];
    imgElement.src = data.image;
    titleElement.textContent = data.title;
    authorElement.textContent = data.author;
}

function voltearTarjeta() {
    cardElement.classList.toggle('is-flipped');
}

function siguienteTarjeta() {
    // Si no hay datos cargados todavía, el botón no hace nada
    if (flashcardsData.length === 0) return;

    if (cardElement.classList.contains('is-flipped')) {
        cardElement.classList.remove('is-flipped');
        setTimeout(() => {
            avanzarIndice();
        }, 300);
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
    cargarTarjeta();
}

// INICIAMOS LA APP
iniciarApp();