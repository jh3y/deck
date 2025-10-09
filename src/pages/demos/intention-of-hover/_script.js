import { Pane } from 'tweakpane'

const CONFIG = {
  revert: false,
  vertical: true,
  intent: false,
  theme: 'light',
}

const CTRL = new Pane({
  title: 'config',
})

CTRL.addBinding(CONFIG, 'vertical')
CTRL.addBinding(CONFIG, 'revert')
CTRL.addBinding(CONFIG, 'intent', {
  label: 'delay',
})
CTRL.addBinding(CONFIG, 'theme', {
  label: 'theme',
  options: {
    system: 'system',
    light: 'light',
    dark: 'dark',
  },
})

const update = () => {
  document.documentElement.dataset.vertical = CONFIG.vertical
  document.documentElement.dataset.revert = CONFIG.revert
  document.documentElement.dataset.intent = CONFIG.intent
  document.documentElement.dataset.theme = CONFIG.theme
}

const sync = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== 'theme'
  )
    return update()
  document.startViewTransition(() => update())
}

CTRL.on('change', sync)

update()

document.querySelector('.actions').style.display = 'block'
