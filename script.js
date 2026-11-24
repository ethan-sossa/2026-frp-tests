emailjs.init({
    publicKey: "Gs_esq3KuDrF52UIQ",
    blockHeadless: true,
    limitRate: {
        throttle: 5000
    }
});

const DEBUG_MODE = true;
const startButton = document.getElementById("startButton");
const reactionMessage = document.getElementById("reactionMessage");

const totalTrials = 10;
const totalMemoryTrials = 3;
const totalStroopTrials = 30;
let reactionTimes = [];

let reactionState = "idle";
let greenTime = 0;
let reactionTimer;

let Reaction = 0;
let memoryResults = 0;
let ACRT = 0;
let averageStroopAccuracy = 0;

const COLORS = {
    default: "#19222d",
    waiting: "#ff3232",
    ready: "#00cc00",
    falseStart: "#a00000",
    result: "#0389ff"
};

const testOrders = [
    ["reaction", "memory", "stroop"],
    ["memory", "stroop", "reaction"],
    ["stroop", "reaction", "memory"],
    ["reaction", "stroop", "memory"],
    ["stroop", "memory", "reaction"],
    ["memory", "reaction", "stroop"]
];

const orderNumber = 1; // Change from 1 to 6
let currentOrder = testOrders[0];

// Display Functions

function showSection(sectionId) {
    document.querySelectorAll("section").forEach(function(section) {
        section.style.display = "none";
    });

    const section = document.getElementById(sectionId);
    section.style.display = "block";
}

function setBackground(color) {
    document.documentElement.style.setProperty("--background-color", color);
}

function nextTest(currentTest) {
    const currentIndex = currentOrder.indexOf(currentTest);

    if (currentIndex === -1) {
        console.error("Unknown test:", currentTest);
        return;
    }

    if (currentIndex < currentOrder.length - 1) {
        showSection(currentOrder[currentIndex + 1]);
    } else {
        showFinalResults();
    }
}

// Reaction Time Functions

function startReactionTrial() {
    reactionState = "waiting";

    setBackground(COLORS.waiting);

    reactionMessage.textContent = "Wait for green...";
    reactionProgress.textContent = `Trial ${reactionTimes.length + 1}/${totalTrials}`;

    const delay = 2000 + Math.random() * 3000;

    reactionTimer = setTimeout(function() {
        reactionState = "ready";
        setBackground(COLORS.ready);
        reactionMessage.textContent = "Click!";

        greenTime = performance.now();
    }, delay);
}

// Setup
setBackground(COLORS.default);

// Start Button Event Listener
startButton.addEventListener("click", function(event) {
    event.stopPropagation();

    const orderNumber = Number(
        document.getElementById("orderSelect").value
    );

    currentOrder = testOrders[orderNumber - 1];

    showSection(currentOrder[0]);
});

//Reaction Start Event Listener
document.getElementById("reactionStart").addEventListener("click", function(event) {
    event.stopPropagation();

    document.getElementById("reactionInstructions").style.display = "none";
    document.getElementById("reactionGameplay").style.display = "block";
    startReactionTrial();
});

// Reaction Gameplay Event Listener
document.body.addEventListener("click", function() {
    const reactionSection = document.getElementById("reaction");

    const reactionGameplay = document.getElementById("reactionGameplay");

    if (reactionGameplay.style.display !== "block") {
        return;
    }

    if (reactionSection.style.display !== "block") {
        return;
    }

    // False Start
    if (reactionState === "waiting") {
        clearTimeout(reactionTimer);
        console.log("Too early!");
        reactionMessage.textContent = "Too early! Click when it turns GREEN.";
        setBackground(COLORS.falseStart);
        reactionState = "result";
        setTimeout(function() {
            startReactionTrial();
        }, 1500);
        return;        
    }
    if (reactionState === "ready") {
        const clickTime = performance.now();
        const reactionTime = clickTime - greenTime;
        reactionTimes.push(reactionTime);
        if (reactionTimes.length === totalTrials) {
            console.log("Test complete!");
            let total = 0;

            for (let time of reactionTimes) {
                total += time;
            }

            const average = total / reactionTimes.length;
            Reaction = average.toFixed(0);
            setBackground(COLORS.default);
            console.log("Average reaction time: " + average.toFixed(0) + " ms");
            reactionState = "complete";
            reactionMessage.textContent = `Average: ${average.toFixed(0)} ms`;
            reactionProgress.textContent = "10/10 Complete!";
            document.getElementById("reactionEnd").style.display = "block";
            return;
        }
        //Display Result
        setBackground(COLORS.result);
        reactionMessage.textContent = reactionTime.toFixed(0) + " ms";
        console.log(reactionTime);
        reactionState = "result";
        console.log("Scheduling next trial...");
        console.log(typeof startReactionTrial);
        setTimeout(function() {
            console.log("Starting next trial!");
            startReactionTrial();
        }, 1500);
        return;
    
    }

    // Idle
    if (reactionState !== "idle") {
        return;
    }
    startReactionTrial();
});

// Memory
const memoryDigits = 12;
let memoryScores = [];
let memorySummaryShown = false;

function generateMemorySequence() {
    let sequence = "";
    for (let i = 0; i < memoryDigits; i++) {
        sequence += Math.floor(Math.random() * 10).toString();
    }
    return sequence;
}

//Start Memory Test
const showMemory = document.getElementById("showMemory");
let currentMemorySequence = "";
let memoryAcceptingAnswers = false;

showMemory.addEventListener("click", function(event) {
    event.stopPropagation();
    nextTest("reaction");
});

document.getElementById("memoryStart").addEventListener("click", function(event) {
    event.stopPropagation();

    document.getElementById("memoryInstructions").style.display = "none";
    document.getElementById("memoryGameplay").style.display = "block";
    document.getElementById("memoryTimer").style.display = "block";
    startMemoryTrial();
});

function startMemoryTrial() {
    let seconds = 10;
    currentMemorySequence = generateMemorySequence();
    document.getElementById("memorySequence").textContent = currentMemorySequence;
    document.getElementById("memoryTimer").style.display = "block";
    document.getElementById("memoryTimer").textContent = "10 seconds remaining";
    document.getElementById("memoryRecall").style.display = "none";
    
    document.getElementById("memoryInput").value = "";
    const timer = setInterval(function() {
        seconds--;
        console.log(seconds);
        document.getElementById("memoryTimer").textContent = seconds + " seconds remaining";
        if (seconds === 0) {
            clearInterval(timer);
            document.getElementById("memorySequence").textContent = "";
            document.getElementById("memoryTimer").textContent = "Time's up!";
            document.getElementById("memoryRecall").style.display = "block";
            memoryAcceptingAnswers = true;
        }
    }, 1000);
}

document.getElementById("memorySubmit").addEventListener("click", function() {
    if (!memoryAcceptingAnswers) return;
    const answer = document.getElementById("memoryInput").value;
    if (!/^\d{1,12}$/.test(answer)) {
        alert("Please enter between 1 and 12 digits.");
        return;
    }
    console.log("Participant's answer:", answer);

    let correctDigits = 0;
    for (let i = 0; i < memoryDigits; i++) {
        if (answer[i] === currentMemorySequence[i]) {
            correctDigits++;
        }
    }
    console.log("Correct digits:", correctDigits);
    console.log("Accuracy:", (correctDigits / memoryDigits * 100).toFixed(2) + "%");
    const accuracy = correctDigits / memoryDigits;
    memoryAcceptingAnswers = false;
    memoryScores.push(accuracy);
    document.getElementById("memoryRecall").style.display = "none";
    document.getElementById("memoryNext").style.display = "block";
    document.getElementById("memoryResults").style.display = "block";
    document.getElementById("memoryTimer").style.display = "none";
    document.getElementById("memoryScore").textContent = "Accuracy: " + (accuracy * 100).toFixed(2) + "% (" + correctDigits + "/" + memoryDigits + ")";
    document.getElementById("memoryResults").style.display = "block";
});

const memoryNext = document.getElementById("memoryNext");

memoryNext.addEventListener("click", function() {
    if (memoryScores.length >= totalMemoryTrials) {
        if (memorySummaryShown) {
            nextTest("memory");
            return;
        }

        let totalAccuracy = 0;

        for (let score of memoryScores) {
            totalAccuracy += score;
        }

        const averageAccuracy = totalAccuracy / memoryScores.length;
        memoryResults = (averageAccuracy * 100).toFixed(2);
        document.getElementById("memoryResults").style.display = "block";
        document.getElementById("memoryScore").textContent =
            `Final Average Accuracy: ${(averageAccuracy * 100).toFixed(2)}%`;
        memorySummaryShown = true;
        return;
    }

    document.getElementById("memoryResults").style.display = "none";
    startMemoryTrial();
});

//Hotkeys for Debug Mode
document.addEventListener("keydown", function(event) {
    if (!DEBUG_MODE) return;
    if (!event.ctrlKey || !event.shiftKey) return;

    switch (event.code) {
        case "Digit1":
            showSection("reaction");
            break;

        case "Digit2":
            showSection("memory");
            break;

        case "Digit3":
            showSection("stroop");
            break;

        case "Digit4":
            showSection("end");
            console.log("Reaction:", typeof Reaction);
            console.log("Memory:", typeof memoryResults);
            console.log("Stroop Time:", typeof ACRT);
            console.log("Stroop Accuracy:", typeof averageStroopAccuracy);
            document.getElementById("finalResults").textContent =
                `Reaction Time: ${Reaction} ms\n` +
                `Memory Accuracy: ${memoryResults}%\n` +
                `Stroop Response Time: ${ACRT} ms\n` +
                `Stroop Accuracy: ${averageStroopAccuracy}%`;
            break;

        default:
            return;
    }

    event.preventDefault();
});

//STROOP!
const stroopColors = ["red", "yellow", "blue", "green"];
const stroopColorHex = {
    red: "#ff3232",
    yellow: "#ffff00",
    blue: "#0389ff",
    green: "#00cc00"
};
let currentStroopColor = "";
let stroopAcceptingAnswers = false;

function generateStroopItem() {
    const word = stroopColors[
        Math.floor(Math.random() * stroopColors.length)
    ].toUpperCase();

    const textColor = stroopColors[
        Math.floor(Math.random() * stroopColors.length)
    ];

    return { word, textColor };
}

function showStroopItem() {
    document.getElementById("stroopFeedback").textContent = "";
    const item = generateStroopItem();

    document.getElementById("stroopWord").textContent = item.word;
    document.getElementById("stroopWord").style.color = stroopColorHex[item.textColor];
    document.getElementById("stroopProgress").textContent =
        `Trial ${stroopResults.length + 1}/${totalStroopTrials}`;
    document.getElementById("stroopWord").style.visibility = "visible";
    stroopStartTime = performance.now();
    currentStroopColor = item.textColor;
}

stroopStart.addEventListener("click", function(event) {
    event.stopPropagation();
    stroopAcceptingAnswers = false;
    document.getElementById("stroopInstructions").style.display = "none";
    document.getElementById("stroopGameplay").style.display = "block";
    startStroopCountdown();
});

const stroopButtons = document.querySelectorAll("#stroopButtons button");
const stroopKeys = {
    r: "red",
    y: "yellow",
    b: "blue",
    g: "green"
};

stroopButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        const selectedColor = button.dataset.color;
        submitStroopAnswer(selectedColor);
    });
});

function submitStroopAnswer(answer) {
    if (!stroopAcceptingAnswers) return;
    stroopAcceptingAnswers = false;
    console.log("Selected:", answer);
    console.log("Correct:", currentStroopColor);
    const responseTime = performance.now() - stroopStartTime;
    const isCorrect = answer === currentStroopColor;
    const feedback = document.getElementById("stroopFeedback");

    feedback.textContent = isCorrect ? "Correct!" : "Incorrect!";
    feedback.style.color = isCorrect ? "#00cc00" : "#ff3232";
    if (answer === currentStroopColor) {
        console.log("Correct!");
    } else {
        console.log("Incorrect!");
    }
    stroopResults.push({
        correct: isCorrect,
        time: responseTime
    });

    if (stroopResults.length >= totalStroopTrials) {
        finishStroopTest();
    } else {
        setTimeout(function() {
            showStroopItem();
            stroopAcceptingAnswers = true;
        }, 250);
    }
}

document.addEventListener("keydown", function(event) {
    if (event.repeat) return;
    const gameplay = document.getElementById("stroopGameplay");
    const section = document.getElementById("stroop");

    if (section.style.display !== "block") return;
    if (gameplay.style.display !== "block") return;

    const key = event.key.toLowerCase();

    if (stroopKeys[key]) {
        submitStroopAnswer(stroopKeys[key]);
    }
});

let stroopResults = [];
let stroopStartTime = 0;

function finishStroopTest() {
    stroopAcceptingAnswers = false;
    document.getElementById("stroopGameplay").style.display = "none";
    document.getElementById("stroopResults").style.display = "block";
    const correctTrials = stroopResults.filter(function(result) {
        return result.correct;
    });
    const accuracy = correctTrials.length / stroopResults.length;
    console.log("Stroop test complete", stroopResults);
    console.log("Accuracy:", accuracy);
    document.getElementById("stroopAccuracy").textContent = "Accuracy: " +(accuracy * 100).toFixed(2) + "%";
    averageStroopAccuracy = (accuracy * 100).toFixed(2);
    const averageTime = correctTrials.length > 0
    ? correctTrials.reduce((sum, result) => sum + result.time, 0) / correctTrials.length
    : null;
    document.getElementById("stroopAverageTime").textContent =
    "Average Correct Response Time: " + (averageTime === null ? "N/A" : averageTime.toFixed(0) + " ms");
    ACRT = averageTime === null ? "N/A" : averageTime.toFixed(0);
}

function startStroopCountdown() {
    let seconds = 3;
    const countdown = document.getElementById("stroopCountdown");

    countdown.style.display = "block";
    countdown.textContent = seconds;

    const interval = setInterval(function() {
        seconds--;

        if (seconds > 0) {
            countdown.textContent = seconds;
        } else {
            clearInterval(interval);
            countdown.style.display = "none";
            document.getElementById("stroopActiveTest").style.display = "block";
            showStroopItem();
            stroopAcceptingAnswers = true;
        }
    }, 1000);
}

finish.addEventListener("click", function(event) {
    event.stopPropagation();

    nextTest("stroop");
});

function showFinalResults() {
    document.getElementById("finalResults").textContent =
        `Reaction Time: ${Reaction} ms\n` +
        `Memory Accuracy: ${memoryResults}%\n` +
        `Stroop Response Time: ${ACRT} ms\n` +
        `Stroop Accuracy: ${averageStroopAccuracy}%`;

    showSection("end");
}
    document.getElementById("finalResults").textContent =
        `Reaction Time: ${Reaction} ms\n` +
        `Memory Accuracy: ${memoryResults}%\n` +
        `Stroop Response Time: ${ACRT} ms\n` +
        `Stroop Accuracy: ${averageStroopAccuracy}%`;

        // Email Submission

const resultsForm = document.getElementById("resultsForm");
const sendResults = document.getElementById("sendResults");
const sendStatus = document.getElementById("sendStatus");

let resultsSent = false;

resultsForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (resultsSent || sendResults.disabled) return;

    // Verify that all tests are complete
    if (
        reactionTimes.length !== totalTrials ||
        memoryScores.length !== totalMemoryTrials ||
        !memorySummaryShown ||
        stroopResults.length !== totalStroopTrials
    ) {
        sendStatus.textContent = "Please complete all tests first.";
        return;
    }

    const name = document.getElementById("participantName").value.trim();
    const contact = document.getElementById("participantContact").value.trim();

    if (!name || !contact) {
        sendStatus.textContent = "Please complete all fields.";
        return;
    }

    // Prevent repeated submissions
    sendResults.disabled = true;
    sendResults.textContent = "SENDING...";
    sendStatus.textContent = "";

    const templateParams = {
        participant_name: name,
        participant_contact: contact,

        submission_date: new Date().toLocaleString(),

        test_order: currentOrder
            .map(test => test[0].toUpperCase())
            .join(""),

        reaction_time: Reaction,
        memory_accuracy: memoryResults,
        stroop_time: ACRT === "N/A" ? "N/A" : `${ACRT} ms`,
        stroop_accuracy: averageStroopAccuracy
    };

    try {
        await emailjs.send(
            "service_muovoel",
            "template_f3rdyj7",
            templateParams
        );

        resultsSent = true;

        sendResults.textContent = "RESULTS SENT";
        sendStatus.textContent = "Results successfully submitted!";
        sendStatus.style.color = "#00cc00";

        document.getElementById("participantName").disabled = true;
        document.getElementById("participantContact").disabled = true;
        document.getElementById("resultsConsent").disabled = true;

    } catch (error) {
        console.error("EmailJS error:", error);

        sendStatus.textContent =
            "Failed to send results. Please try again.";

        sendStatus.style.color = "#ff3232";

        sendResults.disabled = false;
        sendResults.textContent = "SEND RESULTS";
    }
});
