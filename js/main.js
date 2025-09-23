const ARTISTS = [
    { name: "SZA", img: "images/sza.webp" },
    { name: "H.E.R.", img: "images/her.webp" },
    { name: "GloRilla", img: "images/glorilla.png" },
    { name: "Megan Thee Stallion", img: "images/megan.webp" },
    { name: "Chris Brown", img: "images/chris.jpg" },
    { name: "Drake", img: "images/drake.webp" },
    { name: "Kendrick Lamar", img: "images/kendrick.webp" }
];

const reelSections = ["#reel1", "#reel2", "#reel3"].map(sel => document.querySelector(sel));
const reelImages = reelSections.map(reel => reel.querySelector(".slot"));
const reelCaptions = reelSections.map(reel => reel.querySelector(".caption"));

const resultText = document.querySelector("#result");
const balanceText = document.querySelector("#balance");
const spinButton = document.querySelector("#spin");
const resetButton = document.querySelector("#reset");

const betMinButton = document.querySelector("#bet-min");
const betMaxButton = document.querySelector("#bet-max");
const betDisplay = document.querySelector("#bet-display");

const curtain = document.querySelector(".curtain");
const stageFlash = document.querySelector(".stage-flash");

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGame);
betMinButton.addEventListener("click", setBetMin);
betMaxButton.addEventListener("click", setBetMax);

let balance = 100;
let bet = 5;
const minBet = 5;
const maxBet = 20;

const matchTwo = 5;     
const matchThree = 15;  

function randomPick(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function spinOnce() {
    return [randomPick(ARTISTS), randomPick(ARTISTS), randomPick(ARTISTS)];
}

function renderReels(chosenCards) {
    chosenCards.forEach((card, index) => {
        reelImages[index].src = card.img;
        reelImages[index].alt = card.name;
        reelCaptions[index].textContent = card.name;
    });
}

function evaluateSpin(chosenCards) {
    const counts = {};
    chosenCards.forEach(card => {
        counts[card.name] = (counts[card.name] || 0) + 1;
    });

    let mostFrequentArtist = null;                                  // from ChatGPT
    let highestCount = 0;

    for (const [artistName, count] of Object.entries(counts)) {   // from ChatGPT
        if (count > highestCount) {
            highestCount = count;
            mostFrequentArtist = artistName;
        }
    }

    return { artist: mostFrequentArtist, hits: highestCount };
}

function clearHighlights() {
    reelSections.forEach(section => section.classList.remove("match", "perfect"));
}

function highlightMatches(chosenCards, artist) {
    clearHighlights();
    const matchingIndexes = chosenCards.map(card => card.name === artist);

    const matchedReels = [];
    matchingIndexes.forEach((isMatch, index) => {
        if (isMatch) matchedReels.push(reelSections[index]);
    });

    if (matchedReels.length === 3) {
        reelSections.forEach(section => section.classList.add("perfect"));
    } else if (matchedReels.length === 2) {
        matchedReels.forEach(section => section.classList.add("match"));
    }
}

function closeCurtain() { curtain.classList.remove("open"); curtain.classList.add("closed"); } // from ChatGPT
function openCurtain() { curtain.classList.remove("closed"); curtain.classList.add("open"); } //

function flashStage(ms = 240) {                                     // 
    stageFlash.classList.add("show");                               //    from ChatGPT   
    setTimeout(() => stageFlash.classList.remove("show"), ms);      //  
}

function updateBetDisplay() { betDisplay.textContent = `Current Bet: $${bet}`; }
function updateBalance() { balanceText.textContent = `Balance: $${balance}`; }

async function spin() {
    if (balance < bet) {
        resultText.textContent = "Not enough balance.";
        return;
    }

    balance -= bet;
    updateBalance();
    spinButton.disabled = true;

    closeCurtain();
    await new Promise(resolve => setTimeout(resolve, 360));   // from ChatGPT

    clearHighlights();

    const chosenCards = spinOnce();
    renderReels(chosenCards);
    const { artist, hits } = evaluateSpin(chosenCards);

    openCurtain();

    let winnings = 0;
    if (hits === 3) {
        highlightMatches(chosenCards, artist);
        winnings = bet * matchThree;
        resultText.textContent = `🎉 YOU WON TICKETS & VIP PASSES TO ${artist}! +$${winnings}`;
        flashStage(280);
    } else if (hits === 2) {
        highlightMatches(chosenCards, artist);
        winnings = bet * matchTwo;
        resultText.textContent = `✨ YOU WON TICKETS TO ${artist}! +$${winnings}`;
        flashStage(220);
    } else {
        resultText.textContent = "No match. Try again!";
    }

    balance += winnings;
    updateBalance();
    spinButton.disabled = false;
}

function resetGame() {
    balance = 100;
    updateBalance();

    resultText.textContent = "Press SPIN to book the show.";
    reelSections.forEach((section, index) => {
        reelImages[index].src = "";
        reelImages[index].alt = "";
        reelCaptions[index].textContent = "?";
    });

    clearHighlights();
    openCurtain();
    bet = minBet;
    updateBetDisplay();
}

function setBetMin() { bet = minBet; updateBetDisplay(); }
function setBetMax() { bet = maxBet; updateBetDisplay(); }

updateBalance();
updateBetDisplay();

