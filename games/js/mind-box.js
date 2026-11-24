(() => {

    "use strict";

    const $ = id => document.getElementById(id);


    /* =====================================================
       UNIT
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

        questions: [],

        questionBag: [],

        names: [],

        scores: [],

        totalRounds: 5,

        round: 0,

        player: 0,

        answered: false,

        currentQuestion: null,

        finished: false

    };


    /* =====================================================
       HELPERS
    ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "").replace(/[&<>"']/g, char => ({

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


    function setStatus(message, isError = false) {

        $("vocab-status").textContent = message;

        $("vocab-status").style.color = isError
            ? "#ff938c"
            : "#9fc3c2";

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
       LOAD QUESTIONS
       ORIGINAL QUESTIONS.TXT SYSTEM
    ===================================================== */

    async function loadQuestions(unit) {

        const response = await fetch("data/questions.txt");

        if (!response.ok) {

            throw new Error("Could not load questions.txt");

        }

        const text = await response.text();

        return text.split(/\r?\n/)

            .filter(line => line.trim() && !line.startsWith("#"))

            .map(line => {

                const [

                    unitNumber,

                    question,

                    optionA,

                    optionB,

                    optionC,

                    optionD,

                    answer

                ] = line.split("|").map(x => x.trim());


                return {

                    unit: Number(unitNumber),

                    question,

                    options: [

                        optionA,

                        optionB,

                        optionC,

                        optionD

                    ],

                    answer: Number(answer)

                };

            })

            .filter(item => {

                return (

                    item.unit === unit &&

                    item.question &&

                    item.options.every(Boolean) &&

                    Number.isInteger(item.answer) &&

                    item.answer >= 0 &&

                    item.answer <= 3

                );

            });

    }


    /* =====================================================
       INITIALISE
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
                "Return to the Games Hub and select a unit first.",
                true
            );

            return;

        }


        setStatus("Loading questions...");


        try {

            state.questions = await loadQuestions(unitNumber);


            if (!state.questions.length) {

                throw new Error(
                    "No questions available for this unit."
                );

            }


            state.unit = unitNumber;


            setStatus(
                `Unit ${unitNumber} · ${state.questions.length} questions loaded.`
            );


            $("start-btn").disabled = false;

        } catch (error) {

            console.error(error);

            setStatus(
                error.message,
                true
            );

        }

    }


    /* =====================================================
       QUESTION BAG
    ===================================================== */

    function getNextQuestion() {

        if (!state.questionBag.length) {

            state.questionBag = shuffle(state.questions);

        }


        return state.questionBag.pop();

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

        state.totalRounds = Number($("round-count").value);

        state.round = 0;

        state.player = 0;

        state.answered = false;

        state.finished = false;

        state.questionBag = shuffle(state.questions);


        $("setup-screen").hidden = true;

        $("game-screen").hidden = false;

        $("result-screen").hidden = true;


        renderScoreboard();

        showQuestion();

    }


    /* =====================================================
       SHOW QUESTION
    ===================================================== */

    function showQuestion() {

        if (state.finished) return;


        state.answered = false;


        state.currentQuestion = getNextQuestion();


        const totalQuestions =
            state.totalRounds * state.names.length;


        const currentQuestionNumber =
            state.round * state.names.length + state.player + 1;


        const playerName = state.names[state.player];


        $("round-title").textContent =

            `ROUND ${state.round + 1} / ${state.totalRounds}`;


        $("question-number").textContent =

            `QUESTION ${currentQuestionNumber} / ${totalQuestions}`;


        $("progress").style.width =

            `${(currentQuestionNumber - 1) / totalQuestions * 100}%`;


        $("current-player").textContent =

            `${playerName.toUpperCase()}'S TURN`;


        $("score").textContent =

            `${state.scores[state.player]} POINTS`;


        $("question").textContent =

            state.currentQuestion.question;


        $("feedback").textContent = "";

        $("feedback").className = "feedback";


        $("next-btn").hidden = true;


        renderOptions();

        renderScoreboard();

    }


    /* =====================================================
       RENDER OPTIONS
    ===================================================== */

    function renderOptions() {

        const item = state.currentQuestion;


        $("options").innerHTML = item.options.map(

            (option, index) => `

                <button
                    type="button"
                    class="option"
                    data-index="${index}"
                >

                    <span class="option-letter">
                        ${"ABCD"[index]}
                    </span>

                    <span>${escapeHTML(option)}</span>

                </button>

            `

        ).join("");


        $("options").querySelectorAll(".option").forEach(button => {

            button.addEventListener("click", () => {

                checkAnswer(
                    Number(button.dataset.index)
                );

            });

        });

    }


    /* =====================================================
       CHECK ANSWER
    ===================================================== */

    function checkAnswer(selected) {

        if (state.answered || state.finished) return;


        state.answered = true;


        const item = state.currentQuestion;

        const correct = item.answer;


        const buttons = $("options").querySelectorAll(".option");


        buttons.forEach(button => {

            button.disabled = true;


            const index = Number(button.dataset.index);


            if (index === correct) {

                button.classList.add("correct");

            }


            if (index === selected && selected !== correct) {

                button.classList.add("wrong");

            }

        });


        if (selected === correct) {

            state.scores[state.player] += 100;


            $("feedback").textContent =

                "Excellent! +100 POINTS";


            $("feedback").classList.add("correct-text");

        } else {

            $("feedback").textContent =

                `Not quite! The correct answer is ${item.options[correct]}.`;


            $("feedback").classList.add("wrong-text");

        }


        $("score").textContent =

            `${state.scores[state.player]} POINTS`;


        renderScoreboard();


        $("next-btn").hidden = false;


        const isLastTurn =

            state.round === state.totalRounds - 1 &&

            state.player === state.names.length - 1;


        $("next-btn").textContent = isLastTurn

            ? "SEE FINAL RESULTS →"

            : "NEXT TURN →";

    }


    /* =====================================================
       NEXT TURN
    ===================================================== */

    function nextTurn() {

        if (!state.answered || state.finished) return;


        state.player++;


        if (state.player >= state.names.length) {

            state.player = 0;

            state.round++;

        }


        if (state.round >= state.totalRounds) {

            finishGame();

            return;

        }


        showQuestion();

    }


    /* =====================================================
       SCOREBOARD
    ===================================================== */

    function renderScoreboard() {

        $("score-list").innerHTML = state.names.map(

            (name, i) => `

                <div class="score-row ${
                    i === state.player && !state.finished
                        ? "active"
                        : ""
                }">

                    <span class="player-name">
                        ${escapeHTML(name)}
                    </span>

                    <span class="player-score">
                        ${state.scores[i]}
                    </span>

                </div>

            `

        ).join("");

    }


    /* =====================================================
       FINISH GAME
    ===================================================== */

    function finishGame() {

        if (state.finished) return;


        state.finished = true;


        $("game-screen").hidden = true;

        $("result-screen").hidden = false;


        const ranked = state.names.map((name, i) => ({

            name,

            score: state.scores[i],

            correct: state.scores[i] / 100

        })).sort((a, b) => b.score - a.score);


        const highestScore = ranked[0].score;


        $("final-scores").innerHTML = ranked.map(

            (player, index) => `

                <div class="final-row ${
                    player.score === highestScore
                        ? "winner"
                        : ""
                }">

                    <strong>

                        ${index === 0 ? "🏆 " : ""}

                        ${index + 1}. ${escapeHTML(player.name)}

                    </strong>

                    <span>
                        ${player.score} PTS
                    </span>

                </div>

            `

        ).join("");

    }


    /* =====================================================
       RESET GAME
    ===================================================== */

    function playAgain() {

        state.scores = [];

        state.questions = state.questions;

        state.questionBag = [];

        state.round = 0;

        state.player = 0;

        state.answered = false;

        state.finished = false;


        $("result-screen").hidden = true;

        $("game-screen").hidden = true;

        $("setup-screen").hidden = false;


        setStatus(
            `Unit ${state.unit} · ${state.questions.length} questions loaded.`
        );

    }


    /* =====================================================
       EVENT LISTENERS
    ===================================================== */

    $("start-btn").addEventListener(
        "click",
        startGame
    );


    $("next-btn").addEventListener(
        "click",
        nextTurn
    );


    $("end-game-btn").addEventListener(
        "click",
        finishGame
    );


    $("play-again-btn").addEventListener(
        "click",
        playAgain
    );


    /* =====================================================
       INITIALISE GAME
    ===================================================== */

    initialise();

})();
