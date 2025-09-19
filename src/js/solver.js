import { checkRowConstraints, checkColumnConstraints } from './utils.js';

export class PuzzleSolver {
    constructor(grid) {
        this.grid = grid;
        this.size = grid.length;
    }

    solve() {
        // Solver implementation will go here
        return false;
    }
}

function backtrackSolve(grid, row = 0, col = 0) {
    const gridSize = grid.length;
    if (row === gridSize) {
        return true;
    }

    const nextCol = col + 1 === gridSize ? 0 : col + 1;
    const nextRow = col + 1 === gridSize ? row + 1 : row;

    if (grid[row][col] !== null) {
        return backtrackSolve(grid, nextRow, nextCol);
    }

    for (const symbol of ['☀️', '🌑']) {
        grid[row][col] = symbol;

        if (isValidState(grid, row, col) && backtrackSolve(grid, nextRow, nextCol)) {
            return true;
        }

        grid[row][col] = null;
    }

    return false;
}

function isValidState(grid, row, col) {
    return (
        isValidRowConstraints(grid, row) &&
        isValidColumnConstraints(grid, col) &&
        checkAdjacentSymbols(grid, row, col) &&
        checkConstraints(grid, row, col)
    );
}

function isValidRowConstraints(grid, row) {
    const rowData = grid[row].filter(cell => cell !== null);
    const sunCount = rowData.filter(cell => cell === '☀️').length;
    const moonCount = rowData.filter(cell => cell === '🌑').length;
    return sunCount <= grid.length / 2 && moonCount <= grid.length / 2;
}

function isValidColumnConstraints(grid, col) {
    const colData = grid.map(row => row[col]).filter(cell => cell !== null);
    const sunCount = colData.filter(cell => cell === '☀️').length;
    const moonCount = colData.filter(cell => cell === '🌑').length;
    return sunCount <= grid.length / 2 && moonCount <= grid.length / 2;
}

function checkAdjacentSymbols(grid, row, col) {
    const gridSize = grid.length;

    // Check horizontal consecutive symbols
    for (let c = 0; c < gridSize - 2; c++) {
        if (grid[row][c] !== null &&
            grid[row][c] === grid[row][c + 1] &&
            grid[row][c] === grid[row][c + 2]) {
            return false;
        }
    }

    // Check vertical consecutive symbols
    for (let r = 0; r < gridSize - 2; r++) {
        if (grid[r][col] !== null &&
            grid[r][col] === grid[r + 1][col] &&
            grid[r][col] === grid[r + 2][col]) {
            return false;
        }
    }

    return true;
}

function checkConstraints(grid, row, col, constraints) {
    for (const constraint of constraints) {
        if (
            (constraint.row1 === row && constraint.col1 === col) || 
            (constraint.row2 === row && constraint.col2 === col)
        ) {
            const cell1 = grid[constraint.row1][constraint.col1];
            const cell2 = grid[constraint.row2][constraint.col2];

            if (cell1 !== null && cell2 !== null) {
                if (constraint.type === '=' && cell1 !== cell2) return false;
                if (constraint.type === 'x' && cell1 === cell2) return false;
            }
        }
    }
    return true;
}

function solvePuzzle(grid, constraints) {
    if (backtrackSolve(grid)) {
        return grid;
    }
    return null;
}