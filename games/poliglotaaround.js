(() => {

    "use strict";

    const $ = (id) => document.getElementById(id);

    const params = new URLSearchParams(window.location.search);

    const unitNumber = Number(
        params.get("unit") ||
        sessionStorage.getItem("poliglotaSelectedGameUnit") ||
        0
    );


    const state = {

        unit: null,

        names: [],

        scores: [],

        roundPoints: [],

        round: 0,

        totalRounds: 3,

        words: [],

        colour: null,

        showingWords: false,

        previousColour: null

    };


    const COLOURS = [

        {
            key: "black",
            label: "BLACK",
            hex: "#111111",
            ring: "outer / longest word"
        },

        {
            key: "teal",
            label: "TEAL",
            hex: "#20b4ad",
            ring: "middle word"
        },

        {
            key: "red",
            label: "RED",
            hex: "#ff4136",
            ring: "inner / shortest word"
        }

    ];


    /* =====================================================
       GENERAL HELPERS
    ===================================================== */

    function escapeHTML(value) {

        return String(value).replace(/[&<>"]/g, ch => ({

            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;"

        }[ch]));

    }


    function shuffle(items) {

        const copy = [...items];

        for (let i = copy.length - 1; i > 0; i--) {

            const j = Math.floor(Math.random() * (i + 1));

            [copy[i], copy[j]] = [copy[j], copy[i]];

        }

        return copy;

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


    function setStatus(message, isError = false) {

        $("vocab-status").textContent = message;

        $("vocab-status").style.color = isError
            ? "#ff938c"
            : "#9fc3c2";

    }


    /* =====================================================
       LOAD UNIT VOCABULARY
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


        if (!unitNumber || !window.GameVocabulary) {

            setStatus(
                "Unit or vocabulary system not found. Return to the Games Hub and select a unit.",
                true
            );

            return;

        }


        try {

            state.unit = await window.GameVocabulary.loadUnit(
                unitNumber
            );

            setStatus(
                `${state.unit.title} · ${state.unit.words.length} vocabulary items loaded.`
            );


            if (state.unit.words.length < 3) {

                setStatus(
                    "This unit needs at least 3 vocabulary items to play.",
                    true
                );

                return;

            }


            $("start-btn").disabled = false;

        } catch (error) {

            console.error(error);

            setStatus(
                error.message || "Could not load this unit's vocabulary.",
                true
            );

        }

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

        state.roundPoints = Array(count).fill(0);

        state.totalRounds = Number($("round-count").value);

        state.round = 0;

        state.previousColour = null;


        $("setup-screen").hidden = true;

        $("result-screen").hidden = true;

        $("game-screen").hidden = false;


        nextRound(true);

    }


    /* =====================================================
       WORD SELECTION
    ===================================================== */

    function chooseWords() {

        const words = shuffle(state.unit.words);

        return words.slice(0, 3);

    }


    /* =====================================================
       COLOUR SELECTION
    ===================================================== */

    function chooseColour() {

        const options = COLOURS.filter(
            colour => colour.key !== state.previousColour
        );

        const picked = options[
            Math.floor(Math.random() * options.length)
        ];

        state.previousColour = picked.key;

        return picked;

    }


    /* =====================================================
       CARD GRAPHICS
    ===================================================== */

    function pMark() {

        return `
            <text
                x="200"
                y="207"
                text-anchor="middle"
                dominant-baseline="central"
                font-family="Manrope,Arial,sans-serif"
                font-size="88"
                font-weight="900"
                fill="#20b4ad"
                stroke="#c7d2d2"
                stroke-width="2"
                paint-order="stroke"
            >P</text>
        `;

    }


    function renderColourCard() {

        $("colour-face").innerHTML = `

            <div
                class="colour-disc"
                style="background:${state.colour.hex}"
            >

                <span class="p-mark">P</span>

            </div>

        `;

    }


    /* =====================================================
       WORD WHEEL
    ===================================================== */

    function renderWordWheel() {

        const sorted = [...state.words].sort(
            (a, b) => a.length - b.length
        );


        const rings = [

            {
                word: sorted[2],
                radius: 169,
                font: 23
            },

            {
                word: sorted[1],
                radius: 128,
                font: 21
            },

            {
                word: sorted[0],
                radius: 87,
                font: 19
            }

        ];


        let svg = `

            <svg
                class="words-svg"
                viewBox="0 0 400 400"
                role="img"
                aria-label="Three vocabulary words arranged in a spiral"
            >

                <circle cx="200" cy="200" r="195" fill="#111"/>

                <circle cx="200" cy="200" r="151" fill="#20b4ad"/>

                <circle cx="200" cy="200" r="108" fill="#ff4136"/>

                <circle cx="200" cy="200" r="63" fill="#fff"/>

        `;


        rings.forEach(ring => {

            const chars = [...ring.word.toUpperCase()];

            const visible = chars.length > 22
                ? chars.slice(0, 22)
                : chars;

            const step = 360 / Math.max(visible.length, 1);

            const offset = Math.random() * 360;


            visible.forEach((char, i) => {

                const angle = offset + i * step;

                svg += `

                    <text
                        x="200"
                        y="${200 - ring.radius}"
                        fill="#fff"
                        font-family="Manrope,Arial,sans-serif"
                        font-size="${ring.font}"
                        font-weight="800"
                        text-anchor="middle"
                        dominant-baseline="central"
                        transform="rotate(${angle} 200 200)"
                    >${escapeHTML(char === " " ? "·" : char)}</text>

                `;

            });

        });


        svg += pMark() + "</svg>";

        $("words-face").innerHTML = svg;

    }


    /* =====================================================
       FLIP CARD
    ===================================================== */

    function setFlip(showWords) {

        state.showingWords = showWords;

        $("flip-card").classList.toggle(
            "flipped",
            showWords
        );

        $("flip-btn").textContent = showWords
            ? "SHOW COLOUR CARD"
            : "REVEAL THREE WORDS";


        if (showWords) {

            const wheel = $("words-face").querySelector(
                ".words-svg"
            );

            if (wheel) {

                wheel.style.transition =
                    "transform 1.7s cubic-bezier(.17,.67,.2,1)";

                wheel.style.transform =
                    `rotate(${720 + Math.floor(Math.random() * 360)}deg)`;

            }

        } else {

            const wheel = $("words-face").querySelector(
                ".words-svg"
            );

            if (wheel) {

                wheel.style.transition = "none";

                wheel.style.transform = "rotate(0deg)";

            }

        }


        $("instruction").textContent = showWords

            ? "Read the three words aloud. The colour tells you which word to identify."

            : "Look at the colour card, then reveal the three words.";

    }


    /* =====================================================
       ANSWER
    ===================================================== */

    function answerHTML() {

        const sorted = [...state.words].sort(
            (a, b) => a.length - b.length
        );


        const byKey = {

            red: sorted[0],

            teal: sorted[1],

            black: sorted[2]

        };


        return `

            <strong>
                ${state.colour.label} →
                ${escapeHTML(byKey[state.colour.key])}
            </strong>

            <br>

            <span>${state.colour.ring}</span>

        `;

    }


    /* =====================================================
       SCOREBOARD
    ===================================================== */

    function renderScoreboard() {

        $("score-list").innerHTML = state.names.map(
            (name, i) => `

                <div class="score-row">

                    <span class="player-name">
                        ${escapeHTML(name)}
                    </span>

                    <span
                        class="player-score"
                        id="score-${i}"
                    >
                        ${state.scores[i]}
                    </span>

                    <span class="score-actions">

                        <button
                            type="button"
                            class="minus"
                            data-player="${i}"
                            aria-label="Remove 100 points"
                            disabled
                        >−</button>

                        <button
                            type="button"
                            class="add"
                            data-player="${i}"
                            aria-label="Award 100 points"
                        >+100</button>

                    </span>

                </div>

            `
        ).join("");


        $("score-list").querySelectorAll(".add").forEach(
            button => {

                button.addEventListener("click", () => {

                    changeScore(
                        Number(button.dataset.player),
                        100
                    );

                });

            }
        );


        $("score-list").querySelectorAll(".minus").forEach(
            button => {

                button.addEventListener("click", () => {

                    changeScore(
                        Number(button.dataset.player),
                        -100
                    );

                });

            }
        );

    }


    function changeScore(index, amount) {

        if (
            amount < 0 &&
            state.roundPoints[index] < 100
        ) {
            return;
        }


        if (
            amount > 0 &&
            state.roundPoints[index] >= 100
        ) {
            return;
        }


        state.scores[index] += amount;

        state.roundPoints[index] += amount;


        $(`score-${index}`).textContent =
            state.scores[index];


        const add = $("score-list").querySelector(
            `.add[data-player="${index}"]`
        );

        const minus = $("score-list").querySelector(
            `.minus[data-player="${index}"]`
        );


        add.disabled = state.roundPoints[index] >= 100;

        minus.disabled = state.roundPoints[index] <= 0;

    }


    /* =====================================================
       NEXT ROUND
    ===================================================== */

    function nextRound(first = false) {

        if (
            !first &&
            state.round + 1 >= state.totalRounds
        ) {

            const topScore = Math.max(...state.scores);

            const leaders = state.scores.filter(
                score => score === topScore
            ).length;


            if (leaders > 1) {

                // Three additional rounds for a tie-break.
                state.totalRounds += 3;

            } else {

                showResults();

                return;

            }

        } else if (!first) {

            state.round += 1;

        }


        if (first) {

            state.round = 0;

        }


        state.words = chooseWords();

        state.colour = chooseColour();

        state.roundPoints = Array(
            state.names.length
        ).fill(0);


        $("round-title").textContent =
            `ROUND ${state.round + 1} / ${state.totalRounds}`;


        $("answer-box").hidden = true;

        $("answer-box").innerHTML = "";

        $("answer-btn").textContent = "Show colour answer";


        $("next-round-btn").textContent =
            state.round + 1 >= state.totalRounds
                ? "SEE RESULTS →"
                : "NEXT ROUND →";


        renderColourCard();

        renderWordWheel();

        setFlip(false);

        renderScoreboard();

    }


    /* =====================================================
       FINAL RESULTS
    ===================================================== */

    function showResults() {

        $("game-screen").hidden = true;

        $("result-screen").hidden = false;


        const ranked = state.names.map(
            (name, i) => ({

                name,

                score: state.scores[i]

            })
        ).sort(
            (a, b) => b.score - a.score
        );


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
       EVENT LISTENERS
    ===================================================== */

    $("start-btn").addEventListener(
        "click",
        startGame
    );


    $("flip-card").addEventListener(
        "click",
        () => setFlip(!state.showingWords)
    );


    $("flip-btn").addEventListener(
        "click",
        () => setFlip(!state.showingWords)
    );


    $("answer-btn").addEventListener(
        "click",
        () => {

            $("answer-box").hidden =
                !$("answer-box").hidden;

            $("answer-box").innerHTML =
                answerHTML();

            $("answer-btn").textContent =
                $("answer-box").hidden
                    ? "Show colour answer"
                    : "Hide colour answer";

        }
    );


    $("reset-round-btn").addEventListener(
        "click",
        () => {

            state.names.forEach((_, i) => {

                state.scores[i] -= state.roundPoints[i];

                state.roundPoints[i] = 0;

            });

            renderScoreboard();

        }
    );


    $("next-round-btn").addEventListener(
        "click",
        () => nextRound(false)
    );


    $("end-game-btn").addEventListener(
        "click",
        showResults
    );


    $("play-again-btn").addEventListener(
        "click",
        () => {

            $("result-screen").hidden = true;

            $("setup-screen").hidden = false;

            state.scores = [];

            setStatus(
                `${state.unit.title} · ${state.unit.words.length} vocabulary items loaded.`
            );

        }
    );


    /* =====================================================
       INITIALISE
    ===================================================== */

    initialise();

})();
