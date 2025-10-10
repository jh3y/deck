import { Pane } from 'tweakpane'
import gsap from 'gsap'

const filters = {
  distortion: {
    show: document.querySelector('filter#noiseshow feTurbulence'),
    feTurbulence: document.querySelector('filter#distortion feTurbulence'),
  },
}

const config = {
  theme: 'system',
  // base: 0.05,
  tile: 10,
  size: 1,
  offset: 0,
  operator: 'dilate',
  radius: 5,
}

const ctrl = new Pane({
  title: 'Config',
  expanded: true,
})

const update = () => {
  document.documentElement.dataset.theme = config.theme
  gsap.set('feFlood', {
    attr: {
      x: config.offset,
      y: config.offset,
      width: config.size,
      height: config.size,
    }
  })
  gsap.set('feComposite:first-of-type', {
    attr: {
      width: config.tile,
      height: config.tile,
    }
  })
  gsap.set('feMorphology', {
    attr: {
      operator: config.operator,
      radius: config.radius,
    }
  })
}

const sync = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== 'Theme'
  )
    return update()
  document.startViewTransition(() => update())
}

ctrl.addBinding(config, 'tile', {
  min: 0,
  max: 100,
  step: 1,
  label: 'tile',
})
ctrl.addBinding(config, 'size', {
  min: 0,
  max: 100,
  step: 1,
  label: 'size',
})
ctrl.addBinding(config, 'offset', {
  min: 0,
  max: 100,
  step: 1,
  label: 'offset',
})
ctrl.addBinding(config, 'operator', {
  label: 'operator',
  options: {
    dilate: 'dilate',
    erode: 'erode',
  },
})
ctrl.addBinding(config, 'radius', {
  min: 0,
  max: 100,
  step: 1,
  label: 'radius',
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
