
export const vertex = `
varying vec2 vUv;

void main() {
    vUv = uv;
    vec4 vertPos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = vertPos;
}
`;
    
export const fragment = `
varying vec2 vUv;
uniform sampler2D fogMap;
varying vec2 vPos;

void main() {
    vec2 nextUv = vec2(vUv.x, vUv.y);
    vec4 fogColor = texture2D(fogMap, vUv);
    float fogValue = 0.0;

    float factor = 0.20;

    fogValue += fogColor.r * factor;
    
    nextUv.x = vUv.x + 0.001;
    fogColor = texture2D(fogMap, nextUv);
    fogValue += fogColor.r * factor;
    
    nextUv.x = vUv.x - 0.001;
    fogColor = texture2D(fogMap, nextUv);
    fogValue += fogColor.r * factor;

    nextUv.x = vUv.x;
    nextUv.y = vUv.y - 0.001;
    fogColor = texture2D(fogMap, nextUv);
    fogValue += fogColor.r * factor;

    nextUv.y = vUv.y + 0.001;
    fogColor = texture2D(fogMap, nextUv);
    fogValue += fogColor.r * factor;

    vec4 finalColor = vec4(fogValue, fogValue, fogValue, 1.0);
    
    gl_FragColor = finalColor;
}

`;
