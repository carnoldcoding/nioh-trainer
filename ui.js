// DOM Elements
const cogElement = document.querySelector('ion-icon[name="cog"]');
const closeElement = document.querySelector('ion-icon[name="close"]')
const modal = document.querySelector('.modal');

// State
class ModalState {
    constructor(element) {
        this._isOpen = false;
        this._element = element;
    }

    get isOpen() {
        return this._isOpen;
    }

    set isOpen(flag) {
        this._isOpen = Boolean(flag);
    }
}

// Initialize State
const settingsModal = new ModalState(modal);

// Event Listeners
cogElement.addEventListener('click', ()=>{
    settingsModal._element.style.display = settingsModal._isOpen ? "none" : "block"; 
    settingsModal._isOpen = !settingsModal._isOpen;
})

closeElement.addEventListener('click', () => {
    settingsModal._element.style.display = settingsModal._isOpen ? "none" : "block"; 
    settingsModal._isOpen = !settingsModal._isOpen;
})