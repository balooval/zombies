
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
uniform sampler2D fluxMap;
uniform vec2 emiterPos;
uniform float time;
uniform float rand;
varying vec2 vPos;

void main() {
    float dist = distance(gl_FragCoord.xy, emiterPos);

    vec2 nextUv = vec2(vUv.x, vUv.y);
    vec4 fluxColor = texture2D(fluxMap, vUv);

    
    vec4 currentColor = texture2D(fogMap, vUv);
    float fogValue = currentColor.r;

    float distMax = 1.0 * (1.0 + (1.0 + (sin(time * 0.4))) * 0.5);
    
    if (dist < 15.0) {
        // fogValue += 1.0;
        // fogValue += (1.0 + (sin(time * 0.1)));
    }
        
    if (gl_FragCoord.x > 60.0 && gl_FragCoord.x < 100.0 && abs(gl_FragCoord.y - emiterPos.y) < 2.0) {
        fogValue += 1.0;
    }

    float nextOffset = 0.005;
    float horOffset = (fluxColor.r - 0.5) * 2.0;
    float vertOffset = (fluxColor.g - 0.5) * 2.0 + 0.5;

    float translationFactor = 3.0;
    
    float leftFactor = max(1.0, horOffset * translationFactor);
    float rightFactor = max(1.0, horOffset * -translationFactor);

    float bottomFactor = max(1.0, vertOffset * translationFactor);
    float topFactor = max(1.0, vertOffset * -translationFactor);
    // bottomFactor = 1.0;
    // topFactor = 1.0;

    float curFactor = (leftFactor + rightFactor + topFactor + bottomFactor) * 1.00;


    float factor = 14.0 * 0.016;

    vec4 left = texture2D(fogMap, vec2(vUv.x - nextOffset, vUv.y)) * leftFactor;
    vec4 right = texture2D(fogMap, vec2(vUv.x + nextOffset, vUv.y)) * rightFactor;
    vec4 bottom = texture2D(fogMap, vec2(vUv.x, vUv.y - nextOffset)) * bottomFactor;
    vec4 top = texture2D(fogMap, vec2(vUv.x, vUv.y + nextOffset)) * topFactor;

    
    fogValue += (left.r + right.r + bottom.r + top.r - (currentColor.r * curFactor)) * factor;

    float minimum = 0.003;
    if (fogValue >= -minimum && factor < 0.0) fogValue = -minimum;

    fogValue *= 1.0 - fluxColor.b;

    // fogValue *= 0.99;

    vec4 finalColor = vec4(fogValue, fogValue, fogValue, 1.0);
    
    gl_FragColor += finalColor;
    
    // gl_FragColor = fluxColor;
}

`;
