export class BridgesGame {
    constructor() {
        this.gridSize = 8;
        this.islands = [];
        this.bridges = new Map(); // key: "row1,col1-row2,col2", value: bridge count (1 or 2)
        this.bridgeMode = 'single'; // single, double, remove
        this.history = [];
        this.difficulty = 'medium';
        
        this.setupGame();
        this.setupControls();
        this.generatePuzzle();
    }

    setupGame() {
        const grid = document.getElementById('bridges-grid');
        grid.style.gridTemplateColumns = `repeat(${this.gridSize}, 50px)`;
        grid.style.gridTemplateRows = `repeat(${this.gridSize}, 50px)`;
        grid.style.width = `${this.gridSize * 50}px`;
        grid.style.height = `${this.gridSize * 50}px`;
        grid.style.position = 'relative';
    }

    setupControls() {
        // Bridge mode controls
        document.querySelectorAll('.bridge-mode').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.bridge-mode').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.bridgeMode = e.target.dataset.mode;
            });
        });

        // Game controls
        document.querySelector('[data-game="bridges"].new-game-btn').addEventListener('click', () => this.generatePuzzle());
        document.querySelector('[data-game="bridges"].hint-btn').addEventListener('click', () => this.showHint());
        document.querySelector('[data-game="bridges"].undo-btn').addEventListener('click', () => this.undo());
        document.querySelector('[data-game="bridges"].clear-btn').addEventListener('click', () => this.clearBridges());
        document.querySelector('[data-game="bridges"].rules-btn').addEventListener('click', () => this.showRules());
    }

    generatePuzzle() {
        this.islands = [];
        this.bridges.clear();
        this.history = [];

        // Generate islands
        const islandCount = { easy: 6, medium: 8, hard: 10 }[this.difficulty];
        const positions = this.generateIslandPositions(islandCount);
        
        positions.forEach(([row, col]) => {
            const requiredBridges = this.calculateRequiredBridges(row, col, positions);
            this.islands.push({ row, col, required: requiredBridges, current: 0 });
        });

        this.updateDisplay();
    }

    generateIslandPositions(count) {
        const positions = [];
        const attempts = 1000;
        
        for (let attempt = 0; attempt < attempts && positions.length < count; attempt++) {
            const row = Math.floor(Math.random() * this.gridSize);
            const col = Math.floor(Math.random() * this.gridSize);
            
            // Check if position is valid (not too close to other islands)
            const tooClose = positions.some(([r, c]) => {
                const distance = Math.abs(r - row) + Math.abs(c - col);
                return distance < 2;
            });
            
            if (!tooClose) {
                positions.push([row, col]);
            }
        }
        
        return positions;
    }

    calculateRequiredBridges(row, col, positions) {
        // Count possible connections (horizontal and vertical neighbors)
        let connections = 0;
        
        // Check horizontal
        const sameRowIslands = positions.filter(([r, c]) => r === row && c !== col);
        if (sameRowIslands.length > 0) {
            connections += Math.min(2, sameRowIslands.length);
        }
        
        // Check vertical
        const sameColIslands = positions.filter(([r, c]) => c === col && r !== row);
        if (sameColIslands.length > 0) {
            connections += Math.min(2, sameColIslands.length);
        }
        
        // Random variation
        const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        return Math.max(1, Math.min(8, connections + variation));
    }

    updateDisplay() {
        const grid = document.getElementById('bridges-grid');
        grid.innerHTML = '';

        // Add islands
        this.islands.forEach(island => {
            const islandEl = document.createElement('div');
            islandEl.className = 'bridge-island';
            islandEl.textContent = island.required;
            islandEl.style.gridRow = island.row + 1;
            islandEl.style.gridColumn = island.col + 1;
            islandEl.dataset.row = island.row;
            islandEl.dataset.col = island.col;
            
            // Add click handler for bridge creation
            islandEl.addEventListener('click', (e) => this.handleIslandClick(island, e));
            
            // Update color based on completion
            if (island.current === island.required) {
                islandEl.style.backgroundColor = '#27ae60';
            } else if (island.current > island.required) {
                islandEl.style.backgroundColor = '#e74c3c';
            } else {
                islandEl.style.backgroundColor = '#3498db';
            }
            
            grid.appendChild(islandEl);
        });

        // Add bridges
        this.bridges.forEach((count, key) => {
            const [from, to] = key.split('-');
            const [row1, col1] = from.split(',').map(Number);
            const [row2, col2] = to.split(',').map(Number);
            
            this.drawBridge(row1, col1, row2, col2, count);
        });
    }

    handleIslandClick(island, event) {
        // Store clicked island for bridge creation
        if (!this.selectedIsland) {
            this.selectedIsland = island;
            event.target.style.border = '3px solid #f39c12';
        } else {
            // Try to create bridge between selected island and this one
            if (this.selectedIsland !== island) {
                this.createBridge(this.selectedIsland, island);
            }
            
            // Clear selection
            document.querySelectorAll('.bridge-island').forEach(el => {
                el.style.border = 'none';
            });
            this.selectedIsland = null;
        }
    }

    createBridge(island1, island2) {
        // Check if islands are in same row or column
        if (island1.row !== island2.row && island1.col !== island2.col) {
            return; // Can only connect horizontally or vertically
        }

        // Check if there are other islands in the way
        if (this.isPathBlocked(island1, island2)) {
            return;
        }

        const key = this.getBridgeKey(island1, island2);
        const currentBridges = this.bridges.get(key) || 0;

        let newBridgeCount = currentBridges;
        
        switch (this.bridgeMode) {
            case 'single':
                newBridgeCount = currentBridges === 0 ? 1 : (currentBridges === 1 ? 0 : 1);
                break;
            case 'double':
                newBridgeCount = currentBridges === 0 ? 2 : (currentBridges === 2 ? 0 : 2);
                break;
            case 'remove':
                newBridgeCount = 0;
                break;
        }

        // Save for undo
        this.history.push({ key, oldCount: currentBridges, newCount: newBridgeCount });

        // Update bridge count
        if (newBridgeCount === 0) {
            this.bridges.delete(key);
        } else {
            this.bridges.set(key, newBridgeCount);
        }

        // Update island current counts
        this.updateIslandCounts();
        this.updateDisplay();
        this.checkWin();
    }

    isPathBlocked(island1, island2) {
        const minRow = Math.min(island1.row, island2.row);
        const maxRow = Math.max(island1.row, island2.row);
        const minCol = Math.min(island1.col, island2.col);
        const maxCol = Math.max(island1.col, island2.col);

        // Check for islands in between
        return this.islands.some(island => {
            if (island === island1 || island === island2) return false;
            
            if (island1.row === island2.row) {
                // Horizontal bridge
                return island.row === island1.row && 
                       island.col > minCol && island.col < maxCol;
            } else {
                // Vertical bridge
                return island.col === island1.col && 
                       island.row > minRow && island.row < maxRow;
            }
        });
    }

    getBridgeKey(island1, island2) {
        // Ensure consistent key format
        const key1 = `${island1.row},${island1.col}`;
        const key2 = `${island2.row},${island2.col}`;
        return key1 < key2 ? `${key1}-${key2}` : `${key2}-${key1}`;
    }

    updateIslandCounts() {
        // Reset all current counts
        this.islands.forEach(island => island.current = 0);

        // Count bridges for each island
        this.bridges.forEach((count, key) => {
            const [from, to] = key.split('-');
            const [row1, col1] = from.split(',').map(Number);
            const [row2, col2] = to.split(',').map(Number);

            const island1 = this.islands.find(i => i.row === row1 && i.col === col1);
            const island2 = this.islands.find(i => i.row === row2 && i.col === col2);

            if (island1) island1.current += count;
            if (island2) island2.current += count;
        });
    }

    drawBridge(row1, col1, row2, col2, count) {
        const grid = document.getElementById('bridges-grid');
        const bridge = document.createElement('div');
        bridge.className = `bridge-connection ${row1 === row2 ? 'horizontal' : 'vertical'}`;
        
        if (count === 2) {
            bridge.classList.add('double');
        }

        if (row1 === row2) {
            // Horizontal bridge
            const minCol = Math.min(col1, col2);
            const maxCol = Math.max(col1, col2);
            const width = (maxCol - minCol) * 50;
            
            bridge.style.left = `${(minCol + 1) * 50 - 25}px`;
            bridge.style.top = `${row1 * 50 + 23}px`;
            bridge.style.width = `${width}px`;
            bridge.style.height = '4px';
        } else {
            // Vertical bridge
            const minRow = Math.min(row1, row2);
            const maxRow = Math.max(row1, row2);
            const height = (maxRow - minRow) * 50;
            
            bridge.style.left = `${col1 * 50 + 23}px`;
            bridge.style.top = `${(minRow + 1) * 50 - 25}px`;
            bridge.style.width = '4px';
            bridge.style.height = `${height}px`;
        }

        grid.appendChild(bridge);
    }

    showHint() {
        // Find an island that needs more bridges
        const incompleteIslands = this.islands.filter(island => island.current < island.required);
        
        if (incompleteIslands.length > 0) {
            const island = incompleteIslands[Math.floor(Math.random() * incompleteIslands.length)];
            
            // Highlight the island
            const islandEl = document.querySelector(`[data-row="${island.row}"][data-col="${island.col}"]`);
            if (islandEl) {
                islandEl.style.border = '3px solid #f39c12';
                setTimeout(() => {
                    islandEl.style.border = 'none';
                }, 2000);
            }
        }
    }

    undo() {
        if (this.history.length > 0) {
            const move = this.history.pop();
            
            if (move.oldCount === 0) {
                this.bridges.delete(move.key);
            } else {
                this.bridges.set(move.key, move.oldCount);
            }
            
            this.updateIslandCounts();
            this.updateDisplay();
        }
    }

    clearBridges() {
        this.bridges.clear();
        this.updateIslandCounts();
        this.updateDisplay();
        this.history = [];
    }

    checkWin() {
        // Check if all islands have the correct number of bridges
        const allComplete = this.islands.every(island => island.current === island.required);
        
        if (allComplete && this.isConnected()) {
            setTimeout(() => {
                alert('🎉 Congratulations! You solved the Bridges puzzle!');
            }, 100);
            return true;
        }
        return false;
    }

    isConnected() {
        // Check if all islands are connected (simplified check)
        if (this.islands.length === 0) return true;
        
        const visited = new Set();
        const queue = [this.islands[0]];
        visited.add(`${this.islands[0].row},${this.islands[0].col}`);
        
        while (queue.length > 0) {
            const current = queue.shift();
            const currentKey = `${current.row},${current.col}`;
            
            // Find connected islands
            this.bridges.forEach((count, bridgeKey) => {
                const [from, to] = bridgeKey.split('-');
                let connectedKey = null;
                
                if (from === currentKey) {
                    connectedKey = to;
                } else if (to === currentKey) {
                    connectedKey = from;
                }
                
                if (connectedKey && !visited.has(connectedKey)) {
                    visited.add(connectedKey);
                    const [row, col] = connectedKey.split(',').map(Number);
                    const connectedIsland = this.islands.find(i => i.row === row && i.col === col);
                    if (connectedIsland) {
                        queue.push(connectedIsland);
                    }
                }
            });
        }
        
        return visited.size === this.islands.length;
    }

    showRules() {
        const rulesContent = `
            <div class="rules-section">
                <h3>How to Play Bridges</h3>
                <ul>
                    <li>Connect islands with bridges</li>
                    <li>Each island shows how many bridges it needs</li>
                    <li>Bridges can only be horizontal or vertical</li>
                    <li>Maximum 2 bridges between any two islands</li>
                    <li>Bridges cannot cross each other</li>
                    <li>All islands must be connected</li>
                </ul>
            </div>
            <div class="rules-section">
                <h3>Controls</h3>
                <ul>
                    <li>Click an island to select it</li>
                    <li>Click another island to create a bridge</li>
                    <li><strong>— Single:</strong> Create/remove single bridges</li>
                    <li><strong>= Double:</strong> Create/remove double bridges</li>
                    <li><strong>✖ Remove:</strong> Remove any bridge</li>
                </ul>
            </div>
        `;
        
        document.getElementById('rules-title').textContent = 'Bridges Rules';
        document.getElementById('rules-content').innerHTML = rulesContent;
        document.getElementById('rules-modal').style.display = 'block';
    }
}