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
const attacks = ['light', 'heavy']
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
const skillChance = document.getElementById('skill-chance');
//const voiceSelect = document.getElementById('voice');
const rateInput = document.getElementById('rate');

function generateTransition() {
    /*
    * Goal is to have variable training
    * Low light -> low skill -> high heavy -> mid light -> frost moon
    * Frost moons can END an expression, but aren't to be used in the middle
    * Skills can be at any point in the expression
    */
    let from, to, frostMoon;
    let commands = [];
    let expression = ``;
    frostMoon = Math.random() < frostMoonChance.value / 100;
    const calcSkill = () => Math.random() < skillChance.value / 100;

    // Initial state, there's no previous stance to choose from so it must be generated
    from = lastStance;
    if(lastStance === '') from = stances[Math.floor(Math.random() * stances.length)];

    if(calcSkill()){
        commands.push(`${from} skill`);
    }else{
        commands.push(from)
    }
    
    // Stance that the user must switch into
    to = stances[Math.floor(Math.random() * stances.length)];

    if(calcSkill()){
        commands.push(`${to} skill`);
    }else{
        commands.push(to)
    }

    // Frost Moon Modifier, can only be used at the end of a sequence
    if(frostMoon){
        commands.push('frost moon');
    }
    lastStance = to;

    commands.forEach((command, index) => {
        expression += String(command);
        if(index != commands.length - 1){
            expression += ' to '
        }    
    })
    return expression; 
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