import { checkRowConstraints, checkColumnConstraints } from './utils.js';

export class PuzzleGenerator {
    constructor(size = 6) {
        this.size = size;
    }

    generatePuzzle() {
        const solution = this.generateValidSolution();
        const puzzle = {
            predefinedCells: [],
            constraints: [],
            solution: solution
        };

        // Add 4-5 predefined cells
        const positions = this.getRandomPositions(4 + Math.floor(Math.random() * 2));
        positions.forEach(([row, col]) => {
            puzzle.predefinedCells.push({
                row, col, value: solution[row][col]
            });
        });

        // Add 5-7 meaningful constraints
        puzzle.constraints = this.generateMeaningfulConstraints(solution);

        return puzzle;
    }

    generateValidSolution() {
        const grid = Array(this.size).fill(null)
            .map(() => Array(this.size).fill(null));
        this.solveGrid(grid);
        return grid;
    }

    solveGrid(grid, row = 0, col = 0) {
        if (col >= this.size) {
            row++;
            col = 0;
        }
        
        if (row >= this.size) {
            return true; // Puzzle is solved
        }

        // Shuffle symbols to randomize solutions
        const symbols = ['☀️', '🌑'].sort(() => Math.random() - 0.5);

        for (const symbol of symbols) {
            if (this.isValidPlacement(grid, row, col, symbol)) {
                grid[row][col] = symbol;
                
                if (this.solveGrid(grid, row, col + 1)) {
                    return true;
                }
                
                grid[row][col] = null;
            }
        }

        return false;
    }

    isValidPlacement(grid, row, col, symbol) {
        // Check row constraints
        const rowCount = grid[row].filter(cell => cell === symbol).length;
        if (rowCount >= this.size / 2) return false;

        // Check column constraints
        const colCount = grid.map(r => r[col]).filter(cell => cell === symbol).length;
        if (colCount >= this.size / 2) return false;

        // Check no more than two consecutive same symbols horizontally
        if (col >= 2 && 
            grid[row][col - 1] === symbol && 
            grid[row][col - 2] === symbol) {
            return false;
        }

        // Check no more than two consecutive same symbols vertically
        if (row >= 2 && 
            grid[row - 1][col] === symbol && 
            grid[row - 2][col] === symbol) {
            return false;
        }

        return true;
    }

    getRandomPositions(count) {
        const positions = [];
        const used = new Set();

        while (positions.length < count) {
            const row = Math.floor(Math.random() * this.size);
            const col = Math.floor(Math.random() * this.size);
            const key = `${row},${col}`;

            if (!used.has(key)) {
                used.add(key);
                positions.push([row, col]);
            }
        }

        return positions;
    }

    generateMeaningfulConstraints(solution) {
        const constraints = [];
        const used = new Set();

        // Look for meaningful patterns in the solution
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size - 1; col++) {
                const key = `${row},${col}-${row},${col + 1}`;
                if (!used.has(key)) {
                    const value1 = solution[row][col];
                    const value2 = solution[row][col + 1];
                    const type = value1 === value2 ? '=' : '×';
                    constraints.push({
                        type,
                        cell1: [row, col],
                        cell2: [row, col + 1]
                    });
                    used.add(key);
                }
            }
        }

        // Shuffle and take 5-7 constraints
        return this.shuffleArray(constraints).slice(0, 5 + Math.floor(Math.random() * 3));
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

const gridSize = 6;

function generateConstraints() {
    const generatedConstraints = [];
    const numConstraints = Math.floor(Math.random() * 4) + 3;
    const usedCoordinates = new Set();

    for (let i = 0; i < numConstraints; i++) {
        let row1, col1, row2, col2, type;
        const isHorizontal = Math.random() < 0.5;

        do {
            if (isHorizontal) {
                row1 = Math.floor(Math.random() * gridSize);
                col1 = Math.floor(Math.random() * (gridSize - 1));
                row2 = row1;
                col2 = col1 + 1;
            } else {
                row1 = Math.floor(Math.random() * (gridSize - 1));
                col1 = Math.floor(Math.random() * gridSize);
                row2 = row1 + 1;
                col2 = col1;
            }
        } while (
            usedCoordinates.has(`${row1},${col1}`) || 
            usedCoordinates.has(`${row2},${col2}`)
        );

        usedCoordinates.add(`${row1},${col1}`);
        usedCoordinates.add(`${row2},${col2}`);

        type = Math.random() < 0.5 ? '=' : '×';
        generatedConstraints.push({ row1, col1, row2, col2, type });
    }
    return generatedConstraints;
}

function generatePuzzle() {
    const maxAttempts = 100;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const gameGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
        const constraints = generateConstraints();
        
        const numberOfPreFilledCells = Math.floor(Math.random() * 6) + 3;
        for (let i = 0; i < numberOfPreFilledCells; i++) {
            let row, col;
            do {
                row = Math.floor(Math.random() * gridSize);
                col = Math.floor(Math.random() * gridSize);
            } while (gameGrid[row][col] != null);
            
            gameGrid[row][col] = Math.random() < 0.5 ? '☀️' : '🌙';
        }

        if (backtrackSolve(gameGrid, constraints)) {
            return { gameGrid, constraints };
        }
    }
    return null;
}

function backtrackSolve(gameGrid, constraints, row = 0, col = 0) {
    if (row === gridSize) {
        return true;
    }

    const nextCol = col + 1 === gridSize ? 0 : col + 1;
    const nextRow = col + 1 === gridSize ? row + 1 : row;

    if (gameGrid[row][col] !== null) {
        return backtrackSolve(gameGrid, constraints, nextRow, nextCol);
    }

    for (const symbol of ['☀️', '🌙']) {
        gameGrid[row][col] = symbol;
        
        if (isValidState(gameGrid, constraints, row, col) && backtrackSolve(gameGrid, constraints, nextRow, nextCol)) {
            return true;
        }
        
        gameGrid[row][col] = null;
    }

    return false;
}

function isValidState(gameGrid, constraints, row, col) {
    return (
        isValidRowConstraints(gameGrid, row) &&
        isValidColumnConstraints(gameGrid, col) &&
        checkAdjacentSymbols(gameGrid, row, col) &&
        checkConstraints(gameGrid, constraints, row, col)
    );
}

function isValidRowConstraints(gameGrid, row) {
    const rowData = gameGrid[row].filter(cell => cell !== null);
    const sunCount = rowData.filter(cell => cell === '☀️').length;
    const moonCount = rowData.filter(cell => cell === '🌙').length;
    return sunCount <= gridSize / 2 && moonCount <= gridSize / 2;
}

function isValidColumnConstraints(gameGrid, col) {
    const colData = gameGrid.map(row => row[col]).filter(cell => cell !== null);
    const sunCount = colData.filter(cell => cell === '☀️').length;
    const moonCount = colData.filter(cell => cell === '🌙').length;
    return sunCount <= gridSize / 2 && moonCount <= gridSize / 2;
}

function checkAdjacentSymbols(gameGrid, row, col) {
    // Check horizontal consecutive symbols
    for (let c = 0; c < gridSize - 2; c++) {
        if (gameGrid[row][c] !== null &&
            gameGrid[row][c] === gameGrid[row][c + 1] &&
            gameGrid[row][c] === gameGrid[row][c + 2]) {
            return false;
        }
    }

    // Check vertical consecutive symbols
    for (let r = 0; r < gridSize - 2; r++) {
        if (gameGrid[r][col] !== null &&
            gameGrid[r][col] === gameGrid[r + 1][col] &&
            gameGrid[r][col] === gameGrid[r + 2][col]) {
            return false;
        }
    }

    return true;
}

function checkConstraints(gameGrid, constraints, row, col) {
    for (const constraint of constraints) {
        if (
            (constraint.row1 === row && constraint.col1 === col) || 
            (constraint.row2 === row && constraint.col2 === col)
        ) {
            const cell1 = gameGrid[constraint.row1][constraint.col1];
            const cell2 = gameGrid[constraint.row2][constraint.col2];

            if (cell1 !== null && cell2 !== null) {
                if (constraint.type === '=' && cell1 !== cell2) return false;
                if (constraint.type === '×' && cell1 === cell2) return false;
            }
        }
    }
    return true;
}

function generateDailyPuzzle() {
    const puzzle = generatePuzzle();
    if (puzzle) {
        // Save the puzzle for daily use (e.g., in local storage or a database)
        return puzzle;
    }
    return null;
}