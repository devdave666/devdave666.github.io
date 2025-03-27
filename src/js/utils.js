function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = getRandomInt(0, i);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function cloneArray(array) {
    return array.map(item => Array.isArray(item) ? cloneArray(item) : item);
}

function isArrayEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

export const checkRowConstraints = (grid, row) => {
    const rowValues = grid[row].filter(cell => cell !== null);
    const sunCount = rowValues.filter(v => v === '☀️').length;
    const moonCount = rowValues.filter(v => v === '🌑').length;
    
    return {
        isValid: sunCount === moonCount,
        consecutive: !rowValues.join('').includes('☀️☀️☀️') && !rowValues.join('').includes('🌑🌑🌑')
    };
};

export const checkColumnConstraints = (grid, col) => {
    const colValues = grid.map(row => row[col]).filter(cell => cell !== null);
    const sunCount = colValues.filter(v => v === '☀️').length;
    const moonCount = colValues.filter(v => v === '🌑').length;
    
    return {
        isValid: sunCount === moonCount,
        consecutive: !colValues.join('').includes('☀️☀️☀️') && !colValues.join('').includes('🌑🌑🌑')
    };
};

export { getRandomInt, shuffleArray, cloneArray, isArrayEqual };