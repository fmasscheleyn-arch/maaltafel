// Game State
let gameState = {
    selectedTables: [],
    currentQuestion: 0,
    score: 0,
    startTime: 0,
    currentNum1: 0,
    currentNum2: 0,
    correctAnswer: 0,
    answers: [],
    possibleAnswers: []
};

// DOM Elements
const selectScreen = document.getElementById('selectScreen');
const quizScreen = document.getElementById('quizScreen');
const endScreen = document.getElementById('endScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]');
const answerBtns = document.querySelectorAll('.answer-btn');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const num1Display = document.getElementById('num1');
const num2Display = document.getElementById('num2');

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', resetGame);
answerBtns.forEach(btn => {
    btn.addEventListener('click', handleAnswer);
});

// Start Game
function startGame() {
    // Get selected tables
    gameState.selectedTables = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => parseInt(cb.value));

    if (gameState.selectedTables.length === 0) {
        alert('Selecteer minstens één maaltabel!');
        return;
    }

    // Reset game state
    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.startTime = Date.now();

    // Show quiz screen
    selectScreen.classList.remove('active');
    quizScreen.classList.add('active');

    // Start timer
    startTimer();

    // Show first question
    generateQuestion();
}

// Generate Random Question
function generateQuestion() {
    const selectedTable = gameState.selectedTables[
        Math.floor(Math.random() * gameState.selectedTables.length)
    ];
    
    gameState.currentNum1 = selectedTable;
    gameState.currentNum2 = Math.floor(Math.random() * 10) + 1;
    gameState.correctAnswer = gameState.currentNum1 * gameState.currentNum2;

    // Update display
    num1Display.textContent = gameState.currentNum1;
    num2Display.textContent = gameState.currentNum2;

    // Generate answer options
    generateAnswerOptions();

    // Clear previous feedback
    answerBtns.forEach(btn => {
        btn.classList.remove('correct', 'wrong');
        btn.disabled = false;
    });
}

// Generate Answer Options
function generateAnswerOptions() {
    gameState.possibleAnswers = [gameState.correctAnswer];

    // Add wrong answers
    while (gameState.possibleAnswers.length < 6) {
        let wrongAnswer = gameState.correctAnswer + (Math.random() - 0.5) * 30;
        wrongAnswer = Math.max(0, Math.round(wrongAnswer));

        if (!gameState.possibleAnswers.includes(wrongAnswer) && wrongAnswer !== gameState.correctAnswer) {
            gameState.possibleAnswers.push(wrongAnswer);
        }
    }

    // Shuffle answers
    gameState.possibleAnswers.sort(() => Math.random() - 0.5);

    // Update buttons
    answerBtns.forEach((btn, index) => {
        btn.textContent = gameState.possibleAnswers[index];
        btn.dataset.correct = gameState.possibleAnswers[index] === gameState.correctAnswer;
    });
}

// Handle Answer
function handleAnswer(e) {
    const btn = e.target;
    const selectedAnswer = parseInt(btn.textContent);
    const isCorrect = selectedAnswer === gameState.correctAnswer;

    // Disable all buttons
    answerBtns.forEach(b => b.disabled = true);

    // Show feedback
    if (isCorrect) {
        btn.classList.add('correct');
        gameState.score++;
        scoreDisplay.textContent = gameState.score;
    } else {
        btn.classList.add('wrong');
        // Show correct answer
        answerBtns.forEach(b => {
            if (parseInt(b.textContent) === gameState.correctAnswer) {
                b.classList.add('correct');
            }
        });
    }

    // Move to next question after delay
    gameState.currentQuestion++;
    setTimeout(() => {
        if (gameState.currentQuestion < 10) {
            generateQuestion();
        } else {
            endGame();
        }
    }, 1000);
}

// Timer
let timerInterval;
function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 100);
}

// End Game
function endGame() {
    clearInterval(timerInterval);

    // Calculate time
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Update end screen
    const endMessage = document.getElementById('endMessage');
    const finalScore = document.getElementById('finalScore');
    const finalTime = document.getElementById('finalTime');

    if (gameState.score === 10) {
        endMessage.textContent = '🎉 PERFECT! 10 op 10! 🎉';
        createFireworks();
    } else if (gameState.score >= 8) {
        endMessage.textContent = `Geweldig! ${gameState.score}/10! 🌟`;
    } else if (gameState.score >= 6) {
        endMessage.textContent = `Goed bezig! ${gameState.score}/10 👍`;
    } else {
        endMessage.textContent = `${gameState.score}/10 - Oefenen! 💪`;
    }

    finalScore.textContent = `${gameState.score}/10`;
    finalTime.textContent = timeString;

    // Show end screen
    quizScreen.classList.remove('active');
    endScreen.classList.add('active');
}

// Reset Game
function resetGame() {
    endScreen.classList.remove('active');
    selectScreen.classList.add('active');

    // Clear fireworks
    const fireworksContainer = document.getElementById('fireworks');
    fireworksContainer.innerHTML = '';
}

// Fireworks Animation
function createFireworks() {
    const fireworksContainer = document.getElementById('fireworks');
    fireworksContainer.innerHTML = '';

    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random color
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = color;
        particle.style.width = Math.random() * 10 + 5 + 'px';
        particle.style.height = particle.style.width;
        particle.style.borderRadius = '50%';

        // Random start position
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 5 + Math.random() * 8;

        const startX = 150;
        const startY = 150;

        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';

        fireworksContainer.appendChild(particle);

        // Animate
        let vx = Math.cos(angle) * velocity;
        let vy = Math.sin(angle) * velocity;
        let x = startX;
        let y = startY;
        let life = 1;

        const animate = () => {
            x += vx;
            y += vy;
            vy += 0.2; // gravity
            life -= 0.02;

            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.opacity = life;

            if (life > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };

        animate();
    }

    // Sound effect (optional - beep)
    playBeep();
}

// Simple beep sound
function playBeep() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}
