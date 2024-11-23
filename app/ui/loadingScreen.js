
let loadingBloc;
let container;

export function display(containerId) {
    container = document.getElementById(containerId);
    loadingBloc = document.createElement('div');
    loadingBloc.id = 'loading-bloc';
    container.appendChild(loadingBloc);
}

export function hide() {
    loadingBloc.remove();
}