import gsap from "gsap"
import Draggable from "gsap/Draggable"
import { Pane } from "tweakpane"

const config = {
  inset: "center",
  theme: "system",
  duration: 0.35,
}

const ctrl = new Pane({
  title: "Config",
  expanded: true,
})

ctrl.addBinding(config, "inset", {
  label: "Position",
  options: {
    Center: "center",
    Top: "center span-top",
    "Top Right": "span-right span-top",
    Right: "span-right center",
    "Bottom Right": "span-right span-bottom",
    Bottom: "center span-bottom",
    "Bottom left": "span-left span-bottom",
    Left: "span-left center",
    "Top Left": "span-left span-top",
  },
})

ctrl.addBinding(config, "theme", {
  label: "Theme",
  options: {
    System: "system",
    Light: "light",
    Dark: "dark",
  },
})

ctrl.addBinding(config, "duration", {
  min: 0.2,
  max: 5,
  step: 0.1,
  label: "Speed (s)",
})

const sync = () => {
  document.documentElement.dataset.theme = config.theme
  document.documentElement.style.setProperty("--inset", config.inset)
  document.documentElement.style.setProperty("--speed", `${config.duration}s`)
}

sync()

const handle = () => {
  if (!document.startViewTransition) return sync()
  document.startViewTransition(() => sync())
}

ctrl.on("change", handle)

gsap.registerPlugin(Draggable)

Draggable.create(".sign-in", {
  type: "top,left",
  allowEventDefault: true,
})
