import { Pane } from 'tweakpane'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import InertiaPlugin from 'gsap/InertiaPlugin'
import MorphSVGPlugin from 'gsap/MorphSVGPlugin'
import Flip from 'gsap/Flip'

gsap.registerPlugin(Draggable, InertiaPlugin, Flip, MorphSVGPlugin)

const config = {
  theme: 'light',
  proximity: 120,
  debug: false,
  duration: 0.35,
  rollback: 0.2,
  timeScale: 1,
  css: false,
}

const ctrl = new Pane({
  title: 'config',
  expanded: false,
})

const update = () => {
  document.documentElement.dataset.theme = config.theme
  document.documentElement.dataset.debug = config.debug
  document.documentElement.dataset.css = config.css
  if (config.css) {
    gsap.set('.animated svg path', {
      attr: {
        pathLength: config.css ? 1 : undefined,
      },
    })
  } else {
    document.querySelector('.animated svg path').removeAttribute('pathLength')
  }
  document.documentElement.style.setProperty(
    '--snap-proximity',
    config.proximity
  )
  document.documentElement.style.setProperty(
    '--timescale',
    1 / config.timeScale
  )
}

const sync = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== 'theme'
  )
    return update()
  document.startViewTransition(() => update())
}

const spots = ctrl.addFolder({ title: 'hot spots', expanded: false })

spots.addBinding(config, 'proximity', {
  min: 0,
  max: 300,
  step: 1,
  label: 'proximity',
})

ctrl.addBinding(config, 'duration', {
  min: 0.1,
  max: 5,
  step: 0.01,
  label: 'morph duration',
})

ctrl.addBinding(config, 'timeScale', {
  min: 0.1,
  max: 2,
  step: 0.01,
  label: 'playback timeScale',
})

spots.addBinding(config, 'debug', {
  label: 'debug',
})

ctrl.addBinding(config, 'css')

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
// END TWEAKPANE STUFF

// do GSAP stuff
const button = document.querySelector('[aria-label^="Sign"]')
const targets = document.querySelectorAll('.target')

const getClosestPoint = (target, maxDistance = Number.POSITIVE_INFINITY) => {
  if (maxDistance !== Number.POSITIVE_INFINITY)
    document.documentElement.style.setProperty('--snap-proximity', maxDistance)
  let closest = null
  let minDistance = Number.POSITIVE_INFINITY

  const coordinates = Array.from(targets).map((el) => {
    const rect = el.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      element: el,
    }
  })

  for (const coord of coordinates) {
    const dx = Math.min(window.innerWidth, Math.max(0, target.x)) - coord.x
    const dy = Math.min(window.innerHeight, Math.max(0, target.y)) - coord.y
    const distance = Math.hypot(dx, dy) // Euclidean distance
    if (distance < minDistance) {
      minDistance = distance
      closest = coord
    }
  }

  if (minDistance <= maxDistance) {
    return {
      coordinate: closest,
      distance: minDistance,
    }
  }

  // If no point is within maxDistance
  return null
}

const RESISTANCE_PIXELS = 80
const DEFAULT_RESISTANCE = 0.75
const END_RESISTANCE = 0
gsap.set(button, {
  x: window.innerWidth * 0.5,
  y: window.innerHeight * 0.5,
  yPercent: -50,
  xPercent: -50,
})

// make magnetic hotspots draggable
for (const target of targets) {
  Draggable.create(target, {
    inertia: false,
    type: 'x,y',
  })
}

Draggable.create(button, {
  inertia: true,
  allowContextMenu: true,
  allowEventDefault: true,
  type: 'x,y',
  dragResistance: DEFAULT_RESISTANCE,
  resistance: 1800,
  snap: {
    points: function (point) {
      const { isDragging, __unlocked, startX, startY } = this
      const closestPoint = getClosestPoint(point, config.proximity)
      if (!isDragging && !__unlocked) {
        return { x: startX, y: startY }
      } else if (__unlocked && closestPoint) {
        for (const t of targets) t.dataset.active = false
        closestPoint.coordinate.element.dataset.active = true
        return closestPoint.coordinate
      }
      return point
    },
  },
  bounds: '.targets',
  onDragStart: function (event) {
    const bounds = this.target.getBoundingClientRect()
    const currentPoint = {
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    }
    this.__start = currentPoint
    this.dragResistance = DEFAULT_RESISTANCE
    this.__unlocked = false
    document.documentElement.dataset.dragging = true
  },
  onDrag: function (event) {
    const { startX, startY, x, y } = this
    const distance = Math.hypot(x - startX, y - startY)
    const newResistance = gsap.utils.clamp(
      END_RESISTANCE,
      DEFAULT_RESISTANCE,
      gsap.utils.mapRange(
        0,
        RESISTANCE_PIXELS,
        DEFAULT_RESISTANCE,
        END_RESISTANCE
      )(Math.abs(distance))
    )
    if (!this.__unlocked) this.dragResistance = newResistance
    if (!this.__unlocked && newResistance === END_RESISTANCE) {
      this.__unlocked = true
      document.querySelector('.arrow--instruction').style.opacity = 0
      for (const t of targets) t.dataset.active = false
    }
  },
  onDragEnd: function () {
    this.dragResistance = DEFAULT_RESISTANCE
    this.__unlocked = false
  },
  onRelease: () => {
    document.documentElement.dataset.dragging = false
  },
  onThrowComplete: function () {
    this.dragResistance = DEFAULT_RESISTANCE
    this.__unlocked = false
  },
})

// do some Popover stuff...
const pop = document.querySelector('[popover]')
let f
let signoff
let popDrag
const closePopover = async (event) => {
  if ((event && event.key === 'Escape') || event === undefined) {
    pop.dataset.closing = 'true'
    if (popDrag) popDrag[0].kill()

    // need to flip down to the button location which could be "tricky"
    // first ascertain if you're next to a hotspot
    let closerBounds
    const pos = pop.getBoundingClientRect()
    const center = {
      x: pos.x + pos.width * 0.5,
      y: pos.y + pos.height * 0.5,
    }
    const {
      x: buttonX,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
    } = button.getBoundingClientRect()
    const closest = getClosestPoint(center, config.proximity)
    if (closest) {
      closerBounds = closest.coordinate.element.getBoundingClientRect()
      gsap.set(button, {
        opacity: 0,
        x: closest.coordinate.x,
        y: closest.coordinate.y,
      })
    }
    const state = Flip.getState(
      [
        pop,
        '.placeholder',
        '.placeholder > svg',
        '[popover] .popover__content',
      ],
      {
        nested: true,
        props: 'borderRadius, scale, opacity, filter, backgroundColor, color',
      }
    )
    // now set the popover attributes
    gsap.set(pop, {
      width: buttonWidth,
      height: buttonHeight,
      top: closest
        ? closerBounds.top + closerBounds.height * 0.5
        : buttonY + buttonHeight * 0.5,
      left: closest
        ? closerBounds.left + closerBounds.width * 0.5
        : buttonX + buttonWidth * 0.5,
      opacity: 1,
      borderRadius: '21px',
      x: 0,
      y: 0,
      xPercent: -50,
      yPercent: -50,
      backgroundColor:
        pop.dataset.signed === 'true'
          ? 'hsl(140 80% 90%)'
          : getComputedStyle(document.body).color,
      color:
        pop.dataset.signed === 'true'
          ? 'hsl(140 90% 30%)'
          : getComputedStyle(document.body).backgroundColor,
    })
    gsap.set('.placeholder > svg', {
      width: 20,
      height: 20,
      y: 0,
      opacity: 1,
    })
    gsap.set('[popover] .popover__content', {
      y: 0,
      opacity: 0,
      filter: 'blur(4px)',
    })
    // try it
    const tl = gsap.timeline({ paused: true })
    tl.add(
      Flip.from(state, {
        duration: config.duration,
        nested: true,
        // delay: 1,
        ease: 'power2.inOut',
      })
    )
    if (pop.dataset.signed === 'true') {
      tl.to(
        '#morph',
        {
          morphSVG: '#check',
          duration: config.duration,
          ease: 'power2.inOut',
        },
        0
      )
    }
    await tl.play()
    gsap.set(button, { opacity: 1, boxShadow: 'var(--shadow)' })
    pop.hidePopover()
  }
}

const handleOffClick = (event) => {
  if (!event.target.closest('[popover]')) closePopover()
}

const openPopover = async () => {
  gsap.set(button, {
    boxShadow: 'unset',
  })
  // we need to work out the correct position for x/y
  const {
    x: buttonX,
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight,
  } = button.getBoundingClientRect()
  const center = {
    x: buttonX + buttonWidth * 0.5,
    y: buttonY + buttonHeight * 0.5,
  }
  const {
    x: popX,
    y: popY,
    width: popWidth,
    height: popHeight,
  } = pop.getBoundingClientRect()

  let vertical = 'center'
  if (center.y < popHeight * 0.5 + 24) vertical = 'bottom'
  if (center.y > window.innerHeight - (popHeight * 0.5 + 24)) vertical = 'top'
  let horizontal = 'center'
  if (center.x < popWidth * 0.5) horizontal = 'left'
  if (center.x > window.innerWidth - popWidth * 0.5) horizontal = 'right'
  const result = `vertical: ${vertical}; horizontal: ${horizontal};`

  // now do the FLIPPING stuff
  gsap.set(pop, {
    width: buttonWidth,
    height: buttonHeight,
    top: buttonY,
    left: buttonX,
    opacity: 1,
    borderRadius: '22px',
    backgroundColor:
      pop.dataset.signed === 'true'
        ? 'hsl(140 80% 90%)'
        : getComputedStyle(document.body).color,
    color:
      pop.dataset.signed === 'true'
        ? 'hsl(140 90% 30%)'
        : getComputedStyle(document.body).backgroundColor,
  })

  const state = Flip.getState(
    [pop, '.placeholder', '.placeholder > svg', '[popover] .popover__content'],
    {
      nested: true,
      props: 'borderRadius, scale, opacity, filter, backgroundColor, color, y',
    }
  )

  // assume central position first
  const position = {
    left: center.x,
    top: center.y,
    xPercent: -50,
    yPercent: -50,
  }

  if (horizontal === 'left') {
    position.right = 'unset'
    position.left = '1.5rem'
    position.xPercent = 0
  }
  if (horizontal === 'right') {
    position.left = 'unset'
    position.right = '1.5rem'
    position.xPercent = 0
  }
  if (vertical === 'bottom') {
    position.top = '1.5rem'
    position.bottom = 'unset'
    position.yPercent = 0
  }
  if (vertical === 'top') {
    position.bottom = '1.5rem'
    position.top = 'unset'
    position.yPercent = 0
  }

  gsap.set(pop, { clearProps: 'width,height' })
  gsap.set(pop, {
    ...position,
    opacity: 1,
    borderRadius: '6px',
    backgroundColor: getComputedStyle(document.body).backgroundColor,
    color: getComputedStyle(document.body).color,
  })

  gsap.set('.placeholder > svg', {
    width: 16,
    height: 16,
    y: -6,
    opacity: 0.5,
  })

  gsap.set('[popover] .popover__content', {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    background: '#0000',
  })

  window.addEventListener('keydown', closePopover)
  window.addEventListener('click', handleOffClick)
  const tl = gsap.timeline({ paused: true })
  tl.add(
    Flip.from(state, {
      // duration: 0.36,
      duration: config.duration,
      nested: true,
      // delay: 10,
      ease: 'power2.inOut',
    })
  )
  if (pop.dataset.signed === 'true') {
    tl.to(
      '#morph',
      {
        morphSVG: '#pen',
        duration: config.duration,
        ease: 'power2.inOut',
      },
      0
    )
  }
  await tl.play()
  // calibrate signature canvas
  calibrateCanvas()
  // set up event listeners for light dismiss etc.
  popDrag = Draggable.create(pop, {
    dragClickables: false,
    inertia: true,
    allowContextMenu: true,
    type: 'x,y',
    bounds: '.targets',
    onDrag: () => {
      f = undefined
      const pos = pop.getBoundingClientRect()
      const center = {
        x: pos.x + pos.width * 0.5,
        y: pos.y + pos.height * 0.5,
        xPercent: -50,
        yPercent: -50,
      }
      gsap.set(button, {
        x: center.x,
        y: center.y,
        xPercent: -50,
        yPercent: -50,
      })
    },
    onThrowUpdate: () => {
      f = undefined
      const pos = pop.getBoundingClientRect()
      const center = {
        x: pos.x + pos.width * 0.5,
        y: pos.y + pos.height * 0.5,
      }
      gsap.set(button, {
        x: center.x,
        y: center.y,
      })
    },
  })
}

pop.addEventListener('toggle', async (event) => {
  if (event.newState === 'open') {
    openPopover()
  } else {
    // closing
    gsap.set([pop, '.placeholder > svg', '[popover] .popover__content'], {
      clearProps: 'all',
    })
    gsap.set(button, {
      opacity: 1,
    })
    pop.dataset.closing = 'false'
    window.removeEventListener('keydown', closePopover)
    window.removeEventListener('click', handleOffClick)
  }
})

// Signature handling - this is where it gets more serious
const erase = document.querySelector('button.erase')
const hold = document.querySelector('button.hold')
// const signature = document.querySelector('.signature')
// const signatureElement = signature.querySelector('svg')
// const signaturePath = signature.querySelector('path')
const animated = document.querySelector('.animated')
const animatedElement = animated.querySelector('svg')
const animatedPath = animated.querySelector('path')
// set up the canvas
const canvas = document.querySelector('[popover] canvas')
const ctx = canvas.getContext('2d')
const DPR = window.devicePixelRatio || 1

const calibrateCanvas = () => {
  if (strokes.length === 0) {
    // Get the canvas size
    const rect = canvas.getBoundingClientRect()
    // Set the canvas size in actual pixels (scaled by DPR)
    canvas.width = Math.floor(rect.width * DPR)
    canvas.height = Math.floor(rect.height * DPR)

    // Scale the canvas context by DPR
    ctx.scale(DPR, DPR)
    // Set up canvas
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = 'canvasText'
  }
}
// kick off rAF using ticker with pointer event
gsap.set(canvas, { touchAction: 'none' })
const strokes = []
let minTime = Number.POSITIVE_INFINITY
let maxTime = Number.NEGATIVE_INFINITY
let signDuration
const getPoint = ({ x, y }) => {
  const { left, top } = canvas.getBoundingClientRect()
  const time = Date.now()
  minTime = Math.min(minTime, time)
  maxTime = Math.max(maxTime, time)
  signDuration = (maxTime - minTime) / 1000
  gsap.set(pop, {
    '--sign-on': signDuration,
  })
  if (pop.dataset.valid !== 'true' && isValidSignature())
    pop.dataset.valid = 'true'
  return {
    x: x - left,
    y: y - top,
    time,
  }
}

const generateSVGPath = () => {
  let path = ''
  if (strokes.length === 0) return path
  for (const stroke of strokes) {
    const points = stroke.points
    if (points.length > 0) {
      path += `M ${points[0].x} ${points[0].y} `
      for (let i = 1; i < points.length; i++) {
        path += `L ${points[i].x} ${points[i].y} `
      }
    }
  }
  return path
}

const render = () => {
  for (const stroke of strokes) {
    const points = stroke.points
    if (points.length > 0) {
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }
      ctx.stroke()
    }
  }
}
const sign = (event) => {
  const currentStroke = strokes[strokes.length - 1]
  currentStroke.points.push(getPoint(event))
}

const startSigning = (event) => {
  gsap.ticker.add(render)
  strokes.push({
    points: [getPoint(event)],
  })
  canvas.addEventListener('pointermove', sign)
}
const stopSigning = (event) => {
  gsap.ticker.remove(render)
  canvas.removeEventListener('pointermove', sign)
  // render the SVG
  const path = generateSVGPath()
  animatedPath.setAttribute('d', path)
  if (signDuration !== undefined) {
    hold.setAttribute(
      'aria-label',
      `Hold for ${signDuration.toFixed(2)} seconds to confirm signature`
    )
  }
  // const rect = canvas.getBoundingClientRect()
  // signatureElement.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`)
  // signaturePath.setAttribute('d', generateSVGPath())
}

const handleTouchOff = () => {
  // now are we done?
  if (!config.css) {
    console.info('running this now')
    pop.dataset.signing = 'false'
    if (signoff) {
      if (signoff.progress() !== 0) pop.dataset.reversing = 'true'
      signoff.timeScale(2)
      signoff.pause()
      signoff.reverse()
    }
  }
  // CSS mode completion is now handled in replaySignature
}

const clearSignature = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  strokes.length = 0
  gsap.set(animatedPath, {
    attr: {
      d: '',
    },
  })
  // Reset CSS animation state
  if (config.css) {
    gsap.set(animatedPath, { clearProps: 'strokeDashoffset' })
    pop.dataset.signing = 'false'
  }
  pop.dataset.valid = 'false'
  minTime = Number.POSITIVE_INFINITY
  maxTime = Number.NEGATIVE_INFINITY
}

let all
let cssAnimationActive = false
const replaySignature = async () => {
  if (config.css) {
    if (!isValidSignature()) return
    // Prevent multiple simultaneous animations
    if (cssAnimationActive) return
    cssAnimationActive = true
    
    // Set signing state to trigger CSS animation
    pop.dataset.signing = 'true'
    
    // Keep signing state active while holding
    const keepSigning = (event) => {
      if (event.type === 'pointerdown') {
        event.preventDefault() // Prevent default to avoid retriggering
      }
      if (!pop.dataset.signing || pop.dataset.signing === 'false') {
        pop.dataset.signing = 'true'
      }
    }
    
    // Handle when user releases the button
    const handleRelease = async () => {
      // Clean up all event listeners
      hold.removeEventListener('pointerdown', keepSigning)
      hold.removeEventListener('pointerenter', keepSigning)
      hold.removeEventListener('pointerup', handleRelease)
      hold.removeEventListener('pointerleave', handleRelease)
      
      // Check if animation completed
      if (getComputedStyle(animatedPath).strokeDashoffset === '0px') {
        pop.dataset.signed = 'true'
        hold.setAttribute('aria-label', 'Signed')
        gsap.set('[popover] button', {
          attr: {
            disabled: 'true',
          },
        })
        gsap.set(animatedPath, { clearProps: 'strokeDashoffset' })
        gsap.set('.toggle svg path:first-of-type', { opacity: 0 })
        gsap.set('.toggle svg path:last-of-type', { opacity: 1 })
      } else {
        // Animation didn't complete, reset
        pop.dataset.signing = 'false'
        gsap.set(animatedPath, { clearProps: 'strokeDashoffset' })
        hold.addEventListener('keydown', handleKeyReplay, { once: true })
      }
      
      // Reset flag
      cssAnimationActive = false
    }
    
    // Set up continuous press handling
    hold.addEventListener('pointerdown', keepSigning)
    hold.addEventListener('pointerenter', keepSigning)
    hold.addEventListener('pointerup', handleRelease)
    hold.addEventListener('pointerleave', handleRelease)
    
  } else {
  // check for validity here...
  // but this could also be done whilst it's being drawn to set disabled?
  if (!isValidSignature()) return
  pop.dataset.signing = 'true'
  // ideally you create a tween that you play/reverse at different rates here...
  // Prepare animation data
  all = []
  console.info({ all })
  let minTime = Number.POSITIVE_INFINITY
  let maxTime = Number.NEGATIVE_INFINITY

  const rect = canvas.getBoundingClientRect()
  animatedElement.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`)
  // Collect all points with timing data and mark new strokes
  for (const stroke of strokes) {
    stroke.points.forEach((point, pointIndex) => {
      all.push({
        x: point.x,
        y: point.y,
        time: point.time,
        relativeTime: point.time - strokes[0].points[0].time,
        isNewStroke: pointIndex === 0, // Mark the first point of each stroke
      })
      // Track min and max times
      minTime = Math.min(minTime, point.time)
      maxTime = Math.max(maxTime, point.time)
    })
  }
  // Sort points by time
  all.sort((a, b) => a.time - b.time)
  signoff = gsap.timeline({
    paused: true,
  })
  let def = ''
  for (const point of all) {
    def += ` ${point.isNewStroke ? 'M' : 'L'} ${point.x} ${point.y} `
    if (point.isNewStroke) {
      signoff.set(
        animatedPath,
        {
          attr: {
            d: def,
          },
        },
        point.relativeTime / 1000
      )
    } else {
      // this would be great as a .to morphSVG but it can't handle it
      signoff.set(
        animatedPath,
        {
          attr: {
            d: def,
          },
        },
        point.relativeTime / 1000
      )
    }
  }
  signoff.timeScale(config.timeScale)
  await signoff.play()
  pop.dataset.signing = 'false'
  pop.dataset.reversing = 'false'

  if (signoff.progress() === 1) {
    pop.dataset.signed = 'true'
    hold.setAttribute('aria-label', 'Signed')
    gsap.set('[popover] button', {
      attr: {
        disabled: 'true',
      },
    })
    gsap.set('.toggle svg path:first-of-type', { opacity: 0 })
    gsap.set('.toggle svg path:last-of-type', { opacity: 1 })
  } else {
    console.info('did not confirm')
  }
}
}
// backup replay that just does a basic draw
// const replaySignature = async () => {
//   if (!isValidSignature()) return
//   try {
//     await Promise.all(animatedPath.getAnimations().map((t) => t.finished))
//     if (getComputedStyle(animatedPath).strokeDashoffset === '0px') {
//       pop.dataset.signed = 'true'
//       hold.setAttribute('aria-label', 'Signed')
//       gsap.set('[popover] button', {
//         attr: {
//           disabled: 'true',
//         },
//       })
//       gsap.set(animatedPath, { strokeDashoffset: 0 })
//       gsap.set('.toggle svg path:first-of-type', { opacity: 0 })
//       gsap.set('.toggle svg path:last-of-type', { opacity: 1 })
//     } else {
//       hold.addEventListener('keydown', handleKeyReplay, { once: true })
//     }
//   } catch (err) {
//     console.info('User did not confirm signature')
//     hold.addEventListener('keydown', handleKeyReplay, { once: true })
//   }
//   // DO THIS ONCE TRANSITION HAS FINISHED
// }

const handleKeyReplay = (event) => {
  if (event.code === 'Space') {
    replaySignature()
  }
}

canvas.addEventListener('pointerdown', startSigning)
canvas.addEventListener('pointerup', stopSigning)
erase.addEventListener('click', clearSignature)
hold.addEventListener('pointerdown', replaySignature)
hold.addEventListener('pointerup', handleTouchOff)
hold.addEventListener('keydown', handleKeyReplay, { once: true })
// check signature validity
const isValidSignature = () => {
  // Minimum requirements
  const MIN_POINTS = 50 // Minimum number of points across all strokes
  const MIN_DISTANCE = 150 // Minimum distance covered in pixels

  // Count total points
  let totalPoints = 0
  let totalDistance = 0

  for (const stroke of strokes) {
    const points = stroke.points
    totalPoints += points.length

    // Calculate distance covered in this stroke
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x
      const dy = points[i].y - points[i - 1].y
      totalDistance += Math.sqrt(dx * dx + dy * dy)
    }
  }

  return totalPoints >= MIN_POINTS && totalDistance >= MIN_DISTANCE
}

ctrl.addButton({ title: 'reset signature' }).on('click', () => {
  pop.dataset.signed = 'false'
  pop.dataset.signing = 'false'
  strokes.length = 0
  clearSignature()
  for (const button of document.querySelectorAll('[popover] button')) {
    button.removeAttribute('disabled')
  }
  gsap.set(animatedPath, { clearProps: 'all' })
  hold.setAttribute('aria-label', 'Hold to confirm')
  gsap.set('.toggle svg path:first-of-type', { clearProps: 'all' })
  gsap.set('.toggle svg path:last-of-type', { opacity: 0 })
  gsap.set('#morph', { morphSVG: '#pen' })
  hold.addEventListener('keydown', handleKeyReplay, { once: true })
  // Reset CSS animation flag
  cssAnimationActive = false
})