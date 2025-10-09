import gsap from 'gsap'
import { Physics2DPlugin } from 'gsap/Physics2DPlugin'
import { Pane } from 'tweakpane'

gsap.registerPlugin(Physics2DPlugin)

const button = document.querySelector('[aria-label="Leave a tip"]')
const coin = button.querySelector('.coin')

const config = {
  theme: 'light',
  power: '',
  muted: false,
  timeScale: 1.1,
  distance: {
    lower: 100,
    upper: 350,
  },
  bounce: {
    lower: 2,
    upper: 12,
  },
  velocity: {
    lower: 300,
    upper: 700,
  },
  rotation: {
    lower: 0,
    upper: 15,
  },
  flipSpeed: {
    lower: 0.25,
    upper: 0.6,
  },
  spins: {
    lower: 1,
    upper: 6,
  },
  rotate: {
    lower: 0,
    upper: 90,
  },
}

const tipSound = new Audio('https://myinstants.com/media/sounds/coin_1.mp3')
tipSound.volume = 0.3
tipSound.muted = config.muted

const tip = () => {
  if (button.dataset.tipping === 'true') return
  const currentRotation = gsap.getProperty(button, 'rotate')
  if (currentRotation < 0) document.documentElement.dataset.flipped = 'true'
  button.dataset.tipping = 'true'
  const duration = gsap.utils.mapRange(
    config.rotation.lower,
    config.rotation.upper,
    0,
    config.flipSpeed.upper
  )(Math.abs(currentRotation))
  const distance = gsap.utils.snap(
    1,
    gsap.utils.mapRange(
      config.rotation.lower,
      config.rotation.upper,
      config.distance.lower,
      config.distance.upper
    )(Math.abs(currentRotation))
  )

  const velocity = gsap.utils.mapRange(
    config.rotation.lower,
    config.rotation.upper,
    config.velocity.lower,
    config.velocity.upper
  )(Math.abs(currentRotation))
  const bounce = gsap.utils.mapRange(
    config.velocity.lower,
    config.velocity.upper,
    config.bounce.lower,
    config.bounce.upper
  )(Math.abs(velocity))

  const distanceDuration = gsap.utils.mapRange(
    config.distance.lower,
    config.distance.upper,
    config.flipSpeed.lower,
    config.flipSpeed.upper
  )(distance)

  const spin = gsap.utils.snap(
    1,
    gsap.utils.mapRange(
      config.distance.lower,
      config.distance.upper,
      config.spins.lower,
      config.spins.upper
    )(distance)
  )
  const offRotate =
    gsap.utils.random(config.rotate.lower, config.rotate.upper, 1) * -1
  const hangtime = Math.max(1, duration * 4)

  const tl = gsap
    .timeline({
      onComplete: () => {
        if (config.muted === false) {
          tipSound.muted = config.muted
          tipSound.play()
        }
        gsap.set(coin, {
          yPercent: 100,
        })
        gsap
          .timeline({
            onComplete: () => {
              gsap.set(button, { clearProps: 'all' })
              gsap.set(coin, { clearProps: 'all' })
              gsap.set('.purse', { clearProps: 'all' })
              button.dataset.tipping = 'false'
            },
          })
          .to(button, {
            yPercent: bounce,
            repeat: 1,
            duration: 0.12,
            yoyo: true,
          })
          .fromTo(
            '.hole',
            {
              scale: 1,
            },
            {
              scale: 0,
              duration: 0.2,
              delay: 0.2,
            }
          )
          .set(coin, {
            clearProps: 'all',
          })
          .set(coin, {
            yPercent: -50,
          })
          .fromTo(
            '.purse',
            {
              xPercent: -200,
            },
            {
              delay: 0.5,
              xPercent: 0,
              duration: 0.5,
              ease: 'power1.out',
            }
          )
          .fromTo(
            coin,
            {
              rotate: -460,
            },
            {
              rotate: 0,
              duration: 0.5,
              ease: 'power1.out',
            },
            '<'
          )
          .timeScale(config.timeScale)
      },
    })
    .set(button, { transition: 'none' })
    .fromTo(
      button,
      {
        rotate: currentRotation,
      },
      {
        rotate: 0,
        duration,
        ease: 'elastic.out(1.75,0.75)',
      }
    )
    .to(
      coin,
      {
        onUpdate: function () {
          const y = gsap.getProperty(coin, 'y')
          if (y >= coin.offsetHeight) {
            this.progress(1)
            tl.progress(1)
          }
        },
        duration: hangtime,
        physics2D: {
          velocity,
          angle: -90,
          gravity: 1000,
        },
      },
      `>-${duration * 0.825}`
    )
    .fromTo(
      coin,
      {
        rotateX: 0,
      },
      {
        duration: distanceDuration * 2,
        rotateX: spin * -360,
      },
      '<'
    )
    .to(
      coin,
      {
        rotateY: offRotate,
        duration: distanceDuration,
      },
      '<'
    )
    .to(
      coin,
      {
        '--rx': offRotate,
        duration: distanceDuration,
      },
      '<'
    )
    .fromTo(
      '.hole',
      {
        scale: 0,
      },
      {
        scale: 1,
        duration: 0.2,
      },
      hangtime * 0.35
    )
    .timeScale(config.timeScale)
}
button.addEventListener('click', tip)

const ctrl = new Pane({
  title: 'config',
  expanded: true,
})

const update = () => {
  document.documentElement.dataset.theme = config.theme
}

const sync = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== 'theme'
  )
    return update()
  document.startViewTransition(() => update())
}

ctrl.addBinding(config, 'timeScale', {
  label: 'timescale',
  min: 0.1,
  max: 2,
  step: 0.1,
})

ctrl.addBinding(config, 'muted', {
  label: 'muted',
})

ctrl.addBinding(config, 'power', {
  label: 'power',
  disabled: true,
})

ctrl.addBinding(config, 'theme', {
  label: 'theme',
  options: {
    System: 'system',
    Light: 'light',
    Dark: 'dark',
  },
})

ctrl.on('change', sync)
update()
