import gsap from "gsap"
import { Pane } from "tweakpane"

const UPDATE = ({ x, y }) => {
  gsap.set(document.documentElement, {
    "--x": gsap.utils.mapRange(0, window.innerWidth, -1, 1, x),
    "--y": gsap.utils.mapRange(0, window.innerHeight, -1, 1, y),
  })
}

window.addEventListener("mousemove", UPDATE)

// Want to handle device orientation too

const handleOrientation = ({ beta, gamma }) => {
  const isLandscape = window.matchMedia("(orientation: landscape)").matches
  gsap.set(document.documentElement, {
    "--x": gsap.utils.clamp(
      -1,
      1,
      isLandscape
        ? gsap.utils.mapRange(-45, 45, -1, 1, beta)
        : gsap.utils.mapRange(-45, 45, -1, 1, gamma),
    ),
    "--y": gsap.utils.clamp(
      -1,
      1,
      isLandscape
        ? gsap.utils.mapRange(20, 70, 1, -1, Math.abs(gamma))
        : gsap.utils.mapRange(20, 70, 1, -1, beta),
    ),
  })
}

let started
const START = () => {
  if (started) return
  started = true
  // if (BUTTON) BUTTON.remove();
  if (DeviceOrientationEvent?.requestPermission) {
    Promise.all([DeviceOrientationEvent.requestPermission()]).then(
      (results) => {
        if (results.every((result) => result === "granted")) {
          window.addEventListener("deviceorientation", handleOrientation)
        }
      },
    )
  } else {
    window.addEventListener("deviceorientation", handleOrientation)
  }
}

const config = {
  use: "pow",
}

const ctrl = new Pane({ title: "Config", expanded: true })

ctrl.addBinding(config, "use", {
  options: {
    pow: "pow",
    sin: "sin",
  },
  label: "Math function",
})
const starter = ctrl.addButton({ title: "Device Orientation " })
starter.on("click", START)

const sync = () => {
  document.documentElement.dataset.use = config.use
}
sync()
ctrl.on("change", sync)
