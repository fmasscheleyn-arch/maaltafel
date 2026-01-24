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
        .map(cb => cb.value);

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
    
    // Check if it's a division table (starts with 'd')
    if (selectedTable.toString().startsWith('d')) {
        // Division
        const divisor = parseInt(selectedTable.substring(1));
        gameState.currentNum2 = divisor;
        gameState.currentNum1 = divisor * (Math.floor(Math.random() * 10) + 1);
        gameState.correctAnswer = gameState.currentNum1 / gameState.currentNum2;
        
        num1Display.textContent = gameState.currentNum1;
        num1Display.style.marginRight = '10px';
        num2Display.textContent = gameState.currentNum2;
        num2Display.style.marginLeft = '10px';
        
        // Update question display to show division symbol
        const questionDiv = document.querySelector('.question');
        questionDiv.innerHTML = `<span id="num1">${gameState.currentNum1}</span> ÷ <span id="num2">${gameState.currentNum2}</span> = ?`;
        
        // Re-attach event listeners to new elements
        document.querySelectorAll('#num1, #num2').forEach(el => {
            el.id = el.id; // Keep their IDs
        });
    } else {
        // Multiplication
        const multiplier = parseInt(selectedTable);
        gameState.currentNum1 = multiplier;
        gameState.currentNum2 = Math.floor(Math.random() * 10) + 1;
        gameState.correctAnswer = gameState.currentNum1 * gameState.currentNum2;
        
        num1Display.textContent = gameState.currentNum1;
        num2Display.textContent = gameState.currentNum2;
        
        // Update question display to show multiplication symbol
        const questionDiv = document.querySelector('.question');
        questionDiv.innerHTML = `<span id="num1">${gameState.currentNum1}</span> × <span id="num2">${gameState.currentNum2}</span> = ?`;
        
        // Re-attach references
        document.querySelectorAll('#num1, #num2').forEach(el => {
            el.id = el.id; // Keep their IDs
        });
    }

    // Generate answer options
    generateAnswerOptions();

    // Clear previous feedback - GOED ALLES WISSEN
    answerBtns.forEach(btn => {
        btn.classList.remove('correct', 'wrong');
        btn.style.background = 'white';
        btn.style.color = '#c71585';
        btn.style.borderColor = '#ffb6d9';
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
        playCorrectSound(); // Geluid voor goed antwoord
    } else {
        btn.classList.add('wrong');
        playWrongSound(); // Geluid voor fout antwoord
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
        if (gameState.currentQuestion < 25) {
            generateQuestion();
        } else {
            endGame();
        }
    }, 600);
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
    const barbieMessage = document.getElementById('barbieMessage');
    const finalScore = document.getElementById('finalScore');
    const finalTime = document.getElementById('finalTime');

    // Barbie pop zegt je score
    barbieMessage.textContent = `Wauw, jij haalde een score van ${gameState.score}/25!`;

    if (gameState.score === 25) {
        endMessage.textContent = '🎉 PERFECT! 25 op 25! 🎉';
        createFireworks();
    } else if (gameState.score >= 20) {
        endMessage.textContent = `Geweldig! ${gameState.score}/25! 🌟`;
    } else if (gameState.score >= 15) {
        endMessage.textContent = `Goed bezig! ${gameState.score}/25 👍`;
    } else {
        endMessage.textContent = `${gameState.score}/25 - Oefenen! 💪`;
    }

    finalScore.textContent = `${gameState.score}/25`;
    finalTime.textContent = timeString;

    // Show end screen
    quizScreen.classList.remove('active');
    endScreen.classList.add('active');

    // Play success sound and speak the score
    playSuccessSound();
    speakScore(gameState.score);
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

// Success Sound - twee beeps
function playSuccessSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Eerste beep
        let osc = audioContext.createOscillator();
        let gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = 600;
        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.15);

        // Tweede beep (hoger)
        setTimeout(() => {
            osc = audioContext.createOscillator();
            gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = 900;
            gain.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + 0.15);
        }, 200);
    } catch (e) {
        console.log('Audio niet beschikbaar');
    }
}

// Goed antwoord geluid
function playCorrectSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Twee opeenvolgende hoge beeps - veel zachter en helderder
        let frequencies = [1200, 1500];
        let delay = 0;
        
        frequencies.forEach(freq => {
            setTimeout(() => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.03, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.005, audioContext.currentTime + 0.06);
                osc.start(audioContext.currentTime);
                osc.stop(audioContext.currentTime + 0.06);
            }, delay);
            delay += 80;
        });
    } catch (e) {
        console.log('Audio niet beschikbaar');
    }
}

// Fout antwoord geluid
function playWrongSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Twee lage beeps - veel zachter
        let frequencies = [600, 450];
        let delay = 0;
        
        frequencies.forEach(freq => {
            setTimeout(() => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.03, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.005, audioContext.currentTime + 0.08);
                osc.start(audioContext.currentTime);
                osc.stop(audioContext.currentTime + 0.08);
            }, delay);
            delay += 100;
        });
    } catch (e) {
        console.log('Audio niet beschikbaar');
    }
}

// Spreek de score uit
function speakScore(score) {
    // Check of browser speech API ondersteunt
    const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance;
    
    if (!SpeechSynthesisUtterance) {
        console.log('Speech API niet beschikbaar');
        return;
    }

    // Wacht even voor geluid
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance();
        utterance.text = `Wauw! Jij haalde een score van ${score} op 25!`;
        utterance.lang = 'nl-NL'; // Nederlands
        utterance.rate = 1; // Normale snelheid
        utterance.pitch = 2; // Heel hoog voor vrolijk meisjes stemgeluid
        utterance.volume = 1; // Vol volume
        
        // Laad alle beschikbare stemmen
        const voices = window.speechSynthesis.getVoices();
        
        // Zoek naar vrouwelijke/meisjes stemmen (prioriteit volgorde)
        const femaleVoice = voices.find(voice => {
            const name = voice.name.toLowerCase();
            return name.includes('female') || 
                   name.includes('woman') ||
                   name.includes('girl') ||
                   name.includes('claire') ||
                   name.includes('moira') ||
                   name.includes('samantha') ||
                   name.includes('victoria') ||
                   name.includes('ava') ||
                   (!voice.default && !name.includes('male') && voice.lang.includes('nl'));
        });
        
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }
        
        window.speechSynthesis.cancel(); // Stop vorige spraak
        window.speechSynthesis.speak(utterance);
    }, 500);
}

