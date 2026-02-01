let gameState = {
    selectedTables: [],
    currentQuestion: 0,
    score: 0,
    startTime: 0,
    currentNum1: 0,
    currentNum2: 0,
    correctAnswer: 0,
    isDiv: false,
    theme: 'pink',
    wrongAnswers: [],
    isRetryMode: false
};

const sounds = {
    correct: new Audio('correct.wav'),
    wrong: new Audio('wrong.wav')
};

const themeScreen = document.getElementById('themeScreen');
const selectScreen = document.getElementById('selectScreen');
const quizScreen = document.getElementById('quizScreen');
const endScreen = document.getElementById('endScreen');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const retryBtn = document.getElementById('retryBtn');
const backToTheme = document.getElementById('backToTheme');
const checkboxes = document.querySelectorAll('.checkbox-item input');
const answerBtns = document.querySelectorAll('.answer-btn');
const progressBar = document.getElementById('progressBar');
const themeEmoji = document.getElementById('themeEmoji');
const scoreDisplay = document.getElementById('score');

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

startBtn.addEventListener('click', () => {
    gameState.wrongAnswers = [];
    gameState.isRetryMode = false;
    startGame();
});

retryBtn.addEventListener('click', () => {
    gameState.isRetryMode = true;
    startGame();
});

restartBtn.addEventListener('click', () => {
    endScreen.classList.remove('active');
    themeScreen.classList.add('active');
});

answerBtns.forEach(btn => btn.addEventListener('click', handleAnswer));

function startGame() {
    gameState.selectedTables = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
    if (!gameState.isRetryMode && gameState.selectedTables.length === 0) return alert('Kies een tafel!');
    
    sounds.correct.load();
    sounds.wrong.load();

    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.startTime = Date.now();
    scoreDisplay.textContent = '0';
    
    selectScreen.classList.remove('active');
    endScreen.classList.remove('active');
    quizScreen.classList.add('active');
    
    generateQuestion();
    startTimer();
}

function generateQuestion() {
    const totalQuestions = gameState.isRetryMode ? gameState.wrongAnswers.length : 25;
    const progress = (gameState.currentQuestion / totalQuestions) * 100;
    progressBar.style.width = progress + '%';

    const num1El = document.getElementById('num1');
    const num2El = document.getElementById('num2');
    const opEl = document.getElementById('operator');

    if (gameState.isRetryMode) {
        const q = gameState.wrongAnswers[gameState.currentQuestion];
        gameState.currentNum1 = q.n1;
        gameState.currentNum2 = q.n2;
        gameState.correctAnswer = q.ans;
        gameState.isDiv = q.isDiv;
    } else {
        const table = gameState.selectedTables[Math.floor(Math.random() * gameState.selectedTables.length)];
        if (table.startsWith('d')) {
            gameState.isDiv = true;
            const div = parseInt(table.substring(1));
            gameState.currentNum2 = div;
            gameState.correctAnswer = Math.floor(Math.random() * 10) + 1;
            gameState.currentNum1 = gameState.correctAnswer * div;
        } else {
            gameState.isDiv = false;
            const mult = parseInt(table);
            gameState.currentNum1 = Math.floor(Math.random() * 10) + 1;
            gameState.currentNum2 = mult;
            gameState.correctAnswer = gameState.currentNum1 * mult;
        }
    }

    num1El.textContent = gameState.currentNum1;
    num2El.textContent = gameState.currentNum2;
    opEl.textContent = gameState.isDiv ? ':' : '×';

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
    const totalQuestions = gameState.isRetryMode ? gameState.wrongAnswers.length : 25;
    
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
        
        if (!gameState.isRetryMode) {
            gameState.wrongAnswers.push({
                n1: gameState.currentNum1,
                n2: gameState.currentNum2,
                ans: gameState.correctAnswer,
                isDiv: gameState.isDiv
            });
        }

        e.target.classList.add('wrong');
        const correctDiv = document.getElementById('correctAnswer');
        correctDiv.style.display = 'block';
        const opTxt = gameState.isDiv ? ':' : '×';
        correctDiv.textContent = `${gameState.currentNum1} ${opTxt} ${gameState.currentNum2} = ${gameState.correctAnswer}`;
    }

    gameState.currentQuestion++;
    const delay = isCorrect ? 700 : 3500;

    setTimeout(() => {
        document.getElementById('correctAnswer').style.display = 'none';
        if (gameState.currentQuestion < totalQuestions) generateQuestion();
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
    
    const totalPossible = gameState.isRetryMode ? gameState.wrongAnswers.length : 25;
    document.getElementById('finalScore').textContent = `${gameState.score}/${totalPossible}`;
    document.getElementById('finalTime').textContent = document.getElementById('timer').textContent;

    if (gameState.wrongAnswers.length > 0 && !gameState.isRetryMode) {
        retryBtn.style.display = 'block';
    } else {
        retryBtn.style.display = 'none';
    }

    const barbieMsgEl = document.getElementById('barbieMessage');
    if(gameState.score >= (totalPossible * 0.8)) {
        barbieMsgEl.textContent = gameState.theme === 'blue' ? "Topscoorder! ⚽" : "Wauw, goed gedaan! ✨";
    } else {
        barbieMsgEl.textContent = "Goed gedaan, blijven oefenen! 💪";
    }

    let tekst = `Jij behaalde een score van ${gameState.score} op ${totalPossible}.`;
    if(gameState.score >= (totalPossible * 0.8)) tekst += " Super gedaan!";
    else tekst += " Blijf goed oefenen!";
    
    speak(tekst);
}

function speak(text) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'nl-NL';
    msg.pitch = 1.4; 
    window.speechSynthesis.speak(msg);
}