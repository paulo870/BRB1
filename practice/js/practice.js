/* =================================
   PRACTICE ZONE NAVIGATION
================================= */

const practiceHome = document.getElementById("practice-home");

const freePracticeView = document.getElementById("free-practice-view");

const interactivePageView = document.getElementById("interactive-page-view");


document.getElementById("free-practice-btn").addEventListener("click", () => {

    practiceHome.style.display = "none";

    freePracticeView.style.display = "block";

});


document.getElementById("interactive-page-btn").addEventListener("click", () => {

    practiceHome.style.display = "none";

    interactivePageView.style.display = "block";

});


document.getElementById("free-practice-back").addEventListener("click", () => {

    freePracticeView.style.display = "none";

    practiceHome.style.display = "block";

});


document.getElementById("interactive-page-back").addEventListener("click", () => {

    interactivePageView.style.display = "none";

    practiceHome.style.display = "block";

});
/* =====================================================
   POLIGLOTA PRACTICE ENGINE
===================================================== */


// =====================================================
// GET CURRENT PAGE INFORMATION
// =====================================================

const params = new URLSearchParams(window.location.search);

const book = params.get("book");

const unit = params.get("unit");

const page = params.get("page");

const exerciseKey = `${book}-${unit}-${page}`;


// =====================================================
// ELEMENTS
// =====================================================

const exerciseContainer =
    document.getElementById("exercise-container");

const exerciseCounter =
    document.getElementById("exercise-counter");

const exerciseProgress =
    document.getElementById("exercise-progress");

const progressBar =
    document.getElementById("progress-bar");

const previousBtn =
    document.getElementById("previous-exercise");

const nextBtn =
    document.getElementById("next-exercise");

const checkBtn =
    document.getElementById("check-answer");


// Main Practice Zone
document.getElementById("unit-label").textContent =
    `UNIT ${String(unit).padStart(2, "0")}`;

document.getElementById("page-label").textContent =
    `PAGE ${page}`;


// Free Practice
document.getElementById("free-unit-label").textContent =
    `UNIT ${String(unit).padStart(2, "0")}`;

document.getElementById("free-page-label").textContent =
    `PAGE ${page}`;


// Interactive Page
document.getElementById("interactive-unit-label").textContent =
    `UNIT ${String(unit).padStart(2, "0")}`;

document.getElementById("interactive-page-label").textContent =
    `PAGE ${page}`;


// =====================================================
// LOAD PAGE EXERCISES
// =====================================================

const exercises = practiceData[exerciseKey] || [];

let currentExerciseIndex = 0;

let selectedAnswer = null;

let answeredExercises = new Set();


// =====================================================
// EMPTY STATE
// =====================================================

if (exercises.length === 0) {

    exerciseContainer.innerHTML = `

        <div class="empty-state">

            <h2>Practice Coming Soon</h2>

            <p>
                Interactive activities for this page
                are currently being prepared.
            </p>

        </div>

    `;

    previousBtn.style.display = "none";

    nextBtn.style.display = "none";

    checkBtn.style.display = "none";

}


// =====================================================
// LOAD EXERCISE
// =====================================================

function loadExercise() {

    if (!exercises.length) return;

    const exercise = exercises[currentExerciseIndex];

    selectedAnswer = null;

    const progress =

        ((currentExerciseIndex + 1) / exercises.length) * 100;


    exerciseCounter.textContent =

        `Exercise ${currentExerciseIndex + 1} of ${exercises.length}`;


    exerciseProgress.textContent =

        `${Math.round(progress)}%`;


    progressBar.style.width = `${progress}%`;


    previousBtn.disabled = currentExerciseIndex === 0;

    nextBtn.disabled =
        currentExerciseIndex === exercises.length - 1;


    exerciseContainer.innerHTML = `

        <span class="exercise-type">

            ${exercise.type.toUpperCase().replace("-", " ")}

        </span>

        <h2 class="exercise-title">

            ${exercise.title}

        </h2>

        <p class="exercise-instructions">

            ${exercise.instructions}

        </p>

        <div id="exercise-content"></div>

        <div id="exercise-feedback"></div>

    `;


    const content = document.getElementById("exercise-content");


    switch (exercise.type) {

        case "audio":

            renderAudio(exercise, content);

            break;


        case "cloze":

            renderCloze(exercise, content);

            break;


        case "multiple-choice":

            renderMultipleChoice(exercise, content);

            break;


        case "listen-choice":

            renderListenChoice(exercise, content);

            break;


        default:

            content.textContent =
                "Unsupported exercise type.";

    }


    checkBtn.disabled = answeredExercises.has(currentExerciseIndex);

}


// =====================================================
// AUDIO EXERCISE
// LISTEN AND TYPE
// =====================================================

function renderAudio(exercise, container) {

    container.innerHTML = `

        <audio
            class="exercise-audio"
            controls
            controlsList="nodownload"
            src="${exercise.audio}"
        ></audio>

        <input

            type="text"

            class="answer-input"

            id="audio-answer"

            placeholder="Type your answer here..."

            autocomplete="off"

        >

    `;

}


// =====================================================
// CLOZE EXERCISE
// =====================================================

function renderCloze(exercise, container) {

    container.innerHTML = `

        <div class="cloze-text">

            ${exercise.sentence.replace(

                "{{blank}}",

                `<input
                    type="text"
                    class="cloze-input"
                    id="cloze-answer"
                    placeholder="..."
                    autocomplete="off"
                >`

            )}

        </div>

    `;

}


// =====================================================
// MULTIPLE CHOICE
// =====================================================

function renderMultipleChoice(exercise, container) {

    container.innerHTML = `

        <div class="answer-options">

            ${exercise.options.map((option, index) => `

                <button

                    class="answer-option"

                    data-answer="${index}"

                >

                    ${option}

                </button>

            `).join("")}

        </div>

    `;


    container.querySelectorAll(".answer-option").forEach(button => {

        button.addEventListener("click", function() {

            container.querySelectorAll(".answer-option").forEach(btn => {

                btn.classList.remove("selected");

            });

            this.classList.add("selected");

            selectedAnswer = Number(this.dataset.answer);

        });

    });

}


// =====================================================
// LISTEN AND CHOOSE
// =====================================================

function renderListenChoice(exercise, container) {

    container.innerHTML = `

        <audio

            class="exercise-audio"

            controls

            controlsList="nodownload"

            src="${exercise.audio}"

        ></audio>


        <div class="answer-options">

            ${exercise.options.map((option, index) => `

                <button

                    class="answer-option"

                    data-answer="${index}"

                >

                    ${option}

                </button>

            `).join("")}

        </div>

    `;


    container.querySelectorAll(".answer-option").forEach(button => {

        button.addEventListener("click", function() {

            container.querySelectorAll(".answer-option").forEach(btn => {

                btn.classList.remove("selected");

            });

            this.classList.add("selected");

            selectedAnswer = Number(this.dataset.answer);

        });

    });

}


// =====================================================
// CHECK ANSWER
// =====================================================

checkBtn.addEventListener("click", function() {

    if (!exercises.length) return;

    if (answeredExercises.has(currentExerciseIndex)) return;

    const exercise = exercises[currentExerciseIndex];

    let correct = false;


    switch (exercise.type) {

        case "audio": {

            const input = document.getElementById("audio-answer");

            if (!input) return;

            correct =

                input.value.trim().toLowerCase() ===

                exercise.answer.trim().toLowerCase();

            break;

        }


        case "cloze": {

            const input = document.getElementById("cloze-answer");

            if (!input) return;

            correct =

                input.value.trim().toLowerCase() ===

                exercise.answer.trim().toLowerCase();

            break;

        }


        case "multiple-choice":

        case "listen-choice":

            correct = selectedAnswer === exercise.answer;

            break;

    }


    showFeedback(correct, exercise);

});


// =====================================================
// FEEDBACK
// =====================================================

function showFeedback(correct, exercise) {

    const feedback =

        document.getElementById("exercise-feedback");


    feedback.className = correct ? "correct" : "incorrect";


    if (correct) {

        feedback.textContent =

            "✓ Excellent! Your answer is correct.";

    } else {

        feedback.textContent =

            `✗ Not quite. Correct answer: ${exercise.correctAnswer}`;

    }


    answeredExercises.add(currentExerciseIndex);

    checkBtn.disabled = true;

}


// =====================================================
// NEXT EXERCISE
// =====================================================

nextBtn.addEventListener("click", function() {

    if (currentExerciseIndex < exercises.length - 1) {

        currentExerciseIndex++;

        loadExercise();

    }

});


// =====================================================
// PREVIOUS EXERCISE
// =====================================================

previousBtn.addEventListener("click", function() {

    if (currentExerciseIndex > 0) {

        currentExerciseIndex--;

        loadExercise();

    }

});


// =====================================================
// INITIALIZATION
// =====================================================

if (exercises.length > 0) {

    loadExercise();

}
Symbols
Find definitions and references for functions and other symbols in this file by clicking a symbol below or in the code.

Filter symbols
r
R
func
loadExercise
func
renderAudio
func
renderCloze
func
renderMultipleChoice
func
renderListenChoice
func
showFeedback
