/* =================================
   POLIGLOTA PRACTICE ZONE NAVIGATION
================================= */

document.addEventListener("DOMContentLoaded", () => {

    const practiceHome = document.getElementById("practice-home");

    const freePracticeView = document.getElementById("free-practice-view");

    const interactivePageView = document.getElementById("interactive-page-view");


    /* =================================
       OPEN FREE PRACTICE
    ================================= */

    document.getElementById("free-practice-btn").addEventListener("click", () => {

        practiceHome.style.display = "none";

        interactivePageView.style.display = "none";

        freePracticeView.style.display = "block";

    });


    /* =================================
       OPEN INTERACTIVE PAGE
    ================================= */

    document.getElementById("interactive-page-btn").addEventListener("click", () => {

        practiceHome.style.display = "none";

        freePracticeView.style.display = "none";

        interactivePageView.style.display = "block";

    });


    /* =================================
       RETURN FROM FREE PRACTICE
    ================================= */

    document.getElementById("free-practice-back").addEventListener("click", () => {

        freePracticeView.style.display = "none";

        practiceHome.style.display = "block";

    });


    /* =================================
       RETURN FROM INTERACTIVE PAGE
    ================================= */

    document.getElementById("interactive-page-back").addEventListener("click", () => {

        interactivePageView.style.display = "none";

        practiceHome.style.display = "block";

    });

});
