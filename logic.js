// Speech synthesis setup
const synth = window.speechSynthesis;
let voices = [];

// Load available voices
function loadVoices() {
    voices = synth.getVoices();

    // const voiceSelect = document.getElementById('voice');
    
    // // Clear existing options except the first one
    // voiceSelect.innerHTML = '<option value="">Default Voice</option>';
    
    // voices.forEach((voice, index) => {
    //     const option = document.createElement('option');
    //     option.value = index;
    //     option.textContent = `${voice.name} (${voice.lang})`;
    //     voiceSelect.appendChild(option);
    // });
}

// Load voices on page load and when they change
loadVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

// Game state
const stances = ['low', 'mid', 'high'];
let currentIndex = 0;
let totalTransitions = 0;
let isPaused = false;
let isRunning = false;
let timeoutId = null;
let lastStance = '';

// DOM elements
const transitionEl = document.getElementById('transition');
const counterEl = document.getElementById('counter');
const statusEl = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const numTransitionsInput = document.getElementById('numTransitions');
const delayInput = document.getElementById('delay');
const frostMoonChance = document.getElementById('frost-moon-chance');
//const voiceSelect = document.getElementById('voice');
const rateInput = document.getElementById('rate');

function generateTransition() {
    let from;
    let frostMoon = Math.random() < frostMoonChance.value / 100;

    if(lastStance==''){
        from = stances[Math.floor(Math.random() * stances.length)];
    }else{
        from = lastStance;
    }
    const to = stances[Math.floor(Math.random() * stances.length)];
    lastStance = to;
    return `${from} to ${to}${frostMoon ? ' to frost moon' : ''}`;
}

function speak(text) {
    // Cancel any ongoing speech
    synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set selected voice
    const voiceIndex = '';
    if (voiceIndex !== '') {
        utterance.voice = voices[voiceIndex];
    }
    
    // Set speech rate
    utterance.rate = parseFloat(rateInput.value);
    
    synth.speak(utterance);
}

function updateDisplay(transition) {
    transitionEl.textContent = transition;
    counterEl.textContent = `${currentIndex} / ${totalTransitions}`;
}

function countdown() {
    let count = 3;
    statusEl.textContent = 'Get ready...';
    
    const countInterval = setInterval(() => {
        if (count > 0) {
            transitionEl.textContent = count;
            speak(count.toString());
            count--;
        } else {
            clearInterval(countInterval);
            transitionEl.textContent = 'GO!';
            speak('Go');
            setTimeout(() => {
                runPractice();
            }, 1000);
        }
    }, 1000);
}

function runPractice() {
    if (!isRunning || isPaused) return;

    if (currentIndex >= totalTransitions) {
        endPractice();
        return;
    }

    currentIndex++;
    const transition = generateTransition();
    updateDisplay(transition);
    speak(transition);
    statusEl.textContent = 'Training...';

    const delay = parseFloat(delayInput.value) * 1000;
    timeoutId = setTimeout(runPractice, delay);
}

function startPractice() {
    if (isRunning) return;

    currentIndex = 0;
    totalTransitions = parseInt(numTransitionsInput.value);
    isRunning = true;
    isPaused = false;

    // Update UI
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    stopBtn.classList.remove('hidden');
    numTransitionsInput.disabled = true;
    delayInput.disabled = true;
    //voiceSelect.disabled = true;
    rateInput.disabled = true;

    countdown();
}

function pausePractice() {
    isPaused = !isPaused;
    
    if (isPaused) {
        clearTimeout(timeoutId);
        pauseBtn.textContent = 'Resume';
        statusEl.textContent = 'Paused';
        synth.cancel();
    } else {
        pauseBtn.textContent = 'Pause';
        statusEl.textContent = 'Training...';
        runPractice();
    }
}

function stopPractice() {
    isRunning = false;
    isPaused = false;
    clearTimeout(timeoutId);
    synth.cancel();

    // Reset UI
    transitionEl.textContent = 'Stopped';
    counterEl.textContent = '-';
    statusEl.textContent = 'Press Start to begin';
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    stopBtn.classList.add('hidden');
    pauseBtn.textContent = 'Pause';
    numTransitionsInput.disabled = false;
    delayInput.disabled = false;
    //voiceSelect.disabled = false;
    rateInput.disabled = false;
}

function endPractice() {
    isRunning = false;
    transitionEl.textContent = 'Complete!';
    statusEl.textContent = 'Session finished';
    speak('Session complete');

    setTimeout(() => {
        startBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
        stopBtn.classList.add('hidden');
        pauseBtn.textContent = 'Pause';
        numTransitionsInput.disabled = false;
        delayInput.disabled = false;
        //voiceSelect.disabled = false;
        rateInput.disabled = false;
        transitionEl.textContent = 'Ready';
        counterEl.textContent = '-';
        statusEl.textContent = 'Press Start to begin';
    }, 2000);
}

// Event listeners
startBtn.addEventListener('click', startPractice);
pauseBtn.addEventListener('click', pausePractice);
stopBtn.addEventListener('click', stopPractice);