import gsap from 'gsap'
import Draggable from 'gsap/Draggable'
import { Pane } from 'tweakpane'

gsap.registerPlugin(Draggable)

const toggle = document.querySelector('.liquid-toggle')
const config = {
  theme: 'light',
  complete: 0,
  active: false,
  deviation: 2,
  alpha: 16,
  bounce: false,
  debug: false,
}

const ctrl = new Pane({
  title: 'config',
})

const update = () => {
  gsap.set('#goo feGaussianBlur', {
    attr: {
      stdDeviation: config.deviation,
    },
  })
  gsap.set('#goo feColorMatrix', {
    attr: {
      values: `
        1 0 0 0 0
        0 1 0 0 0
        0 0 1 0 0
        0 0 0 ${config.alpha} -10
      `,
    },
  })
  document.documentElement.dataset.debug = config.debug
  document.documentElement.dataset.theme = config.theme
  document.documentElement.dataset.active = config.active
  document.documentElement.dataset.bounce = config.bounce
  toggle.style.setProperty('--complete', config.complete)
}

const sync = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== 'theme'
  )
    return update()
  document.startViewTransition(() => update())
}

ctrl.addBinding(config, 'complete', {
  min: 0,
  max: 100,
  label: 'complete (%)',
  step: 1,
})

ctrl.addBinding(config, 'active')
ctrl.addBinding(config, 'bounce')
ctrl.addBinding(config, 'debug')

const settings = ctrl.addFolder({
  title: 'settings',
  disabled: false,
  expanded: false,
})
settings.addBinding(config, 'deviation', {
  min: 0,
  max: 50,
  step: 1,
  label: 'stdDeviation',
})
settings.addBinding(config, 'alpha', {
  min: 0,
  max: 50,
  step: 1,
  label: 'alpha',
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
// this is the CSS from going :active
// .liquid-toggle:active .indicator--masked .mask {
//   height: calc((100% - (2 * var(--border))) * 1.65);
//   width: calc((60% - (2 * var(--border))) * 1.65);
//   margin-left: calc((60% - (2 * var(--border))) * -0.325);
//   /* we can't use scale because of Safari flashing the mask color on change... */
//   /* scale: 1.65; */
// }
// .liquid-toggle:active .indicator__liquid {
//   scale: 1.65;
// }

// .liquid-toggle:active .wrapper {
//   filter: blur(0px);
// }

// .liquid-toggle:active .indicator__liquid .shadow {
//   opacity: 1;
// }

// .liquid-toggle:active .indicator__liquid .cover {
//   opacity: 0;
// }

// .liquid-toggle:active .indicator__liquid .liquid__track {
//   left: calc(var(--border) * 3);
//   height: calc((var(--height) * 1px) - (6 * var(--border)));
// }
// the actual interaction we're going to do with GSAP here because I can't be bothered
// to manage a CSS timeline for this with the bounce lol
const toggleState = async () => {
  toggle.dataset.active = true
  // if we use wiggle, don't await, instead jus' set a delay
  await Promise.allSettled(
    !config.bounce
      ? toggle.getAnimations({ subtree: true }).map((a) => a.finished)
      : []
  )
  // if it was a click, do a toggle timeline
  // else run a timeline and swap out the aria-pressed attribute
  // 1. scale up
  // 2. slide across
  // 3. bounce the scale depending on direction
  // 4. scale back down
  const pressed = toggle.matches('[aria-pressed=true]')
  gsap
    .timeline({
      onComplete: () => {
        gsap.delayedCall(0.05, () => {
          toggle.dataset.active = false
          toggle.setAttribute(
            'aria-pressed',
            !toggle.matches('[aria-pressed=true]')
          )
        })
      },
    })
    .to(toggle, {
      '--complete': pressed ? 0 : 100,
      duration: 0.15,
      delay: config.bounce ? 0.2 : 0,
    })
  // .fromTo(
  //   '.indicator__liquid',
  //   {
  //     '--scale-x': 1,
  //     '--scale-y': 1,
  //   },
  //   {
  //     '--scale-x': 1.1,
  //     '--scale-y': 1.1,
  //     duration: 0.05,
  //     repeat: 1,
  //     repeatDelay: 0.15,
  //     yoyo: true,
  //   },
  //   0
  // )
}
// toggle.addEventListener('click', toggleState)
const proxy = document.createElement('div')
Draggable.create(proxy, {
  allowContextMenu: true,
  handle: '.liquid-toggle',
  onDragStart: function () {
    // if you want a more true drag distance, use pointer down + remaining width
    const toggleBounds = toggle.getBoundingClientRect()
    const pressed = toggle.matches('[aria-pressed=true]')
    const bounds = pressed
      ? toggleBounds.left - this.pointerX
      : toggleBounds.left + toggleBounds.width - this.pointerX
    this.dragBounds = bounds
    toggle.dataset.active = true
  },
  onDrag: function () {
    const pressed = toggle.matches('[aria-pressed=true]')
    // on drag needs to make sure it's also inverted for when already pressed
    const dragged = this.x - this.startX
    const complete = gsap.utils.clamp(
      0,
      100,
      pressed
        ? gsap.utils.mapRange(this.dragBounds, 0, 0, 100, dragged)
        : gsap.utils.mapRange(0, this.dragBounds, 0, 100, dragged)
    )
    this.complete = complete
    gsap.set(toggle, { '--complete': complete })
  },
  onDragEnd: function () {
    gsap.fromTo(
      toggle,
      {
        '--complete': this.complete,
      },
      {
        '--complete': this.complete >= 50 ? 100 : 0,
        duration: 0.15,
        onComplete: () => {
          gsap.delayedCall(0.05, () => {
            toggle.dataset.active = false
            toggle.setAttribute('aria-pressed', this.complete >= 50)
          })
        },
      }
    )
  },
  onPress: function () {
    this.__pressTime = Date.now()
    toggle.dataset.active = true
    // if ('ontouchstart' in window && navigator.maxTouchPoints > 0)
  },
  onRelease: function () {
    this.__releaseTime = Date.now()
    // console.info(this)
      // 'ontouchstart' in window &&
      // navigator.maxTouchPoints > 0 &&
    if (
      ((this.startX !== undefined &&
        this.endX !== undefined &&
        Math.abs(this.endX - this.startX) < 4) ||
        this.endX === undefined)
    )
      toggle.dataset.active = false
    // the interaction becomes a drag if the duration is long enough for the transition
    if (this.__releaseTime - this.__pressTime <= 150) {
      // if it's a click, run a timeline
      toggleState()
    }
  },
})

toggle.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    toggleState()
  }

  if (e.key === ' ') {
    // Prevent scroll
    e.preventDefault()
  }
})

toggle.addEventListener('keyup', (e) => {
  if (e.key === ' ') {
    toggleState()
  }
})
