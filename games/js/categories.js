(() => {

    "use strict";

    const $ = id => document.getElementById(id);

    const CATEGORIES = [
        "name",
        "place",
        "animal",
        "object",
        "food"
    ];

    const LETTERS = "ABCDEMPST".split("");

    const state = {
        players: [],
        scores: [],
        round: 0,
        maxRounds: 3,
        letter: "",
        usedLetters: [],
        timer: null,
        answers: []
    };


    function showScreen(id) {

        [
            "setup-screen",
            "game-screen",
            "validation-screen",
            "results-screen"
        ].forEach(screen => {
            $(screen).hidden = screen !== id;
        });

    }


    function makePlayerFields() {

        const count = Number($("player-count").value);

        $("player-fields").innerHTML = Array.from(
            { length: count },
            (_, i) => `
                <label>
                    PLAYER ${i + 1}

                    <input
                        id="player-${i}"
                        maxlength="18"
                        value="Player ${i + 1}"
                    >
                </label>
            `
        ).join("");

    }


    function chooseLetter() {

        const available = LETTERS.filter(
            letter => !state.usedLetters.includes(letter)
        );

        if (!available.length) {
            state.usedLetters = [];
            return chooseLetter();
        }

        const letter = available[
            Math.floor(Math.random() * available.length)
        ];

        state.usedLetters.push(letter);

        return letter;

    }


    function startGame() {

        const count = Number($("player-count").value);

        state.players = Array.from(
            { length: count },
            (_, i) => (
                $("player-" + i).value.trim() ||
                `Player ${i + 1}`
            )
        );

        state.scores = Array(count).fill(0);

        state.round = 0;

        state.usedLetters = [];

        startRound();

    }


    function startRound() {

        clearInterval(state.timer);

        state.round++;

        state.letter = chooseLetter();

        state.answers = [];

        $("current-letter").textContent = state.letter;

        document.querySelectorAll(
            ".categories-grid input"
        ).forEach(input => {
            input.value = "";
        });

        showScreen("game-screen");

        let remaining = Number($("round-duration").value);

        $("timer").textContent = remaining;

        state.timer = setInterval(() => {

            remaining--;

            $("timer").textContent = remaining;

            if (remaining <= 0) {
                finishRound();
            }

        }, 1000);

    }


    function finishRound() {

        clearInterval(state.timer);

        state.answers = state.players.map((player, index) => {

            const answers = {};

            CATEGORIES.forEach(category => {

                const input = document.querySelector(
                    `#game-screen .categories-grid input[data-category="${category}"]`
                );

                answers[category] = input.value.trim();

            });

            return {
                player,
                answers
            };

        });

        /*
          The first version uses one shared answer sheet.
          Players take turns entering their answers.
        */

        showValidation();

    }


    function showValidation() {

        const content = $("validation-content");

        content.innerHTML = state.players.map(
            (player, index) => `

                <div class="validation-player">

                    <h3>${escapeHTML(player)}</h3>

                    ${CATEGORIES.map(category => `

                        <div class="validation-row">

                            <span>
                                ${category.toUpperCase()}:
                                <b>${escapeHTML(
                                    state.answers[index].answers[category]
                                )}</b>
                            </span>

                            <label>
                                <input
                                    type="checkbox"
                                    class="valid-answer"
                                    data-player="${index}"
                                    data-category="${category}"
                                >
                            </label>

                        </div>

                    `).join("")}

                </div>

            `
        ).join("");

        showScreen("validation-screen");

    }


    function calculateScores() {

        document.querySelectorAll(
            ".valid-answer:checked"
        ).forEach(input => {

            const player = Number(input.dataset.player);

            const category = input.dataset.category;

            const answer = state.answers[player].answers[category];

            const duplicate = state.answers.some(
                (other, index) => (
                    index !== player &&
                    other.answers[category].toLowerCase() ===
                    answer.toLowerCase()
                )
            );

            state.scores[player] += duplicate ? 50 : 100;

        });

    }


    function nextRound() {

        calculateScores();

        if (state.round >= state.maxRounds) {
            showResults();
        } else {
            startRound();
        }

    }


    function showResults() {

        const ranking = state.players
            .map((player, index) => ({
                player,
                score: state.scores[index]
            }))
            .sort((a, b) => b.score - a.score);

        $("results-content").innerHTML = ranking.map(
            (item, index) => `
                <div class="result-player">
                    <span>${index + 1}. ${escapeHTML(item.player)}</span>
                    <span>${item.score} pts</span>
                </div>
            `
        ).join("");

        showScreen("results-screen");

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


    $("player-count").addEventListener(
        "change",
        makePlayerFields
    );

    $("start-btn").addEventListener(
        "click",
        startGame
    );

    $("finish-btn").addEventListener(
        "click",
        finishRound
    );

    $("next-round-btn").addEventListener(
        "click",
        nextRound
    );

    makePlayerFields();

})();
