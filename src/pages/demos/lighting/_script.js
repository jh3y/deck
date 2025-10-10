import { Pane } from 'tweakpane'
import gsap from 'gsap'
import Draggable from 'gsap/Draggable'
gsap.registerPlugin(Draggable)

const config = {
  theme: 'system',
  border: 2,
  lights: {
    light1: {
      label: 'spotify',
      constant: 10,
      exponent: 150,
      color: 'hsl(142, 77%, 48%)',
      surface: 1,
      z: 170,
    },
    light2: {
      label: 'raycast',
      constant: 2,
      exponent: 300,
      surface: 1,
      color: 'hsl(0, 100%, 69%)',
      z: 160,
    },
    light3: {
      label: 'discord',
      constant: 12,
      exponent: 110,
      surface: 1,
      color: 'hsl(235, 86%, 73%)',
      z: 160,
    },
    light4: {
      label: 'screen studio',
      constant: 20,
      exponent: 120,
      surface: 1,
      color: 'hsl(267, 61%, 48%)',
      z: 120,
    },
  },
}
// specularConstant="12"
// specularExponent="120"
// lighting-color="green",
// z: 180,

const ctrl = new Pane({
  title: 'config',
  expanded: true,
})

const update = () => {
  document.documentElement.style.setProperty('--border', config.border)
  document.documentElement.dataset.theme = config.theme
  for (const light of Object.keys(config.lights)) {
    gsap.set(`#${light}`, {
      attr: {
        specularConstant: config.lights[light].constant,
        specularExponent: config.lights[light].exponent,
        surfaceScale: config.lights[light].surface,
        'lighting-color': config.lights[light].color,
      },
    })
    gsap.set(`#${light} fePointLight`, {
      attr: {
        z: config.lights[light].z,
      },
    })
  }
}

const sync = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== 'theme'
  )
    return update()
  document.startViewTransition(() => update())
}

ctrl.addBinding(config, 'border', {
  min: 1,
  max: 6,
  step: 1,
  label: 'border',
})

ctrl.addBinding(config, 'theme', {
  label: 'theme',
  options: {
    system: 'system',
    light: 'light',
    dark: 'dark',
  },
})

for (let i = 0; i < Object.keys(config.lights).length; i++) {
  const light = Object.keys(config.lights)[i]
  const folder = ctrl.addFolder({
    expanded: false,
    title: config.lights[light].label || `light ${i + 1}`,
  })
  folder.addBinding(config.lights[light], 'color', {
    label: 'color',
  })
  folder.addBinding(config.lights[light], 'z', {
    min: 0,
    max: 300,
    step: 1,
    label: 'z',
  })
  folder.addBinding(config.lights[light], 'constant', {
    min: 0.1,
    max: 20,
    step: 0.1,
    label: 'constant',
  })
  folder.addBinding(config.lights[light], 'exponent', {
    min: 1,
    max: 300,
    step: 1,
    label: 'exponent',
  })
  folder.addBinding(config.lights[light], 'surface', {
    min: 1,
    max: 30,
    step: 1,
    label: 'surface',
  })
}

ctrl.on('change', sync)
update()

const syncLight = (control) => {
  const { x, y, width, height } = control.getBoundingClientRect()
  const { left, top } = surface.getBoundingClientRect()
  const lightX = x + width * 0.5 - left
  const lightY = y + height * 0.5 - top
  gsap.set(`#${control.dataset.light} fePointLight`, {
    attr: {
      x: lightX,
      y: lightY,
    },
  })
}

const surface = document.querySelector('.surface')
const icons = document.querySelectorAll('.icon')
for (const icon of icons) {
  Draggable.create(icon, {
    type: 'x,y',
    onDrag: () => {
      syncLight(icon)
    },
  })
  syncLight(icon)
  // set a random position
  // gsap.set(icon, {
  //   x: gsap.utils.random(100, 300),
  //   y: gsap.utils.random(100, 300),
  // })
}
Draggable.create(surface, {
  type: 'x,y',
  onDrag: () => {
    for (const icon of icons) syncLight(icon)
  },
})
