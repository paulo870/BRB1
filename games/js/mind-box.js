<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#071b20">

    <title>Mind Box | Academia Poliglota</title>

    <link rel="stylesheet" href="css/mind-box.css">
</head>

<body>

    <main class="app-shell">

        <header class="topbar">

            <div class="brand">
                <span class="brand-mark">P</span>
                <span>POLIGLOTA <b>MINDBOX</b></span>
            </div>

            <div class="unit-pill" id="unit-pill">
                LOADING UNIT…
            </div>

        </header>


        <!-- SETUP SCREEN -->

        <section id="setup-screen" class="screen setup-screen">

            <div class="eyebrow">
                ACADEMIA POLIGLOTA · CLASSROOM GAME
            </div>

            <h1>Ready to <span>think?</span></h1>

            <p class="intro">
                Set up the players and rounds. Challenge your knowledge
                with questions from the selected unit.
            </p>


            <div class="setup-card">

                <div class="setup-grid">

                    <label class="field">

                        <span>NUMBER OF PLAYERS</span>

                        <select id="player-count">

                            <option value="1">1 player</option>
                            <option value="2" selected>2 players</option>
                            <option value="3">3 players</option>
                            <option value="4">4 players</option>

                        </select>

                    </label>


                    <label class="field">

                        <span>NUMBER OF ROUNDS</span>

                        <select id="round-count">

                            <option value="3">3 rounds</option>
                            <option value="5" selected>5 rounds</option>
                            <option value="8">8 rounds</option>

                        </select>

                    </label>

                </div>


                <div id="player-fields" class="player-fields"></div>


                <div class="vocab-status" id="vocab-status">
                    Loading questions...
                </div>


                <button id="start-btn" class="primary-btn" disabled>
                    START GAME <span>→</span>
                </button>

            </div>

        </section>


        <!-- GAME SCREEN -->

        <section id="game-screen" class="screen game-screen" hidden>

            <div class="game-heading">

                <div>

                    <div class="eyebrow">MIND BOX CHALLENGE</div>

                    <h1 id="round-title">ROUND 1 / 5</h1>

                </div>

                <button class="quiet-btn" id="end-game-btn">
                    Finish game
                </button>

            </div>


            <div class="game-layout">

                <!-- QUESTION PANEL -->

                <section class="question-panel">

                    <div class="question-top">

                        <div class="brain-icon">
                            🧠
                        </div>

                        <div class="question-progress">

                            <div id="question-number">
                                QUESTION 1 / 10
                            </div>

                            <div class="progress-bar">
                                <div id="progress"></div>
                            </div>

                            <strong id="score">0 POINTS</strong>

                        </div>

                    </div>


                    <div id="current-player" class="current-player">
                        PLAYER'S TURN
                    </div>


                    <div id="question" class="question-text"></div>


                    <div id="options" class="options"></div>


                    <div id="feedback" class="feedback"></div>


                    <button
                        id="next-btn"
                        class="primary-btn next-btn"
                        hidden
                    >
                        NEXT TURN →
                    </button>

                </section>


                <!-- SCOREBOARD -->

                <aside class="score-panel">

                    <div class="score-head">

                        <div>

                            <div class="eyebrow">LIVE SCORE</div>

                            <h2>Scoreboard</h2>

                        </div>

                        <span class="score-unit">
                            +100 PTS
                        </span>

                    </div>


                    <div id="score-list" class="score-list"></div>


                    <div class="score-note">
                        Each correct answer earns 100 points.
                        The player with the highest score wins.
                    </div>

                </aside>

            </div>

        </section>


        <!-- RESULTS SCREEN -->

        <section id="result-screen" class="screen result-screen" hidden>

            <div class="eyebrow">GAME COMPLETE</div>

            <h1>That's a <span>wrap!</span></h1>

            <p class="intro">
                Final scores for this Mind Box challenge.
            </p>

            <div id="final-scores" class="final-scores"></div>

            <button class="primary-btn" id="play-again-btn">
                PLAY AGAIN ↻
            </button>

        </section>

    </main>


    <script src="js/mind-box.js"></script>

</body>
</html>
