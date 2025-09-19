export class NonogramGame {
    constructor() {
        this.size = 10;
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0)); // 0=empty, 1=filled, 2=marked
        this.solution = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.rowClues = [];
        this.colClues = [];
        this.drawMode = 'fill'; // fill, mark, erase
        this.history = [];
        this.difficulty = 'medium';
        
        this.setupGame();
        this.setupControls();
        this.generatePuzzle();
    }

    setupGame() {
        const grid = document.getElementById('nonogram-grid');
        this.updateGridLayout();
    }

    updateGridLayout() {
        const grid = document.getElementById('nonogram-grid');
        grid.innerHTML = '';
        
        // Calculate max clue length for layout
        const maxRowClues = Math.max(...this.rowClues.map(clues => clues.length));
        const maxColClues = Math.max(...this.colClues.map(clues => clues.length));
        
        const totalCols = maxRowClues + this.size;
        const totalRows = maxColClues + this.size;
        
        grid.style.gridTemplateColumns = `repeat(${totalCols}, 25px)`;
        grid.style.gridTemplateRows = `repeat(${totalRows}, 25px)`;

        // Create grid cells
        for (let row = 0; row < totalRows; row++) {
            for (let col = 0; col < totalCols; col++) {
                const cell = document.createElement('div');
                
                if (row < maxColClues && col >= maxRowClues) {
                    // Column clues
                    const colIndex = col - maxRowClues;
                    const clueIndex = row;
                    cell.className = 'nonogram-clue';
                    if (this.colClues[colIndex] && this.colClues[colIndex][clueIndex] !== undefined) {
                        cell.textContent = this.colClues[colIndex][clueIndex];
                    }
                } else if (row >= maxColClues && col < maxRowClues) {
                    // Row clues
                    const rowIndex = row - maxColClues;
                    const clueIndex = col;
                    cell.className = 'nonogram-clue';
                    if (this.rowClues[rowIndex] && this.rowClues[rowIndex][clueIndex] !== undefined) {
                        cell.textContent = this.rowClues[rowIndex][clueIndex];
                    }
                } else if (row >= maxColClues && col >= maxRowClues) {
                    // Game cells
                    const gameRow = row - maxColClues;
                    const gameCol = col - maxRowClues;
                    cell.className = 'nonogram-cell';
                    cell.dataset.row = gameRow;
                    cell.dataset.col = gameCol;
                    cell.addEventListener('click', () => this.handleCellClick(gameRow, gameCol));
                    cell.addEventListener('mouseenter', (e) => this.handleCellHover(e, gameRow, gameCol));
                } else {
                    // Empty corner
                    cell.className = 'nonogram-clue';
                }
                
                grid.appendChild(cell);
            }
        }
        
        this.updateDisplay();
    }

    setupControls() {
        // Drawing mode controls
        document.querySelectorAll('.draw-mode').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.draw-mode').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.drawMode = e.target.dataset.mode;
            });
        });

        // Game controls
        document.querySelector('[data-game="nonogram"].new-game-btn').addEventListener('click', () => this.generatePuzzle());
        document.querySelector('[data-game="nonogram"].hint-btn').addEventListener('click', () => this.showHint());
        document.querySelector('[data-game="nonogram"].undo-btn').addEventListener('click', () => this.undo());
        document.querySelector('[data-game="nonogram"].clear-btn').addEventListener('click', () => this.clearGrid());
        document.querySelector('[data-game="nonogram"].rules-btn').addEventListener('click', () => this.showRules());

        // Mouse drag support
        this.isDragging = false;
        document.addEventListener('mousedown', () => this.isDragging = true);
        document.addEventListener('mouseup', () => this.isDragging = false);
    }

    generatePuzzle() {
        // Generate a random solution pattern
        this.generateSolution();
        
        // Calculate clues from solution
        this.calculateClues();
        
        // Clear the grid
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        
        this.updateGridLayout();
        this.history = [];
    }

    generateSolution() {
        const patterns = [
            this.generateRandomPattern,
            this.generateSymmetricPattern,
            this.generateShapePattern
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        pattern.call(this);
    }

    generateRandomPattern() {
        const density = { easy: 0.4, medium: 0.5, hard: 0.6 }[this.difficulty];
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.solution[i][j] = Math.random() < density ? 1 : 0;
            }
        }
    }

    generateSymmetricPattern() {
        const density = { easy: 0.3, medium: 0.4, hard: 0.5 }[this.difficulty];
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (j <= i) {
                    this.solution[i][j] = Math.random() < density ? 1 : 0;
                    this.solution[j][i] = this.solution[i][j]; // Mirror
                }
            }
        }
    }

    generateShapePattern() {
        // Generate simple geometric shapes
        const centerX = Math.floor(this.size / 2);
        const centerY = Math.floor(this.size / 2);
        const radius = Math.floor(this.size / 3);
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const distance = Math.sqrt((i - centerX) ** 2 + (j - centerY) ** 2);
                this.solution[i][j] = distance <= radius ? 1 : 0;
            }
        }
    }

    calculateClues() {
        // Calculate row clues
        this.rowClues = [];
        for (let i = 0; i < this.size; i++) {
            const clues = [];
            let count = 0;
            
            for (let j = 0; j < this.size; j++) {
                if (this.solution[i][j] === 1) {
                    count++;
                } else if (count > 0) {
                    clues.push(count);
                    count = 0;
                }
            }
            if (count > 0) clues.push(count);
            if (clues.length === 0) clues.push(0);
            
            this.rowClues.push(clues);
        }

        // Calculate column clues
        this.colClues = [];
        for (let j = 0; j < this.size; j++) {
            const clues = [];
            let count = 0;
            
            for (let i = 0; i < this.size; i++) {
                if (this.solution[i][j] === 1) {
                    count++;
                } else if (count > 0) {
                    clues.push(count);
                    count = 0;
                }
            }
            if (count > 0) clues.push(count);
            if (clues.length === 0) clues.push(0);
            
            this.colClues.push(clues);
        }
    }

    handleCellClick(row, col) {
        this.makeMove(row, col);
    }

    handleCellHover(e, row, col) {
        if (this.isDragging) {
            this.makeMove(row, col);
        }
    }

    makeMove(row, col) {
        const oldValue = this.grid[row][col];
        let newValue = oldValue;

        switch (this.drawMode) {
            case 'fill':
                newValue = oldValue === 1 ? 0 : 1;
                break;
            case 'mark':
                newValue = oldValue === 2 ? 0 : 2;
                break;
            case 'erase':
                newValue = 0;
                break;
        }

        if (newValue !== oldValue) {
            this.history.push({ row, col, oldValue, newValue });
            this.grid[row][col] = newValue;
            this.updateCell(row, col);
            this.checkWin();
        }
    }

    updateDisplay() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.updateCell(i, j);
            }
        }
    }

    updateCell(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!cell) return;

        cell.classList.remove('filled', 'marked');
        
        switch (this.grid[row][col]) {
            case 1:
                cell.classList.add('filled');
                break;
            case 2:
                cell.classList.add('marked');
                break;
        }
    }

    showHint() {
        // Find a random empty cell that should be filled
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0 && this.solution[i][j] === 1) {
                    emptyCells.push([i, j]);
                }
            }
        }

        if (emptyCells.length > 0) {
            const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.history.push({ row, col, oldValue: this.grid[row][col], newValue: 1 });
            this.grid[row][col] = 1;
            this.updateCell(row, col);
            this.checkWin();
        }
    }

    undo() {
        if (this.history.length > 0) {
            const move = this.history.pop();
            this.grid[move.row][move.col] = move.oldValue;
            this.updateCell(move.row, move.col);
        }
    }

    clearGrid() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = 0;
                this.updateCell(i, j);
            }
        }
        this.history = [];
    }

    checkWin() {
        // Check if all filled cells match the solution
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cellFilled = this.grid[i][j] === 1;
                const shouldBeFilled = this.solution[i][j] === 1;
                
                if (cellFilled !== shouldBeFilled) {
                    return false;
                }
            }
        }

        // Victory!
        setTimeout(() => {
            alert('🎉 Congratulations! You solved the Nonogram puzzle!');
        }, 100);
        return true;
    }

    showRules() {
        const rulesContent = `
            <div class="rules-section">
                <h3>How to Play Nonogram</h3>
                <ul>
                    <li>Fill cells to reveal a hidden picture</li>
                    <li>Numbers show consecutive filled cells in each row/column</li>
                    <li>Multiple numbers mean separate groups with gaps between</li>
                    <li>Use logic to determine which cells to fill</li>
                </ul>
            </div>
            <div class="rules-section">
                <h3>Controls</h3>
                <ul>
                    <li><strong>🖤 Fill:</strong> Click to fill/unfill cells</li>
                    <li><strong>❌ Mark:</strong> Mark cells you know are empty</li>
                    <li><strong>🗑️ Erase:</strong> Clear any cell</li>
                    <li>Drag to fill multiple cells at once</li>
                </ul>
            </div>
            <div class="rules-section">
                <h3>Example</h3>
                <p>If a row shows "3 1", it means there are 3 consecutive filled cells, then a gap, then 1 filled cell.</p>
            </div>
        `;
        
        document.getElementById('rules-title').textContent = 'Nonogram Rules';
        document.getElementById('rules-content').innerHTML = rulesContent;
        document.getElementById('rules-modal').style.display = 'block';
    }
}