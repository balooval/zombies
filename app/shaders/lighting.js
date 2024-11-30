
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
uniform sampler2D bgMap;
uniform sampler2D lightMap;
varying vec2 vPos;

void main() {
    vec4 lightColor = texture2D(lightMap, vUv);
    float lightIntensity = lightColor.r + 0.2;
    vec4 bgColor = texture2D(bgMap, vUv);

    vec4 finalColor = vec4(bgColor.r * lightIntensity, bgColor.g * lightIntensity, bgColor.b * lightIntensity, bgColor.a);
    
    gl_FragColor = finalColor;
}

`;
