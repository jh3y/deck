import Color from "colorjs.io"
import gsap from "gsap"
import { Draggable } from "gsap/Draggable"
import { InertiaPlugin } from "gsap/InertiaPlugin"
import { Pane } from "tweakpane"

gsap.registerPlugin(Draggable, InertiaPlugin)

// Think the way this works is that you have a conic layer for each rotation
// Then you do a conic-gradient from the start to the end of that ring
let ball
const levels = 2
const caption = document.querySelector(".caption__text")
const can = document.querySelector(".can")

const config = {
  starter: "hsla(10,80%,50%,1)",
  mixer: "hsla(210, 80%, 50%, 1)",
}

const ctrl = new Pane({
  title: "Config",
  expanded: true,
})

const startDial = ctrl.addBinding(config, "starter", {
  picker: "inline",
  label: "Starting Point",
  expanded: false,
})
const mixerDial = ctrl.addBinding(config, "mixer", {
  picker: "inline",
  label: "Mixer",
  expanded: false,
})

const copier = ctrl.addButton({ title: "Copy Mix", disabled: false })
const compute = ctrl.addButton({ title: "Copy Computed", disabled: false })
const newMix = ctrl.addButton({ title: "New Mix", disabled: true })
const reset = ctrl.addButton({ title: "Reset", disabled: false })

compute.on("click", () => {
  const currentColor = getComputedStyle(
    can.querySelector(".mixer__ball"),
  ).backgroundColor
  navigator.clipboard.writeText(currentColor)
})

copier.on("click", () => {
  navigator.clipboard.writeText(caption.innerText)
})

ctrl.on("change", () => {
  if (!dirty) {
    syncLayers()
    sync(0)
  }
})

reset.on("click", () => {
  dirty = false
  // Reset everything and remove all layers...
  const sa = 0
  config.starter = "hsla(0, 0%, 0%, 0)"
  gsap.set(".mixer__ball", {
    rotate: sa,
  })
  ball[0].update()
  startDial.disabled = false
  mixerDial.disabled = false
  startDial.refresh()
  sync(sa)
  syncLayers()
  can.innerHTML = ""
  createWheel(0)
  // ctrl.update();
})

const syncLayers = () => {
  gsap.set(can.querySelectorAll(".mixer:last-of-type .mixer__layer"), {
    // xPercent: (index) => index * 100,
    "--base": (index) => {
      const stop = (100 / levels) * index
      return `color-mix(in lch, ${config.starter}, ${config.mixer} ${stop}%)`
    },
    "--end": (index) => {
      const stop = (100 / levels) * (index + 1)
      return `color-mix(in lch, ${config.starter}, ${config.mixer} ${Math.min(
        stop,
        100,
      )}%)`
    },
  })
  gsap.set(".mixer:last-of-type", {
    "--base": origin ? config.starter : undefined,
    "--mixer": config.mixer,
  })
}

let dirty = false
const sync = (rotation) => {
  if (rotation !== 0 && !dirty) {
    dirty = true
    newMix.disabled = false
    startDial.disabled = mixerDial.disabled = true
  }

  const currentLevel = Math.floor(Math.round(rotation) / 360)
  const progress = rotation / 360 / levels
  const startingColor = new Color(config.starter).to("hsl")
  const mixingColor = new Color(config.mixer).to("hsl")

  const mixed = `color-mix(in lch, hsl(${Math.floor(
    startingColor.coords[0],
  )} ${Math.floor(startingColor.coords[1])}% ${Math.floor(
    startingColor.coords[2],
  )}%${
    Number.parseInt(startingColor.alpha, 10) !== 1
      ? ` / ${startingColor.alpha}`
      : ""
  }), hsl(${Math.floor(mixingColor.coords[0])} ${Math.floor(
    mixingColor.coords[1],
  )}% ${Math.floor(mixingColor.coords[2])}%${
    Number.parseInt(mixingColor.alpha, 10) !== 1
      ? ` / ${mixingColor.alpha}`
      : ""
  }) ${Math.min(Math.max(0, Math.floor(progress * 100)), 100)}%)`
  gsap.set(can.querySelector(".mixer:last-of-type"), {
    "--mixed": mixed,
  })
  const currentColor = getComputedStyle(
    can.querySelector(".mixer__ball"),
  ).backgroundColor
  caption.innerHTML = `<div><span>mix:</span>${mixed}</div><div><span>computed:</span>${currentColor}</div>`

  // Layers are  0 - (levels - 1)
  if (currentLevel > -1 && currentLevel < levels + 1) {
    gsap.set(".mixer:last-of-type .mixer__layer", {
      "--completion": (index) => {
        if (index < currentLevel) return 360
        if (index > currentLevel) return 0
        return rotation % 360
      },
    })
  } else {
    gsap.set(".mixer:last-of-type .mixer__layer", {
      "--completion": currentLevel >= levels ? 360 : 0,
    })
  }
  gsap.set(".mixer:last-of-type", {
    "--rotation": Math.floor(rotation),
  })
}
const createWheel = (startingAngle) => {
  let innerHTML = ""
  for (let i = 0; i < levels + 1; i++) {
    innerHTML += '<div class="mixer__layer"></div>'
  }
  innerHTML += '<div class="mixer__ball"></div>'
  // mixer.innerHTML = innerHTML
  const mixer = Object.assign(document.createElement("div"), {
    className: "mixer",
    innerHTML,
  })
  mixer.dataset.startingAngle = Math.floor(startingAngle) || 0
  can.appendChild(mixer)
  ball = Draggable.create(".mixer__ball", {
    type: "rotation",
    inertia: true,
    bounds: { minRotation: 0, maxRotation: Number.POSITIVE_INFINITY },
    onDrag: function () {
      startDial.disabled = true
      sync(this.rotation)
    },
    onThrowUpdate: function () {
      sync(this.rotation)
    },
  })
  gsap.set(mixer, {
    rotate: startingAngle,
  })
  // Sync the layers
  syncLayers()
  sync(0)
}
createWheel()

// If you know there are 5 levels, you can generate them prior anyway...
sync(0)

const sa = 580
gsap.set(".mixer__ball", {
  rotate: sa,
})
ball[0].update()
sync(sa)

newMix.on("click", () => {
  /**
   * At this point:
   * 1. Kill the wheel and remove it
   * 2. Set up a new wheel with the current rotation as the starting point
   * 3. Take the current computedColor as the new starting point
   * 4. Enable the mixer until it's ready again
   * 5. Set dirty to false
   */
  const currentRotation = ball[0].rotation

  // Get the currentColor and set in the controls
  const currentColor = getComputedStyle(
    can.querySelector(".mixer__ball"),
  ).backgroundColor

  const currentStart = document.querySelector(".mixer:last-of-type").dataset
    .startingAngle

  const converted = new Color(currentColor).to("hsl")

  const strung = `hsla(${Math.round(converted.coords[0])},${Math.round(
    converted.coords[1],
  )}%,${Math.round(converted.coords[2])}%,${converted.alpha})`

  // console.info({ currentColor, converted, strung })

  config.starter = strung
  startDial.refresh()

  // Enable the mixer dial
  mixerDial.disabled = false

  ball[0].kill()
  can.querySelector(".mixer__ball").remove()
  createWheel((currentRotation % 360) - (360 - currentStart))

  dirty = false

  newMix.disabled = true
})
