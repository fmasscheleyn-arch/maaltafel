let gameState = {
    selectedTables: [],
    currentQuestion: 0,
    score: 0,
    startTime: 0,
    currentNum1: 0,
    currentNum2: 0,
    correctAnswer: 0,
    isDiv: false,
    theme: 'pink'
};

const sounds = {
    correct: new Audio('https://www.soundjay.com/buttons/sounds/button-37a.mp3'),
    wrong: new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3')
};

// Schermen
const themeScreen = document.getElementById('themeScreen');
const selectScreen = document.getElementById('selectScreen');
const quizScreen = document.getElementById('quizScreen');
const endScreen = document.getElementById('endScreen');

// Knoppen en displays
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const backToTheme = document.getElementById('backToTheme');
const checkboxes = document.querySelectorAll('.checkbox-item input');
const answerBtns = document.querySelectorAll('.answer-btn');
const progressBar = document.getElementById('progressBar');
const themeEmoji = document.getElementById('themeEmoji');
const scoreDisplay = document.getElementById('score');

// --- THEMA LOGICA ---
function setTheme(theme) {
    gameState.theme = theme;
    if (theme === 'blue') {
        document.body.classList.add('theme-blue');
        themeEmoji.textContent = '⚽';
    } else {
        document.body.classList.remove('theme-blue');
        themeEmoji.textContent = '💕';
    }
    themeScreen.classList.remove('active');
    selectScreen.classList.add('active');
}

backToTheme.addEventListener('click', () => {
    selectScreen.classList.remove('active');
    themeScreen.classList.add('active');
});

// --- SPEL LOGICA ---
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
    endScreen.classList.remove('active');
    themeScreen.classList.add('active');
});

answerBtns.forEach(btn => btn.addEventListener('click', handleAnswer));

function startGame() {
    gameState.selectedTables = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
    if (gameState.selectedTables.length === 0) return alert('Kies een tafel!');
    
    sounds.correct.load();
    sounds.wrong.load();

    // Reset de data
    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.startTime = Date.now();
    
    // CORRIGEER SCORE DISPLAY: Meteen op nul zetten in de HTML bij start
    scoreDisplay.textContent = '0';
    
    selectScreen.classList.remove('active');
    quizScreen.classList.add('active');
    
    generateQuestion();
    startTimer();
}

function generateQuestion() {
    const progress = (gameState.currentQuestion / 25) * 100;
    progressBar.style.width = progress + '%';

    const table = gameState.selectedTables[Math.floor(Math.random() * gameState.selectedTables.length)];
    const num1El = document.getElementById('num1');
    const num2El = document.getElementById('num2');
    const opEl = document.getElementById('operator');

    if (table.startsWith('d')) {
        gameState.isDiv = true;
        const div = parseInt(table.substring(1));
        gameState.currentNum2 = div;
        gameState.correctAnswer = Math.floor(Math.random() * 10) + 1;
        gameState.currentNum1 = gameState.correctAnswer * div;
        
        num1El.textContent = gameState.currentNum1;
        num2El.textContent = gameState.currentNum2;
        opEl.textContent = ':';
    } else {
        gameState.isDiv = false;
        const mult = parseInt(table);
        gameState.currentNum1 = Math.floor(Math.random() * 10) + 1;
        gameState.currentNum2 = mult;
        gameState.correctAnswer = gameState.currentNum1 * mult;
        
        num1El.textContent = gameState.currentNum1;
        num2El.textContent = gameState.currentNum2;
        opEl.textContent = '×';
    }

    let options = [gameState.correctAnswer];
    while(options.length < 6) {
        let opt = Math.max(0, gameState.correctAnswer + Math.floor(Math.random() * 11) - 5);
        if(!options.includes(opt)) options.push(opt);
    }
    options.sort(() => Math.random() - 0.5);
    answerBtns.forEach((btn, i) => {
        btn.textContent = options[i];
        btn.className = 'answer-btn';
        btn.disabled = false;
    });
}

function handleAnswer(e) {
    const selected = parseInt(e.target.textContent);
    const isCorrect = selected === gameState.correctAnswer;
    
    answerBtns.forEach(b => b.disabled = true);
    
    if (isCorrect) {
        sounds.correct.currentTime = 0;
        sounds.correct.play().catch(err => console.log(err));
        
        e.target.classList.add('correct');
        gameState.score++;
        scoreDisplay.textContent = gameState.score;
    } else {
        sounds.wrong.currentTime = 0;
        sounds.wrong.play().catch(err => console.log(err));

        e.target.classList.add('wrong');
        const correctDiv = document.getElementById('correctAnswer');
        correctDiv.style.display = 'block';
        const opTxt = gameState.isDiv ? ':' : '×';
        correctDiv.textContent = `${gameState.currentNum1} ${opTxt} ${gameState.currentNum2} = ${gameState.correctAnswer}`;
    }

    gameState.currentQuestion++;
    const delay = isCorrect ? 700 : 2500;

    setTimeout(() => {
        document.getElementById('correctAnswer').style.display = 'none';
        if (gameState.currentQuestion < 25) generateQuestion();
        else endGame();
    }, delay);
}

let timerInt;
function startTimer() {
    if(timerInt) clearInterval(timerInt);
    timerInt = setInterval(() => {
        const sec = Math.floor((Date.now() - gameState.startTime) / 1000);
        document.getElementById('timer').textContent = `${Math.floor(sec/60)}:${(sec%60).toString().padStart(2,'0')}`;
    }, 1000);
}

function endGame() {
    clearInterval(timerInt);
    quizScreen.classList.remove('active');
    endScreen.classList.add('active');
    
    const finalScore = gameState.score;
    document.getElementById('finalScore').textContent = `${finalScore}/25`;
    document.getElementById('finalTime').textContent = document.getElementById('timer').textContent;

    const barbieMsgEl = document.getElementById('barbieMessage');
    if(finalScore >= 20) {
        barbieMsgEl.textContent = gameState.theme === 'blue' ? "Topscoorder! ⚽" : "Wauw, goed gedaan! ✨";
    } else {
        barbieMsgEl.textContent = "Goed gedaan, blijven oefenen! 💪";
    }

    let tekst;
    if(finalScore >= 20) {
        tekst = `Wauw! Jij behaalde een topscore van ${finalScore} op 25! Super gedaan!`;
    } else {
        tekst = `Jij behaalde een score van ${finalScore} op 25. Blijf goed oefenen, je kan het!`;
    }
    
    speak(tekst);
}

function speak(text) {
    const msg = new SpeechSynthesisUtterance();
    msg.text = text;
    msg.lang = 'nl-NL';
    msg.pitch = 1.4; 
    window.speechSynthesis.speak(msg);
}