import { Pane } from "tweakpane"

const config = {
  travel: 0.75,
  padding: 1.5,
  reflect: false,
  gap: 1.5,
  animate: false,
  theme: "dark",
}

const ctrl = new Pane({
  title: "Config",
  expanded: true,
})

ctrl.addBinding(config, "animate", {
  label: "Animate",
})
const travel = ctrl.addBinding(config, "travel", {
  min: 0,
  max: 1,
  step: 0.01,
  label: "Travel",
})
const padding = ctrl.addBinding(config, "padding", {
  min: 0,
  max: 5,
  step: 0.01,
  label: "Padding (cards)",
})
ctrl.addBinding(config, "reflect", {
  label: "Reflect",
})
ctrl.addBinding(config, "gap", {
  min: 0,
  max: 4,
  step: 0.1,
  label: "Gap (rem)",
})

ctrl.addBinding(config, "theme", {
  options: {
    System: "system",
    Light: "light",
    Dark: "dark",
  },
  label: "Theme",
})

const sync = () => {
  document.documentElement.dataset.animate = config.animate
  document.documentElement.dataset.theme = config.theme
  document.documentElement.dataset.reflect = config.reflect
  document.documentElement.style.setProperty("--travel", config.travel)
  document.documentElement.style.setProperty("--gap", config.gap)
  document.documentElement.style.setProperty("--padding", config.padding)
  travel.disabled = !config.animate
  padding.disabled = !config.animate
}

const handle = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== "Theme"
  )
    return sync()
  document.startViewTransition(() => sync())
}

ctrl.on("change", handle)

sync()
