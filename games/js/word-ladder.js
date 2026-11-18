(() => {

    "use strict";

    const $ = id => document.getElementById(id);

    const state = {
        unit: 0,
        words: [],
        index: 0,
        word: null,
        guessed: new Set(),
        wrong: 0,
        score: 0,
        finished: false
    };

    const MAX_ATTEMPTS = 6;

    const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");


    async function loadWords(unit) {

        const response = await fetch("data/tips.txt");

        if (!response.ok) {
            throw new Error("Could not load tips.txt");
        }

        const text = await response.text();

        return text.split(/\r?\n/)
            .filter(line => line.trim() && !line.startsWith("#"))
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


    async function startGame() {

        const unit = Number($("unit-select").value);

        if (!unit) {
            $("status").textContent = "Select a unit first.";
            return;
        }

        $("status").textContent = "Loading vocabulary...";

        try {

            state.words = await loadWords(unit);

            if (!state.words.length) {
                throw new Error("No words available for this unit.");
            }

            state.unit = unit;
            state.index = 0;
            state.score = 0;

            $("setup-screen").hidden = true;
            $("game-screen").hidden = false;

            nextWord();

        } catch (error) {

            $("status").textContent = error.message;

        }

    }


    function nextWord() {

        if (state.index >= state.words.length) {
            showResults();
            return;
        }

        state.word = state.words[state.index];

        state.guessed = new Set();
        state.wrong = 0;
        state.finished = false;

        $("unit-label").textContent =
            `UNIT ${String(state.unit).padStart(2, "0")}`;

        $("word-progress").textContent =
            `WORD ${state.index + 1} / ${state.words.length}`;

        $("score").textContent = `${state.score} PTS`;

        $("hint").textContent = state.word.definition;

        $("feedback").textContent = "";

        $("next-btn").hidden = true;

        renderKeyboard();
        renderWord();
        renderLives();
        renderLadder();

    }


    function renderKeyboard() {

        $("keyboard").innerHTML = LETTERS.map(letter => `

            <button
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


    function renderWord() {

        const word = state.word.word.toUpperCase();

        $("word-tiles").innerHTML = [...word].map(letter => {

            if (letter === " ") {
                return `<div class="tile"></div>`;
            }

            return `

                <div class="tile">

                    ${state.guessed.has(letter) ? escapeHTML(letter) : ""}

                </div>

            `;

        }).join("");

    }


    function renderLives() {

        $("lives").innerHTML = Array.from(
            { length: MAX_ATTEMPTS },
            (_, i) => `
                <span class="life ${i < state.wrong ? "lost" : ""}"></span>
            `
        ).join("");

    }


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
                            fill="${active ? "#03aaa2" : "#dcebea"}"
                        />

                    `;

                }).join("")}

            </svg>

        `;

    }


    function guess(letter) {

        if (state.finished) return;

        if (state.guessed.has(letter)) return;

        state.guessed.add(letter);

        const answer = state.word.word
            .toUpperCase();

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

        const won = [...answer].every(
            char => char === " " || state.guessed.has(char)
        );

        if (won) {

            state.score += 120 + (
                MAX_ATTEMPTS - state.wrong
            ) * 20;

            finishWord(true);

        } else if (state.wrong >= MAX_ATTEMPTS) {

            finishWord(false);

        }

    }


    function finishWord(won) {

        state.finished = true;

        $("feedback").className = won
            ? "success"
            : "error";

        $("feedback").textContent = won
            ? `Excellent! +${120 + (MAX_ATTEMPTS - state.wrong) * 20} points`
            : `The correct word was: ${state.word.word}`;

        $("score").textContent = `${state.score} PTS`;

        $("next-btn").hidden = false;

        $("keyboard").querySelectorAll("button").forEach(button => {
            button.disabled = true;
        });

    }


    function showResults() {

        $("game-screen").hidden = true;
        $("result-screen").hidden = false;

        $("final-result").innerHTML = `

            <h3>Unit ${state.unit}</h3>

            <div class="final-score">
                ${state.score} POINTS
            </div>

            <p>
                Words completed: ${state.words.length}
            </p>

        `;

    }


    function escapeHTML(value) {

        return String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);

    }


    $("start-btn").addEventListener(
        "click",
        startGame
    );

    $("next-btn").addEventListener("click", () => {

        state.index++;

        nextWord();

    });

})();
