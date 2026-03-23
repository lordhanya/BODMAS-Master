<?php
$pageTitle = "BODMAS Master - Learn Order of Operations";
$currentPage = "game";
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="icon" type="image/png" href="assets/images/logo.png">
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
    <?php include 'components/header.php'; ?>
    
    <main class="main-content">
        <section class="game-container">
            <div class="game-header">
                <div class="score-display">
                    <span class="score-label">Score</span>
                    <span class="score-value" id="score">0</span>
                </div>
                <div class="level-display">
                    <span class="level-label">Level</span>
                    <span class="level-value" id="level">1</span>
                </div>
                <div class="streak-display">
                    <span class="streak-label">Streak</span>
                    <span class="streak-value" id="streak">0</span>
                </div>
            </div>

            <div class="bodmas-guide">
                <span class="bodmas-letter" data-priority="1">B</span>
                <span class="bodmas-arrow">→</span>
                <span class="bodmas-letter" data-priority="2">O</span>
                <span class="bodmas-arrow">→</span>
                <span class="bodmas-letter" data-priority="3">D</span>
                <span class="bodmas-arrow">→</span>
                <span class="bodmas-letter" data-priority="4">M</span>
                <span class="bodmas-arrow">→</span>
                <span class="bodmas-letter" data-priority="5">A</span>
                <span class="bodmas-arrow">→</span>
                <span class="bodmas-letter" data-priority="6">S</span>
            </div>

            <div class="selection-counter">
                <div class="selection-dot" id="dot1"></div>
                <div class="selection-dot" id="dot2"></div>
                <div class="selection-dot" id="dot3"></div>
            </div>

            <div class="expression-area" id="expressionArea">
                <div class="expression-container" id="expressionContainer">
                </div>
            </div>

            <div class="feedback-area" id="feedbackArea">
                <div class="feedback-message" id="feedbackMessage">Step 1: Click a NUMBER</div>
            </div>

            <div class="game-controls">
                <button class="btn btn-secondary" id="hintBtn">
                    <span class="btn-icon">💡</span>
                    Hint
                </button>
                <button class="btn btn-primary" id="newGameBtn">
                    <i class="bi bi-arrow-repeat btn-icon"></i>
                    New Game
                </button>
                <button class="btn btn-secondary" id="resetBtn">
                    <i class="bi bi-arrow-counterclockwise btn-icon"></i>
                    Reset
                </button>
            </div>
        </section>

        <aside class="instructions-panel">
            <h2>How to Play</h2>
            <div class="instruction-step">
                <span class="step-number">1</span>
                <p>Click 3 tiles in order: a NUMBER, then a SYMBOL, then another NUMBER (e.g., 8 × 2)</p>
            </div>
            <div class="instruction-step">
                <span class="step-number">2</span>
                <p>Follow BODMAS order: Do × and ÷ first, then + and −</p>
            </div>
            <div class="instruction-step">
                <span class="step-number">3</span>
                <p>Correct answers earn points and merge tiles into result</p>
            </div>
            <div class="instruction-step">
                <span class="step-number">4</span>
                <p>Solve the entire expression to complete the level!</p>
            </div>
            <div class="bodmas-full">
                <h3>BODMAS Rule</h3>
                <ul>
                    <li><strong>B</strong>rackets: ( ), [ ], { }</li>
                    <li><strong>O</strong>rders: Powers, Square Roots</li>
                    <li><strong>D</strong>ivision: ÷</li>
                    <li><strong>M</strong>ultiplication: ×</li>
                    <li><strong>A</strong>ddition: +</li>
                    <li><strong>S</strong>ubtraction: −</li>
                </ul>
            </div>
        </aside>
    </main>

    <?php include 'components/footer.php'; ?>
    
    <div class="modal-overlay" id="aboutModal">
        <div class="modal about-modal">
            <button class="modal-close" id="closeAbout">&times;</button>
            <img src="assets/images/logo.png" alt="BODMAS Master" class="about-logo">
            <h2>About BODMAS Master</h2>
            <p class="about-tagline">Learn Math the Fun Way!</p>
            <div class="about-content">
                <p><strong>BODMAS Master</strong> is an interactive learning game designed to help students understand the correct order of mathematical operations.</p>
                
                <h3>What is BODMAS?</h3>
                <p>BODMAS tells us the right order to solve math problems:</p>
                <ul class="about-list">
                    <li><strong>B</strong> - Brackets (things inside parentheses)</li>
                    <li><strong>O</strong> - Orders (powers and roots)</li>
                    <li><strong>D</strong> - Division</li>
                    <li><strong>M</strong> - Multiplication</li>
                    <li><strong>A</strong> - Addition</li>
                    <li><strong>S</strong> - Subtraction</li>
                </ul>
                
                <h3>How to Play</h3>
                <p>Click a <strong>NUMBER</strong>, then a <strong>SYMBOL</strong>, then another <strong>NUMBER</strong> to solve the expression. Always follow the BODMAS rule - do multiplication and division before addition and subtraction!</p>
                
                <h3>Features</h3>
                <ul class="about-list">
                    <li>Learn BODMAS step by step</li>
                    <li>Fun animations and feedback</li>
                    <li>Track your score and streak</li>
                    <li>Levels that get harder</li>
                </ul>
                
                <p class="about-footer">Made with <i class="bi bi-heart-fill" style="color: #ef4444;"></i> for young learners everywhere.</p>
            </div>
        </div>
    </div>
    
    <script src="assets/js/game.js"></script>
    <script>
        document.getElementById('aboutBtn').addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('aboutModal').classList.add('active');
        });
        document.getElementById('closeAbout').addEventListener('click', function() {
            document.getElementById('aboutModal').classList.remove('active');
        });
        document.getElementById('aboutModal').addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    </script>
</body>
</html>
