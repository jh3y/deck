import gsap from "gsap"
import { Draggable } from "gsap/Draggable"
import { Pane } from "tweakpane"

gsap.registerPlugin(Draggable)

let dragger

const config = {
  explode: false,
  duration: 4,
  border: 4,
  radius: 12,
  width: 38,
  height: 20,
  x: 0,
  y: 0,
  alpha: 0,
  blur: 8,
  spread: 25,
  style: "mask-rotate",
  size: 80,
  debug: false,
  anchorx: 100,
  anchory: 50,
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
  offsetTab.selected = config.style === "offset"
  document.documentElement.dataset.debug = config.debug
  document.documentElement.dataset.removeMask = config.alpha === 1
  document.documentElement.dataset.style = config.style
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

const switcher = ctrl.addBinding(config, "style", {
  label: "Style",
  options: {
    "Mask Rotate": "mask-rotate",
    "Rotate Element": "rotate",
    "Offset Path": "offset",
    // Combine: "combine",
  },
})

switcher.on("change", () => {
  const section = document.querySelector("section")
  const markup = section.innerHTML
  section.innerHTML = ""
  requestAnimationFrame(() => {
    section.innerHTML = markup
    if (dragger) {
      dragger[0].kill()
      dragger = Draggable.create(".wrapper", {
        type: "x, y",
        allowEventDefault: true,
      })
    }
  })
})

ctrl.addBinding(config, "duration", {
  min: 0.5,
  max: 20,
  step: 0.1,
  label: "Duration (s)",
})

// ctrl.addBinding(config, "border", {
//   min: 1,
//   max: 30,
//   step: 1,
//   label: "Thickness (px)",
// });
ctrl.addBinding(config, "radius", {
  min: 1,
  max: 500,
  step: 1,
  label: "Radius (px)",
})
// ctrl.addBinding(config, "width", {
//   min: 10,
//   max: 100,
//   step: 1,
//   label: "Width (vmin)",
// });
// ctrl.addBinding(config, "height", {
//   min: 10,
//   max: 100,
//   step: 1,
//   label: "Height (vmin)",
// });
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

const tab = ctrl.addTab({
  pages: [{ title: "Conic" }, { title: "Offset" }],
})

const conicTab = tab.pages[0]
const offsetTab = tab.pages[1]

conicTab.addBinding(config, "spread", {
  min: 5,
  max: 50,
  step: 1,
  label: "Spread (%)",
})

offsetTab.addBinding(config, "size", {
  min: 5,
  max: 100,
  step: 1,
  label: "Size (%)",
})
offsetTab.addBinding(config, "debug", {
  label: "Debug",
})
offsetTab.addBinding(config, "anchorx", {
  min: 0,
  max: 100,
  step: 1,
  label: "Anchor X (%)",
})
offsetTab.addBinding(config, "anchory", {
  min: 0,
  max: 100,
  step: 1,
  label: "Anchor Y (%)",
})

ctrl.on("change", sync)

sync()

dragger = Draggable.create(".wrapper", {
  type: "x, y",
  allowEventDefault: true,
})
