const startButton = document.getElementById("startButton");
let reactionTimes = [];
const totalTrials = 10;

function showSection(sectionId) {
    document.querySelectorAll("section").forEach(function(section) {
        section.style.display = "none";
    });
    const section = document.getElementById(sectionId);
    section.style.display = "block";
}

startButton.addEventListener("click", function() {
    event.stopPropagation();
    document.documentElement.requestFullscreen();
    showSection("reaction");
});

function setBackground(color) {
    document.documentElement.style.setProperty("--background-color", color);
}

const COLORS = {
    default: "#19222d",
    waiting: "#ff3232",
    ready: "#00cc00",
    falseStart: "#a00000",
    result: "#0389ff"
};

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

let reactionState = "idle";
setBackground(COLORS.default);
let greenTime = 0;
let reactionTimer;
const reactionMessage = document.getElementById("reactionMessage");
document.getElementById("reactionStart").addEventListener("click", function(event) {
    event.stopPropagation();

    document.getElementById("reactionInstructions").style.display = "none";
    document.getElementById("reactionGameplay").style.display = "block";
    startReactionTrial();
});

document.body.addEventListener("click", function() {
    const reactionSection = document.getElementById("reaction");

    const reactionGameplay = document.getElementById("reactionGameplay");

    if (reactionGameplay.style.display !== "block") {
        return;
    }

    if (reactionSection.style.display !== "block") {
        return;
    }
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
            setBackground(COLORS.default);
            console.log("Average reaction time: " + average.toFixed(0) + " ms");
            reactionState = "complete";
            reactionMessage.textContent = `Average: ${average.toFixed(0)} ms`;
            reactionProgress.textContent = "10/10 Complete!";
            return;
        }
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
    if (reactionState !== "idle") {
        return;
    }
    startReactionTrial();
});