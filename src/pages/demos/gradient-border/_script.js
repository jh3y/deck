import { Pane } from "tweakpane"

const config = {
  explode: false,
  border: 4,
  radius: 12,
  interactive: false,
  gradient:
    "radial-gradient( circle at top right, hsl(180 100% 50%), hsl(180 100% 50% / 0%) ) border-box, radial-gradient( circle at bottom left, hsl(328 100% 54%), hsl(328 100% 54% / 0%) )",
}

const gradients = {
  A: "radial-gradient( circle at top right, hsl(180 100% 50%), hsl(180 100% 50% / 0%) ) border-box, radial-gradient( circle at bottom left, hsl(328 100% 54%), hsl(328 100% 54% / 0%) )",
  B: "linear-gradient(hsl(0 0% 90%), hsl(0 0% 50%))",
  C: "conic-gradient(from -90deg at 20% 115%, #ff0000, #ff0066, #ff00cc, #cc00ff, #6600ff, #0000ff, #0000ff, #0000ff, #0000ff)",
  D: "conic-gradient(from 180deg at 50% 70%,hsla(0,0%,98%,1) 0deg,#eec32d 72.0000010728836deg,#ec4b4b 144.0000021457672deg,#709ab9 216.00000858306885deg,#4dffbf 288.0000042915344deg,hsla(0,0%,98%,1) 1turn)",
  E: "conic-gradient(white, gray, white)",
}

const ctrl = new Pane({
  title: "Config",
  expanded: true,
})

const sync = () => {
  document.documentElement.dataset.interactive = config.interactive
  document.documentElement.style.setProperty("--border-width", config.border)
  document.documentElement.style.setProperty("--border-radius", config.radius)
  document.documentElement.style.setProperty("--gradient", config.gradient)
}

const toggleExplode = () => {
  const exploded = config.explode
  document.body.toggleAttribute("data-exploded")
  if (!exploded) {
    // Need to tear down the explosion
    document.body.toggleAttribute("data-imploding")
    const transitions = document.getAnimations()
    Promise.all([...transitions.map((t) => t.finished)]).then(() => {
      document.body.toggleAttribute("data-imploding")
    })
  }
}

ctrl.addBinding(config, "border", {
  label: "Thickness (px)",
  min: 0,
  max: 50,
  step: 1,
})
ctrl.addBinding(config, "radius", {
  label: "Radius (px)",
  min: 0,
  max: 50,
  step: 1,
})
ctrl.addBinding(config, "gradient", {
  options: gradients,
  label: "Gradient",
})
const exploder = ctrl.addBinding(config, "explode", { label: "Explode" })
exploder.on("change", toggleExplode)

ctrl.addBinding(config, "interactive", { label: "Interactive" })

ctrl.on("change", sync)
sync()

const syncPointer = ({ x, y }) => {
  document.documentElement.style.setProperty("--x", x.toFixed(2))
  document.documentElement.style.setProperty(
    "--xp",
    (x / window.innerWidth).toFixed(2),
  )
  document.documentElement.style.setProperty("--y", y.toFixed(2))
  document.documentElement.style.setProperty(
    "--yp",
    (y / window.innerHeight).toFixed(2),
  )
}
document.body.addEventListener("pointermove", syncPointer)
