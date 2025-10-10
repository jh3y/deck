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
  speed: 20,
  flame: '#822f2f',
  animate: false,
  displace: false,
  blur: 2,
  contrast: 3,
  distortion: {
    turbulence: {
      numOctaves: 4,
      baseFrequency: 0.022,
      seed: 1,
      stitchTiles: 'noStitch',
      type: 'fractalNoise',
    },
  },
}

const ctrl = new Pane({
  title: 'Config',
  expanded: true,
})

const update = () => {
  document.documentElement.dataset.theme = config.theme
  document.documentElement.dataset.displace = config.displace
  document.documentElement.dataset.animate = config.animate
  document.documentElement.style.setProperty('--flame', config.flame)
  document.documentElement.style.setProperty('--flame-blur', config.blur)
  document.documentElement.style.setProperty('--flame-speed', config.speed)
  document.documentElement.style.setProperty(
    '--flame-contrast',
    config.contrast
  )

  for (const key of Object.keys(config.distortion.turbulence)) {
    filters.distortion.feTurbulence.setAttribute(
      key,
      config.distortion.turbulence[key]
    )
    filters.distortion.show.setAttribute(key, config.distortion.turbulence[key])
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

ctrl.addBinding(config, 'animate')
ctrl.addBinding(config, 'displace')

ctrl.addBinding(config, 'theme', {
  label: 'Theme',
  options: {
    System: 'system',
    Light: 'light',
    Dark: 'dark',
  },
})

const distortion = ctrl.addFolder({ title: 'Distortion ' })
const turb = distortion.addFolder({ title: 'feTurbulence' })
turb.addBinding(config.distortion.turbulence, 'seed', {
  min: 0,
  max: 1000,
  step: 1,
  label: 'seed',
})
turb.addBinding(config.distortion.turbulence, 'baseFrequency', {
  min: 0,
  max: 1,
  step: 0.001,
  label: 'baseFrequency',
})
turb.addBinding(config.distortion.turbulence, 'numOctaves', {
  min: 0,
  max: 10,
  step: 1,
  label: 'numOctaves',
})
turb.addBinding(config.distortion.turbulence, 'type', {
  options: {
    fractalNoise: 'fractalNoise',
    turbulence: 'turbulence',
  },
  label: 'type',
})
turb.addBinding(config.distortion.turbulence, 'stitchTiles', {
  options: {
    noStitch: 'noStitch',
    stitch: 'stitch',
  },
  label: 'stitchTiles',
})

ctrl.addBinding(config, 'flame', {
  label: 'Flame',
})
ctrl.addBinding(config, 'blur', {
  label: 'blur',
  min: 0,
  max: 10,
  step: 1,
})
ctrl.addBinding(config, 'contrast', {
  label: 'contrast',
  min: 0,
  max: 30,
  step: 1,
})
ctrl.addBinding(config, 'speed', {
  label: 'speed',
  min: 2,
  max: 30,
  step: 1,
})

ctrl.on('change', sync)
update()
