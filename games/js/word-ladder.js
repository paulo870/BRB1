(() => {

    "use strict";


    const $ = id => document.getElementById(id);


    /* =====================================================
       UNIT SELECTION
    ===================================================== */

    const params = new URLSearchParams(window.location.search);

    const unitNumber = Number(
        params.get("unit") ||
        sessionStorage.getItem("poliglotaSelectedGameUnit") ||
        0
    );


    /* =====================================================
       GAME STATE
    ===================================================== */

    const state = {

        unit: 0,

        words: [],

        wordBag: [],

        word: null,

        names: [],

        scores: [],

        round: 0,

        totalRounds: 3,

        turn: 0,

        player: 0,

        guessed: new Set(),

        wrong: 0,

        finished: false

    };


    const MAX_ATTEMPTS = 6;

    const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");



    /* =====================================================
       HELPERS
    ===================================================== */

    function escapeHTML(value) {

        return String(value).replace(/[&<>"']/g, char => ({

            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"

        })[char]);

    }


    function shuffle(items) {

        const copy = [...items];

        for (let i = copy.length - 1; i > 0; i--) {

            const j = Math.floor(Math.random() * (i + 1));

            [copy[i], copy[j]] = [copy[j], copy[i]];

        }

        return copy;

    }


    function setStatus(message, error = false) {

        $("vocab-status").textContent = message;

        $("vocab-status").style.color = error
            ? "#ff938c"
            : "#9fc3c2";

    }



    /* =====================================================
       LOAD WORDS FROM TIPS.TXT
       ORIGINAL VOCABULARY SYSTEM PRESERVED
    ===================================================== */

    async function loadWords(unit) {

        const response = await fetch("data/tips.txt");

        if (!response.ok) {

            throw new Error("Could not load tips.txt");

        }


        const text = await response.text();


        return text.split(/\r?\n/)

            .filter(line =>
                line.trim() &&
                !line.startsWith("#")
            )

            .map(line => {

                const [unitNumber, word, definition] =
                    line.split("|").map(x => x.trim());


                return {

                    unit: Number(unitNumber),

                    word,

                    definition

                };

            })

            .filter(item =>

                item.unit === unit &&
                item.word &&
                item.definition

            );

    }



    /* =====================================================
       INITIALISE GAME
    ===================================================== */

    async function initialise() {

        $("unit-pill").textContent = unitNumber

            ? `UNIT ${String(unitNumber).padStart(2, "0")}`

            : "UNIT NOT SELECTED";


        makePlayerFields();


        $("player-count").addEventListener(
            "change",
            makePlayerFields
        );


        if (!unitNumber) {

            setStatus(
                "No unit selected. Return to the Games Hub and select a unit.",
                true
            );

            return;

        }


        try {

            state.words = await loadWords(unitNumber);


            if (!state.words.length) {

                throw new Error(
                    "No words available for this unit."
                );

            }


            state.unit = unitNumber;


            setStatus(
                `${state.words.length} vocabulary items loaded successfully.`
            );


            $("start-btn").disabled = false;


        } catch (error) {

            console.error(error);

            setStatus(error.message, true);

        }

    }



    /* =====================================================
       PLAYER SETUP
    ===================================================== */

    function makePlayerFields() {

        const count = Number($("player-count").value);


        $("player-fields").innerHTML = Array.from(
            { length: count },
            (_, i) => `

                <label class="player-field">

                    PLAYER ${i + 1}

                    <input
                        class="player-input"
                        id="player-${i}"
                        maxlength="18"
                        autocomplete="off"
                        placeholder="Player ${i + 1}"
                        value="${
                            i === 0
                                ? "Player 1"
                                : i === 1
                                    ? "Player 2"
                                    : ""
                        }"
                    >

                </label>

            `
        ).join("");

    }



    /* =====================================================
       START GAME
    ===================================================== */

    function startGame() {

        const count = Number($("player-count").value);


        state.names = Array.from(
            { length: count },
            (_, i) => {

                return (

                    ($(`player-${i}`).value || "").trim() ||

                    `Player ${i + 1}`

                );

            }
        );


        state.scores = Array(count).fill(0);


        state.totalRounds = Number(
            $("round-count").value
        );


        state.round = 0;

        state.turn = 0;

        state.player = 0;


        // Shuffle the vocabulary.

        state.wordBag = shuffle(state.words);


        $("setup-screen").hidden = true;

        $("game-screen").hidden = false;

        $("result-screen").hidden = true;


        nextTurn();

    }



    /* =====================================================
       SELECT NEXT WORD
    ===================================================== */

    function chooseWord() {

        // Refill the word bag when all words have been used.

        if (!state.wordBag.length) {

            state.wordBag = shuffle(state.words);

        }


        return state.wordBag.pop();

    }



    /* =====================================================
       NEXT PLAYER / ROUND
    ===================================================== */

    function nextTurn() {


        const totalTurns =
            state.totalRounds * state.names.length;


        if (state.turn >= totalTurns) {

            showResults();

            return;

        }


        state.round = Math.floor(

            state.turn / state.names.length

        );


        state.player =

            state.turn % state.names.length;


        state.word = chooseWord();


        state.guessed = new Set();

        state.wrong = 0;

        state.finished = false;


        // Game heading.

        $("round-title").textContent =

            `ROUND ${state.round + 1} / ${state.totalRounds}`;


        $("current-player").textContent =

            `${state.names[state.player]}'S TURN`;


        $("word-progress").textContent =

            `PLAYER ${state.player + 1}`;


        $("score").textContent =

            `${state.scores[state.player]} PTS`;


        // Word information.

        $("hint").textContent = state.word.definition;


        $("feedback").textContent = "";

        $("feedback").className = "";


        $("next-btn").hidden = true;


        $("next-btn").textContent =

            state.turn + 1 >= totalTurns

                ? "SEE RESULTS →"

                : state.player === state.names.length - 1

                    ? "NEXT ROUND →"

                    : "NEXT PLAYER →";


        renderKeyboard();

        renderWord();

        renderLives();

        renderLadder();

        renderScoreboard();

    }



    /* =====================================================
       KEYBOARD
    ===================================================== */

    function renderKeyboard() {

        $("keyboard").innerHTML = LETTERS.map(letter => `

            <button
                type="button"
                data-letter="${letter}"
                ${state.guessed.has(letter) ? "disabled" : ""}
            >

                ${letter}

            </button>

        `).join("");


        $("keyboard").querySelectorAll("button").forEach(button => {

            button.addEventListener("click", () => {

                guess(button.dataset.letter);

            });

        });

    }



    /* =====================================================
       WORD TILES
    ===================================================== */

    function renderWord() {

        const word = state.word.word.toUpperCase();


        $("word-tiles").innerHTML = [...word].map(letter => {


            // Spaces.

            if (letter === " ") {

                return `<div class="tile space-tile"></div>`;

            }


            // Automatically reveal punctuation and numbers.

            if (!/[A-Z]/.test(letter)) {

                return `

                    <div class="tile revealed-tile">

                        ${escapeHTML(letter)}

                    </div>

                `;

            }


            // Regular letters.

            return `

                <div class="tile">

                    ${state.guessed.has(letter) ? escapeHTML(letter) : ""}

                </div>

            `;

        }).join("");

    }



    /* =====================================================
       ATTEMPTS
    ===================================================== */

    function renderLives() {

        $("lives").innerHTML = Array.from(

            { length: MAX_ATTEMPTS },

            (_, i) => `

                <span class="life ${
                    i < state.wrong ? "lost" : ""
                }"></span>

            `

        ).join("");

    }



    /* =====================================================
       LADDER
    ===================================================== */

    function renderLadder() {

        const steps = 5;


        $("ladder").innerHTML = `

            <svg viewBox="0 0 260 160">

                ${Array.from({ length: steps }, (_, i) => {

                    const height = (i + 1) * 22;

                    const x = 20 + i * 42;

                    const y = 145 - height;


                    const active = i < Math.floor(

                        state.guessed.size / 2

                    );


                    return `

                        <rect
                            x="${x}"
                            y="${y}"
                            width="35"
                            height="${height}"
                            rx="4"
                            fill="${
                                active ? "#20b4ad" : "#dcebea"
                            }"
                        />

                    `;

                }).join("")}

            </svg>

        `;

    }



    /* =====================================================
       GUESS LETTER
    ===================================================== */

    function guess(letter) {

        if (state.finished) return;

        if (state.guessed.has(letter)) return;


        state.guessed.add(letter);


        const answer = state.word.word.toUpperCase();


        const button = $("keyboard").querySelector(

            `[data-letter="${letter}"]`

        );


        if (answer.includes(letter)) {

            button.classList.add("good");

        } else {

            button.classList.add("bad");

            state.wrong++;

        }


        button.disabled = true;


        renderWord();

        renderLives();

        renderLadder();


        // Check whether the player has completed the word.

        const won = [...answer].every(char => {

            return (

                !/[A-Z]/.test(char) ||

                state.guessed.has(char)

            );

        });


        if (won) {

            finishWord(true);

        } else if (state.wrong >= MAX_ATTEMPTS) {

            finishWord(false);

        }

    }



    /* =====================================================
       FINISH WORD
    ===================================================== */

    function finishWord(won) {

        state.finished = true;


        let points = 0;


        if (won) {

            points = 120 + (

                MAX_ATTEMPTS - state.wrong

            ) * 20;


            state.scores[state.player] += points;

        }


        $("feedback").className = won

            ? "success"

            : "error";


        $("feedback").textContent = won

            ? `Excellent! +${points} points`

            : `The correct word was: ${state.word.word}`;


        $("score").textContent =

            `${state.scores[state.player]} PTS`;


        $("next-btn").hidden = false;


        // Disable the remaining keyboard buttons.

        $("keyboard").querySelectorAll("button").forEach(button => {

            button.disabled = true;

        });


        renderScoreboard();

    }



    /* =====================================================
       SCOREBOARD
    ===================================================== */

    function renderScoreboard() {

        const ranked = state.names.map((name, i) => ({

            name,

            score: state.scores[i],

            index: i

        })).sort((a, b) => b.score - a.score);


        $("score-list").innerHTML = ranked.map(

            (player, index) => `

                <div class="score-row ${
                    player.index === state.player
                        ? "active-player"
                        : ""
                }">

                    <span class="player-rank">

                        ${index + 1}

                    </span>


                    <span class="player-name">

                        ${escapeHTML(player.name)}

                    </span>


                    <span class="player-score">

                        ${player.score}

                    </span>

                </div>

            `

        ).join("");

    }



    /* =====================================================
       FINAL RESULTS
    ===================================================== */

    function showResults() {

        $("game-screen").hidden = true;

        $("result-screen").hidden = false;


        const ranked = state.names.map((name, i) => ({

            name,

            score: state.scores[i]

        })).sort((a, b) => b.score - a.score);


        $("final-scores").innerHTML = ranked.map(

            (player, index) => `

                <div class="final-row ${
                    index === 0 ? "winner" : ""
                }">

                    <strong>

                        ${index === 0 ? "🏆 " : ""}

                        ${escapeHTML(player.name)}

                    </strong>


                    <span>

                        ${player.score} PTS

                    </span>

                </div>

            `

        ).join("");

    }



    /* =====================================================
       PLAY AGAIN
    ===================================================== */

    function playAgain() {

        $("result-screen").hidden = true;

        $("setup-screen").hidden = false;


        state.scores = [];

        state.wordBag = [];

        state.turn = 0;


        setStatus(

            `${state.words.length} vocabulary items loaded successfully.`

        );

    }



    /* =====================================================
       EVENT LISTENERS
    ===================================================== */

    $("start-btn").addEventListener(

        "click",

        startGame

    );


    $("next-btn").addEventListener("click", () => {

        state.turn++;

        nextTurn();

    });


    $("end-game-btn").addEventListener(

        "click",

        showResults

    );


    $("play-again-btn").addEventListener(

        "click",

        playAgain

    );



    /* =====================================================
       INITIALISE
    ===================================================== */

    initialise();


})();
