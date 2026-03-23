(function() {
    'use strict';

    const BODMAS_PRIORITY = {
        '(': 0, ')': 0,
        '^': 1,
        '*': 2, '/': 2,
        '+': 3, '-': 3
    };

    class SoundManager {
        constructor() {
            this.audioContext = null;
            this.enabled = true;
        }

        init() {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('Web Audio API not supported');
                this.enabled = false;
            }
        }

        playTone(frequency, duration, type = 'sine', volume = 0.3) {
            if (!this.enabled || !this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;
            gainNode.gain.value = volume;

            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            oscillator.stop(this.audioContext.currentTime + duration);
        }

        playCorrect() {
            if (!this.audioContext) this.init();
            if (!this.enabled) return;

            this.playTone(523, 0.1, 'sine', 0.2);
            setTimeout(() => this.playTone(659, 0.1, 'sine', 0.2), 100);
            setTimeout(() => this.playTone(784, 0.2, 'sine', 0.25), 200);
        }

        playWrong() {
            if (!this.audioContext) this.init();
            if (!this.enabled) return;

            this.playTone(200, 0.15, 'square', 0.15);
            setTimeout(() => this.playTone(150, 0.3, 'square', 0.15), 150);
        }

        playVictory() {
            if (!this.audioContext) this.init();
            if (!this.enabled) return;

            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.2), i * 150);
            });
        }

        playClick() {
            if (!this.audioContext) this.init();
            if (!this.enabled) return;

            this.playTone(400, 0.05, 'sine', 0.1);
        }

        playMerge() {
            if (!this.audioContext) this.init();
            if (!this.enabled) return;

            this.playTone(300, 0.1, 'triangle', 0.15);
            setTimeout(() => this.playTone(450, 0.15, 'triangle', 0.2), 80);
        }
    }

    const soundManager = new SoundManager();

    class BodmasGame {
        constructor() {
            this.expressionContainer = document.getElementById('expressionContainer');
            this.scoreElement = document.getElementById('score');
            this.levelElement = document.getElementById('level');
            this.streakElement = document.getElementById('streak');
            this.feedbackMessage = document.getElementById('feedbackMessage');
            this.hintBtn = document.getElementById('hintBtn');
            this.newGameBtn = document.getElementById('newGameBtn');
            this.resetBtn = document.getElementById('resetBtn');

            this.tiles = [];
            this.selectedTiles = [];
            this.draggedTiles = [];
            this.score = 0;
            this.level = 1;
            this.streak = 0;
            this.maxStreak = 0;
            this.currentExpression = [];
            this.correctSteps = 0;
            this.totalSteps = 0;
            this.initialExpression = [];

            this.init();
        }

        init() {
            this.bindEvents();
            this.newGame();
        }

        bindEvents() {
            this.hintBtn.addEventListener('click', () => this.showHint());
            this.newGameBtn.addEventListener('click', () => this.newGame());
            this.resetBtn.addEventListener('click', () => this.resetLevel());
        }

        generateExpression() {
            const level = this.level;
            let numbers = [];
            let operators = [];

            const count = Math.min(2 + level, 5);

            for (let i = 0; i < count; i++) {
                numbers.push(Math.floor(Math.random() * 10) + 2);
            }

            for (let i = 0; i < count - 1; i++) {
                if (i % 2 === 0 && level > 1) {
                    operators.push(Math.random() > 0.5 ? '*' : '/');
                } else {
                    operators.push(Math.random() > 0.5 ? '+' : '-');
                }
            }

            let expr = [];
            for (let i = 0; i < numbers.length; i++) {
                expr.push(numbers[i]);
                if (i < operators.length) {
                    expr.push(operators[i]);
                }
            }

            return expr;
        }

        calculate(a, operator, b) {
            switch (operator) {
                case '+': return a + b;
                case '-': return a - b;
                case '*': return a * b;
                case '/': return b !== 0 ? a / b : null;
                default: return null;
            }
        }

        findNextOperation(expr) {
            let highestPriority = 4;
            let opIndex = -1;

            for (let i = 0; i < expr.length; i++) {
                if (typeof expr[i] === 'string' && BODMAS_PRIORITY[expr[i]] !== undefined) {
                    const priority = BODMAS_PRIORITY[expr[i]];
                    if (priority < highestPriority) {
                        highestPriority = priority;
                        opIndex = i;
                    }
                }
            }

            return opIndex;
        }

        renderExpression() {
            this.expressionContainer.innerHTML = '';
            this.tiles = [];
            this.selectedTiles = [];

            this.currentExpression.forEach((item, index) => {
                const tile = this.createTile(item, index);
                this.expressionContainer.appendChild(tile);
                this.tiles.push(tile);
            });

            this.updateBODMASGuide();
        }

        createTile(value, index) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.index = index;
            tile.dataset.value = value;
            tile.draggable = true;

            if (typeof value === 'number') {
                tile.textContent = value;
                tile.classList.add('tile-number');
            } else {
                tile.textContent = this.formatOperator(value);
                tile.dataset.operator = value;
                tile.classList.add('tile-operator');
            }

            tile.addEventListener('click', (e) => this.handleTileClick(e, tile));
            tile.addEventListener('dragstart', (e) => this.handleDragStart(e, tile));
            tile.addEventListener('dragend', (e) => this.handleDragEnd(e, tile));
            tile.addEventListener('dragover', (e) => this.handleDragOver(e));
            tile.addEventListener('drop', (e) => this.handleDrop(e, tile));
            tile.addEventListener('dragleave', (e) => this.handleDragLeave(e));

            return tile;
        }

        formatOperator(op) {
            const formats = {
                '+': '+',
                '-': '−',
                '*': '×',
                '/': '÷'
            };
            return formats[op] || op;
        }

        handleTileClick(e, tile) {
            e.preventDefault();
            const index = parseInt(tile.dataset.index);
            const value = this.currentExpression[index];
            const isNumber = typeof value === 'number';
            const isOperator = typeof value === 'string';

            if (this.selectedTiles.includes(index)) {
                this.deselectTile(index);
                return;
            }

            if (this.selectedTiles.length === 3) {
                this.clearSelection();
            }

            const expectedType = this.getExpectedType(this.selectedTiles.length);
            const clickedType = isNumber ? 'number' : 'symbol';

            if (expectedType && clickedType !== expectedType) {
                this.showSequenceError(expectedType, clickedType);
                return;
            }

            this.selectTile(tile, index);
            this.updateFeedback();

            if (this.selectedTiles.length === 3) {
                this.attemptOperation();
            }
        }

        getExpectedType(position) {
            const sequence = ['number', 'symbol', 'number'];
            return sequence[position];
        }

        showSequenceError(expected, clicked) {
            const clickedLabel = clicked === 'number' ? 'a number' : 'a symbol (+, −, ×, ÷)';
            const expectedLabel = expected === 'number' ? 'a NUMBER' : 'a SYMBOL (+, −, ×, ÷)';
            this.showFeedback(`Oops! Pick ${expectedLabel} next. You picked ${clickedLabel}.`, 'error');
            
            setTimeout(() => {
                this.showFeedback('Step 1: Click a NUMBER', '');
            }, 2500);
        }

        selectTile(tile, index) {
            soundManager.playClick();
            this.selectedTiles.push(index);
            tile.classList.add('selected');
            this.tiles[index] = tile;
            this.updateSelectionDots();
        }

        deselectTile(index) {
            const tile = this.tiles[index];
            if (tile) {
                tile.classList.remove('selected');
            }
            this.selectedTiles = this.selectedTiles.filter(i => i !== index);
            this.updateFeedback();
            this.updateSelectionDots();
        }

        clearSelection() {
            this.selectedTiles.forEach(i => {
                const tile = this.tiles[i];
                if (tile) tile.classList.remove('selected');
            });
            this.selectedTiles = [];
            this.updateFeedback();
            this.updateSelectionDots();
        }

        updateSelectionDots() {
            for (let i = 1; i <= 3; i++) {
                const dot = document.getElementById(`dot${i}`);
                if (dot) {
                    dot.classList.remove('active', 'complete');
                    if (i <= this.selectedTiles.length) {
                        dot.classList.add(i === 3 ? 'complete' : 'active');
                    }
                }
            }
        }

        updateFeedback() {
            if (this.selectedTiles.length === 0) {
                this.showFeedback('Step 1: Click a NUMBER', '');
            } else if (this.selectedTiles.length === 1) {
                this.showFeedback(`Step 2: Click a SYMBOL (+, −, ×, ÷)`, '');
            } else if (this.selectedTiles.length === 2) {
                this.showFeedback(`Step 3: Click another NUMBER`, '');
            }
        }

        getDisplay(val) {
            return typeof val === 'number' ? val : this.formatOperator(val);
        }

        attemptOperation() {
            const [idx1, idx2, idx3] = this.selectedTiles.sort((a, b) => a - b);
            const val1 = this.currentExpression[idx1];
            const val2 = this.currentExpression[idx2];
            const val3 = this.currentExpression[idx3];

            if (typeof val1 !== 'number' || typeof val2 !== 'string' || typeof val3 !== 'number') {
                this.showFeedback('Pick: NUMBER, SYMBOL, NUMBER', 'error');
                this.shakeSelection();
                this.clearSelection();
                return;
            }

            const correctOpIdx = this.findNextOperation(this.currentExpression);

            if (correctOpIdx === -1) {
                this.showFeedback('Expression is complete!', 'success');
                this.clearSelection();
                return;
            }

            const correctNumIdx = correctOpIdx - 1;
            const correctNum1 = this.currentExpression[correctNumIdx];
            const correctNum2 = this.currentExpression[correctOpIdx + 1];
            const correctOp = this.currentExpression[correctOpIdx];

            if (idx1 === correctNumIdx && idx2 === correctOpIdx && idx3 === correctOpIdx + 1) {
                if (val1 === correctNum1 && val2 === correctOp && val3 === correctNum2) {
                    this.handleCorrectOperation(idx1, idx2, idx3, val1, val2, val3);
                } else {
                    this.showWrongOperation(correctOpIdx, correctNumIdx);
                }
            } else {
                this.showWrongOperation(correctOpIdx, correctNumIdx);
            }
        }

        handleCorrectOperation(idx1, idx2, idx3, num1, operator, num2) {
            const result = this.calculate(num1, operator, num2);

            if (result === null) {
                this.showFeedback('Cannot divide by zero!', 'error');
                return;
            }

            this.highlightCorrect(idx1, idx2, idx3);
            soundManager.playCorrect();

            setTimeout(() => {
                this.mergeTiles(idx1, idx3, result);
                soundManager.playMerge();
                this.updateScore(true);
                this.correctSteps++;
                this.totalSteps++;
                this.clearSelection();

                if (this.currentExpression.length === 1) {
                    this.levelComplete();
                } else {
                    this.showFeedback(`Correct! ${num1} ${this.formatOperator(operator)} ${num2} = ${result}`, 'success');
                }

                this.updateBODMASGuide();
            }, 500);
        }

        highlightCorrect(...indices) {
            indices.forEach(i => {
                const tile = this.tiles[i];
                if (tile) tile.classList.add('correct');
            });
        }

        showWrongOperation(correctOpIdx, correctNumIdx) {
            this.shakeSelection();
            soundManager.playWrong();
            this.updateScore(false);
            this.streak = 0;
            this.updateStreak();

            if (correctOpIdx !== -1) {
                const num1 = this.currentExpression[correctNumIdx];
                const op = this.currentExpression[correctOpIdx];
                const num2 = this.currentExpression[correctOpIdx + 1];
                this.showFeedback(`Wrong! Try: ${num1} ${this.formatOperator(op)} ${num2} first (BODMAS)`, 'error');
            } else {
                this.showFeedback('Try again!', 'error');
            }

            setTimeout(() => {
                this.selectedTiles.forEach(i => {
                    const tile = this.tiles[i];
                    if (tile) tile.classList.remove('wrong');
                });
                this.clearSelection();
            }, 800);
        }

        shakeSelection() {
            this.selectedTiles.forEach(i => {
                const tile = this.tiles[i];
                if (tile) tile.classList.add('wrong');
            });
        }

        mergeTiles(leftIdx, rightIdx, result) {
            this.currentExpression.splice(leftIdx, rightIdx - leftIdx + 1, Math.round(result * 100) / 100);
            this.renderExpression();
        }

        updateBODMASGuide() {
            const bodmasLetters = document.querySelectorAll('.bodmas-letter');
            bodmasLetters.forEach(letter => letter.classList.remove('active', 'completed'));

            const correctOpIdx = this.findNextOperation(this.currentExpression);

            if (correctOpIdx === -1) {
                bodmasLetters.forEach(letter => letter.classList.add('completed'));
                return;
            }

            const currentOp = this.currentExpression[correctOpIdx];

            if (currentOp === '*' || currentOp === '/') {
                const mIdx = document.querySelector('[data-priority="4"]');
                const dIdx = document.querySelector('[data-priority="3"]');
                if (mIdx) mIdx.classList.add('active');
                if (dIdx) dIdx.classList.add('active');
            } else if (currentOp === '+' || currentOp === '-') {
                const aIdx = document.querySelector('[data-priority="5"]');
                const sIdx = document.querySelector('[data-priority="6"]');
                if (aIdx) aIdx.classList.add('active');
                if (sIdx) sIdx.classList.add('active');
            }
        }

        showFeedback(message, type) {
            this.feedbackMessage.textContent = message;
            this.feedbackMessage.className = 'feedback-message';
            if (type) this.feedbackMessage.classList.add(type);
        }

        updateScore(correct) {
            if (correct) {
                const basePoints = 10 * this.level;
                const streakBonus = Math.min(this.streak * 5, 50);
                this.score += basePoints + streakBonus;
                this.streak++;
                if (this.streak > this.maxStreak) this.maxStreak = this.streak;
            }
            this.scoreElement.textContent = this.score;
            this.updateStreak();
        }

        updateStreak() {
            this.streakElement.textContent = this.streak;
        }

        showHint() {
            const correctOpIdx = this.findNextOperation(this.currentExpression);

            if (correctOpIdx === -1) {
                this.showFeedback('Expression is complete!', 'success');
                return;
            }

            const numIdx = correctOpIdx - 1;
            const num1 = this.currentExpression[numIdx];
            const op = this.currentExpression[correctOpIdx];
            const num2 = this.currentExpression[correctOpIdx + 1];

            this.showFeedback(`Hint: Calculate ${num1} ${this.formatOperator(op)} ${num2}`, '');

            [numIdx, correctOpIdx, correctOpIdx + 1].forEach(i => {
                const tile = this.tiles[i];
                if (tile) {
                    tile.classList.add('selected');
                    setTimeout(() => tile.classList.remove('selected'), 2000);
                }
            });
        }

        handleDragStart(e, tile) {
            const index = parseInt(tile.dataset.index);
            this.draggedTiles = [index];
            tile.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        }

        handleDragEnd(e, tile) {
            tile.classList.remove('dragging');
            this.draggedTiles = [];
        }

        handleDragOver(e) {
            e.preventDefault();
        }

        handleDrop(e, targetTile) {
            e.preventDefault();
            const targetIndex = parseInt(targetTile.dataset.index);
            
            if (this.draggedTiles.includes(targetIndex)) {
                return;
            }

            if (this.draggedTiles.length > 0) {
                const sourceIndex = this.draggedTiles[0];
                
                if (this.selectedTiles.includes(sourceIndex)) {
                    this.deselectTile(sourceIndex);
                }

                if (!this.selectedTiles.includes(targetIndex)) {
                    this.selectTile(targetTile, targetIndex);
                }
            }
        }

        handleDragLeave(e) {
        }

        levelComplete() {
            const levelBonus = this.level * 50;
            const accuracy = this.correctSteps / Math.max(this.totalSteps, 1);
            const accuracyBonus = Math.round(accuracy * 100);
            this.score += levelBonus + accuracyBonus;
            this.level++;
            this.levelElement.textContent = this.level;
            this.scoreElement.textContent = this.score;

            setTimeout(() => this.showVictoryModal(), 500);
        }

        showVictoryModal() {
            soundManager.playVictory();
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay active';
            overlay.innerHTML = `
                <div class="modal">
                    <div class="modal-icon">🎉</div>
                    <h2>Level Complete!</h2>
                    <p>Great job! Ready for a harder challenge?</p>
                    <div class="modal-stats">
                        <div class="modal-stat">
                            <div class="modal-stat-value">${this.level - 1}</div>
                            <div class="modal-stat-label">Level</div>
                        </div>
                        <div class="modal-stat">
                            <div class="modal-stat-value">${this.score}</div>
                            <div class="modal-stat-label">Score</div>
                        </div>
                    </div>
                    <button class="btn btn-primary" id="nextLevelBtn">Next Level</button>
                </div>
            `;
            document.body.appendChild(overlay);

            document.getElementById('nextLevelBtn').addEventListener('click', () => {
                overlay.remove();
                this.newGame();
            });

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                    this.newGame();
                }
            });
        }

        newGame() {
            this.currentExpression = this.generateExpression();
            this.initialExpression = [...this.currentExpression];
            this.correctSteps = 0;
            this.totalSteps = 0;
            this.renderExpression();
            this.showFeedback('Step 1: Click a NUMBER', '');
        }

        resetLevel() {
            this.currentExpression = [...this.initialExpression];
            this.correctSteps = 0;
            this.totalSteps = 0;
            this.streak = 0;
            this.renderExpression();
            this.showFeedback('Level reset! Step 1: Click a NUMBER', '');
            this.updateStreak();
        }
    }

    let game;
    document.addEventListener('DOMContentLoaded', () => {
        game = new BodmasGame();
    });

})();
