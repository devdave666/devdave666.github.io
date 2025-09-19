# Logiq - Daily Logic Puzzle Game

A modern web-based logic puzzle game that challenges players with unique daily puzzles featuring sun and moon symbols.

## Overview

Logiq is an engaging puzzle game that combines logical thinking with intuitive gameplay. Players solve 6x6 grid-based puzzles using sun (☀️) and moon (🌑) symbols while following specific constraints and rules.

## ✨ Features

- 🎲 **Daily Puzzles** - Unique daily challenges with consistent generation
- 🎮 **Interactive Interface** - Smooth, responsive gameplay experience
- 📱 **Mobile Optimized** - Fully responsive design for all devices
- 🔄 **Multiple Difficulty Levels** - Easy, Medium, and Hard modes
- ⏱️ **Timer & Statistics** - Track your progress and best times
- 💡 **Smart Hint System** - Get help when you're stuck
- ⌨️ **Keyboard Shortcuts** - Full keyboard navigation support
- 📊 **Game Statistics** - Track wins, completion times, and performance
- 🎯 **Accessibility** - ARIA labels and keyboard-friendly interface
- 💾 **Progress Persistence** - Your stats and preferences are saved locally

## 🎯 How to Play

### Basic Rules
1. **Fill the Grid** - Complete the 6x6 grid with suns (☀️) and moons (🌑)
2. **Balance Symbols** - Each row and column must contain exactly 3 suns and 3 moons
3. **Avoid Triplets** - No more than two identical symbols can be adjacent (horizontally or vertically)
4. **Follow Constraints** - Respect the connection symbols:
   - `=` means connected cells must contain the same symbol
   - `×` means connected cells must contain different symbols

### Difficulty Levels
- **Easy** - More pre-filled cells (6-8), fewer constraints (3-5)
- **Medium** - Balanced challenge (4-6 cells, 5-7 constraints)
- **Hard** - Minimal help (2-4 cells, 7-9 constraints)

### Controls
- **Click** cells to cycle through: Empty → Sun → Moon → Empty
- **Keyboard Shortcuts**:
  - `Ctrl+N` - New Game
  - `Ctrl+H` - Show Hint
  - `Ctrl+Z` - Undo last move
  - `Ctrl+R` - Clear grid
  - `?` - Show rules
  - `Esc` - Close modals

## Development

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation
```bash
# Clone the repository
git clone https://github.com/devdave666/devdave666.github.io.git

# Navigate to project directory
cd devdave666.github.io

# Install dependencies
npm install

# Start development server
npm start
```

### Testing
```bash
npm test
```

## Technologies Used

- HTML5/CSS3
- JavaScript (ES6+)
- Jest for testing
- GitHub Pages for deployment

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Puzzle generation algorithm inspired by classic Sudoku mechanics
- UI/UX design influenced by modern web puzzle games

## Contact

DevDave - [@devdave666](https://github.com/devdave666)

Project Link: [https://github.com/devdave666/devdave666.github.io](https://github.com/devdave666/devdave666.github.io)
