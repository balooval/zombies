
export const vertex = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}

`;

export const fragment = `
varying vec2 vUv;
uniform sampler2D map;

void main() {
    vec4 color = texture2D(map, vUv);
    //vec4 color = vec4(vUv.x, vUv.y, 1.0, 1.0);
    gl_FragColor = color;
}

`;
