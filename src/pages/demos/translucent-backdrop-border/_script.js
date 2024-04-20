import gsap from "gsap"
import { Draggable } from "gsap/Draggable"
import { Pane } from "tweakpane"

gsap.registerPlugin(Draggable)

const config = {
  explode: false,
  border: 4,
  radius: 12,
  width: 30,
  height: 20,
  x: 0,
  y: 0,
  alpha: 0,
  blur: 8,
}

const ctrl = new Pane({
  expanded: true,
  title: "Config",
})

const sync = () => {
  for (const key of Object.keys(config)) {
    if (key !== "explode") {
      document.documentElement.style.setProperty(`--${key}`, config[key])
    }
  }
}

const toggle = () => {
  const exploded = config.explode
  document.documentElement.toggleAttribute("data-exploded")
  if (!exploded) {
    // Need to tear down the explosion
    document.documentElement.toggleAttribute("data-imploding")
    const transitions = document.getAnimations()
    Promise.all([...transitions.map((t) => t.finished)]).then(() => {
      document.documentElement.toggleAttribute("data-imploding")
    })
  }
}

const exploder = ctrl.addBinding(config, "explode", { label: "Explode" })
exploder.on("change", toggle)

ctrl.addBinding(config, "border", {
  min: 1,
  max: 30,
  step: 1,
  label: "Thickness (px)",
})
ctrl.addBinding(config, "radius", {
  min: 1,
  max: 500,
  step: 1,
  label: "Radius (px)",
})
ctrl.addBinding(config, "width", {
  min: 10,
  max: 100,
  step: 1,
  label: "Width (vmin)",
})
ctrl.addBinding(config, "height", {
  min: 10,
  max: 100,
  step: 1,
  label: "Height (vmin)",
})
ctrl.addBinding(config, "alpha", {
  min: 0,
  max: 1,
  step: 0.01,
  label: "Alpha",
})
ctrl.addBinding(config, "blur", {
  min: 0,
  max: 50,
  step: 1,
  label: "Backdrop blur (px)",
})

ctrl.on("change", sync)

sync()

Draggable.create(".wrapper", {
  type: "x, y",
  allowEventDefault: true,
})
