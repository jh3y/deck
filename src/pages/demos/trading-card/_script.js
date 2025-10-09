import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { Pane } from 'tweakpane'

gsap.registerPlugin(DrawSVGPlugin, Draggable)

const config = {
  theme: 'system',
  explode: false,
  animate: true,
  pointer: {
    x: 0,
    y: 0,
  },
  turbulence: {
    type: 'turbulence',
    baseFrequency: 0.6,
    numOctaves: 10,
  },
  noise: {
    type: 'fractalNoise',
    baseFrequency: 0.6,
    numOctaves: 10,
  },
}

const CARD = document.querySelector('.card')
const MINIMAP = document.querySelector('.minimap')

const syncLight = ({ x, y }) => {
  const bounds = config.explode
    ? MINIMAP.getBoundingClientRect()
    : CARD.getBoundingClientRect()
  gsap.set('fePointLight', {
    attr: {
      x: Math.floor(x - bounds.x),
      y: Math.floor(y - bounds.y),
    },
  })
}
const UPDATE = ({ x, y }) => {
  if (config.debug) return
  const BOUNDS = config.explode
    ? MINIMAP.getBoundingClientRect()
    : CARD.getBoundingClientRect()
  // Calculate the range between the center and the pointer position.
  const posX = x - BOUNDS.x
  const posY = y - BOUNDS.y
  const ratioX = posX / BOUNDS.width - 0.5
  const ratioY = posY / BOUNDS.height - 0.5
  const pointerX = gsap.utils.clamp(-1, 1, ratioX * 2).toFixed(2)
  const pointerY = gsap.utils.clamp(-1, 1, ratioY * 2).toFixed(2)
  gsap.set(CARD, {
    '--pointer-x': pointerX,
    '--pointer-y': pointerY,
  })
  gsap.set('.minimap span:first-of-type', {
    innerText: `x: ${pointerX}`,
  })
  gsap.set('.minimap span:last-of-type', {
    innerText: `y: ${pointerY}`,
  })
  syncLight({ x, y })
}
syncLight({ x: window.innerWidth / 2, y: window.innerHeight })

const flipper = CARD.querySelector('button')
flipper.addEventListener('click', () => {
  if (
    CARD.dataset.active === 'false' ||
    document.documentElement.dataset.explode === 'true'
  )
    return
  flipper.ariaPressed = flipper.matches('[aria-pressed="false"]')
})

document.body.addEventListener('pointermove', UPDATE)

// tweakpane stuff
const ctrl = new Pane({
  title: 'config',
  expanded: true,
})

const update = () => {
  document.documentElement.dataset.theme = config.theme
  document.documentElement.dataset.animate = config.animate
  document.documentElement.dataset.explode = config.explode
}

const sync = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== 'theme'
  )
    return update()
  document.startViewTransition(() => update())
}

ctrl.addBinding(config, 'explode', {
  label: 'explode',
})

ctrl.addBinding(config, 'animate', {
  label: 'animate',
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

// timeline stuff...
gsap.set(['.sig', '.ear', '.eye', '.nose'], {
  drawSVG: 0,
})
gsap.set('.glare', {
  xPercent: 100,
})
gsap.set(['.sticker', '.card h3', '.card__front img', '.watermark', '.arrow'], {
  opacity: 0,
})

const activate = () => {
  CARD.dataset.active = 'true'
  gsap.set(
    [CARD, '.watermark', '.card__front img', '.sticker', '.card h3', '.arrow'],
    {
      clearProps: 'all',
    }
  )
  gsap.set([CARD], {
    display: 'block',
  })
}

gsap
  .timeline({
    delay: 0.5,
    onComplete: () => {
      document.querySelector('.glare').remove()
      activate()
    },
  })
  .to('.glare', {
    delay: 0.25,
    xPercent: -100,
    duration: 0.65,
    ease: 'power2.inOut',
  })
  .to(
    '.watermark',
    {
      opacity: 1,
      duration: 0.5,
    },
    '<50%'
  )
  .to(
    '.card__front img',
    {
      opacity: 1,
      duration: 0.5,
    },
    '<'
  )
  .to('.sticker', {
    opacity: 1,
    duration: 0.5,
  })
  .to('.card h3', {
    opacity: 1,
  })
  .to('.sig', {
    drawSVG: 1,
    duration: 0.8,
    ease: 'power2.in',
  })
  .to('.ear', {
    drawSVG: 1,
    duration: 0.1,
    ease: 'power2.in',
  })
  .to('.signature .eye', {
    drawSVG: 1,
    duration: 0.1,
    ease: 'power2.in',
  })
  .to('.nose', {
    drawSVG: 1,
    duration: 0.1,
    ease: 'power2.in',
  })
  .to(['.signature .eye', '.nose'], {
    fill: 'hsl(45 20% 60%)',
    duration: 0.2,
  })
  .to('.arrow', {
    opacity: 0.8,
  })


Draggable.create('div.tp-dfwv')