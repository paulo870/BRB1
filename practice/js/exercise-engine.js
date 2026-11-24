/* =====================================================
   POLIGLOTA UNIVERSAL EXERCISE ENGINE
===================================================== */

const ExerciseEngine = (() => {

    /* =========================================
       HELPERS
    ========================================= */

    function escapeHTML(value) {

        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

    }


    function normalize(value) {

        return String(value ?? "")
            .trim()
            .toLowerCase();

    }


function createQuestion(question, index, displayNumber) {
        const type = question.type;

        const id = `question-${index}`;

let content = "";
let questionHeading = escapeHTML(question.question || "");
function createSentenceChoice(question, index) {

    const sentenceHTML = question.parts.map((part, partIndex) => {

        // Normal text
        if (typeof part === "string") {
            return escapeHTML(part);
        }

        // Choice dropdown
        const optionsHTML = part.options.map(option => `
            <option value="${escapeHTML(option)}">
                ${escapeHTML(option)}
            </option>
        `).join("");

        return `
            <select
                class="engine-sentence-choice"
                data-part-index="${partIndex}"
                data-answer="${escapeHTML(part.answer)}"
            >
                <option value="">Choose...</option>
                ${optionsHTML}
            </select>
        `;

    }).join("");

    return `
        <div class="engine-question" data-question-index="${index}">
            <div class="engine-sentence-choice-text">
                ${sentenceHTML}
            </div>
        </div>
    `;
}
        /* =====================================
           MULTIPLE CHOICE
        ===================================== */

        if (type === "multiple-choice") {

            content = `

                <div class="engine-options">

                    ${question.options.map((option, i) => `

                        <label class="engine-option">

                            <input
                                type="radio"
                                name="${id}"
                                value="${i}"
                            >

                            <span>${escapeHTML(option)}</span>

                        </label>

                    `).join("")}

                </div>

            `;

        }


        /* =====================================
           MULTIPLE SELECT
        ===================================== */

        else if (type === "multiple-select") {

            content = `

                <div class="engine-options">

                    ${question.options.map((option, i) => `

                        <label class="engine-option">

                            <input
                                type="checkbox"
                                name="${id}"
                                value="${i}"
                            >

                            <span>${escapeHTML(option)}</span>

                        </label>

                    `).join("")}

                </div>

            `;

        }


        /* =====================================
           TRUE OR FALSE
        ===================================== */

        else if (type === "true-false") {

            content = `

                <div class="engine-options">

                    <label class="engine-option">

                        <input
                            type="radio"
                            name="${id}"
                            value="true"
                        >

                        True

                    </label>

                    <label class="engine-option">

                        <input
                            type="radio"
                            name="${id}"
                            value="false"
                        >

                        False

                    </label>

                </div>

            `;

        }


        /* =====================================
           SHORT ANSWER / DICTATION
        ===================================== */

        else if (
            type === "short-answer" ||
            type === "dictation"
        ) {

            content = `

                <input
                    type="text"
                    class="engine-text-input"
                    autocomplete="off"
                    placeholder="Write your answer..."
                >

            `;

        }


        /* =====================================
           CLOZE
        ===================================== */

     else if (type === "cloze") {

    let blankIndex = 0;

    questionHeading = question.text.replace(
        /\{\{blank\}\}/g,
        () => {

            return `
                <input
                    type="text"
                    class="engine-cloze-input"
                    data-blank="${blankIndex++}"
                    autocomplete="off"
                >
            `;

        }
    );

    content = "";

}
/* =====================================
   TABLE CLOZE
===================================== */

else if (type === "table-cloze") {

    let blankIndex = 0;

    const headers = question.columns || [];

    const rows = (question.rows || []).map(row => {

        let cellContent = "";

        const parts = String(row.text ?? "").split("{{blank}}");

        parts.forEach((part, index) => {

            cellContent += escapeHTML(part);

            if (index < parts.length - 1) {

                cellContent += `
                    <input
                        type="text"
                        class="engine-cloze-input engine-table-cloze-input"
                        data-blank="${blankIndex++}"
                        autocomplete="off"
                        aria-label="Answer ${blankIndex}"
                    >
                `;

            }

        });

        return `
            <tr>
                <th scope="row">
                    ${escapeHTML(row.label)}
                </th>

                <td>
                    ${cellContent}
                </td>
            </tr>
        `;

    }).join("");

    content = `
        <div class="engine-table-wrapper">

            <table class="engine-table-cloze">

                <thead>
                    <tr>
                        ${headers.map(header => `
                            <th>${escapeHTML(header)}</th>
                        `).join("")}
                    </tr>
                </thead>

                <tbody>
                    ${rows}
                </tbody>

            </table>

        </div>
    `;

}
        /* =====================================
           MATCHING
        ===================================== */

        else if (type === "matching") {

            const rightItems = question.pairs.map(
                pair => pair.right
            );

            content = `

                <div class="engine-matching">

                    ${question.pairs.map((pair, i) => `

                        <div class="engine-match-row">

                            <span>
                                ${escapeHTML(pair.left)}
                            </span>

                            <select data-match="${i}">

                                <option value="">
                                    Select an answer
                                </option>

                                ${rightItems.map(item => `

                                    <option value="${escapeHTML(item)}">
                                        ${escapeHTML(item)}
                                    </option>

                                `).join("")}

                            </select>

                        </div>

                    `).join("")}

                </div>

            `;

        }


        /* =====================================
           ORDERING
        ===================================== */

        else if (type === "ordering") {

            const count = question.items.length;

            const positions = Array.from(
                { length: count },
                (_, i) => i + 1
            );

            content = `

                <div class="engine-ordering">

                    ${question.items.map((item, i) => `

                        <div class="engine-order-row">

                            <span>${escapeHTML(item)}</span>

                            <select data-order="${i}">

                                <option value="">
                                    Position
                                </option>

                                ${positions.map(position => `

                                    <option value="${position}">
                                        ${position}
                                    </option>

                                `).join("")}

                            </select>

                        </div>

                    `).join("")}

                </div>

            `;

        }


        return `

            <div
                class="engine-question"
                data-question-index="${index}"
            >

               <h3>
                <h3 class="engine-question-heading">

    <span class="engine-question-number">
        ${displayNumber}.
    </span>

    <span class="engine-question-text">
        ${questionHeading}
    </span>

</h3>

                ${content}

                <div class="engine-question-feedback"></div>

                <div class="engine-correct-answer"></div>

            </div>

        `;

    }


    /* =========================================
       RENDER ACTIVITY
    ========================================= */

    function renderActivity(activity, index) {

        let media = "";


        if (activity.media?.type === "audio") {

            media = `

                <audio
                    class="engine-audio"
                    controls
                    controlsList="nodownload"
                    src="${escapeHTML(activity.media.src)}"
                ></audio>

            `;

        }


        else if (activity.media?.type === "video") {

            media = `

                <video
                    class="engine-video"
                    controls
                    controlsList="nodownload"
                    src="${escapeHTML(activity.media.src)}"
                ></video>

            `;

        }


        else if (activity.media?.type === "image") {

            media = `

                <img
                    class="engine-image"
                    src="${escapeHTML(activity.media.src)}"
                    alt="${escapeHTML(activity.media.alt || "")}"
                >

            `;

        }


        let passage = "";

        if (activity.text) {

            passage = `

                <div class="engine-passage">

                    ${escapeHTML(activity.text).replace(/\n/g, "<br>")}

                </div>

            `;

        }


       const questions = (activity.questions || []).map(
    (question, questionIndex) => {

        const globalIndex = `${index}-${questionIndex}`;

        return createQuestion(
            question,
            globalIndex,
            questionIndex + 1
        );

    }
).join("");


        return `

            <section
                class="engine-activity"
                data-activity="${index}"
            >

                <div class="engine-activity-header">

                    <span>
                        ACTIVITY ${index + 1}
                    </span>

                    <span>
                        ${escapeHTML(activity.type)}
                    </span>

                </div>

                <h2>
                    ${escapeHTML(activity.title)}
                </h2>

                <p class="engine-instructions">
                    ${escapeHTML(activity.instructions)}
                </p>

                ${passage}

                ${media}

                <div class="engine-questions">

                    ${questions}

                </div>

            </section>

        `;

    }


    /* =========================================
       DISPLAY PAGE
    ========================================= */

    function render(container, activities) {

        container.innerHTML = activities.map(
            renderActivity
        ).join("");

    }


    /* =========================================
       COLLECT ANSWERS
    ========================================= */

    function getAnswer(questionElement, question) {

        const type = question.type;


        if (type === "multiple-choice" || type === "true-false") {

            const selected = questionElement.querySelector(
                'input[type="radio"]:checked'
            );

            if (!selected) return null;

            return type === "multiple-choice"
                ? Number(selected.value)
                : selected.value === "true";

        }


        if (type === "multiple-select") {

            return Array.from(
                questionElement.querySelectorAll(
                    'input[type="checkbox"]:checked'
                )
            ).map(input => Number(input.value));

        }


        if (
            type === "short-answer" ||
            type === "dictation"
        ) {

            return questionElement.querySelector(
                ".engine-text-input"
            )?.value ?? "";

        }


       if (
    type === "cloze" ||
    type === "table-cloze"
) {
    return Array.from(
        questionElement.querySelectorAll(
            ".engine-cloze-input"
        )
    ).map(input => input.value);
}

        if (type === "matching") {

            return Array.from(
                questionElement.querySelectorAll("[data-match]")
            ).map(select => select.value);

        }


        if (type === "ordering") {

            return Array.from(
                questionElement.querySelectorAll("[data-order]")
            ).map(select => Number(select.value));

        }


        return null;

    }


    /* =========================================
       ANSWER COMPARISON
    ========================================= */

    function check(question, userAnswer) {

        if (userAnswer === null) return false;

        const expected = question.answer;


        if (
            question.type === "short-answer" ||
            question.type === "dictation"
        ) {

            const accepted = Array.isArray(expected)
                ? expected
                : [expected];

            return accepted.some(answer =>
                normalize(answer) === normalize(userAnswer)
            );

        }


        if (
            question.type === "multiple-choice" ||
            question.type === "true-false"
        ) {

            return userAnswer === expected;

        }


        if (question.type === "multiple-select") {

            return JSON.stringify([...userAnswer].sort()) ===
                JSON.stringify([...expected].sort());

        }


       if (
    question.type === "cloze" ||
    question.type === "table-cloze" ||
    question.type === "matching" ||
    question.type === "ordering"
) {

            return userAnswer.length === expected.length &&
                userAnswer.every((answer, index) => {

if (
    question.type === "cloze" ||
    question.type === "table-cloze"
) {
                        return normalize(answer) ===
                            normalize(expected[index]);

                    }

                    if (question.type === "matching") {

                        return normalize(answer) ===
                            normalize(expected[index]);

                    }

                    return answer === expected[index];

                });

        }


        return false;

    }


    /* =========================================
       CHECK ALL ANSWERS
    ========================================= */

   function checkAll(container, activities) {

    let correctCount = 0;
    let totalCount = 0;

    container.querySelectorAll(
        ".engine-question"
    ).forEach(element => {

        const [activityIndex, questionIndex] =
            element.dataset.questionIndex.split("-").map(Number);

        const question =
            activities[activityIndex].questions[questionIndex];

        const answer = getAnswer(element, question);

        const feedback = element.querySelector(
            ".engine-question-feedback"
        );

        element.classList.remove("correct", "incorrect");

        /* =====================================
           TABLE CLOZE — COUNT EACH BLANK
        ===================================== */

       /* =====================================
   CLOZE + TABLE CLOZE
   COUNT AND CHECK EACH BLANK
===================================== */

if (
    question.type === "cloze" ||
    question.type === "table-cloze"
) {

    const inputs = element.querySelectorAll(
        ".engine-cloze-input"
    );

    const expected = Array.isArray(question.answer)
        ? question.answer
        : [question.answer];

    let questionCorrect = 0;

    inputs.forEach((input, index) => {

        const correctAnswer = expected[index] ?? "";

        const isCorrect =
            normalize(input.value) ===
            normalize(correctAnswer);

        /* Remove previous feedback */

        input.classList.remove(
            "correct",
            "incorrect"
        );

        const previousLabel = input.nextElementSibling;

        if (
            previousLabel &&
            previousLabel.classList.contains(
                "engine-cloze-correct-answer"
            )
        ) {
            previousLabel.remove();
        }

        /* Apply visual feedback */

        input.classList.add(
            isCorrect ? "correct" : "incorrect"
        );

        if (isCorrect) {

            questionCorrect++;

            correctCount++;

        } else {

            /* Show the correct answer */

            const answerLabel = document.createElement("span");

            answerLabel.className =
                "engine-cloze-correct-answer";

            answerLabel.textContent =
                `Correct answer: ${correctAnswer}`;

            input.insertAdjacentElement(
                "afterend",
                answerLabel
            );

        }

        totalCount++;

    });

    /* Mark the complete question */

    element.classList.add(
        questionCorrect === inputs.length
            ? "correct"
            : "incorrect"
    );

    feedback.textContent =
        `${questionCorrect}/${inputs.length} correct`;

    return;

}
        /* =====================================
           ALL OTHER EXERCISE TYPES
        ===================================== */

        const correct = check(question, answer);

        element.classList.add(
            correct ? "correct" : "incorrect"
        );

        feedback.textContent = correct
            ? "✓ Correct!"
            : answer === null
                ? "Please answer this question."
                : "✗ Incorrect. Try again or reveal the answer.";

        if (correct) correctCount++;

        totalCount++;

    });

    return {
        correct: correctCount,
        total: totalCount
    };

}

    /* =========================================
       SHOW ALL ANSWERS
    ========================================= */

    function showAllAnswers(container, activities) {

        container.querySelectorAll(
            ".engine-question"
        ).forEach(element => {

            const [activityIndex, questionIndex] =
                element.dataset.questionIndex.split("-").map(Number);

            const question =
                activities[activityIndex].questions[questionIndex];

            const answerBox = element.querySelector(
                ".engine-correct-answer"
            );

            answerBox.textContent =
                `Correct answer: ${formatAnswer(question)}`;

            answerBox.style.display = "block";

        });

    }


    function formatAnswer(question) {

        const answer = question.answer;

        if (question.type === "multiple-choice") {
            return question.options[answer];
        }

        if (question.type === "multiple-select") {
            return answer.map(index => question.options[index]).join(", ");
        }

        if (question.type === "true-false") {
            return answer ? "True" : "False";
        }

        if (question.type === "matching") {
            return question.pairs.map((pair, index) =>
                `${pair.left} → ${answer[index]}`
            ).join("; ");
        }

        if (question.type === "ordering") {
            return answer.map(position =>
                question.items[position - 1]
            ).join(" → ");
        }

        return Array.isArray(answer)
            ? answer.join(", ")
            : answer;

    }


    /* =========================================
       RESET
    ========================================= */

    function reset(container) {

        container.querySelectorAll(
            ".engine-question"
        ).forEach(element => {

            element.classList.remove("correct", "incorrect");

            element.querySelectorAll("input").forEach(input => {

                if (input.type === "radio" || input.type === "checkbox") {
                    input.checked = false;
                } else {
                    input.value = "";
                }

            });

            element.querySelectorAll("select").forEach(select => {
                select.selectedIndex = 0;
            });

            element.querySelector(
                ".engine-question-feedback"
            ).textContent = "";

            const answerBox = element.querySelector(
                ".engine-correct-answer"
            );

            answerBox.textContent = "";
            answerBox.style.display = "none";

        });

    }


    /* =========================================
       PUBLIC METHODS
    ========================================= */

    return {
        render,
        checkAll,
        showAllAnswers,
        reset
    };

})();
