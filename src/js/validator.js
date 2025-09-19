export class GridValidator {
    constructor(gridSize = 6) {
        this.gridSize = gridSize;
        this.halfSize = gridSize / 2;
    }

    validateMove(grid, row, col, value, constraints = []) {
        if (!value) return { valid: true, errors: [] };

        const errors = [];
        
        // Check row balance
        const rowCounts = this.countSymbolsInRow(grid, row, col, value);
        if (rowCounts.suns > this.halfSize) {
            errors.push('Too many suns in this row');
        }
        if (rowCounts.moons > this.halfSize) {
            errors.push('Too many moons in this row');
        }

        // Check column balance
        const colCounts = this.countSymbolsInColumn(grid, row, col, value);
        if (colCounts.suns > this.halfSize) {
            errors.push('Too many suns in this column');
        }
        if (colCounts.moons > this.halfSize) {
            errors.push('Too many moons in this column');
        }

        // Check consecutive symbols
        if (this.hasThreeConsecutive(grid, row, col, value)) {
            errors.push('Three consecutive identical symbols not allowed');
        }

        // Check constraints
        const constraintErrors = this.validateConstraints(grid, row, col, value, constraints);
        errors.push(...constraintErrors);

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    countSymbolsInRow(grid, row, col, newValue) {
        const rowValues = [...grid[row]];
        rowValues[col] = newValue;
        
        return {
            suns: rowValues.filter(cell => cell === '☀️').length,
            moons: rowValues.filter(cell => cell === '🌑').length
        };
    }

    countSymbolsInColumn(grid, row, col, newValue) {
        const colValues = grid.map((r, i) => i === row ? newValue : r[col]);
        
        return {
            suns: colValues.filter(cell => cell === '☀️').length,
            moons: colValues.filter(cell => cell === '🌑').length
        };
    }

    hasThreeConsecutive(grid, row, col, value) {
        // Create temporary grid with new value
        const tempGrid = grid.map(r => [...r]);
        tempGrid[row][col] = value;

        // Check horizontal
        for (let c = 0; c <= this.gridSize - 3; c++) {
            if (tempGrid[row][c] === value && 
                tempGrid[row][c + 1] === value && 
                tempGrid[row][c + 2] === value) {
                return true;
            }
        }

        // Check vertical
        for (let r = 0; r <= this.gridSize - 3; r++) {
            if (tempGrid[r][col] === value && 
                tempGrid[r + 1][col] === value && 
                tempGrid[r + 2][col] === value) {
                return true;
            }
        }

        return false;
    }

    validateConstraints(grid, row, col, value, constraints) {
        const errors = [];

        for (const constraint of constraints) {
            const [r1, c1] = constraint.cell1;
            const [r2, c2] = constraint.cell2;
            
            if ((row === r1 && col === c1) || (row === r2 && col === c2)) {
                const otherRow = (row === r1 && col === c1) ? r2 : r1;
                const otherCol = (row === r1 && col === c1) ? c2 : c1;
                const otherValue = grid[otherRow][otherCol];
                
                if (otherValue) {
                    if (constraint.type === '=' && value !== otherValue) {
                        errors.push('Connected cells must have the same symbol');
                    }
                    if (constraint.type === '×' && value === otherValue) {
                        errors.push('Connected cells must have different symbols');
                    }
                }
            }
        }

        return errors;
    }

    isGridComplete(grid) {
        return grid.every(row => row.every(cell => cell !== null));
    }

    isGridValid(grid, constraints = []) {
        // Check all rows and columns have equal symbols
        for (let i = 0; i < this.gridSize; i++) {
            const rowSuns = grid[i].filter(cell => cell === '☀️').length;
            const rowMoons = grid[i].filter(cell => cell === '🌑').length;
            if (rowSuns !== this.halfSize || rowMoons !== this.halfSize) {
                return false;
            }

            const colSuns = grid.map(row => row[i]).filter(cell => cell === '☀️').length;
            const colMoons = grid.map(row => row[i]).filter(cell => cell === '🌑').length;
            if (colSuns !== this.halfSize || colMoons !== this.halfSize) {
                return false;
            }
        }

        // Check no three consecutive
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.hasThreeConsecutive(grid, r, c, grid[r][c])) {
                    return false;
                }
            }
        }

        // Check constraints
        for (const constraint of constraints) {
            const [r1, c1] = constraint.cell1;
            const [r2, c2] = constraint.cell2;
            const val1 = grid[r1][c1];
            const val2 = grid[r2][c2];

            if (constraint.type === '=' && val1 !== val2) {
                return false;
            }
            if (constraint.type === '×' && val1 === val2) {
                return false;
            }
        }

        return true;
    }
}