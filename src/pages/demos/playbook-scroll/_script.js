// Newsletter issue: https://craftofui.substack.com/p/scrolling-a-page-out-of-the-playbook

import { Pane } from 'tweakpane'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

let layersCtrl
let centerCtrl
let staggerCtrl
let scalerTl
let layersTl

const hasScrollSupport = CSS.supports(
  '(animation-timeline: view()) and (animation-range: 0 100%)'
)

const config = {
  theme: 'system',
  enhanced: false,
  stick: true,
  layers: true,
  center: true,
  stagger: 'range',
}

const ctrl = new Pane({
  title: 'Config',
  expanded: true,
})

if (!hasScrollSupport) {
  gsap.registerPlugin(ScrollTrigger)
  console.info('GSAP ScrollTrigger registered')
}

const update = () => {
  document.documentElement.dataset.theme = config.theme
  document.documentElement.dataset.enhanced = config.enhanced
  document.documentElement.dataset.stick = config.stick
  document.documentElement.dataset.center = config.center
  document.documentElement.dataset.layers = config.layers
  document.documentElement.dataset.stagger = config.stagger

  if (config.enhanced && !hasScrollSupport) {
    scalerTl = gsap
      .timeline({
        scrollTrigger: {
          trigger: 'main section:first-of-type',
          start: 'top -10%',
          end: 'bottom 80%',
          scrub: true,
        },
      })
      .from(
        '.scaler img',
        {
          height: window.innerHeight - 32,
          ease: 'power1.inOut',
        },
        0
      )
      .from(
        '.scaler img',
        {
          width: window.innerWidth - 32,
          ease: 'power2.inOut',
        },
        0
      )
    // then the layers
    layersTl = gsap
      .timeline({
        scrollTrigger: {
          trigger: 'main section:first-of-type',
          start: 'top -40%',
          end: 'bottom bottom',
          scrub: true,
        },
      })
      .from(
        '.layer:nth-of-type(1)',
        {
          opacity: 0,
          ease: 'sine.out',
        },
        0
      )
      .from(
        '.layer:nth-of-type(1)',
        {
          scale: 0,
          ease: 'power1.inOut',
        },
        0
      )
      .from(
        '.layer:nth-of-type(2)',
        {
          opacity: 0,
          ease: 'sine.out',
        },
        0
      )
      .from(
        '.layer:nth-of-type(2)',
        {
          scale: 0,
          ease: 'power3.inOut',
        },
        0
      )
      .from(
        '.layer:nth-of-type(3)',
        {
          opacity: 0,
          ease: 'sine.out',
        },
        0
      )
      .from(
        '.layer:nth-of-type(3)',
        {
          scale: 0,
          ease: 'power4.inOut',
        },
        0
      )
  } else {
    gsap.set(['.scaler img', '.layer'], {
      attr: {
        style: undefined,
      },
    })
    scalerTl?.kill()
    layersTl?.kill()
    scalerTl = undefined
    layersTl = undefined
  }

  if (hasScrollSupport) {
    layersCtrl.hidden = !config.enhanced
    staggerCtrl.hidden = !config.enhanced
    centerCtrl.hidden = !config.enhanced
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

ctrl.addBinding(config, 'enhanced', {
  label: 'Enhance',
})

if (hasScrollSupport) {
  centerCtrl = ctrl.addBinding(config, 'center', {
    label: 'Center',
    hidden: !config.enhanced,
  })
  layersCtrl = ctrl.addBinding(config, 'layers', {
    label: 'Layers',
    hidden: !config.enhanced,
  })
  staggerCtrl = ctrl.addBinding(config, 'stagger', {
    label: 'Stagger',
    options: {
      Range: 'range',
      Timing: 'timing',
    },
    hidden: !config.enhanced,
  })
}
ctrl.addBinding(config, 'stick', {
  label: 'Stick',
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
