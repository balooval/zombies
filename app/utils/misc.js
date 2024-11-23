
export function randomElement(collection) {
    const index = Math.floor(Math.random() * collection.length);
    return collection[index];
}

export function randomValue(minValue, maxValue) {
    const gap = maxValue - minValue;
    return minValue + Math.round(Math.random() * gap);
}