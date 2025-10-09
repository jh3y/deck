import { Pane } from 'tweakpane'

const config = {
  theme: 'system',
  perspective: 400,
  distance: 0.75,
  duration: 1.2,
  invert: true,
}

const ctrl = new Pane({
  title: 'config',
  expanded: true,
})

const update = () => {
  document.documentElement.dataset.theme = config.theme
  document.documentElement.dataset.invert = config.invert
  document.documentElement.style.setProperty(
    '--perspective',
    `${config.perspective}vmax`
  )
  document.documentElement.style.setProperty(
    '--distance',
    `-${config.distance}`
  )
  document.documentElement.style.setProperty(
    '--duration',
    `${config.duration}s`
  )
}

const sync = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== 'theme'
  )
    return update()
  document.startViewTransition(update)
}

ctrl.addBinding(config, 'perspective', {
  min: 10,
  max: 2000,
  step: 10,
  label: 'perspective(vmax)',
})
ctrl.addBinding(config, 'distance', {
  min: 0.05,
  max: 5,
  step: 0.01,
  label: 'distance(x)',
})
ctrl.addBinding(config, 'duration', {
  min: 0.5,
  max: 10,
  step: 0.01,
  label: 'duration(s)',
})
ctrl.addBinding(config, 'invert', {
  label: 'invert',
})
ctrl.addBinding(config, 'theme', {
  label: 'theme',
  options: {
    system: 'system',
    light: 'light',
    dark: 'dark',
  },
})

ctrl.on('change', sync)
update()
