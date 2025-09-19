import { checkRowConstraints, checkColumnConstraints } from './utils.js';

export class PuzzleGenerator {
    constructor(size = 6) {
        this.size = size;
    }

    generatePuzzle(difficulty = 'medium') {
        let attempt = 0;
        
        while (true) {
            attempt++;
            const solution = this.generateValidSolution();
            const puzzle = this.createUniquePuzzle(solution, difficulty);
            
            if (puzzle && this.hasUniqueSolution(puzzle)) {
                console.log(`Generated unique puzzle on attempt ${attempt}`);
                return puzzle;
            }
            
            // Log progress every 10 attempts
            if (attempt % 10 === 0) {
                console.log(`Still searching for unique puzzle... attempt ${attempt}`);
            }
            
            // If we're taking too long, try with more constraints/cells
            if (attempt > 50) {
                console.log('Switching to more conservative generation parameters');
                return this.generateConservativePuzzle(difficulty);
            }
        }
    }

    generateConservativePuzzle(difficulty) {
        // More aggressive parameters to guarantee uniqueness
        const conservativeSettings = {
            easy: { minCells: 12, maxCells: 16, minConstraints: 8, maxConstraints: 12 },
            medium: { minCells: 10, maxCells: 14, minConstraints: 10, maxConstraints: 14 },
            hard: { minCells: 8, maxCells: 12, minConstraints: 12, maxConstraints: 16 }
        };

        let attempt = 0;
        while (true) {
            attempt++;
            const solution = this.generateValidSolution();
            const puzzle = this.createUniquePuzzleWithSettings(solution, conservativeSettings[difficulty] || conservativeSettings.medium);
            
            if (puzzle && this.hasUniqueSolution(puzzle)) {
                console.log(`Generated conservative unique puzzle on attempt ${attempt}`);
                return puzzle;
            }
            
            if (attempt % 5 === 0) {
                console.log(`Conservative generation attempt ${attempt}`);
            }
        }
    }

    createUniquePuzzleWithSettings(solution, settings) {
        const puzzle = {
            predefinedCells: [],
            constraints: [],
            solution: solution
        };

        // Use provided settings
        const cellCount = settings.minCells + Math.floor(Math.random() * (settings.maxCells - settings.minCells + 1));
        const positions = this.getRandomPositions(cellCount);
        positions.forEach(([row, col]) => {
            puzzle.predefinedCells.push({
                row, col, value: solution[row][col]
            });
        });

        // Add constraints that help ensure uniqueness
        const constraintCount = settings.minConstraints + Math.floor(Math.random() * (settings.maxConstraints - settings.minConstraints + 1));
        puzzle.constraints = this.generateConstraintsForUniqueness(solution, constraintCount);

        return puzzle;
    }

    createUniquePuzzle(solution, difficulty) {
        const puzzle = {
            predefinedCells: [],
            constraints: [],
            solution: solution
        };

        // Difficulty-based parameters - more conservative for uniqueness
        const difficultySettings = {
            easy: { minCells: 8, maxCells: 12, minConstraints: 4, maxConstraints: 6 },
            medium: { minCells: 6, maxCells: 10, minConstraints: 6, maxConstraints: 8 },
            hard: { minCells: 4, maxCells: 8, minConstraints: 8, maxConstraints: 10 }
        };

        const settings = difficultySettings[difficulty] || difficultySettings.medium;

        // Start with more cells and constraints to ensure uniqueness
        const cellCount = settings.minCells + Math.floor(Math.random() * (settings.maxCells - settings.minCells + 1));
        const positions = this.getRandomPositions(cellCount);
        positions.forEach(([row, col]) => {
            puzzle.predefinedCells.push({
                row, col, value: solution[row][col]
            });
        });

        // Add constraints that help ensure uniqueness
        const constraintCount = settings.minConstraints + Math.floor(Math.random() * (settings.maxConstraints - settings.minConstraints + 1));
        puzzle.constraints = this.generateConstraintsForUniqueness(solution, constraintCount);

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

    generateConstraintsForUniqueness(solution, targetCount = 6) {
        const constraints = [];
        const used = new Set();

        // Generate all possible constraints
        const allConstraints = [];

        // Horizontal constraints
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size - 1; col++) {
                const value1 = solution[row][col];
                const value2 = solution[row][col + 1];
                const type = value1 === value2 ? '=' : '×';
                allConstraints.push({
                    type,
                    cell1: [row, col],
                    cell2: [row, col + 1],
                    priority: this.calculateConstraintPriority(solution, row, col, row, col + 1, type)
                });
            }
        }

        // Vertical constraints
        for (let row = 0; row < this.size - 1; row++) {
            for (let col = 0; col < this.size; col++) {
                const value1 = solution[row][col];
                const value2 = solution[row + 1][col];
                const type = value1 === value2 ? '=' : '×';
                allConstraints.push({
                    type,
                    cell1: [row, col],
                    cell2: [row + 1, col],
                    priority: this.calculateConstraintPriority(solution, row, col, row + 1, col, type)
                });
            }
        }

        // Sort by priority (higher priority constraints are more likely to ensure uniqueness)
        allConstraints.sort((a, b) => b.priority - a.priority);

        // Take the top constraints
        return allConstraints.slice(0, targetCount).map(c => ({
            type: c.type,
            cell1: c.cell1,
            cell2: c.cell2
        }));
    }

    calculateConstraintPriority(solution, r1, c1, r2, c2, type) {
        // Higher priority for constraints that:
        // 1. Are in areas with fewer predefined cells nearby
        // 2. Help break symmetries
        // 3. Are '=' constraints (they're more restrictive)
        
        let priority = Math.random() * 10; // Base randomness
        
        if (type === '=') priority += 5; // Equality constraints are more restrictive
        
        // Prefer constraints in the center of the grid
        const centerDistance = Math.abs(r1 - this.size/2) + Math.abs(c1 - this.size/2) + 
                              Math.abs(r2 - this.size/2) + Math.abs(c2 - this.size/2);
        priority += (this.size * 2 - centerDistance) * 0.5;
        
        return priority;
    }

    hasUniqueSolution(puzzle) {
        // Create a grid with only the predefined cells
        const testGrid = Array(this.size).fill(null)
            .map(() => Array(this.size).fill(null));
        
        // Fill in predefined cells
        puzzle.predefinedCells.forEach(({row, col, value}) => {
            testGrid[row][col] = value;
        });

        // Count how many solutions exist
        const solutionCount = this.countSolutions(testGrid, puzzle.constraints, 0, 0, 0, 2);
        console.log(`Puzzle has ${solutionCount} solution(s)`);
        return solutionCount === 1;
    }

    countSolutions(grid, constraints, row, col, count, maxCount) {
        // Early termination if we've found more than one solution
        if (count >= maxCount) return count;
        
        if (col >= this.size) {
            row++;
            col = 0;
        }
        
        if (row >= this.size) {
            return count + 1; // Found a complete solution
        }

        // If cell is already filled, move to next
        if (grid[row][col] !== null) {
            return this.countSolutions(grid, constraints, row, col + 1, count, maxCount);
        }

        let totalCount = count;
        const symbols = ['☀️', '🌑'];

        for (const symbol of symbols) {
            if (this.isValidPlacementWithConstraints(grid, constraints, row, col, symbol)) {
                grid[row][col] = symbol;
                totalCount = this.countSolutions(grid, constraints, row, col + 1, totalCount, maxCount);
                grid[row][col] = null;
                
                // Early termination
                if (totalCount >= maxCount) break;
            }
        }

        return totalCount;
    }

    isValidPlacementWithConstraints(grid, constraints, row, col, symbol) {
        // First check basic placement rules
        if (!this.isValidPlacement(grid, row, col, symbol)) {
            return false;
        }

        // Then check constraints
        for (const constraint of constraints) {
            const [r1, c1] = constraint.cell1;
            const [r2, c2] = constraint.cell2;
            
            // If this placement affects a constraint
            if ((row === r1 && col === c1) || (row === r2 && col === c2)) {
                const val1 = (row === r1 && col === c1) ? symbol : grid[r1][c1];
                const val2 = (row === r2 && col === c2) ? symbol : grid[r2][c2];
                
                // If both cells are filled, check constraint
                if (val1 !== null && val2 !== null) {
                    if (constraint.type === '=' && val1 !== val2) return false;
                    if (constraint.type === '×' && val1 === val2) return false;
                }
            }
        }

        return true;
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
            
            gameGrid[row][col] = Math.random() < 0.5 ? '☀️' : '🌑';
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

    for (const symbol of ['☀️', '🌑']) {
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
    const moonCount = rowData.filter(cell => cell === '🌑').length;
    return sunCount <= gridSize / 2 && moonCount <= gridSize / 2;
}

function isValidColumnConstraints(gameGrid, col) {
    const colData = gameGrid.map(row => row[col]).filter(cell => cell !== null);
    const sunCount = colData.filter(cell => cell === '☀️').length;
    const moonCount = colData.filter(cell => cell === '🌑').length;
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