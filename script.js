// --- Data State & Config ---
let totalCO2 = 0.0;

// Configurable Milestones with weights and descriptions
const milestones = [
    { threshold: 0.2, label: "Smartphone", icon: "📱", desc: "Offset the weight of a basic phone (~0.2 kg)" },
    { threshold: 1.0, label: "Loaf of Bread", icon: "🍞", desc: "Offset the physical weight of a bread loaf (~1 kg)" },
    { threshold: 5.0, label: "Bowling Ball", icon: "🎳", desc: "Equal to a solid professional bowling ball (~5 kg)" },
    { threshold: 15.0, label: "Cat", icon: "🐈", desc: "You've saved the equivalent weight of an average house cat (~15 kg)" },
    { threshold: 50.0, label: "Golden Retriever", icon: "🐕", desc: "Equal to the weight of a heavy adult dog (~50 kg)" }
];

// Icons mapped for falling animations based on action type
const iconMap = {
    bike: "🚲",
    meal: "🥗",
    dry: "🧺",
    reusable: "☕"
};

// --- DOM Elements ---
const form = document.getElementById("logger-form");
const habitSelect = document.getElementById("habit-select");
const quantitySlider = document.getElementById("habit-quantity");
const quantityDisplay = document.getElementById("quantity-display");
const unitLabel = document.getElementById("unit-label");
const totalCO2Text = document.getElementById("total-co2");
const scaleSystem = document.getElementById("scale-system");
const leftPlate = document.getElementById("left-plate");
const fallZone = document.getElementById("fall-zone");
const resetBtn = document.getElementById("reset-btn");

// Milestone DOM elements
const mIcon = document.getElementById("milestone-icon");
const mTitle = document.getElementById("milestone-title");
const mDesc = document.getElementById("milestone-desc");
const mProgress = document.getElementById("milestone-progress");
const mProgressText = document.getElementById("progress-text");

// Modal DOM elements
const modal = document.getElementById("celebration-modal");
const modalText = document.getElementById("modal-text");

// --- Event Listeners ---
habitSelect.addEventListener("change", (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    unitLabel.textContent = selectedOption.getAttribute("data-unit");
});

quantitySlider.addEventListener("input", (e) => {
    quantityDisplay.textContent = e.target.value;
});

form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const selectedOption = habitSelect.options[habitSelect.selectedIndex];
    const habitKey = habitSelect.value;
    const factor = parseFloat(selectedOption.getAttribute("data-factor"));
    const quantity = parseInt(quantitySlider.value);
    
    // Calculate new footprint saved
    const co2Saved = factor * quantity;
    const previousCO2 = totalCO2;
    totalCO2 = parseFloat((totalCO2 + co2Saved).toFixed(2));
    
    // Play falling animation first, update numbers and check milestones after drop hits plate
    spawnFallingObject(iconMap[habitKey]);
    
    setTimeout(() => {
        updateStats();
        checkMilestones(previousCO2);
    }, 800); // Syncs with CSS drop animation timing
});

resetBtn.addEventListener("click", () => {
    totalCO2 = 0.0;
    updateStats();
    scaleSystem.className = "scale-system"; // reset tilt
    leftPlate.innerHTML = '<span class="plate-label">Your Saved CO₂</span>'; // Clear dropped objects
    mProgress.style.width = "0%";
    mProgressText.textContent = "0.0 / 0.2 kg";
});

// --- Functions ---

function updateStats() {
    totalCO2Text.textContent = totalCO2.toFixed(1);
    
    // Tilt the balance scale based on cumulative offsets
    if (totalCO2 > 0) {
        scaleSystem.className = "scale-system tilt-left";
    } else {
        scaleSystem.className = "scale-system";
    }
}

function spawnFallingObject(emoji) {
    const item = document.createElement("div");
    item.classList.add("falling-item");
    item.textContent = emoji;
    
    // Randomize spawning horizontal location slightly over the Left Plate
    const minLeft = 50; 
    const maxLeft = 110;
    const randomLeft = Math.floor(Math.random() * (maxLeft - minLeft + 1)) + minLeft;
    item.style.left = `${randomLeft}px`;
    
    fallZone.appendChild(item);
    
    // When the animation ends, attach the item physically to the scale plate so it tilts with it
    item.addEventListener("animationend", () => {
        item.remove();
        const stationaryItem = document.createElement("span");
        stationaryItem.textContent = emoji;
        stationaryItem.style.position = "absolute";
        stationaryItem.style.fontSize = "1.5rem";
        // Scatter resting objects across the left plate
        stationaryItem.style.left = `${Math.random() * 80 + 10}px`;
        stationaryItem.style.bottom = `${Math.random() * 15 + 10}px`;
        leftPlate.appendChild(stationaryItem);
    });
}

function checkMilestones(previousCO2) {
    // Find the first milestone that hasn't been completely achieved yet, or get the last one.
    let currentMilestone = milestones.find(m => totalCO2 < m.threshold) || milestones[milestones.length - 1];
    
    // Check if we just crossed a new milestone boundary
    const milestoneCrossed = milestones.find(m => previousCO2 < m.threshold && totalCO2 >= m.threshold);
    
    if (milestoneCrossed) {
        triggerCelebration(milestoneCrossed);
    }
    
    // Update Milestone HUD
    mIcon.textContent = currentMilestone.icon;
    mTitle.textContent = currentMilestone.label;
    mDesc.textContent = currentMilestone.desc;
    
    // Update Progress bar towards current active milestone
    const progressPercent = Math.min((totalCO2 / currentMilestone.threshold) * 100, 100);
    mProgress.style.width = `${progressPercent}%`;
    mProgressText.textContent = `${totalCO2.toFixed(1)} / ${currentMilestone.threshold} kg`;
}

function triggerCelebration(milestone) {
    modalText.textContent = `You've locked in ${totalCO2} kg of total offsets! That's equivalent to the physical weight of a ${milestone.label}!`;
    modal.style.display = "flex";
}

function closeModal() {
    modal.style.display = "none";
}
