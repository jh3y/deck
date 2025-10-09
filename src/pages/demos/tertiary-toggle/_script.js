import { Pane } from 'tweakpane'

const config = {
  theme: 'light',
  debug: false,
}

const ctrl = new Pane({
  title: 'config',
  expanded: true,
})

const update = () => {
  document.documentElement.dataset.theme = config.theme
  document.documentElement.dataset.debug = config.debug
}

const sync = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== 'theme'
  )
    return update()
  document.startViewTransition(() => update())
}

ctrl.addBinding(config, 'debug', {
  label: 'debug',
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
