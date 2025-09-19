export class DailyPuzzle {
    constructor(generator) {
        this.generator = generator;
        this.storageKey = 'logiq-daily-puzzle';
    }

    getTodaysPuzzle() {
        const today = this.getTodayString();
        const stored = localStorage.getItem(this.storageKey);
        
        if (stored) {
            const data = JSON.parse(stored);
            if (data.date === today) {
                return data.puzzle;
            }
        }

        // Generate new daily puzzle
        const puzzle = this.generateDailyPuzzle(today);
        localStorage.setItem(this.storageKey, JSON.stringify({
            date: today,
            puzzle: puzzle
        }));
        
        return puzzle;
    }

    generateDailyPuzzle(dateString) {
        // Use date as seed for consistent daily puzzles
        const seed = this.hashCode(dateString);
        Math.seedrandom = this.seedRandom(seed);
        
        // Generate puzzle with medium difficulty for daily challenge
        return this.generator.generatePuzzle('medium');
    }

    getTodayString() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    seedRandom(seed) {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }

    isDailyPuzzleCompleted() {
        const today = this.getTodayString();
        const completed = localStorage.getItem('logiq-daily-completed');
        return completed === today;
    }

    markDailyPuzzleCompleted() {
        const today = this.getTodayString();
        localStorage.setItem('logiq-daily-completed', today);
    }
}