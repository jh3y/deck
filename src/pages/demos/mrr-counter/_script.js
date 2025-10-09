import { Pane } from "tweakpane"

const config = {
  ease: "basic",
  transition: 1.25,
  val: Number.parseFloat(document.documentElement.dataset.defaultValue, 10),
  explode: false,
}

const ctrl = new Pane({
  title: "Config",
  expanded: true,
})
ctrl.addBinding(config, "ease", {
  options: {
    back: "back",
    basic: "basic",
    bounce: "bounce",
    circ: "circ",
    elastic: "elastic",
    expo: "expo",
    power: "power",
    sine: "sine",
  },
  label: "Ease",
})
ctrl.addBinding(config, "transition", {
  min: 0,
  max: 5,
  step: 0.01,
  label: "Transition (s)",
})
ctrl.addBinding(config, "val", {
  min: 0,
  max: 99_999.99,
  step: 0.01,
  label: "Value",
})

ctrl.addBinding(config, "explode", {
  label: "Explode",
})

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const tracks = document.querySelectorAll(".counter [data-value]")
const captions = document.querySelectorAll(".counter .sr-only")
const sync = (event) => {
  if (event.last) {
    const padCount =
      Number(99_999).toString().length - config.val.toFixed(2).toString().length
    const paddedValue = config.val.toFixed(2).toString().padStart(8, "0")
    const digits = paddedValue
      .split("")
      .filter((i) => !Number.isNaN(Number.parseInt(i, 10)))
      .slice(0, 7)
    for (let i = 0; i < tracks.length; i++) {
      const index = i % 7
      const track = tracks[i]
      track.dataset.value = digits[index]
      track.style.setProperty("--v", digits[index])
    }
    let i = 0
    const renderValue = formatter
      .format(paddedValue)
      .split("")
      .map((character) => {
        if (!Number.isNaN(Number.parseInt(character, 10)) && i < padCount) {
          i++
          return "0"
        }
        return character
      })
      .join("")

    for (let c = 0; c < captions.length; c++) {
      const caption = captions[c]
      caption.innerText = renderValue
    }
    document.documentElement.style.setProperty("--transition", config.transition)
    document.documentElement.style.setProperty("--ease", `var(--${config.ease})`)
    document.documentElement.dataset.explode = config.explode
  }
}

ctrl.on("change", sync)
sync()
