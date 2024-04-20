import { Pane } from "tweakpane"

// const MIN = document.querySelector("#min");
// const MAX = document.querySelector("#max");
// const MAX_LABEL = document.querySelector("[for=max]");
// const MIN_LABEL = document.querySelector("[for=min]");

// const HORIZONTAL = document.querySelector("#horizontal");

const config = {
  horizontal: false,
  constrain: false,
  min: 1,
  max: 3,
}

const sharedProps = {
  spellcheck: false,
  name: "textarea",
  id: "textarea",
  placeholder: "Type your message...",
}
const switchMode = () => {
  const INPUT = document.querySelector("#textarea")
  if (INPUT.tagName === "TEXTAREA") {
    min.min = 40
    min.max = 100
    config.min = 50
    min.label = "Min (ch)"
    min.refresh()

    max.min = 100
    max.max = 200
    config.max = 100
    max.label = "Max (ch)"
    max.refresh()

    INPUT.replaceWith(
      Object.assign(document.createElement("input"), sharedProps),
    )
  } else {
    min.min = 1
    min.max = 10
    config.min = 1
    min.label = "Min (lh)"
    min.refresh()

    max.min = 5
    max.max = 20
    config.max = 10
    max.label = "Max (lh)"
    max.refresh()

    INPUT.replaceWith(
      Object.assign(document.createElement("textarea"), sharedProps),
    )
  }
  sync()
}

const ctrl = new Pane({
  title: "Config",
  expanded: true,
})

const flip = ctrl.addBinding(config, "horizontal", { label: "Horizontal" })
ctrl.addBinding(config, "constrain", { label: "Constrain" })
const min = ctrl.addBinding(config, "min", {
  label: "Min (lh)",
  min: 1,
  max: 10,
  step: 1,
})
const max = ctrl.addBinding(config, "max", {
  label: "Max (lh)",
  min: 1,
  max: 10,
  step: 1,
})

const sync = () => {
  document.documentElement.style.setProperty("--min", config.min)
  document.documentElement.style.setProperty("--max", config.max)

  document.documentElement.dataset.constrain = config.constrain
  document.documentElement.dataset.horizontal = config.horizontal

  min.disabled = !config.constrain
  max.disabled = !config.constrain
}

flip.on("change", switchMode)
ctrl.on("change", sync)
sync()

const POINTER_SYNC = ({ x, y }) => {
  document.documentElement.style.setProperty("--x", x)
  document.documentElement.style.setProperty("--y", y)
}
document.body.addEventListener("pointermove", POINTER_SYNC)
