import gsap from "gsap"
import Trombone from "./_trombone.js"

gsap.set(".trombone-bear__torso", { transformOrigin: "50% 82%" })
gsap.set(".trombone-bear__upper-features", { transformOrigin: "26% 83%" })
gsap.set(".trombone-bear__cheek", { display: "none" })
gsap.set(".trombone-bear__arm", { transformOrigin: "65% 75%" })
gsap.set(".trombone-bear__eyes", { transformOrigin: "50% 50%" })

const TROMBONE_INPUT = document.querySelector("input[type=range]")

// More extras from the original
const partialFrequencies = new Map([
  [0, 58.27],
  [1, 116.54],
  [2, 174.81],
  [3, 233.08],
  [4, 291.35],
  [5, 349.62],
  [6, 407.89],
  [7, 466.16],
  [8, 524.43],
  [9, 582.7],
  [10, 640.97],
  [11, 699.24],
])

function getPitchModifierRatioFromPosition(position) {
  return (
    -1.700893 +
    (0.05848351 + 1.700893) / (1 + (position / 27.34756) ** 1.018593)
  )
}

function adjustPitchFromPosition(position, pitch) {
  return pitch + pitch * getPitchModifierRatioFromPosition(position)
}

function getPitchFromPartialAndPosition(partial, position) {
  const basePitch = partialFrequencies.get(partial)
  return adjustPitchFromPosition(position, basePitch)
}

function getPositionFromXCoord(x) {
  return 35.44613 + (0.9992146 - 35.44613) / (1 + (x / 498.2127) ** 0.9692893)
}

function getPartialFromYCoord(y) {
  return 10 - Math.round(y / 10)
}

/**
 * Given an input[type=range]
 * Attack/Release on pointerdown/pointerup
 * Change Chords/Pitch on pointermove when active
 * */

// Takes an x && y which are a fraction of the viewport but could be anything
const changePitch = ({ y }) => {
  // console.info({ val: TROMBONE_INPUT.value / 10})
  const position = getPositionFromXCoord(TROMBONE_INPUT.value / 10)
  // const partial = getPartialFromYCoord(y / window.innerWidth * 100)
  const partial = getPartialFromYCoord((y / window.innerHeight) * 100)

  gsap.set(".trombone-bear__torso, .trombone-bear__upper-features", {
    rotate: gsap.utils.clamp(
      -15,
      15,
      gsap.utils.mapRange(60, 40, 15, -15)((y / window.innerHeight) * 100),
    ),
  })
  // Position is based on the window position in the demo so a fraction of the position
  // position is based on x
  // partial is based on y

  const pitch = getPitchFromPartialAndPosition(partial, position)
  // console.info({ pitch, midi })
  Trombone.setPitch(pitch)
}

const slideArm = () => {
  gsap.set(".slider-arm", {
    xPercent: gsap.utils.clamp(
      0,
      15,
      gsap.utils.mapRange(0, 1000, 0, 15)(TROMBONE_INPUT.value),
    ),
  })
}

let startGig
// Only update the visual position when playing...
const attack = () => {
  startGig = Date.now()
  Trombone.play()
  gsap
    .timeline()
    .set(".trombone-bear__cheek", {
      display: "block",
    })
    .set(".bear", { marginBlock: "10vh" })
    .to("[type=range]", {
      opacity: 0,
      duration: 0.25,
    })
    .to(
      ".trombone-bear",
      {
        opacity: 1,
        duration: 0.25,
      },
      0,
    )
  document.body.addEventListener("pointermove", changePitch)
}

const release = () => {
  Trombone.stop()
  const gigTime = Date.now() - startGig > 2000
  const BOW = gsap
    .timeline({
      paused: !gigTime,
      delay: 1,
      repeat: 1,
      yoyo: true,
      repeatDelay: 2,
    })
    .to(".trombone-bear__arm", {
      rotate: 80,
      duration: 0.2,
      yPercent: -50,
    })
    .to(
      ".trombone-bear__eyes",
      {
        scaleY: 0.2,
        duration: 0.2,
      },
      "<",
    )
    .to(
      ".trombone-bear__upper-features",
      {
        rotate: 16,
        duration: 0.2,
      },
      "<",
    )
    .to(
      ".trombone-bear__torso",
      {
        rotate: 16,
        duration: 0.2,
      },
      "<",
    )

  gsap
    .timeline({
      onComplete: () => {
        gsap.set(".trombone-bear", { clearProps: "opacity" })
        gsap.set(".bear", { clearProps: "marginBlock" })
      },
    })
    .set(".trombone-bear__cheek", {
      display: "none",
    })
    .to(".trombone-bear__upper-features, .trombone-bear__torso", {
      rotate: 0,
      duration: 0.25,
    })
    .add(gigTime ? BOW : null)
    .add(
      gigTime
        ? gsap.to(".trombone-bear__eyes", {
            delay: 1,
            repeat: 3,
            yoyo: true,
            duration: 0.05,
            scaleY: 0.1,
          })
        : null,
    )
    .to(
      "input",
      {
        delay: gigTime ? 0.5 : 0.25,
        opacity: 1,
        duration: 0.25,
      },
      ">",
    )
    .to(
      ".trombone-bear",
      {
        opacity: 0,
        duration: 0.25,
      },
      "<",
    )
  document.body.removeEventListener("pointermove", changePitch)
}

TROMBONE_INPUT.addEventListener("pointerdown", attack)
TROMBONE_INPUT.addEventListener("pointerup", release)
TROMBONE_INPUT.addEventListener("input", slideArm)
