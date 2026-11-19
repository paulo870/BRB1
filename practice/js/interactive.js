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

    alert(
        `You got ${result.correct} out of ${result.total} questions correct.`
    );

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
   INITIALIZE
========================================= */

loadInteractivePage();

 })();
