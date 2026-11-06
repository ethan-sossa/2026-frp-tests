const startButton = document.getElementById("startButton");

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

let reactionState = "idle";
setBackground("#19222d");
let greenTime = 0;
let reactionTimer;
document.body.addEventListener("click", function() {
    const reactionSection = document.getElementById("reaction");
    if (reactionSection.style.display !== "block") {
        return;
    }
    if (reactionState === "waiting") {
        clearTimeout(reactionTimer);
        console.log("Too early!");
        reactionState = "idle";
        setBackground("#19222d");
        return;
    }
    if (reactionState === "ready") {
        const clickTime = performance.now();
        const reactionTime = clickTime - greenTime;
        console.log(reactionTime);
        reactionState = "idle";
        setBackground("#19222d");
        return;
    }
    if (reactionState !== "idle") {
        return;
    }
    reactionState = "waiting";
    setBackground("red");
    const delay = 2000 + Math.random() * 3000;
    reactionTimer = setTimeout(function() {
        reactionState = "ready";
        console.log("Ready!");
        setBackground("green");
        greenTime = performance.now();
    }, delay);
});