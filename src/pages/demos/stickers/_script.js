import { Pane } from 'tweakpane'

const config = {
  theme: 'light',
  radius: 4,
  outline: '#fff',
  base: 0.4,
  octaves: 4,
  seed: 120,
  type: 'turbulence',
  deviation: 2,
  surface: 8,
  specular: 6,
  exponent: 65,
  light: 'hsla(0, 0%, 80%, 0.5)',
  x: 50,
  y: 50,
  z: 65,
  pointer: true,
  dx: 1,
  dy: 3,
  shadow: 'hsl(0, 0%, 0%)',
  shadowOpacity: 0.75,
  shadowDev: 3,
}

const ctrl = new Pane({
  title: 'Config',
  expanded: true,
})
const sticker = document.querySelector('.sticker')
const feMorphology = document.querySelector('feMorphology')
const feFlood = document.querySelector('feFlood')
const feTurbulence = document.querySelector('feTurbulence')
const feGaussianBlur = document.querySelector('feGaussianBlur')
const feSpecularLighting = document.querySelector('feSpecularLighting')
const fePointLight = document.querySelector('fePointLight')
const feDropShadow = document.querySelector('feDropShadow')

const syncLight = ({ x, y }) => {
  const stickerBounds = sticker.getBoundingClientRect()
  fePointLight.setAttribute('x', Math.floor(x - stickerBounds.x))
  fePointLight.setAttribute('y', Math.floor(y - stickerBounds.y))
}
let monitoring = false
const update = () => {
  document.documentElement.dataset.theme = config.theme
  feMorphology.setAttribute('radius', config.radius)
  feFlood.setAttribute('flood-color', config.outline)
  feTurbulence.setAttribute('seed', config.seed)
  feTurbulence.setAttribute('type', config.type)
  feTurbulence.setAttribute('numOctaves', config.octaves)
  feTurbulence.setAttribute('baseFrequency', config.base)
  feGaussianBlur.setAttribute('stdDeviation', config.deviation)
  feSpecularLighting.setAttribute('surfaceScale', config.surface)
  feSpecularLighting.setAttribute('specularConstant', config.specular)
  feSpecularLighting.setAttribute('specularExponent', config.exponent)
  feSpecularLighting.setAttribute('lighting-color', config.light)
  fePointLight.setAttribute('x', config.x)
  fePointLight.setAttribute('y', config.y)
  fePointLight.setAttribute('z', config.z)

  feDropShadow.setAttribute('dx', config.dx)
  feDropShadow.setAttribute('dy', config.dy)
  feDropShadow.setAttribute('flood-color', config.shadow)
  feDropShadow.setAttribute('flood-opacity', config.shadowOpacity)
  feDropShadow.setAttribute('stdDeviation', config.shadowDev)

  if (config.pointer && !monitoring) {
    monitoring = true
    sticker.dataset.pointerLighting = true
    window.addEventListener('pointermove', syncLight)
  } else if (!config.pointer) {
    monitoring = false
    sticker.dataset.pointerLighting = false
    window.removeEventListener('pointermove', syncLight)
  }
}

const sync = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== 'Theme'
  )
    return update()
  document.startViewTransition(() => update())
}

const morph = ctrl.addFolder({ title: 'feMorphology' })
morph.addBinding(config, 'radius', {
  min: 0,
  max: 20,
  step: 1,
  label: 'radius',
})
const flood = ctrl.addFolder({ title: 'feFlood' })
flood.addBinding(config, 'outline', {
  label: 'color',
})
const turbulence = ctrl.addFolder({ title: 'feTurbulence' })
turbulence.addBinding(config, 'base', {
  label: 'baseFrequency',
  min: 0,
  max: 1,
  step: 0.01,
})
turbulence.addBinding(config, 'octaves', {
  label: 'numOctaves',
  min: 0,
  max: 10,
  step: 1,
})
turbulence.addBinding(config, 'seed', {
  label: 'seed',
  min: 0,
  max: 1000,
  step: 1,
})
turbulence.addBinding(config, 'type', {
  label: 'type',
  options: {
    fractalNoise: 'fractalNoise',
    turbulence: 'turbulence',
  },
})
const blur = ctrl.addFolder({ title: 'feGaussianBlur' })
blur.addBinding(config, 'deviation', {
  label: 'stdDeviation',
  min: 0,
  max: 10,
  step: 0.1,
})
const lighting = ctrl.addFolder({ title: 'feSpecularLighting' })
// surfaceScale="5"
// specularConstant="0.5"
// specularExponent="120"
// lighting-color="#ffffff"
lighting.addBinding(config, 'light', {
  label: 'color',
})
lighting.addBinding(config, 'surface', {
  label: 'surfaceScale',
  min: 0,
  max: 50,
  step: 0.1,
})
lighting.addBinding(config, 'specular', {
  label: 'constant',
  min: 0,
  max: 25,
  step: 0.1,
})
lighting.addBinding(config, 'exponent', {
  label: 'exponent',
  min: 0,
  max: 200,
  step: 0.1,
})

const point = ctrl.addFolder({ title: 'fePointLight' })
point.addBinding(config, 'x', {
  label: 'x',
  min: -500,
  max: 500,
  step: 1,
})
point.addBinding(config, 'y', {
  label: 'y',
  min: -500,
  max: 500,
  step: 1,
})
point.addBinding(config, 'z', {
  label: 'z',
  min: 0,
  max: 500,
  step: 1,
})
point.addBinding(config, 'pointer', {
  label: 'pointer',
})

const shadow = ctrl.addFolder({ title: 'feDropShadow' })
shadow.addBinding(config, 'dx', {
  min: -10,
  max: 10,
  step: 1,
  label: 'dx',
})
shadow.addBinding(config, 'dy', {
  min: -10,
  max: 10,
  step: 1,
  label: 'dy',
})
shadow.addBinding(config, 'shadow', {
  label: 'flood-color',
})
shadow.addBinding(config, 'shadowOpacity', {
  label: 'flood-opacity',
  min: 0,
  max: 1,
  step: 0.01,
})
shadow.addBinding(config, 'shadowDev', {
  label: 'stdDeviation',
  min: 0,
  max: 20,
  step: 0.1,
})

ctrl.addBinding(config, 'theme', {
  label: 'Theme',
  options: {
    System: 'system',
    Light: 'light',
    Dark: 'dark',
  },
})

ctrl.on('change', sync)
update()
