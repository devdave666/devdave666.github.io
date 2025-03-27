import { initializeGame, checkSolution, toggleCell } from '../src/js/game.js';

describe('Tango Game Logic', () => {
    let game;

    beforeEach(() => {
        game = initializeGame();
    });

    test('should initialize the game with a valid grid', () => {
        expect(game.grid).toHaveLength(6);
        game.grid.forEach(row => {
            expect(row).toHaveLength(6);
        });
    });

    test('should toggle cell state correctly', () => {
        const initialCell = game.grid[0][0];
        toggleCell(0, 0);
        expect(game.grid[0][0]).not.toBe(initialCell);
    });

    test('should check solution correctly', () => {
        game.grid = [
            ['☀️', '🌙', '☀️', '🌙', '☀️', '🌙'],
            ['🌙', '☀️', '🌙', '☀️', '🌙', '☀️'],
            ['☀️', '🌙', '☀️', '🌙', '☀️', '🌙'],
            ['🌙', '☀️', '🌙', '☀️', '🌙', '☀️'],
            ['☀️', '🌙', '☀️', '🌙', '☀️', '🌙'],
            ['🌙', '☀️', '🌙', '☀️', '🌙', '☀️']
        ];
        expect(checkSolution(game.grid)).toBe(true);
    });

    test('should return false for an invalid solution', () => {
        game.grid[0][0] = '🌙'; // Making it invalid
        expect(checkSolution(game.grid)).toBe(false);
    });
});