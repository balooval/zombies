
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
uniform sampler2D fogMap;
varying vec2 vPos;

void main() {
    vec4 lightColor = 0.0 + texture2D(lightMap, vUv) * 1.2;
    // vec4 lightColor = vec4(1.0);
    vec4 fogColor = texture2D(fogMap, vUv);
    vec4 bgColor = texture2D(bgMap, vUv);

    vec4 finalColor = vec4(bgColor.r, bgColor.g, bgColor.b, bgColor.a);
    finalColor.rgb += fogColor.rgb * 1.0;
    finalColor.rgb *= lightColor.rgb;
    
    gl_FragColor = finalColor;
}

`;
