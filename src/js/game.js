import { PuzzleGenerator } from './generator.js';
import { GameStats } from './stats.js';

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
        this.stats = new GameStats();
        this.difficulty = this.loadDifficulty();
        this.setupGame();
        this.setupAllControls();
        this.setupKeyboardControls();
        this.initializePuzzle();
        this.initTimer();
    }

    loadDifficulty() {
        return localStorage.getItem('logiq-difficulty') || 'medium';
    }

    saveDifficulty(difficulty) {
        localStorage.setItem('logiq-difficulty', difficulty);
        this.difficulty = difficulty;
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
        const puzzle = this.generator.generatePuzzle(this.difficulty);
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
        this.clearInvalidHighlights(); // Clear any existing highlights
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
                symbol.textContent = constraint.type;
                symbol.setAttribute('aria-hidden', 'true'); // Accessibility improvement
                
                // Determine direction more efficiently
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

        // Add delay before validation to let user cycle through symbols
        setTimeout(() => {
            this.validateAndHighlightErrors();
        }, 500);

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
            'showAnswerBtn': () => this.showAnswer(),
            'statsBtn': () => this.showStats(),
            'difficultyBtn': () => this.showDifficultySelector()
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
            
            // Immediately revalidate after undo
            this.validateAndHighlightErrors();
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
        this.clearInvalidHighlights();
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
        
        // Clear highlights immediately when showing solution
        this.clearInvalidHighlights();
        
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

    validateAndHighlightErrors() {
        const invalidCells = new Set();
        const violationTypes = new Map();

        console.log('=== SIMPLE VALIDATION ===');

        // 1. CHECK EACH ROW - if more than 3 of same symbol, highlight ALL of them
        for (let row = 0; row < this.gridSize; row++) {
            const suns = [];
            const moons = [];
            
            // Collect positions of suns and moons
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === '☀️') suns.push([row, col]);
                if (this.grid[row][col] === '🌑') moons.push([row, col]);
            }
            
            // If more than 3 suns, highlight ALL of them (they're all breaking the rule)
            if (suns.length > 3) {
                console.log(`Row ${row}: ${suns.length} suns - highlighting ALL`);
                for (let i = 0; i < suns.length; i++) {
                    const key = `${suns[i][0]},${suns[i][1]}`;
                    invalidCells.add(key);
                    violationTypes.set(key, 'row-balance');
                }
            }
            
            // If more than 3 moons, highlight ALL of them (they're all breaking the rule)
            if (moons.length > 3) {
                console.log(`Row ${row}: ${moons.length} moons - highlighting ALL`);
                for (let i = 0; i < moons.length; i++) {
                    const key = `${moons[i][0]},${moons[i][1]}`;
                    invalidCells.add(key);
                    violationTypes.set(key, 'row-balance');
                }
            }
        }

        // 2. CHECK EACH COLUMN - if more than 3 of same symbol, highlight ALL of them
        for (let col = 0; col < this.gridSize; col++) {
            const suns = [];
            const moons = [];
            
            // Collect positions of suns and moons
            for (let row = 0; row < this.gridSize; row++) {
                if (this.grid[row][col] === '☀️') suns.push([row, col]);
                if (this.grid[row][col] === '🌑') moons.push([row, col]);
            }
            
            // If more than 3 suns, highlight ALL of them (they're all breaking the rule)
            if (suns.length > 3) {
                console.log(`Column ${col}: ${suns.length} suns - highlighting ALL`);
                for (let i = 0; i < suns.length; i++) {
                    const key = `${suns[i][0]},${suns[i][1]}`;
                    invalidCells.add(key);
                    violationTypes.set(key, 'column-balance');
                }
            }
            
            // If more than 3 moons, highlight ALL of them (they're all breaking the rule)
            if (moons.length > 3) {
                console.log(`Column ${col}: ${moons.length} moons - highlighting ALL`);
                for (let i = 0; i < moons.length; i++) {
                    const key = `${moons[i][0]},${moons[i][1]}`;
                    invalidCells.add(key);
                    violationTypes.set(key, 'column-balance');
                }
            }
        }

        // 3. CHECK FOR 3+ CONSECUTIVE - horizontal
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col <= this.gridSize - 3; col++) {
                const cell1 = this.grid[row][col];
                const cell2 = this.grid[row][col + 1];
                const cell3 = this.grid[row][col + 2];
                
                if (cell1 && cell1 === cell2 && cell2 === cell3) {
                    console.log(`3+ consecutive horizontal at row ${row}, cols ${col}-${col+2}`);
                    for (let c = col; c <= col + 2; c++) {
                        const key = `${row},${c}`;
                        invalidCells.add(key);
                        violationTypes.set(key, 'consecutive-horizontal');
                    }
                    
                    // Check for 4th consecutive
                    if (col + 3 < this.gridSize && this.grid[row][col + 3] === cell1) {
                        const key = `${row},${col + 3}`;
                        invalidCells.add(key);
                        violationTypes.set(key, 'consecutive-horizontal');
                    }
                }
            }
        }

        // 4. CHECK FOR 3+ CONSECUTIVE - vertical
        for (let col = 0; col < this.gridSize; col++) {
            for (let row = 0; row <= this.gridSize - 3; row++) {
                const cell1 = this.grid[row][col];
                const cell2 = this.grid[row + 1][col];
                const cell3 = this.grid[row + 2][col];
                
                if (cell1 && cell1 === cell2 && cell2 === cell3) {
                    console.log(`3+ consecutive vertical at col ${col}, rows ${row}-${row+2}`);
                    for (let r = row; r <= row + 2; r++) {
                        const key = `${r},${col}`;
                        invalidCells.add(key);
                        violationTypes.set(key, 'consecutive-vertical');
                    }
                    
                    // Check for 4th consecutive
                    if (row + 3 < this.gridSize && this.grid[row + 3][col] === cell1) {
                        const key = `${row + 3},${col}`;
                        invalidCells.add(key);
                        violationTypes.set(key, 'consecutive-vertical');
                    }
                }
            }
        }

        // 5. CHECK CONSTRAINTS
        for (const constraint of this.constraints) {
            const [r1, c1] = constraint.cell1;
            const [r2, c2] = constraint.cell2;
            const val1 = this.grid[r1][c1];
            const val2 = this.grid[r2][c2];
            
            if (val1 && val2) {
                if (constraint.type === '=' && val1 !== val2) {
                    console.log(`Constraint violation: = between different symbols`);
                    invalidCells.add(`${r1},${c1}`);
                    invalidCells.add(`${r2},${c2}`);
                    violationTypes.set(`${r1},${c1}`, 'constraint');
                    violationTypes.set(`${r2},${c2}`, 'constraint');
                }
                if (constraint.type === '×' && val1 === val2) {
                    console.log(`Constraint violation: × between same symbols`);
                    invalidCells.add(`${r1},${c1}`);
                    invalidCells.add(`${r2},${c2}`);
                    violationTypes.set(`${r1},${c1}`, 'constraint');
                    violationTypes.set(`${r2},${c2}`, 'constraint');
                }
            }
        }

        console.log('Total invalid cells:', invalidCells.size);
        this.highlightInvalidCells(Array.from(invalidCells), violationTypes);
    }

    highlightInvalidCells(invalidCellKeys, violationTypes) {
        // Clear existing highlights first
        this.clearInvalidHighlights();
        
        // Add highlights immediately - INCLUDING FIXED CELLS
        invalidCellKeys.forEach((cellKey) => {
            const [row, col] = cellKey.split(',').map(Number);
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            
            // REMOVED the condition that excluded fixed cells - now ALL violating cells are highlighted
            if (cell) {
                const violationType = violationTypes.get(cellKey);
                cell.classList.add('invalid');
                
                // Add specific violation type class for different colors
                if (violationType) {
                    cell.classList.add(`invalid-${violationType}`);
                }
                
                console.log(`Highlighting cell (${row},${col}) with type: ${violationType}, isFixed: ${this.fixedCells.has(cellKey)}`);
            }
        });
    }

    clearInvalidHighlights() {
        const invalidCells = document.querySelectorAll('.cell.invalid');
        invalidCells.forEach(cell => {
            // Remove all invalid-related classes
            cell.classList.remove('invalid');
            cell.classList.remove('invalid-consecutive-horizontal');
            cell.classList.remove('invalid-consecutive-vertical');
            cell.classList.remove('invalid-row-balance');
            cell.classList.remove('invalid-column-balance');
            cell.classList.remove('invalid-constraint');
            
            // Clear any animation
            cell.style.animation = '';
        });
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
            
            // Clear highlights when puzzle is solved
            this.clearInvalidHighlights();
            
            // Save stats
            this.stats.recordWin(timeTaken, this.difficulty);
            
            setTimeout(() => {
                if (confirm(`🎉 Fantastic job! You solved the puzzle in ${timeString}! Would you like to start a new game?`)) {
                    this.newGame();
                }
            }, 100);
        }
    }

    showStats() {
        const stats = this.stats.getStats();
        const modal = this.createModal('Game Statistics', `
            <div class="stats-container">
                <div class="stat-item">
                    <span class="stat-label">Games Played:</span>
                    <span class="stat-value">${stats.gamesPlayed}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Games Won:</span>
                    <span class="stat-value">${stats.gamesWon}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Win Rate:</span>
                    <span class="stat-value">${stats.winRate}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Best Time:</span>
                    <span class="stat-value">${stats.bestTime ? this.formatTime(stats.bestTime) : 'N/A'}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Average Time:</span>
                    <span class="stat-value">${stats.averageTime ? this.formatTime(Math.round(stats.averageTime)) : 'N/A'}</span>
                </div>
            </div>
        `);
        modal.style.display = 'block';
    }

    showDifficultySelector() {
        const modal = this.createModal('Select Difficulty', `
            <div class="difficulty-container">
                <button class="difficulty-btn ${this.difficulty === 'easy' ? 'active' : ''}" data-difficulty="easy">
                    Easy<br><small>More clues, fewer constraints</small>
                </button>
                <button class="difficulty-btn ${this.difficulty === 'medium' ? 'active' : ''}" data-difficulty="medium">
                    Medium<br><small>Balanced challenge</small>
                </button>
                <button class="difficulty-btn ${this.difficulty === 'hard' ? 'active' : ''}" data-difficulty="hard">
                    Hard<br><small>Fewer clues, more constraints</small>
                </button>
            </div>
        `);
        
        modal.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = e.target.dataset.difficulty;
                this.saveDifficulty(difficulty);
                modal.style.display = 'none';
                this.newGame();
            });
        });
        
        modal.style.display = 'block';
    }

    createModal(title, content) {
        const existingModal = document.getElementById('dynamic-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'dynamic-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>${title}</h2>
                ${content}
                <button class="close-modal">Close</button>
            </div>
        `;

        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        document.body.appendChild(modal);
        return modal;
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'n':
                case 'N':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.newGame();
                    }
                    break;
                case 'h':
                case 'H':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.showHint();
                    }
                    break;
                case 'z':
                case 'Z':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.undo();
                    }
                    break;
                case 'r':
                case 'R':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.clearGrid();
                    }
                    break;
                case '?':
                    this.showRules();
                    break;
                case 'Escape':
                    // Close any open modals
                    const modals = document.querySelectorAll('.modal');
                    modals.forEach(modal => {
                        if (modal.style.display === 'block') {
                            modal.style.display = 'none';
                        }
                    });
                    break;
            }
        });
    }
}

// Initialize game when DOM is loaded
const game = new TangoGame();
window.game = game; // Make it accessible globally for debugging

export { TangoGame };