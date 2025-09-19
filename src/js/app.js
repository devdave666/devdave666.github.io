// Main App Controller
class GameHub {
    constructor() {
        this.currentGame = 'logiq';
        this.games = {};
        this.timer = null;
        this.startTime = null;
        this.timerInterval = null;
        
        this.initializeApp();
    }

    initializeApp() {
        this.setupTabs();
        this.setupTimer();
        this.setupModals();
        this.loadGame('logiq');
    }

    setupModals() {
        // Close modal functionality
        const closeBtn = document.getElementById('closeRules');
        const modal = document.getElementById('rules-modal');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const gameType = e.currentTarget.dataset.game;
                this.switchGame(gameType);
            });
        });
    }

    switchGame(gameType) {
        // Update active tab
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-game="${gameType}"]`).classList.add('active');

        // Update active game panel
        document.querySelectorAll('.game-panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(`${gameType}-game`).classList.add('active');

        // Load game if not already loaded
        this.loadGame(gameType);
        this.currentGame = gameType;

        // Reset timer for new game
        this.resetTimer();
    }

    async loadGame(gameType) {
        if (this.games[gameType]) {
            return; // Already loaded
        }

        try {
            switch (gameType) {
                case 'logiq':
                    // Logiq is already loaded in game.js
                    this.games.logiq = window.game;
                    break;
                case 'sudoku':
                    const { SudokuGame } = await import('./games/sudoku.js');
                    this.games.sudoku = new SudokuGame();
                    break;
                case 'nonogram':
                    const { NonogramGame } = await import('./games/nonogram.js');
                    this.games.nonogram = new NonogramGame();
                    break;
                case 'bridges':
                    const { BridgesGame } = await import('./games/bridges.js');
                    this.games.bridges = new BridgesGame();
                    break;
                case 'sequence':
                    const { SequenceGame } = await import('./games/sequence.js');
                    this.games.sequence = new SequenceGame();
                    break;
            }
        } catch (error) {
            console.error(`Failed to load ${gameType} game:`, error);
        }
    }

    setupTimer() {
        this.resetTimer();
    }

    resetTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this.startTime = new Date();
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

    getCurrentGame() {
        return this.games[this.currentGame];
    }
}

// Initialize the app
const gameHub = new GameHub();
window.gameHub = gameHub;

export { GameHub };