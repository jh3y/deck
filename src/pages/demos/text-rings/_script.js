import { Pane } from "tweakpane"

const heading = document.querySelector("h1")
const ctrl = new Pane({
  title: "Config",
  expanded: true,
})

const config = {
  spacing: 1.2,
  size: 2,
  text: "Made by Jhey with CSS Trig functions • ",
  debug: false,
}

const sync = () => {
  document.documentElement.dataset.debug = config.debug
  // Make the ring text
  const text = config.text
  // 1. Take the text and split it into spans...
  const chars = text.split("")
  heading.innerHTML = ""
  heading.style.setProperty("--char-count", chars.length)

  for (let c = 0; c < chars.length; c++) {
    heading.innerHTML += `<span aria-hidden="true" class="char ${
      chars[c].trim() === "" ? "empty" : ""
    }" style="--char-index: ${c};">${chars[c]}</span>`
  }
  heading.innerHTML += `<span class="sr-only">${config.text}</span>`
  // Set the styles
  heading.style.setProperty("--font-size", config.size)
  heading.style.setProperty("--character-width", config.spacing)
}

ctrl.addBinding(config, "spacing", {
  min: 0.5,
  max: 2,
  step: 0.1,
  label: "Spacing (ch)",
})
ctrl.addBinding(config, "size", {
  min: 0.1,
  max: 3,
  step: 0.1,
  label: "Size (rem)",
})
ctrl.addBinding(config, "text", { label: "Text" })
ctrl.addBinding(config, "debug", { label: "Debug" })

ctrl.on("change", sync)
sync()
