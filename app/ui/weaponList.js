import * as TextureLoader from '../net/loaderTexture.js';

const containerId = 'weapon-container';

let points = 0;
let animationTimeoutId;
let pointContainer;

export function setActive(weapon) {
    const icons = document.getElementsByClassName('weaponIcon');
    [...icons].forEach(element => element.classList.remove('selected'));
    const weaponName = weapon.constructor.name;
    document.getElementById(`weapon-${weaponName}`).classList.add('selected');
}

export function removeWeapon(weapon) {
    const weaponName = weapon.constructor.name;
    document.getElementById(`weapon-${weaponName}`).remove();
}

export function updateWeaponAmmo(weapon) {
    const weaponName = weapon.constructor.name;
    document.getElementById(`ammo-${weaponName}`).innerHTML = weapon.ammo;
}

export function addWeapon(weapon) {
    const weaponImage = TextureLoader.get(weapon.icon).image;
    const weaponName = weapon.constructor.name;
    getContainer().innerHTML += `<div class="weaponIcon" id="weapon-${weaponName}">
        <img src="${weaponImage.src}">
        <div id="ammo-${weaponName}">${weapon.ammo}</div>
    </div>`;
}

export function setPoints(newPoints) {
    points = newPoints;
    getContainer().innerHTML = points + '';
    getContainer().classList.add('changed');
    
    clearTimeout(animationTimeoutId);
    animationTimeoutId = setTimeout(removeChangedClass, 200);
}

function removeChangedClass() {
    getContainer().classList.remove('changed');
}

function getContainer() {
    if (!pointContainer) {
        pointContainer = document.getElementById(containerId);
    }
    return pointContainer;
}