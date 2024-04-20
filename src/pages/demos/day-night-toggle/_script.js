const BUTTON = document.querySelector("button")

const TOGGLE = () => {
  const IS_PRESSED = BUTTON.matches("[aria-pressed=true]")
  BUTTON.setAttribute("aria-pressed", !IS_PRESSED)
}

BUTTON.addEventListener("click", TOGGLE)
