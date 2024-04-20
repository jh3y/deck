import { Pane } from "tweakpane"

const config = {
  minWidth: 320,
  maxWidth: 1500,
  minSize: 17,
  maxSize: 28,
  minRatio: 1.2,
  maxRatio: 1.618,
  text: "Pretty Cool",
  container: false,
  scale: 1,
  level: 0,
}

const ctrl = new Pane({
  title: "Config",
  expanded: true,
})

const dt = document.querySelector("dt")
const level = dt.querySelector(".level")

ctrl.addBinding(config, "level", {
  min: 0,
  max: 6,
  step: 1,
  label: "Level",
})

const sync = () => {
  level.innerText = `${config.level};`
  document.documentElement.style.setProperty("--font-level", config.level)

  document.documentElement.style.setProperty("--font-size-min", config.minSize)
  document.documentElement.style.setProperty("--font-size-max", config.maxSize)
  document.documentElement.style.setProperty(
    "--font-ratio-min",
    config.minRatio,
  )
  document.documentElement.style.setProperty(
    "--font-ratio-max",
    config.maxRatio,
  )
  document.documentElement.style.setProperty(
    "--font-width-min",
    config.minWidth,
  )
  document.documentElement.style.setProperty(
    "--font-width-max",
    config.maxWidth,
  )
  document.documentElement.dataset.container = config.container
  document.documentElement.style.setProperty("--scale", config.scale)
  // Set the text for the dd values.
  // generateMarkup();
}

ctrl.on("change", sync)
sync()

// const config = {
//   width: {
//     min: 320,
//     max: 1500,
//   },
//   size: {
//     min: 17,
//     max: 24,
//   },
//   ratio: {
//     min: 1.2,
//     max: 1.6,
//   },
// }

// const clamps = []

// for (let i = 0; i < 5; i++) {
//   const min = config.size.min * Math.pow(config.ratio.min, i)
//   const max = config.size.max * Math.pow(config.ratio.max, i)

//   const minRem = `${min / 16}rem`
//   const maxRem = `${max / 16}rem`

//   const vi = (max - min) / (config.width.max - config.width.min)

//   const residual = min / 16 - (vi * config.width.min) / 16
//   /**
//    * preferred is: min (px) - (max (px) - min(px) / max width - min width)
//    */
//   const clamp = `clamp(${minRem}, ${residual}rem + ${vi * 100}vi, ${maxRem})`
//   // document.documentElement.style.setProperty(`--step-${i}`, clamp)
//   clamps.push(clamp)
// }
