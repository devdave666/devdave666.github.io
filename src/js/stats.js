export class GameStats {
    constructor() {
        this.storageKey = 'logiq-game-stats';
        this.loadStats();
    }

    loadStats() {
        const saved = localStorage.getItem(this.storageKey);
        this.stats = saved ? JSON.parse(saved) : {
            gamesPlayed: 0,
            gamesWon: 0,
            totalTime: 0,
            bestTime: null,
            difficultyStats: {
                easy: { played: 0, won: 0, totalTime: 0, bestTime: null },
                medium: { played: 0, won: 0, totalTime: 0, bestTime: null },
                hard: { played: 0, won: 0, totalTime: 0, bestTime: null }
            }
        };
    }

    saveStats() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.stats));
    }

    recordWin(timeInSeconds, difficulty = 'medium') {
        this.stats.gamesPlayed++;
        this.stats.gamesWon++;
        this.stats.totalTime += timeInSeconds;

        // Update best time
        if (!this.stats.bestTime || timeInSeconds < this.stats.bestTime) {
            this.stats.bestTime = timeInSeconds;
        }

        // Update difficulty-specific stats
        const diffStats = this.stats.difficultyStats[difficulty];
        diffStats.played++;
        diffStats.won++;
        diffStats.totalTime += timeInSeconds;
        
        if (!diffStats.bestTime || timeInSeconds < diffStats.bestTime) {
            diffStats.bestTime = timeInSeconds;
        }

        this.saveStats();
    }

    recordLoss(difficulty = 'medium') {
        this.stats.gamesPlayed++;
        this.stats.difficultyStats[difficulty].played++;
        this.saveStats();
    }

    getStats() {
        return {
            gamesPlayed: this.stats.gamesPlayed,
            gamesWon: this.stats.gamesWon,
            winRate: this.stats.gamesPlayed > 0 ? 
                Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100) : 0,
            bestTime: this.stats.bestTime,
            averageTime: this.stats.gamesWon > 0 ? 
                this.stats.totalTime / this.stats.gamesWon : null
        };
    }

    getDifficultyStats(difficulty) {
        const diffStats = this.stats.difficultyStats[difficulty];
        return {
            played: diffStats.played,
            won: diffStats.won,
            winRate: diffStats.played > 0 ? 
                Math.round((diffStats.won / diffStats.played) * 100) : 0,
            bestTime: diffStats.bestTime,
            averageTime: diffStats.won > 0 ? 
                diffStats.totalTime / diffStats.won : null
        };
    }

    resetStats() {
        this.stats = {
            gamesPlayed: 0,
            gamesWon: 0,
            totalTime: 0,
            bestTime: null,
            difficultyStats: {
                easy: { played: 0, won: 0, totalTime: 0, bestTime: null },
                medium: { played: 0, won: 0, totalTime: 0, bestTime: null },
                hard: { played: 0, won: 0, totalTime: 0, bestTime: null }
            }
        };
        this.saveStats();
    }
}