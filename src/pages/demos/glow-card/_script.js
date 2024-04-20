import gsap from "gsap"
import { Pane } from "tweakpane"
const config = {
  explode: false,
  spread: false,
}

const ctrl = new Pane({ title: "Config", expanded: true })

ctrl.addBinding(config, "explode", { label: "Explode" })
ctrl.addBinding(config, "spread", { label: "Spread" })

const sync = () => {
  document.documentElement.dataset.explode = config.explode
  document.documentElement.dataset.spread = config.spread

  if (config.explode) {
    const CENTER_CARD = document.querySelector(".dummy__backdrop")
    const BOUNDS = CENTER_CARD.getBoundingClientRect()
    const CONTROL = document.querySelector(
      ".wrapper:first-of-type :is(a, button)",
    )
    const CONTROL_BOUNDS = CONTROL.getBoundingClientRect()
    gsap.set(".wrapper:first-of-type", {
      "--left": BOUNDS.x,
      "--top": BOUNDS.y,
    })
    gsap.set(CONTROL, {
      "--left": CONTROL_BOUNDS.x,
      "--top": CONTROL_BOUNDS.y,
    })
  }
}

ctrl.on("change", sync)

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
