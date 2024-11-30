
export const vertex = `
attribute vec2 lights;
varying vec2 vUv;
varying vec2 vLights;
varying vec2 vPos;

void main() {
    vUv = uv;
    vPos = vec4(modelViewMatrix * vec4(position, 1.0)).xy;
    vLights = lights;
    vec4 vertPos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = vertPos;
    }
`;
    
export const fragment = `
varying vec2 vUv;
varying vec2 vLights;
varying vec2 vPos;
uniform sampler2D map;

void main() {

    float dist = distance(vLights, vPos);
    float localLight = max(0.0, 1.0 - (dist / 30.0));
    
    // float luminosity += localLight;

    vec4 color = texture2D(map, vUv);
    // vec4 finalColor = vec4(color.r, color.g, color.b, color.w);
    vec4 finalColor = vec4(localLight, 0.0, 0.0, 1.0);
    
    gl_FragColor = finalColor;
}

`;
