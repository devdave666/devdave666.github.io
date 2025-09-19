export class SudokuGame {
    constructor() {
        this.grid = Array(9).fill(null).map(() => Array(9).fill(0));
        this.solution = Array(9).fill(null).map(() => Array(9).fill(0));
        this.fixedCells = new Set();
        this.selectedCell = null;
        this.selectedNumber = null;
        this.history = [];
        this.difficulty = 'medium';
        
        this.setupGame();
        this.setupControls();
        this.generatePuzzle();
    }

    setupGame() {
        const grid = document.getElementById('sudoku-grid');
        grid.innerHTML = '';
        
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.selectCell(i));
            grid.appendChild(cell);
        }
    }

    setupControls() {
        // Number pad
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const number = parseInt(e.target.dataset.number);
                if (number === 0) {
                    this.clearSelectedCell();
                } else {
                    this.selectNumber(number);
                }
            });
        });

        // Game controls
        document.querySelector('[data-game="sudoku"].new-game-btn').addEventListener('click', () => this.generatePuzzle());
        document.querySelector('[data-game="sudoku"].hint-btn').addEventListener('click', () => this.showHint());
        document.querySelector('[data-game="sudoku"].undo-btn').addEventListener('click', () => this.undo());
        document.querySelector('[data-game="sudoku"].clear-btn').addEventListener('click', () => this.clearGrid());
        document.querySelector('[data-game="sudoku"].rules-btn').addEventListener('click', () => this.showRules());
    }

    generatePuzzle() {
        // Generate a complete valid Sudoku solution
        this.generateSolution();
        
        // Remove numbers based on difficulty
        const cellsToRemove = {
            easy: 35,
            medium: 45,
            hard: 55
        }[this.difficulty];

        // Copy solution to grid
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.grid[i][j] = this.solution[i][j];
            }
        }

        // Remove random cells
        const positions = [];
        for (let i = 0; i < 81; i++) positions.push(i);
        this.shuffleArray(positions);

        this.fixedCells.clear();
        for (let i = 0; i < cellsToRemove; i++) {
            const pos = positions[i];
            const row = Math.floor(pos / 9);
            const col = pos % 9;
            this.grid[row][col] = 0;
        }

        // Mark remaining cells as fixed
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.grid[i][j] !== 0) {
                    this.fixedCells.add(i * 9 + j);
                }
            }
        }

        this.updateDisplay();
        this.history = [];
    }

    generateSolution() {
        // Reset grid
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.solution[i][j] = 0;
            }
        }

        this.solveSudoku(this.solution);
    }

    solveSudoku(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                    this.shuffleArray(numbers);
                    
                    for (const num of numbers) {
                        if (this.isValidMove(grid, row, col, num)) {
                            grid[row][col] = num;
                            if (this.solveSudoku(grid)) {
                                return true;
                            }
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    isValidMove(grid, row, col, num) {
        // Check row
        for (let j = 0; j < 9; j++) {
            if (grid[row][j] === num) return false;
        }

        // Check column
        for (let i = 0; i < 9; i++) {
            if (grid[i][col] === num) return false;
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (grid[i][j] === num) return false;
            }
        }

        return true;
    }

    selectCell(index) {
        if (this.fixedCells.has(index)) return;

        // Clear previous selection
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('selected');
        });

        // Select new cell
        this.selectedCell = index;
        document.querySelector(`[data-index="${index}"]`).classList.add('selected');

        // If we have a selected number, place it
        if (this.selectedNumber) {
            this.placeNumber(index, this.selectedNumber);
        }
    }

    selectNumber(number) {
        // Clear previous number selection
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Select new number
        this.selectedNumber = number;
        document.querySelector(`[data-number="${number}"]`).classList.add('active');

        // If we have a selected cell, place the number
        if (this.selectedCell !== null) {
            this.placeNumber(this.selectedCell, number);
        }
    }

    placeNumber(index, number) {
        if (this.fixedCells.has(index)) return;

        const row = Math.floor(index / 9);
        const col = index % 9;
        const oldValue = this.grid[row][col];

        // Save for undo
        this.history.push({ index, oldValue, newValue: number });

        // Place number
        this.grid[row][col] = number;
        this.updateCell(index);

        // Check for completion
        this.checkWin();
    }

    clearSelectedCell() {
        if (this.selectedCell !== null && !this.fixedCells.has(this.selectedCell)) {
            const row = Math.floor(this.selectedCell / 9);
            const col = this.selectedCell % 9;
            const oldValue = this.grid[row][col];

            this.history.push({ index: this.selectedCell, oldValue, newValue: 0 });
            this.grid[row][col] = 0;
            this.updateCell(this.selectedCell);
        }
    }

    updateDisplay() {
        for (let i = 0; i < 81; i++) {
            this.updateCell(i);
        }
    }

    updateCell(index) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        const row = Math.floor(index / 9);
        const col = index % 9;
        const value = this.grid[row][col];

        cell.textContent = value === 0 ? '' : value;
        cell.classList.toggle('fixed', this.fixedCells.has(index));
        
        // Check for conflicts
        const isValid = value === 0 || this.isValidMove(this.grid, row, col, value) || 
                       this.grid[row][col] === this.solution[row][col];
        cell.classList.toggle('invalid', !isValid && value !== 0);
    }

    showHint() {
        if (this.selectedCell !== null && !this.fixedCells.has(this.selectedCell)) {
            const row = Math.floor(this.selectedCell / 9);
            const col = this.selectedCell % 9;
            const correctNumber = this.solution[row][col];
            
            this.placeNumber(this.selectedCell, correctNumber);
        }
    }

    undo() {
        if (this.history.length > 0) {
            const move = this.history.pop();
            const row = Math.floor(move.index / 9);
            const col = move.index % 9;
            this.grid[row][col] = move.oldValue;
            this.updateCell(move.index);
        }
    }

    clearGrid() {
        for (let i = 0; i < 81; i++) {
            if (!this.fixedCells.has(i)) {
                const row = Math.floor(i / 9);
                const col = i % 9;
                this.grid[row][col] = 0;
                this.updateCell(i);
            }
        }
        this.history = [];
    }

    checkWin() {
        // Check if grid is complete and valid
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.grid[i][j] === 0 || this.grid[i][j] !== this.solution[i][j]) {
                    return false;
                }
            }
        }

        // Victory!
        setTimeout(() => {
            alert('🎉 Congratulations! You solved the Sudoku puzzle!');
        }, 100);
        return true;
    }

    showRules() {
        const rulesContent = `
            <div class="rules-section">
                <h3>How to Play Sudoku</h3>
                <ul>
                    <li>Fill the 9×9 grid with digits 1-9</li>
                    <li>Each row must contain all digits 1-9</li>
                    <li>Each column must contain all digits 1-9</li>
                    <li>Each 3×3 box must contain all digits 1-9</li>
                    <li>No digit can repeat in any row, column, or box</li>
                </ul>
            </div>
            <div class="rules-section">
                <h3>How to Play</h3>
                <ul>
                    <li>Click a cell to select it</li>
                    <li>Click a number to place it in the selected cell</li>
                    <li>Click the ✖ button to erase a number</li>
                    <li>Invalid numbers will be highlighted in red</li>
                </ul>
            </div>
        `;
        
        document.getElementById('rules-title').textContent = 'Sudoku Rules';
        document.getElementById('rules-content').innerHTML = rulesContent;
        document.getElementById('rules-modal').style.display = 'block';
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}