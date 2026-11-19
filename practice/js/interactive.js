(() => {
/* =====================================================
   POLIGLOTA INTERACTIVE PAGE CONTROLLER
===================================================== */

const interactiveContainer = document.getElementById(
    "interactive-exercise-container"
);

const checkInteractiveBtn = document.getElementById(
    "interactive-check-btn"
);

const showAnswersBtn = document.getElementById(
    "show-all-answers-btn"
);

const tryAgainBtn = document.getElementById(
    "interactive-try-again-btn"
);
/* =========================================
   RESULTS MODAL ELEMENTS
========================================= */

const resultsModal = document.getElementById("results-modal");

const resultsCloseBtn = document.getElementById("results-close-btn");

const resultsCloseAction = document.getElementById("results-close-action");

const resultsRetryBtn = document.getElementById("results-retry-btn");

const resultsPercentage = document.getElementById("results-percentage");

const resultsCorrect = document.getElementById("results-correct");

const resultsIncorrect = document.getElementById("results-incorrect");

const resultsProgressBar = document.getElementById("results-progress-bar");

const resultsMessage = document.getElementById("results-message");

const resultsIcon = document.getElementById("results-icon");

const interactiveParams = new URLSearchParams(window.location.search);

const requestedBook = interactiveParams.get("book");

const book = requestedBook === "student" || !requestedBook
    ? "student-book"
    : requestedBook;

const unit = Number(interactiveParams.get("unit") || 1);

const page = Number(interactiveParams.get("page") || 1);


const unitFolder = `unit-${String(unit).padStart(2, "0")}`;

const pageFile = `page-${String(page).padStart(2, "0")}.json`;


let interactiveActivities = [];

   /* =========================================
   RESULTS MODAL FUNCTIONS
========================================= */

function openResultsModal(result) {

    const percentage = result.total > 0
        ? Math.round((result.correct / result.total) * 100)
        : 0;

    const incorrect = result.total - result.correct;

    resultsPercentage.textContent = `${percentage}%`;

    resultsCorrect.textContent = result.correct;

    resultsIncorrect.textContent = incorrect;

    resultsProgressBar.style.width = `${percentage}%`;

    if (percentage === 100) {

        resultsMessage.textContent =
            "Outstanding! You answered every question correctly.";

        resultsIcon.textContent = "★";

    } else if (percentage >= 80) {

        resultsMessage.textContent =
            "Excellent work! You have demonstrated a strong understanding.";

        resultsIcon.textContent = "✓";

    } else if (percentage >= 60) {

        resultsMessage.textContent =
            "Good progress! Review your mistakes and keep improving.";

        resultsIcon.textContent = "✓";

    } else {

        resultsMessage.textContent =
            "Keep practising. Every attempt is an opportunity to improve.";

        resultsIcon.textContent = "↗";

    }

    resultsModal.classList.add("active");

    resultsModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    resultsCloseBtn.focus();

}


function closeResultsModal() {

    resultsModal.classList.remove("active");

    resultsModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

}


/* =========================================
   LOAD CONTENT
========================================= */

async function loadInteractivePage() {

    const contentPath =
        `content/${book}/${unitFolder}/${pageFile}`;
   console.log("Interactive content URL:", new URL(contentPath, window.location.href).href);

    try {

        const response = await fetch(contentPath);

        if (!response.ok) {
            throw new Error("Page content not found.");
        }

        const data = await response.json();

        interactiveActivities = data.activities || [];

        if (!interactiveActivities.length) {
            throw new Error("No activities available.");
        }

        ExerciseEngine.render(
            interactiveContainer,
            interactiveActivities
        );

    }

    catch (error) {

        console.error(error);

        interactiveContainer.innerHTML = `

            <div class="empty-state">

                <h2>Interactive Page Coming Soon</h2>

                <p>
                    Activities for this page have not been added yet.
                </p>

            </div>

        `;

    }

}


/* =========================================
   CHECK ANSWERS
========================================= */

checkInteractiveBtn.addEventListener("click", () => {

    if (!interactiveActivities.length) return;

    const result = ExerciseEngine.checkAll(
        interactiveContainer,
        interactiveActivities
    );

    if (result.total === 0) return;

    openResultsModal(result);

});


/* =========================================
   SHOW ALL ANSWERS
========================================= */

showAnswersBtn.addEventListener("click", () => {

    if (!interactiveActivities.length) return;

    ExerciseEngine.showAllAnswers(
        interactiveContainer,
        interactiveActivities
    );

});


/* =========================================
   TRY AGAIN
========================================= */

tryAgainBtn.addEventListener("click", () => {

    if (!interactiveActivities.length) return;

    ExerciseEngine.reset(interactiveContainer);

});

/* =========================================
   RESULTS MODAL CONTROLS
========================================= */

resultsCloseBtn.addEventListener("click", closeResultsModal);

resultsCloseAction.addEventListener("click", closeResultsModal);

resultsModal.addEventListener("click", (event) => {

    if (event.target === resultsModal) {
        closeResultsModal();
    }

});

document.addEventListener("keydown", (event) => {

    if (
        event.key === "Escape" &&
        resultsModal.classList.contains("active")
    ) {
        closeResultsModal();
    }

});


/* =========================================
   RESULTS RETRY
========================================= */

resultsRetryBtn.addEventListener("click", () => {

    closeResultsModal();

    ExerciseEngine.reset(interactiveContainer);

});
/* =========================================
   INITIALIZE
========================================= */

loadInteractivePage();

 })();
