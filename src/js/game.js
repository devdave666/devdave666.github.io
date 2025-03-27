import { PuzzleGenerator } from './generator.js';

class TangoGame {
    constructor() {
        this.gridSize = 6;
        this.grid = Array(this.gridSize).fill(null)
            .map(() => Array(this.gridSize).fill(null));
        this.history = [];
        this.fixedCells = new Set();
        this.constraints = [];
        this.generator = new PuzzleGenerator(this.gridSize);
        this.solution = null;
        this.startTime = null;
        this.timerInterval = null;
        this.setupGame();
        this.setupAllControls();
        this.initializePuzzle();
        this.initTimer();
    }

    initTimer() {
        this.startTime = new Date();
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        this.updateTimer();
    }

    updateTimer() {
        const now = new Date();
        const diff = Math.floor((now - this.startTime) / 1000);
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        const timerDisplay = document.getElementById('timer');
        if (timerDisplay) {
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    initializePuzzle() {
        const puzzle = this.generator.generatePuzzle();
        this.solution = puzzle.solution;
        
        // Clear existing grid
        this.grid = Array(this.gridSize).fill(null)
            .map(() => Array(this.gridSize).fill(null));
        this.fixedCells.clear();
        
        // Set initial cells
        puzzle.predefinedCells.forEach(({row, col, value}) => {
            this.grid[row][col] = value;
            this.fixedCells.add(`${row},${col}`);
        });

        // Set constraints
        this.constraints = puzzle.constraints;
        this.setupGame(); // Rebuild grid with new constraints
        this.initTimer(); // Reset timer for new game
    }

    setupGame() {
        const gameGrid = document.getElementById('game-grid');
        if (!gameGrid) return;
        
        gameGrid.innerHTML = '';
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const cellContainer = document.createElement('div');
                cellContainer.className = 'cell-container';

                const cell = document.createElement('div');
                cell.className = 'cell';
                if (this.fixedCells.has(`${i},${j}`)) {
                    cell.classList.add('fixed');
                }
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.textContent = this.grid[i][j] || '';
                cell.addEventListener('click', () => this.handleCellClick(i, j));
                
                cellContainer.appendChild(cell);
                this.addConstraintSymbols(i, j, cellContainer);
                gameGrid.appendChild(cellContainer);
            }
        }
    }

    addConstraintSymbols(row, col, container) {
        this.constraints.forEach(constraint => {
            const [r1, c1] = constraint.cell1;
            const [r2, c2] = constraint.cell2;
            
            if (row === r1 && col === c1) {
                const symbol = document.createElement('div');
                symbol.className = 'constraint-symbol';
                symbol.textContent = constraint.type === '=' ? '=' : '×';
                
                if (c2 > c1) {
                    symbol.classList.add('right');
                } else if (r2 > r1) {
                    symbol.classList.add('bottom');
                }
                
                container.appendChild(symbol);
            }
        });
    }

    handleCellClick(row, col) {
        if (this.fixedCells.has(`${row},${col}`)) return;
        
        const currentValue = this.grid[row][col];
        const newValue = !currentValue ? '☀️' : currentValue === '☀️' ? '🌑' : null;
        
        // Always allow the move
        this.history.push({row, col, value: currentValue});
        this.grid[row][col] = newValue;
        this.updateCell(row, col);

        // Show invalid state if the move violates rules
        if (newValue && !this.isValidMove(row, col, newValue)) {
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.add('invalid');
                setTimeout(() => {
                    cell.classList.remove('invalid');
                }, 1000);
            }
        }

        this.checkWinCondition();
    }

    updateCell(row, col) {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.textContent = this.grid[row][col] || '';
        }
    }

    setupAllControls() {
        const buttons = {
            'rulesBtn': () => this.showRules(),
            'newGameBtn': () => this.newGame(),
            'hintBtn': () => this.showHint(),
            'undoBtn': () => this.undo(),
            'clearBtn': () => this.clearGrid(),
            'showAnswerBtn': () => this.showAnswer()
        };

        Object.entries(buttons).forEach(([id, handler]) => {
            const button = document.getElementById(id);
            if (button) {
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                newButton.addEventListener('click', handler.bind(this));
            }
        });
    }

    showRules() {
        const modal = document.getElementById('rules-modal');
        if (modal) {
            modal.style.display = 'block';
            
            const closeBtn = document.getElementById('closeRules');
            const closeHandler = () => {
                modal.style.display = 'none';
                closeBtn.removeEventListener('click', closeHandler);
            };
            closeBtn.addEventListener('click', closeHandler);
        }
    }

    newGame() {
        this.initializePuzzle();
    }

    showHint() {
        if (!this.solution) return;

        // Find a random empty cell that differs from solution
        const diffCells = [];
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (!this.fixedCells.has(`${i},${j}`) && 
                    this.grid[i][j] !== this.solution[i][j]) {
                    diffCells.push([i, j]);
                }
            }
        }

        if (diffCells.length > 0) {
            const [row, col] = diffCells[Math.floor(Math.random() * diffCells.length)];
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                const originalBg = cell.style.backgroundColor;
                cell.style.backgroundColor = '#a8e6cf';
                cell.textContent = this.solution[row][col];
                
                setTimeout(() => {
                    cell.style.backgroundColor = originalBg;
                    cell.textContent = this.grid[row][col] || '';
                }, 1000);
            }
        }
    }

    undo() {
        if (this.history.length > 0) {
            const lastMove = this.history.pop();
            this.grid[lastMove.row][lastMove.col] = lastMove.value;
            this.updateCell(lastMove.row, lastMove.col);
        }
    }

    clearGrid() {
        // Keep fixed cells, clear others
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (!this.fixedCells.has(`${i},${j}`)) {
                    this.grid[i][j] = null;
                    this.updateCell(i, j);
                }
            }
        }
        this.history = [];
    }

    showAnswer() {
        if (!this.solution) return;
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999;
        `;
        
        const confirmModal = document.createElement('div');
        confirmModal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
            z-index: 1000;
        `;
        
        confirmModal.innerHTML = `
            <h3>Show Solution?</h3>
            <p>Are you sure you want to see the answer?</p>
            <div style="display: flex; justify-content: center; gap: 10px;">
                <button id="confirmAnswer" style="padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Yes, show answer</button>
                <button id="cancelAnswer" style="padding: 8px 16px; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(confirmModal);
        
        document.getElementById('confirmAnswer').onclick = () => {
            this.revealSolution();
            document.body.removeChild(confirmModal);
            document.body.removeChild(overlay);
        };
        
        document.getElementById('cancelAnswer').onclick = () => {
            document.body.removeChild(confirmModal);
            document.body.removeChild(overlay);
        };
    }

    revealSolution() {
        if (!this.solution) return;
        let delay = 0;
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (!this.fixedCells.has(`${i},${j}`)) {
                    setTimeout(() => {
                        this.grid[i][j] = this.solution[i][j];
                        this.updateCell(i, j);
                    }, delay);
                    delay += 50;
                }
            }
        }
    }

    isValidMove(row, col, value) {
        if (!value) return true;

        // Check row balance
        const rowValues = [...this.grid[row]];
        rowValues[col] = value;
        const rowSuns = rowValues.filter(c => c === '☀️').length;
        const rowMoons = rowValues.filter(c => c === '🌑').length;
        if (rowSuns > this.gridSize/2 || rowMoons > this.gridSize/2) return false;

        // Check column balance
        const colValues = this.grid.map(r => r[col]);
        colValues[row] = value;
        const colSuns = colValues.filter(c => c === '☀️').length;
        const colMoons = colValues.filter(c => c === '🌑').length;
        if (colSuns > this.gridSize/2 || colMoons > this.gridSize/2) return false;

        // Check three in a row horizontally
        if (col >= 2 && rowValues[col-2] === value && rowValues[col-1] === value) return false;
        if (col <= this.gridSize-3 && rowValues[col+1] === value && rowValues[col+2] === value) return false;

        // Check three in a row vertically
        if (row >= 2 && colValues[row-2] === value && colValues[row-1] === value) return false;
        if (row <= this.gridSize-3 && colValues[row+1] === value && colValues[row+2] === value) return false;

        // Check constraints
        for (const constraint of this.constraints) {
            const [r1, c1] = constraint.cell1;
            const [r2, c2] = constraint.cell2;
            
            if ((row === r1 && col === c1) || (row === r2 && col === c2)) {
                const otherRow = (row === r1 && col === c1) ? r2 : r1;
                const otherCol = (row === r1 && col === c1) ? c2 : c1;
                const otherValue = this.grid[otherRow][otherCol];
                
                if (otherValue) {
                    if (constraint.type === '=' && value !== otherValue) return false;
                    if (constraint.type === '×' && value === otherValue) return false;
                }
            }
        }

        return true;
    }

    formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const timeString = [];
        
        if (minutes > 0) {
            timeString.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
        }
        if (seconds > 0 || minutes === 0) {
            timeString.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
        }
        
        return timeString.join(' and ');
    }

    checkWinCondition() {
        // Check if grid is complete
        const complete = this.grid.every(row => row.every(cell => cell !== null));
        if (!complete) return;

        // Check if solution matches
        let isCorrect = true;
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] !== this.solution[i][j]) {
                    isCorrect = false;
                    break;
                }
            }
            if (!isCorrect) break;
        }

        if (isCorrect) {
            clearInterval(this.timerInterval);
            const timeTaken = Math.floor((new Date() - this.startTime) / 1000);
            const timeString = this.formatTime(timeTaken);
            
            setTimeout(() => {
                if (confirm(`🎉 Fantastic job! You solved the puzzle in ${timeString}! Would you like to start a new game?`)) {
                    this.newGame();
                }
            }, 100);
        }
    }
}

// Initialize game when DOM is loaded
const game = new TangoGame();
window.game = game; // Make it accessible globally for debugging

export { TangoGame };