import { gsap } from "gsap"
import { Draggable } from "gsap/Draggable"
import { Physics2DPlugin } from "gsap/Physics2DPlugin"
import getBear from "./_getBear.js"

console.clear()

gsap.registerPlugin(Draggable)
gsap.registerPlugin(Physics2DPlugin)

// let open = false;
let count = 0

const MENU = document.querySelector(".menu")
const POPOVER = MENU.querySelector("[popover]")
const PEN = MENU.querySelector(".parachute-pen")
const HANDLE = MENU.querySelector(".bear--handle")
// const LIST = POPOVER.querySelector(".option-box");
const OPTIONS = POPOVER.querySelector(".options")
// const SELECTBUTTON = MENU.querySelector("button");
const NOSEY_PEN = MENU.querySelector(".nosey-pen")
const PROXY = document.createElement("div")

const SNAP_THRESHOLD = 200
let DISTANCE_PER_SECOND

const POP = new Audio("/audio/pop.mp3")
const R2_SCREAM = new Audio("/audio/r2d2_scream.mp3")

const SPEED_SCALE = gsap.utils.mapRange(0, SNAP_THRESHOLD, 1, 0.3)

const RESET = () => {
  gsap.set(PROXY, {
    x: 0,
    y: 0,
  })
}

const yeet = ({ bear, dps }) => {
  gsap.to(bear.firstChild, {
    y: -window.innerHeight,
    duration: window.innerHeight / dps,
    onStart: () => {
      R2_SCREAM.pause()
      R2_SCREAM.currentTime = 0
      R2_SCREAM.play()
    },
    onComplete: () => {
      bear.remove()
    },
  })
}

const launch = ({ bear, ejector, distance, velocity }) => {
  POP.pause()
  POP.currentTime = 0
  POP.play()
  const PARACHUTE = bear.querySelector(".parachute")
  const BEAR_SVG = bear.querySelector(".bear")
  const delay = gsap.utils.mapRange(300, 650, 0.5, 1)(velocity)
  gsap.set(PARACHUTE, { scale: 0, transformOrigin: "50% 100%" })
  // Do a physics animations...
  const left = Math.random() > 0.5
  // At this point we need to make the parachuter jump but not the bear.
  // Start by clipping the bear and then unclip after peak jump...
  const JUMP = gsap
    .to(bear.firstChild, {
      y: -distance,
      duration: 8,
      physics2D: {
        velocity,
        angle: left ? -100 : -80,
        gravity: 500,
      },
      onStart: () => {
        gsap.set(bear, {
          clipPath: "inset(-100vh -100vh 100% -100vh)",
        })
        gsap.delayedCall(delay, () => {
          gsap.set(bear, {
            clipPath: "none",
          })
        })
      },
      onComplete: () => {
        bear.remove()
      },
    })
    .timeScale(2.2)
  gsap.delayedCall(delay + gsap.utils.random(-0.2, 0.2), () => {
    gsap
      .timeline({
        onStart: () => {
          if (Math.random() > 0.5) {
            gsap.to(BEAR_SVG, {
              x: left ? -window.innerWidth : window.innerWidth,
              duration: 30,
            })
          }
        },
      })
      .set(JUMP, { timeScale: 0 })
      .to(PARACHUTE, {
        delay: 0.1,
        scale: gsap.utils.random(1, 2),
        duration: 0.1,
      })
      .add(
        gsap.to(JUMP, {
          timeScale: gsap.utils.random(0.1, 0.25),
          duration: 0.1,
        }),
        "<",
      )
  })
  // const distance = gsap.utils.random(
  //   window.innerHeight * 0.25,
  //   window.innerHeight * 0.5,
  //   1,
  // );
  // const hatch = ejector
  //   .closest("button")
  //   .querySelector(".hatch:not(.hatch--flipped)");
  // const angle = gsap.utils.random(-86, -94);
  // const launchTl = gsap
  //   .timeline()
  //   .to(
  //     ejector.firstElementChild,
  //     {
  //       y: -window.innerHeight * 0.5,
  //       duration: 8,
  //       physics2D: {
  //         velocity,
  //         angle,
  //         gravity: window.innerHeight * 0.5,
  //       },
  //       onStart: () => {
  //         console.info("eject");
  //         gsap.to(hatch, {
  //           onStart: () => {
  //             hatch.classList.add("hatch--flipped");
  //           },
  //           onComplete: () => {
  //             hatch.remove();
  //           },
  //           y: -500,
  //           duration: 2,
  //           rotate: gsap.utils.random(90, 360),
  //           transformOrigin: "75% 50%",
  //           physics2D: {
  //             velocity: 500,
  //             angle: gsap.utils.random(-75, -85),
  //             gravity: 1500,
  //           },
  //         });
  //       },
  //       onUpdate: function () {
  //         if (this.__deployed) return;
  //         const y = gsap.getProperty(ejector.firstElementChild, "y");
  //         if (y > this.__cachedY && !this.__deployed) {
  //           this.__deployed = true;
  //           this.__progress = this.progress();
  //           deployChute({ ejector, timeline: launchTl, angle });
  //         } else {
  //           this.__cachedY = y;
  //         }
  //       },
  //       onComplete: () => {
  //         // Remove the ejected here
  //         ejector.remove();
  //         console.info("done");
  //       },
  //     },
  //     0,
  //   )
  //   .timeScale(3);
}

// let snapped = false;
let closing = false
let duration = 0
let hue = gsap.utils.random(0, 359, 1)
let pos = gsap.utils.random(10, 60, 1)
let rot = 0
let tilt = 0
MENU.style.setProperty("--pos", pos)
HANDLE.innerHTML = getBear(false, "holdingOn")
NOSEY_PEN.innerHTML = getBear(false, "holdingOn")

POPOVER.addEventListener("toggle", ({ newState, oldState }) => {
  if (newState === "closed" && oldState === "open") {
    if (closing) {
      closing = false
      hue = gsap.utils.random(0, 359)
      pos = gsap.utils.random(10, 60, 1)
      rot = Math.random() > 0.5
      tilt = gsap.utils.random(-8, 8)
      MENU.style.setProperty("--hue", hue)
      MENU.style.setProperty("--pos", pos)
      MENU.style.setProperty("--rot", rot ? 1 : 0)
      MENU.style.setProperty("--tilt", tilt)
      setTimeout(() => {
        OPTIONS.removeAttribute("style")
        gsap.set(HANDLE, { clearProps: "transform" })
        HANDLE.removeAttribute("style")
      }, duration * 1000)
    } else {
      gsap.set(OPTIONS, { clearProps: "all" })
    }
  }
})

// Used for pulling the Popover
const onDrag = function () {
  if (!this.__allowDrag) return
  // Set the scale based on the position and popoverHeight
  gsap.set(HANDLE, {
    y: this.y,
  })
  gsap.set(OPTIONS, {
    scaleY: (this.__popoverHeight + this.y) / this.__popoverHeight,
  })
}

// On Popover drag chcek some constraints, etc.
const onDragStart = function ({ x, y }) {
  const BOUNDS = POPOVER.getBoundingClientRect()
  gsap.set(OPTIONS, { clearProps: "all" })
  gsap.set(OPTIONS, { transition: "none" })
  gsap.set(".options button", { pointerEvents: "none" })
  this.__allowDrag = y > BOUNDS.bottom - 50
  this.__popoverHeight = BOUNDS.height
}

// This is where you either yeet/launch
const onRelease = function () {
  // Reset the proxy handle
  RESET()
  this.__allowDrag = false

  duration = gsap.utils.clamp(0.5, 1, SPEED_SCALE(this.y))

  // Spring back to default position if you haven't exceeded the catapult zone
  if (this.y > 0 && this.y < SNAP_THRESHOLD / 2) {
    gsap
      .timeline({
        onComplete: () => {
          POPOVER.removeAttribute("style")
          gsap.set(".options button", { pointerEvents: "all" })
        },
      })
      .to(HANDLE, {
        duration,
        y: 0,
        ease: "elastic.out(1, 0.3)",
      })
      .to(
        OPTIONS,
        {
          scaleY: 1,
          duration,
          ease: "elastic.out(1, 0.3)",
        },
        0,
      )
  } else if (
    this.y > 0 &&
    this.y >= SNAP_THRESHOLD / 2 &&
    POPOVER.matches(":popover-open")
  ) {
    // THIS IS WHERE THE EJECTING LOGIC GOES...

    // Snap closed please
    closing = true
    count += 1
    // Duration * 1 / duration
    // distance per seconds = (1 / duration) * distance
    DISTANCE_PER_SECOND = (1 / duration) * (this.__popoverHeight + this.y)
    const DISTANCE = this.__popoverHeight * 1.5

    // This timeline is for springing back the Popover to closed
    // But at the same time it needs to trigger the launch/yeet of the bear
    gsap
      .timeline({
        onStart: () => {
          gsap.set(OPTIONS, { boxShadow: 0 })
          // POPOVER.style.transition = '0s'
          gsap.delayedCall(duration * 0.2, () => {
            const BEAR = Object.assign(document.createElement("div"), {
              className: "bear__container",
              style: `--eye-delay: ${gsap.utils.random(
                0,
                3,
                1,
              )}; --pos: ${pos};`,
              innerHTML: `<div class="parachuter">
                ${getBear(hue)}
              </div>`,
            })
            PEN.appendChild(BEAR)
            const velocity = gsap.utils.mapRange(
              400,
              900,
              300,
              650,
            )(DISTANCE_PER_SECOND)

            if (velocity >= 630 && Math.random() > 0.5 && count > 3) {
              yeet({ bear: BEAR, dps: DISTANCE_PER_SECOND })
            } else {
              launch({ bear: BEAR, distance: DISTANCE, velocity })
            }
          })
        },
        onComplete: () => {
          gsap.set(OPTIONS, { display: "none" })
          gsap.set(".options button", { pointerEvents: "all" })
          if (POPOVER.matches(":popover-open")) POPOVER.hidePopover()
        },
      })
      .to(HANDLE, {
        ease: "power1.out",
        duration: duration * 0.5,
        yPercent: -100,
        y: -DISTANCE,
      })
      .to(
        OPTIONS,
        {
          ease: "power1.out",
          yPercent: -150,
          scaleY: 1,
          duration: duration * 0.5,
        },
        0,
      )
  }
}

Draggable.create(PROXY, {
  trigger: OPTIONS,
  type: "x,y",
  onDrag: function () {
    onDrag.bind(this)()
  },
  onDragStart: function (args) {
    onDragStart.bind(this)(args)
  },
  onRelease: function () {
    onRelease.bind(this)()
  },
})

gsap.set(MENU, { display: "block" })
