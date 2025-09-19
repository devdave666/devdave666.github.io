export class SequenceGame {
    constructor() {
        this.currentSequence = [];
        this.answer = 0;
        this.pattern = '';
        this.difficulty = 'medium';
        this.score = 0;
        this.streak = 0;
        this.history = [];
        
        this.setupGame();
        this.setupControls();
        this.generateSequence();
    }

    setupGame() {
        this.updateDisplay();
    }

    setupControls() {
        // Answer input
        const input = document.getElementById('sequence-answer');
        const submitBtn = document.getElementById('sequence-submit');
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });
        
        submitBtn.addEventListener('click', () => this.submitAnswer());

        // Game controls
        document.querySelector('[data-game="sequence"].new-game-btn').addEventListener('click', () => this.generateSequence());
        document.querySelector('[data-game="sequence"].hint-btn').addEventListener('click', () => this.showHint());
        document.querySelector('[data-game="sequence"].undo-btn').addEventListener('click', () => this.undo());
        document.querySelector('[data-game="sequence"].clear-btn').addEventListener('click', () => this.clearAnswer());
        document.querySelector('[data-game="sequence"].rules-btn').addEventListener('click', () => this.showRules());
    }

    generateSequence() {
        const generators = [
            this.generateArithmetic,
            this.generateGeometric,
            this.generateFibonacci,
            this.generateSquares,
            this.generatePrimes,
            this.generateFactorial,
            this.generatePolynomial,
            this.generateRecursive
        ];

        const generator = generators[Math.floor(Math.random() * generators.length)];
        generator.call(this);
        
        this.updateDisplay();
        document.getElementById('sequence-answer').value = '';
        document.getElementById('sequence-answer').focus();
    }

    generateArithmetic() {
        const start = Math.floor(Math.random() * 20) + 1;
        const diff = Math.floor(Math.random() * 10) + 1;
        const length = { easy: 4, medium: 5, hard: 6 }[this.difficulty];
        
        this.currentSequence = [];
        for (let i = 0; i < length; i++) {
            this.currentSequence.push(start + i * diff);
        }
        
        this.answer = start + length * diff;
        this.pattern = `Arithmetic sequence (add ${diff})`;
    }

    generateGeometric() {
        const start = Math.floor(Math.random() * 5) + 2;
        const ratio = Math.floor(Math.random() * 3) + 2;
        const length = { easy: 3, medium: 4, hard: 5 }[this.difficulty];
        
        this.currentSequence = [];
        for (let i = 0; i < length; i++) {
            this.currentSequence.push(start * Math.pow(ratio, i));
        }
        
        this.answer = start * Math.pow(ratio, length);
        this.pattern = `Geometric sequence (multiply by ${ratio})`;
    }

    generateFibonacci() {
        const length = { easy: 5, medium: 6, hard: 7 }[this.difficulty];
        
        this.currentSequence = [1, 1];
        for (let i = 2; i < length; i++) {
            this.currentSequence.push(
                this.currentSequence[i - 1] + this.currentSequence[i - 2]
            );
        }
        
        this.answer = this.currentSequence[length - 1] + this.currentSequence[length - 2];
        this.pattern = 'Fibonacci sequence (each number is sum of previous two)';
    }

    generateSquares() {
        const start = Math.floor(Math.random() * 5) + 1;
        const length = { easy: 4, medium: 5, hard: 6 }[this.difficulty];
        
        this.currentSequence = [];
        for (let i = 0; i < length; i++) {
            this.currentSequence.push(Math.pow(start + i, 2));
        }
        
        this.answer = Math.pow(start + length, 2);
        this.pattern = 'Perfect squares sequence';
    }

    generatePrimes() {
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
        const length = { easy: 4, medium: 5, hard: 6 }[this.difficulty];
        
        this.currentSequence = primes.slice(0, length);
        this.answer = primes[length];
        this.pattern = 'Prime numbers sequence';
    }

    generateFactorial() {
        const length = { easy: 4, medium: 5, hard: 6 }[this.difficulty];
        
        this.currentSequence = [];
        for (let i = 1; i <= length; i++) {
            let factorial = 1;
            for (let j = 1; j <= i; j++) {
                factorial *= j;
            }
            this.currentSequence.push(factorial);
        }
        
        let nextFactorial = 1;
        for (let j = 1; j <= length + 1; j++) {
            nextFactorial *= j;
        }
        this.answer = nextFactorial;
        this.pattern = 'Factorial sequence (n!)';
    }

    generatePolynomial() {
        // Simple quadratic: an² + bn + c
        const a = Math.floor(Math.random() * 3) + 1;
        const b = Math.floor(Math.random() * 5) - 2;
        const c = Math.floor(Math.random() * 5) + 1;
        const length = { easy: 4, medium: 5, hard: 6 }[this.difficulty];
        
        this.currentSequence = [];
        for (let n = 1; n <= length; n++) {
            this.currentSequence.push(a * n * n + b * n + c);
        }
        
        const nextN = length + 1;
        this.answer = a * nextN * nextN + b * nextN + c;
        this.pattern = `Quadratic sequence (${a}n² ${b >= 0 ? '+' : ''}${b}n ${c >= 0 ? '+' : ''}${c})`;
    }

    generateRecursive() {
        // a(n) = 2*a(n-1) + 1
        const start = Math.floor(Math.random() * 5) + 1;
        const length = { easy: 4, medium: 5, hard: 6 }[this.difficulty];
        
        this.currentSequence = [start];
        for (let i = 1; i < length; i++) {
            this.currentSequence.push(2 * this.currentSequence[i - 1] + 1);
        }
        
        this.answer = 2 * this.currentSequence[length - 1] + 1;
        this.pattern = 'Recursive sequence (2×previous + 1)';
    }

    updateDisplay() {
        const display = document.getElementById('sequence-display');
        const numbersDiv = display.querySelector('.sequence-numbers') || document.createElement('div');
        const questionDiv = display.querySelector('.sequence-question') || document.createElement('div');
        const patternDiv = display.querySelector('.sequence-pattern') || document.createElement('div');
        
        numbersDiv.className = 'sequence-numbers';
        questionDiv.className = 'sequence-question';
        patternDiv.className = 'sequence-pattern';
        
        numbersDiv.textContent = this.currentSequence.join(', ') + ', ?';
        questionDiv.textContent = 'What comes next?';
        patternDiv.textContent = `Score: ${this.score} | Streak: ${this.streak}`;
        
        display.innerHTML = '';
        display.appendChild(numbersDiv);
        display.appendChild(questionDiv);
        display.appendChild(patternDiv);
    }

    submitAnswer() {
        const input = document.getElementById('sequence-answer');
        const userAnswer = parseInt(input.value);
        
        if (isNaN(userAnswer)) {
            this.showFeedback('Please enter a valid number', 'error');
            return;
        }

        // Save for undo
        this.history.push({
            sequence: [...this.currentSequence],
            answer: this.answer,
            pattern: this.pattern,
            score: this.score,
            streak: this.streak
        });

        if (userAnswer === this.answer) {
            this.score += 10 + this.streak;
            this.streak++;
            this.showFeedback(`Correct! +${10 + this.streak - 1} points`, 'success');
            
            setTimeout(() => {
                this.generateSequence();
            }, 1500);
        } else {
            this.streak = 0;
            this.showFeedback(`Wrong! The answer was ${this.answer}. Pattern: ${this.pattern}`, 'error');
            
            setTimeout(() => {
                this.generateSequence();
            }, 3000);
        }
        
        this.updateDisplay();
    }

    showFeedback(message, type) {
        const display = document.getElementById('sequence-display');
        const feedback = document.createElement('div');
        feedback.className = `sequence-feedback ${type}`;
        feedback.textContent = message;
        feedback.style.cssText = `
            margin-top: 15px;
            padding: 10px;
            border-radius: 6px;
            font-weight: bold;
            ${type === 'success' ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 
              'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}
        `;
        
        display.appendChild(feedback);
    }

    showHint() {
        const hints = {
            'Arithmetic': 'Look at the differences between consecutive numbers',
            'Geometric': 'Look at the ratios between consecutive numbers',
            'Fibonacci': 'Each number is the sum of the two before it',
            'Perfect squares': 'These are squares of consecutive integers',
            'Prime numbers': 'These are numbers only divisible by 1 and themselves',
            'Factorial': 'Each number is n! (n factorial)',
            'Quadratic': 'Look at the second differences between numbers',
            'Recursive': 'Each number follows a pattern based on the previous one'
        };
        
        const patternType = this.pattern.split(' ')[0];
        const hint = hints[patternType] || 'Look for a mathematical pattern in the sequence';
        
        this.showFeedback(`Hint: ${hint}`, 'info');
    }

    undo() {
        if (this.history.length > 0) {
            const previous = this.history.pop();
            this.currentSequence = previous.sequence;
            this.answer = previous.answer;
            this.pattern = previous.pattern;
            this.score = previous.score;
            this.streak = previous.streak;
            
            this.updateDisplay();
            document.getElementById('sequence-answer').value = '';
        }
    }

    clearAnswer() {
        document.getElementById('sequence-answer').value = '';
        document.getElementById('sequence-answer').focus();
    }

    showRules() {
        const rulesContent = `
            <div class="rules-section">
                <h3>How to Play Sequence</h3>
                <ul>
                    <li>Look at the sequence of numbers</li>
                    <li>Find the mathematical pattern</li>
                    <li>Enter the next number in the sequence</li>
                    <li>Build up your score and streak!</li>
                </ul>
            </div>
            <div class="rules-section">
                <h3>Pattern Types</h3>
                <ul>
                    <li><strong>Arithmetic:</strong> Add/subtract same number each time</li>
                    <li><strong>Geometric:</strong> Multiply/divide by same number each time</li>
                    <li><strong>Fibonacci:</strong> Each number = sum of previous two</li>
                    <li><strong>Squares:</strong> Perfect squares (1², 2², 3², ...)</li>
                    <li><strong>Primes:</strong> Prime numbers (2, 3, 5, 7, ...)</li>
                    <li><strong>Factorial:</strong> n! sequences (1!, 2!, 3!, ...)</li>
                    <li><strong>Polynomial:</strong> Quadratic or higher patterns</li>
                </ul>
            </div>
            <div class="rules-section">
                <h3>Scoring</h3>
                <ul>
                    <li>Correct answer: 10 + streak bonus points</li>
                    <li>Wrong answer: streak resets to 0</li>
                    <li>Use hints to learn patterns</li>
                </ul>
            </div>
        `;
        
        document.getElementById('rules-title').textContent = 'Sequence Rules';
        document.getElementById('rules-content').innerHTML = rulesContent;
        document.getElementById('rules-modal').style.display = 'block';
    }
}