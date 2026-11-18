(() => {

    "use strict";

    const $ = id => document.getElementById(id);

    const state = {
        unit: 0,
        questions: [],
        index: 0,
        score: 0,
        correct: 0,
        answered: false
    };


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
                    item.answer >= 0 &&
                    item.answer <= 3
                );

            });

    }


    async function startGame() {

        const unit = Number($("unit-select").value);

        if (!unit) {
            $("status").textContent = "Select a unit first.";
            return;
        }

        $("status").textContent = "Loading questions...";

        try {

            state.questions = await loadQuestions(unit);

            if (!state.questions.length) {
                throw new Error(
                    "No questions available for this unit."
                );
            }

            state.unit = unit;
            state.index = 0;
            state.score = 0;
            state.correct = 0;

            $("setup-screen").hidden = true;
            $("game-screen").hidden = false;

            showQuestion();

        } catch (error) {

            $("status").textContent = error.message;

        }

    }


    function showQuestion() {

        if (state.index >= state.questions.length) {
            finishGame();
            return;
        }

        state.answered = false;

        const item = state.questions[state.index];

        const total = state.questions.length;

        $("question-number").textContent =
            `QUESTION ${state.index + 1} / ${total}`;

        $("progress").style.width =
            `${state.index / total * 100}%`;

        $("score").textContent =
            `${state.score} POINTS`;

        $("question").textContent = item.question;

        $("feedback").textContent = "";

        $("options").innerHTML = item.options.map(
            (option, index) => `

                <button
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

        $("options").querySelectorAll("button").forEach(button => {

            button.addEventListener("click", () => {

                checkAnswer(Number(button.dataset.index));

            });

        });

    }


    function checkAnswer(selected) {

        if (state.answered) return;

        state.answered = true;

        const item = state.questions[state.index];

        const correct = item.answer;

        const buttons = $("options").querySelectorAll("button");

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

            state.score += 100;

            state.correct++;

            $("feedback").textContent = "Excellent! +100 points";

            $("feedback").className = "correct-text";

        } else {

            $("feedback").textContent =
                "Not quite! The correct answer is " +
                item.options[correct];

            $("feedback").className = "wrong-text";

        }

        $("score").textContent =
            `${state.score} POINTS`;

        const delay = 1300;

        setTimeout(() => {

            state.index++;

            showQuestion();

        }, delay);

    }


    function finishGame() {

        $("game-screen").hidden = true;

        $("result-screen").hidden = false;

        $("progress").style.width = "100%";

        $("final-score").innerHTML = `

            <div class="final-score">
                ${state.score}
            </div>

            <p>
                ${state.correct} correct answers out of
                ${state.questions.length}
            </p>

            <p>
                Unit ${state.unit}
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

})();
