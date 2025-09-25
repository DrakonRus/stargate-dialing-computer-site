document.addEventListener('DOMContentLoaded', function () {
    CreateKeyboardDiv();
    CreateChevrons();
}, false);

// Globals
const GLYPHS = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklm"];
let ADDRESS = [];
let MAX_ADDRESS_LENGTH = 9
let SLOW_ROTATE_SPEED = 0.0333
let SLOW_ROTATE_DELAY = 0.25


function CreateKeyboardDiv() {
    let keyboardDiv = document.getElementById("glyph-keyboard-container");

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 13; j++) {
            let button = document.createElement("button");

            let glyph = GLYPHS[13 * i + j]

            button.textContent = glyph;
            button.onclick = function() {
                addressInputAdd(this, glyph);
            }
            button.className = "glyph-button"
            button.id = `glyph-button_${glyph}`

            keyboardDiv.append(button);
        }
        let br = document.createElement("br");
        keyboardDiv.append(br);
    }

    let backspaceButton = document.createElement("button");
    backspaceButton.textContent = "Backspace";
    backspaceButton.className = "functional-button";
    backspaceButton.onclick = function () {
        addressInputPop();
    }
    
    let enterButton = document.createElement("button");
    enterButton.textContent = "Dial";
    enterButton.className = "functional-button";
    enterButton.onclick = function () {
        dial();
    }

    keyboardDiv.append(enterButton, backspaceButton);
    document.body.append(keyboardDiv);
}

function addressInputAdd(button, glyph) {
    console.log(glyph);

    if (ADDRESS.length == MAX_ADDRESS_LENGTH) return;
    if (ADDRESS.includes(glyph)) return;

    let addressInput = document.getElementById("address-input-container");

    ADDRESS.push(glyph);
    addressInput.textContent = ADDRESS.join("");

    disableButton(button);
}

function addressInputPop() {
    if (ADDRESS.length == 0) return;

    let addressInput = document.getElementById("address-input-container");

    let glyph = ADDRESS.pop();
    addressInput.textContent = ADDRESS.join("");

    enableButton(document.getElementById(`glyph-button_${glyph}`))
}

// Rotate → Chevron 0 On → Chevron 0 Off → Chevron 1 On → Rotate → ... → Rotate → Chevron 0 On → Activate                      
function dial() {
    let ring = document.getElementById("stargate-inner-ring");
    let addressLength = ADDRESS.length;
    let chevronNumber = 0;
    let glyphIndex;

    getNextGlyph();

    function getNextGlyph() {
        if (chevronNumber >= ADDRESS.length) return;

        glyphIndex = GLYPHS.indexOf(ADDRESS[chevronNumber]);

        rotateToNextGlyph();

        chevronNumber++;
        waitAnimationEnd(ring, () => {
            if (chevronNumber == ADDRESS.length) {
                lockChevron();
            } else {
                encodeChevron(chevronNumber);
            }
        });
    }

    function rotateToNextGlyph() {
        let currentAngle = Number(ring.dataset.angle);
        let currentDirection = Number(ring.dataset.direction);

        let targetAngle = (360 / GLYPHS.length) * (glyphIndex);
        console.log(targetAngle);

        // 1 - right
        // 0 - left
        if (currentDirection == 0) {
            targetAngle = currentAngle - 360 + (targetAngle - (currentAngle + 360) % 360);
        }
        else {
            // ДОРАБОТАТЬ
            targetAngle = currentAngle + (targetAngle - (currentAngle + 360) % 360);
        }

        let speed = SLOW_ROTATE_SPEED;
        let delay = SLOW_ROTATE_DELAY;
        let time = Math.abs(currentAngle - targetAngle) * speed;

        ring.style.transition = `${time}s ${delay}s ease-in-out`;
        ring.style.transform = `rotate(${-targetAngle}deg)`;

        ring.dataset.angle = targetAngle;
        ring.dataset.direction = Number(currentDirection) ^ 1;
        
        console.log(`${currentAngle} → ${targetAngle}`);
    }

    function encodeChevron(N) {
        let chevron_0 = document.getElementById(`chevron_activated_0`);

        if (N == 7 && addressLength >= 8) {
            N = 4;
        } else if (N == 8 && addressLength == 9) {
            N = 5;
        } else if (N >= 4) {
            N += 2;
        }

        let chevron_N = document.getElementById(`chevron_activated_${N}`);
        
        activateChevron(chevron_0);

        waitAnimationEnd(chevron_0, () => {
            deactivateChevron(chevron_0);
            activateChevron(chevron_N);
        });

        waitAnimationEnd(chevron_N, () => {
            getNextGlyph();
        });
    }

    function lockChevron() {
        let chevron_0 = document.getElementById(`chevron_activated_0`);
        activateChevron(chevron_0);
    }

    function activateChevron(chevron) {
        chevron.style.opacity = "100%";
    }

    function deactivateChevron(chevron) {
        chevron.style.opacity = "0%";
    }
}

function CreateChevrons() {
    const orbit = document.getElementById("chevrons-container");
    const count = 9;
    const radius = 425;
    const imgActiveSrc = "images/activated chevron be like v2.png";
    const imgDeactiveSrc = "images/chevron be like v2.png";

    for (let i = 0; i < count; i++) {
        const div = document.createElement("chevron-container");
        const imgActive = document.createElement("img");
        const imgDeactive = document.createElement("img");

        const angle = (i * 360 / count);

        const x = radius * Math.sin(angle * Math.PI / 180);
        const y = -radius * Math.cos(angle * Math.PI / 180);

        // Деактивированный шеврон
        imgDeactive.src = imgDeactiveSrc;

        imgDeactive.className = "chevron";
        imgDeactive.id = `chevron_deactivated_${i}`
        imgDeactive.style.zIndex = 1;

        imgDeactive.style.left = `calc(50% + ${x}px - 75px)`; // -75px = половина ширины шеврона
        imgDeactive.style.top = `calc(50% + ${y}px - 75px)`;

        imgDeactive.style.transform = `rotate(${angle}deg)`;

        // Активированный шеврон
        imgActive.src = imgActiveSrc;

        imgActive.className = "chevron";
        imgActive.id = `chevron_activated_${i}`
        imgActive.style.zIndex = 2;

        imgActive.style.left = `calc(50% + ${x}px - 75px)`; // -75px = половина ширины шеврона
        imgActive.style.top = `calc(50% + ${y}px - 75px)`;

        imgActive.style.transform = `rotate(${angle}deg)`;
        imgActive.style.opacity = "0%";

        div.append(imgActive);
        div.append(imgDeactive);
        orbit.appendChild(div);
    }
}

function disableButton(button) {
    // button.disabled = true;
    button.classList.add("disabled");
}

function enableButton(button) {
    // button.disabled = false;
    button.classList.remove("disabled");
}

function waitAnimationEnd(element, func) {
    element.addEventListener("transitionend", function handler() {
        element.removeEventListener("transitionend", handler);
        func();
    });
}