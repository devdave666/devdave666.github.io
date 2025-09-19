import { TangoGame } from '../src/js/game.js';
import { PuzzleGenerator } from '../src/js/generator.js';

// Mock DOM elements for testing
const mockFn = () => {};
global.document = {
    getElementById: () => ({
        style: {},
        textContent: '',
        addEventListener: mockFn,
        innerHTML: '',
        appendChild: mockFn,
        removeChild: mockFn,
        querySelector: () => null,
        querySelectorAll: () => []
    }),
    createElement: () => ({
        style: {},
        textContent: '',
        addEventListener: mockFn,
        innerHTML: '',
        appendChild: mockFn,
        className: '',
        dataset: {}
    }),
    body: {
        appendChild: mockFn,
        removeChild: mockFn
    }
};

global.localStorage = {
    getItem: () => null,
    setItem: mockFn,
    removeItem: mockFn
};

global.clearInterval = mockFn;
global.setInterval = mockFn;

describe('Logiq Game Logic', () => {
    let generator;

    beforeEach(() => {
        generator = new PuzzleGenerator(6);
    });

    test('should generate a valid solution grid', () => {
        const solution = generator.generateValidSolution();
        expect(solution).toHaveLength(6);
        solution.forEach(row => {
            expect(row).toHaveLength(6);
            // Each row should have equal suns and moons
            const suns = row.filter(cell => cell === '☀️').length;
            const moons = row.filter(cell => cell === '🌑').length;
            expect(suns).toBe(3);
            expect(moons).toBe(3);
        });
    });

    test('should generate puzzles with different difficulty levels', () => {
        const easyPuzzle = generator.generatePuzzle('easy');
        const hardPuzzle = generator.generatePuzzle('hard');
        
        expect(easyPuzzle.predefinedCells.length).toBeGreaterThan(hardPuzzle.predefinedCells.length);
        expect(hardPuzzle.constraints.length).toBeGreaterThan(easyPuzzle.constraints.length);
    });

    test('should validate cell placement correctly', () => {
        const grid = Array(6).fill(null).map(() => Array(6).fill(null));
        
        // Test valid placement
        expect(generator.isValidPlacement(grid, 0, 0, '☀️')).toBe(true);
        
        // Fill row with 3 suns, next sun should be invalid
        grid[0][0] = '☀️';
        grid[0][1] = '☀️';
        grid[0][2] = '☀️';
        expect(generator.isValidPlacement(grid, 0, 3, '☀️')).toBe(false);
        
        // Test consecutive symbols
        grid[0][3] = '☀️';
        expect(generator.isValidPlacement(grid, 0, 4, '☀️')).toBe(false);
    });

    test('should generate meaningful constraints', () => {
        const solution = generator.generateValidSolution();
        const constraints = generator.generateMeaningfulConstraints(solution, 5);
        
        expect(constraints).toHaveLength(5);
        constraints.forEach(constraint => {
            expect(['=', '×']).toContain(constraint.type);
            expect(constraint.cell1).toHaveLength(2);
            expect(constraint.cell2).toHaveLength(2);
        });
    });
});