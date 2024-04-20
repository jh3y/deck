import { Pane } from "tweakpane"

const config = {
  transition: 0.5,
}

const ctrl = new Pane({
  title: "Config",
  expanded: true,
})

ctrl.addBinding(config, "transition", {
  min: 0.1,
  max: 5,
  step: 0.1,
  label: "Transition (s)",
})

const sync = () => {
  document.documentElement.style.setProperty("--transition", config.transition)
}

ctrl.on("change", sync)
sync()
