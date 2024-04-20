const toggle = document.querySelector("[aria-pressed]")

document.documentElement.dataset.theme = "dark"

const flip = () => {
  const isPressed = toggle.matches("[aria-pressed=true]")
  document.documentElement.dataset.theme = isPressed ? "dark" : "light"
  toggle.setAttribute("aria-pressed", !isPressed)
}

const toggleTheme = () => {
  if (!document.startViewTransition) return flip()
  document.startViewTransition(() => flip())
}

toggle.addEventListener("click", toggleTheme)

const pickers = document.querySelectorAll(".color-picker")

let colorPicker
let currentNote

const setTheme = (event) => {
  currentNote.style.setProperty("--color", event.target.value)
}

const pickColor = (event) => {
  currentNote = event.target.previousElementSibling
  const currentColor = getComputedStyle(currentNote).getPropertyValue("--color")
  if (colorPicker) {
    colorPicker.removeEventListener("input", setTheme)
    colorPicker.remove()
  }
  colorPicker = Object.assign(document.createElement("input"), {
    type: "color",
    value: currentColor,
    className: "sr-only",
  })
  document.body.appendChild(colorPicker)
  colorPicker.click()
  colorPicker.addEventListener("input", setTheme)
}
for (const picker of pickers) {
  picker.addEventListener("click", pickColor)
}
