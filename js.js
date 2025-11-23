let flashcardsData = [];
let currentIndex = 0;
let currentMode = 'study'; 

// VARIABLES PARA MEMORY
let hasFlippedCard = false;
let lockBoard = false; 
let firstCard, secondCard;
let memoryMatches = 0;

// Elementos DOM
const studyContainer = document.getElementById('study-container');
const quizContainer = document.getElementById('quiz-container');
const memoryContainer = document.getElementById('memory-container');

const btnStudy = document.getElementById('btn-mode-study');
const btnQuiz = document.getElementById('btn-mode-quiz');
const btnMemory = document.getElementById('btn-mode-memory');

const cardElement = document.getElementById('flashcard');
const studyImg = document.getElementById('study-img');
const studyTitle = document.getElementById('study-title');
const studyAuthor = document.getElementById('study-author');

const quizImg = document.getElementById('quiz-img');
const quizOptionsDiv = document.getElementById('quiz-options');
const quizFeedback = document.getElementById('quiz-feedback');

const memoryBoard = document.getElementById('memory-board');
const memoryFeedback = document.getElementById('memory-feedback');


// 1. CARGA INICIAL
async function iniciarApp() {
    try {
        const respuesta = await fetch('json.json');
        if(!respuesta.ok) throw new Error("Error cargando json.json");
        flashcardsData = await respuesta.json();
        cambiarModo('study');
    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    }
}

// 2. CAMBIO DE MODO
function cambiarModo(modo) {
    currentMode = modo;
    
    studyContainer.classList.add('hidden');
    quizContainer.classList.add('hidden');
    memoryContainer.classList.add('hidden');
    
    btnStudy.classList.remove('active');
    btnQuiz.classList.remove('active');
    btnMemory.classList.remove('active');

    if (modo === 'study') {
        studyContainer.classList.remove('hidden');
        btnStudy.classList.add('active');
        cargarContenidoEstudio();
    } else if (modo === 'quiz') {
        quizContainer.classList.remove('hidden');
        btnQuiz.classList.add('active');
        cargarContenidoQuiz();
    } else if (modo === 'memory') {
        memoryContainer.classList.remove('hidden');
        btnMemory.classList.add('active');
        prepararMemory();
    }
}

// LÓGICA MODO ESTUDIO
function cargarContenidoEstudio() {
    if (flashcardsData.length === 0) return;
    const data = flashcardsData[currentIndex];
    studyImg.src = data.image;
    studyTitle.textContent = data.title;
    studyAuthor.textContent = data.author;
    cardElement.classList.remove('is-flipped');
}

function voltearTarjetaEstudio() {
    cardElement.classList.toggle('is-flipped');
}

// LÓGICA MODO QUIZ (¡CORREGIDA!)
function cargarContenidoQuiz() {
    if (flashcardsData.length === 0) return;
    const data = flashcardsData[currentIndex];
    quizImg.src = data.image;
    quizFeedback.textContent = "Elige la respuesta correcta";
    
    let opciones = [data];
    let resto = flashcardsData.filter(item => item !== data);
    barajarArray(resto);
    opciones = opciones.concat(resto.slice(0, 3));
    barajarArray(opciones);

    quizOptionsDiv.innerHTML = '';
    opciones.forEach(opcion => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = `${opcion.title} - ${opcion.author}`;
        
        // Asignamos un atributo data para identificar cuál es la correcta luego
        if (opcion === data) btn.dataset.correct = "true";

        btn.onclick = () => {
            if (opcion === data) {
                // ACIERTO
                btn.classList.add('correct');
                quizFeedback.textContent = "¡Correcto! 🎉";
            } else {
                // FALLO
                btn.classList.add('wrong');
                quizFeedback.textContent = "¡Ups! Era: " + data.title;
                
                // --- AQUÍ ESTÁ EL CAMBIO ---
                // Buscamos todos los botones y coloreamos el correcto en verde
                const botones = quizOptionsDiv.querySelectorAll('.option-btn');
                botones.forEach(b => {
                    if (b.dataset.correct === "true") {
                        b.classList.add('correct');
                    }
                });
            }
        };
        quizOptionsDiv.appendChild(btn);
    });
}

// LÓGICA MODO MEMORY (¡MEJORADA!)
function prepararMemory() {
    memoryBoard.innerHTML = '';
    memoryMatches = 0;
    hasFlippedCard = false;
    lockBoard = false;
    memoryFeedback.textContent = "Encuentra las parejas";

    barajarArray(flashcardsData);
    const seleccion = flashcardsData.slice(0, 10);

    let cartasJuego = [];
    seleccion.forEach((item, index) => {
        cartasJuego.push({ id: index, type: 'img', content: item.image, data: item });
        cartasJuego.push({ id: index, type: 'text', content: item.title, data: item });
    });

    barajarArray(cartasJuego);

    cartasJuego.forEach(carta => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('mem-card');
        cardDiv.dataset.id = carta.id;

        let backContent = '';
        if (carta.type === 'img') {
            backContent = `<img src="${carta.content}">`;
        } else {
            backContent = `<div class="info-text">
                             <h3>${carta.data.title}</h3>
                             <p>${carta.data.author}</p>
                           </div>`;
        }

        cardDiv.innerHTML = `
            <div class="mem-inner">
                <div class="mem-front">?</div>
                <div class="mem-back">${backContent}</div>
            </div>
        `;

        cardDiv.addEventListener('click', voltearCartaMemory);
        memoryBoard.appendChild(cardDiv);
    });
}

function voltearCartaMemory() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    lockBoard = true;

    // --- CAMBIO: Esperamos solo 350ms ---
    // (Un pelín más de lo que tarda la carta en girar, que son 300ms)
    setTimeout(() => {
        verificarPareja();
    }, 350);
}

function verificarPareja() {
    let esPareja = firstCard.dataset.id === secondCard.dataset.id;
    esPareja ? desactivarCartas() : devolverCartas();
}

function desactivarCartas() {
    // Se añade clase 'matched' (Verde) y se quitan listeners
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.removeEventListener('click', voltearCartaMemory);
    secondCard.removeEventListener('click', voltearCartaMemory);

    resetearTablero();
    memoryMatches++;
    
    const totalParejas = document.querySelectorAll('.mem-card').length / 2;
    if (memoryMatches === totalParejas) {
        memoryFeedback.textContent = "¡Felicidades! Has completado el Memory 🎉";
    }
}

function devolverCartas() {
    lockBoard = true;
    
    firstCard.classList.add('wrong');
    secondCard.classList.add('wrong');

    // --- CAMBIO: Solo 800ms de espera ---
    setTimeout(() => {
        firstCard.classList.remove('wrong');
        secondCard.classList.remove('wrong');
        
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        
        resetearTablero();
    }, 800); 
}

function resetearTablero() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function reiniciarMemory() {
    prepararMemory();
}

// COMUNES
function siguienteTarjeta() {
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
    if(currentMode === 'study') cargarContenidoEstudio();
    if(currentMode === 'quiz') cargarContenidoQuiz();
}

function barajarArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

iniciarApp();