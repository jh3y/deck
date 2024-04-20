import { gsap } from "gsap"

const moveCursor = () => {
  gsap.to("img", {
    duration: gsap.utils.random(0.2, 1.2),
    x: gsap.utils.random(window.innerWidth * 0.25, window.innerWidth * 0.75),
    y: gsap.utils.random(window.innerHeight * 0.25, window.innerHeight * 0.75),
    onComplete: () => moveCursor(),
  })
}

moveCursor()
