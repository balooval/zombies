import Evt from './../utils/event.js';
import * as Sound from './../sound.js';

class HomeScreen {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.evt = new Evt();
        this.buttons = {};
        this.build();
    }

    build() {
        this.buttons.start = document.createElement('div');
        this.buttons.start.id = 'start-button';
        this.buttons.start.addEventListener('click', () => this.launchGame());
        this.container.appendChild(this.buttons.start);

        this.buttons.sound = document.createElement('div');
        this.buttons.sound.id = 'sound-button';
        this.buttons.sound.addEventListener('click', () => this.switchSound());
        this.container.appendChild(this.buttons.sound);
    }

    launchGame() {
        this.buttons.start.remove();
        this.buttons.sound.remove();
        this.evt.fireEvent('LAUNCH_GAME')
    }

    switchSound() {
        this.buttons.sound.classList.toggle('off');
        Sound.switchMute();
    }
}

export {HomeScreen as default};