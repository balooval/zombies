
export const vertex = `
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
uniform sampler2D map;
uniform vec2 lightPosition;
uniform vec2 lights[ 2 ];
varying vec2 vPos;

void main() {
    vec2 ligthPos = vec2(0.0, 0.0);
    
    float luminosity = 0.2;
    
    for (int v = 0; v < 2; v++) {
        float dist = distance(lights[v], vPos);
        float localLight = max(0.0, 1.0 - (dist / 50.0));
        
        luminosity += localLight;
    }
    
    // float dist = distance(lightPosition, vPos);
    // vec4 color = texture2D(map, vUv);
    
    // float luminosity = 1.0 - (dist / 80.0);
        
    vec4 color = texture2D(map, vUv);
    vec4 finalColor = vec4(color.x * luminosity, color.y * luminosity, color.z * luminosity, color.w);
    
    gl_FragColor = finalColor;
}

`;
