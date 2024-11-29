import * as Renderer from '../renderer.js';

const elementId = 'interactiv-popup';
const element = document.getElementById(elementId);

export function display() {
    element.classList.remove('hidden');
}

export function hide() {
    element.classList.add('hidden');
}

export function place(x, y) {
    const localX = Renderer.toLocalX(x);
    const localY = Renderer.toLocalY(y);
    element.style.left = `${localX}px`;
    element.style.top = `${localY}px`;
}