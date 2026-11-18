/* =========================================================
   POLIGLOTA GAMES
   CENTRAL VOCABULARY SYSTEM
   ========================================================= */

window.GameVocabulary = (() => {

    const vocabularyFile = new URL(
        "../data/vocabulary.txt",
        document.currentScript.src
    ).href;

    let vocabularyData = null;


    // =====================================================
    // LOAD AND PARSE VOCABULARY FILE
    // =====================================================

    async function loadVocabulary() {

        if (vocabularyData) {
            return vocabularyData;
        }

        const response = await fetch(vocabularyFile);

        if (!response.ok) {
            throw new Error("Could not load vocabulary file.");
        }

        const text = await response.text();

        const units = {};

        let currentUnit = null;

        const lines = text.split(/\r?\n/);

        lines.forEach(line => {

            const cleanLine = line.trim();

            if (!cleanLine) return;

            // Detect unit heading
            const headingMatch = cleanLine.match(
                /^#\s*Unit\s+(\d+)\s*:\s*(.+)$/i
            );

            if (headingMatch) {

                const unitNumber = parseInt(
                    headingMatch[1],
                    10
                );

                currentUnit = unitNumber;

                units[currentUnit] = {
                    number: unitNumber,
                    title: headingMatch[2].trim(),
                    words: []
                };

                return;
            }

            // Detect numbered vocabulary entries
            const wordMatch = cleanLine.match(
                /^\d+\s*[.)]\s*(.+)$/
            );

            if (wordMatch && currentUnit !== null) {

                const word = wordMatch[1].trim();

                if (word) {
                    units[currentUnit].words.push(word);
                }
            }

        });

        vocabularyData = units;

        return vocabularyData;
    }


    // =====================================================
    // GET ALL AVAILABLE UNITS
    // =====================================================

    async function getUnits() {

        const data = await loadVocabulary();

        return Object.values(data).map(unit => ({
            number: unit.number,
            title: unit.title,
            wordCount: unit.words.length
        }));

    }


    // =====================================================
    // GET WORDS FROM A SELECTED UNIT
    // =====================================================

    async function loadUnit(unitNumber) {

        const data = await loadVocabulary();

        const unit = data[Number(unitNumber)];

        if (!unit) {
            throw new Error(
                `Unit ${unitNumber} was not found.`
            );
        }

        if (unit.words.length === 0) {
            throw new Error(
                `Unit ${unitNumber} has no vocabulary.`
            );
        }

        return {
            number: unit.number,
            title: unit.title,
            words: [...unit.words]
        };

    }


    // =====================================================
    // PUBLIC FUNCTIONS
    // =====================================================

    return {
        loadVocabulary,
        getUnits,
        loadUnit
    };

})();
