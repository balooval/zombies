
export const vertex = `
attribute vec2 lights;
varying vec2 vUv;
varying vec2 vPos;

void main() {
    vUv = uv;
    vPos = vec4(modelViewMatrix * vec4(position, 1.0)).xy;
    vec4 vertPos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = vertPos;
    }
`;
    
export const fragment = `
varying vec2 vUv;
varying vec2 vPos;
uniform sampler2D map;

void main() {
    vec4 color = texture2D(map, vUv);
    vec4 finalColor = vec4(color.r, color.g, color.b, color.w);
    
    gl_FragColor = finalColor;
}

`;
