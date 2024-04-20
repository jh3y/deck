import { Pane } from "tweakpane"

const CONTAINER = document.querySelector(".container")
const CARDS = document.querySelectorAll("article")

const config = {
  proximity: 40,
  spread: 80,
  blur: 20,
  gap: 32,
  vertical: false,
  opacity: 0,
}

const sync = (event) => {
  // get the angle based on the center point of the card and pointer position
  for (const CARD of CARDS) {
    // Check the card against the proximity and then start updating
    const CARD_BOUNDS = CARD.getBoundingClientRect()
    // Get distance between pointer and outerbounds of card
    if (
      event?.x > CARD_BOUNDS.left - config.proximity &&
      event?.x < CARD_BOUNDS.left + CARD_BOUNDS.width + config.proximity &&
      event?.y > CARD_BOUNDS.top - config.proximity &&
      event?.y < CARD_BOUNDS.top + CARD_BOUNDS.height + config.proximity
    ) {
      // If within proximity set the active opacity
      CARD.style.setProperty("--active", 1)
    } else {
      CARD.style.setProperty("--active", config.opacity)
    }
    const CARD_CENTER = [
      CARD_BOUNDS.left + CARD_BOUNDS.width * 0.5,
      CARD_BOUNDS.top + CARD_BOUNDS.height * 0.5,
    ]
    let ANGLE =
      (Math.atan2(event?.y - CARD_CENTER[1], event?.x - CARD_CENTER[0]) * 180) /
      Math.PI
    ANGLE = ANGLE < 0 ? ANGLE + 360 : ANGLE
    CARD.style.setProperty("--start", ANGLE + 90)
  }
}

document.body.addEventListener("pointermove", sync)

const update = () => {
  CONTAINER.style.setProperty("--gap", config.gap)
  CONTAINER.style.setProperty("--blur", config.blur)
  CONTAINER.style.setProperty("--spread", config.spread)
  CONTAINER.style.setProperty("--direction", config.vertical ? "column" : "row")
}

const ctrl = new Pane({
  title: "Config",
  expanded: true,
  width: 340,
})
ctrl.addBinding(config, "spread", {
  min: 10,
  max: 180,
  step: 1,
  label: "Spread (deg)",
})
ctrl.addBinding(config, "proximity", {
  min: 10,
  max: 180,
  step: 1,
  label: "Active Proximity (px)",
})
ctrl.addBinding(config, "gap", {
  min: 10,
  max: 100,
  step: 1,
  label: "Gap (px)",
})
ctrl.addBinding(config, "blur", {
  min: 0,
  max: 50,
  step: 1,
  label: "Blur (px)",
})
ctrl.addBinding(config, "opacity", {
  min: 0,
  max: 1,
  step: 0.01,
  label: "Inactive Opacity",
})
ctrl.addBinding(config, "vertical", { label: "Vertical" })

ctrl.on("change", update)

update()
sync()
