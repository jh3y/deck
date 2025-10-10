import gsap from 'gsap'
import Draggable from 'gsap/Draggable'
import ScrollTrigger from 'gsap/ScrollTrigger'
import InertiaPlugin from 'gsap/InertiaPlugin'
import { Pane } from 'tweakpane'
gsap.registerPlugin(Draggable, InertiaPlugin, ScrollTrigger)

const config = {
  reveal: false,
  theme: 'dark',
}

const ctrl = new Pane({
  title: 'config',
  expanded: true,
})

const update = () => {
  document.documentElement.dataset.theme = config.theme
  document.documentElement.dataset.reveal = config.reveal
}

const sync = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== 'theme'
  )
    return update()
  document.startViewTransition(() => update())
}



const datepicker = Object.assign(document.createElement('div'), {
  className: 'tp-lblv tp-v-fst tp-v-vfst',
  style: 'margin-bottom: 4px;',
  innerHTML: `
    <div class="tp-lblv_l">time</div>
    <div class="tp-lblv_v">
      <div class="tp-lstv">
        <input type="time" class="datepicker"/>
      </div>
    </div>
  `,
})
const panel = document.querySelector('.tp-rotv_c')
// panel.firstElementChild.classList.remove('tp-v-fst')
ctrl.addBinding(config, 'reveal')
ctrl.addBinding(config, 'theme', {
  label: 'theme',
  options: {
    system: 'system',
    light: 'light',
    dark: 'dark',
  },
})
panel.insertBefore(datepicker, panel.firstElementChild)


ctrl.on('change', sync)
update()

// make tweakpane panel draggable
const tweakClass = 'div.tp-dfwv'
const d = Draggable.create(tweakClass, {
  type: 'x,y',
  allowEventDefault: true,
  trigger: `${tweakClass} button.tp-rotv_b`,
})
document.querySelector(tweakClass).addEventListener('dblclick', () => {
  gsap.to(tweakClass, {
    x: `+=${d[0].x * -1}`,
    y: `+=${d[0].y * -1}`,
    onComplete: () => {
      gsap.set(tweakClass, { clearProps: 'all' })
    },
  })
})

const controls = document.querySelector('.controls')
const hours = controls.querySelector('.control--hours')
const minutes = controls.querySelector('.control--minutes')
const meridiem = document.querySelector('.control--meridiem')

// TODO:: I think once you mess with the override, adjust the hoursIndex by 12
// the meridien state bumps the scroll/rotation index return by 12 so it doesn't break things

const AMOUNT = 60
const buildMarkup = () => {
  hours.style.setProperty('--total', AMOUNT)
  minutes.style.setProperty('--total', AMOUNT)
  meridiem.style.setProperty('--total', AMOUNT)
  // the controller NEEDS +1 to do infinite rotation well
  hours.innerHTML = `
    <ul class="controller controller--hours">${new Array(AMOUNT + 1)
      .fill()
      .map((_, i) => `<li>${i % 12 || 12}</li>`)
      .join('')}</ul>
    <div class="wheel wheel--hours">
      ${new Array(AMOUNT)
        .fill()
        .map(
          (_, i) =>
            `<div style="--index: ${i};">${(i % 12 || 12)
              .toString()
              .padStart(2, '0')}</div>`
        )
        .join('')}
    </div>
    <div class="track-holder">
      <div class="track track--hours">
        ${new Array(AMOUNT + 1)
          .fill()
          .map((_, i) => (i % 12 || 12).toString().padStart(2, '0'))
          .join(' ')
          .trim()}
      </div>
    </div>
    `.trim()
  minutes.innerHTML = `
    <ul class="controller controller--minutes">${new Array(AMOUNT + 1)
      .fill()
      .map((_, i) => `<li>${i === AMOUNT ? 0 : i}</li>`)
      .join('')}</ul>
    <div class="wheel wheel--minutes">
      ${new Array(AMOUNT)
        .fill()
        .map(
          (_, i) =>
            `<div style="--index: ${i};">${
              i === AMOUNT ? '00' : i.toString().padStart(2, '0')
            }</div>`
        )
        .join('')}
    </div>
    <div class="track-holder">
      <div class="track track--minutes">
        ${new Array(AMOUNT + 1)
          .fill()
          .map((_, i) => (i === AMOUNT ? '00' : i.toString().padStart(2, '0')))
          .join(' ')
          .trim()}
      </div>
    </div>
    `.trim()
  meridiem.innerHTML = `
    <ul class="controller controller--meridiem">${new Array(2)
      .fill()
      .map((_, i) => `<li>${i === 0 ? 'AM' : 'PM'}</li>`)
      .join('')}</ul>
    <div class="wheel wheel--meridiem">
      ${new Array(2)
        .fill()
        .map(
          (_, i) => `<div style="--index: ${i};">${i === 0 ? 'AM' : 'PM'}</div>`
        )
        .join('')}
    </div>
    <div class="track-holder">
      <div class="track track--meridiem">
        AM PM
      </div>
    </div>
    `.trim()
}

buildMarkup()

/*** =======================
 * constants & tiny utils
 * ======================= */
const TOTAL = 60
const DEG_STEP = 360 / TOTAL
const BUFFER = 2
const FRAMES = 20

const pad2 = (n) => String(n).padStart(2, '0')
const mod = (n, m) => ((n % m) + m) % m
const mod60 = (n) => mod(n, TOTAL)
const snapRotation = (deg) => Math.round(deg / DEG_STEP) * DEG_STEP

const indexFromRotation = (deg) => {
  const raw =
    deg < 0 ? Math.abs((deg % 360) / DEG_STEP) : TOTAL - (deg % 360) / DEG_STEP
  return Math.round(raw) % TOTAL
}

const getScrollIndex = (el, straight = false) => {
  const h = el.offsetHeight
  if (!h) return 0
  const raw = el.scrollTop / h
  let idx = Math.round(raw)
  if (Math.abs(raw - Math.round(raw)) < 1e-6) idx = Math.round(raw)
  if (straight) return idx
  const count = Math.round(el.scrollHeight / h)
  if (idx < 0 || idx > count - 2) idx = 0
  return idx
}

const maintainInfiniteLoop = (el) => {
  if (el.offsetHeight + el.scrollTop > el.scrollHeight - BUFFER)
    el.scrollTop = BUFFER
  if (el.scrollTop < BUFFER) el.scrollTop = el.scrollHeight - BUFFER
}

const setProxyRotationFromIndex = (proxy, idx) =>
  gsap.set(proxy, { rotation: (TOTAL - idx) * DEG_STEP })

const clearWheelPropsIfCSS = (selectors) =>
  CSS.supports('animation-timeline: scroll()') &&
  gsap.set(selectors, { clearProps: 'all' }) &&
  gsap.set('.track', { clearProps: 'all' })

/*** =======================
 * dom refs & basic state
 * ======================= */
const AM = document.querySelector('#am')
const PM = document.querySelector('#pm')
const timeInput = panel.querySelector('[type="time"]')
const controllerHours = document.querySelector('.controller--hours')
const controllerMinutes = document.querySelector('.controller--minutes')
const controllerMeridiem = document.querySelector('.controller--meridiem')

const PROXY_HOURS = document.createElement('div')
const PROXY_MINUTES = document.createElement('div')
const PROXY_MERIDIEM = document.createElement('div')

let meridiemGuard = false
let meridiemStart
let passiveTrigger = false
let programmaticClear
let meridiemOverride = false // single spelling everywhere

const now = new Date()
now.setMinutes(now.getMinutes() + 5)
const currentHours = now.getHours()
const currentMinutes = now.getMinutes()
let isPMState = currentHours >= 12

/*** =======================
 * meridiem helpers + sync
 * ======================= */
const setMeridiem = (isPM) => {
  // update state first
  isPMState = !!isPM
  // reflect to UI (but UI is NOT the source of truth)
  // PM.checked = isPMState
  // AM.checked = !isPMState
}

// const isPM = () => isPMState

function toggleMeridiem(drive) {
  setMeridiem(!isPMState)
  if (drive) {
    passiveTrigger = true
    controllerMeridiem.scrollTo({
      top: isPMState ? controllerMeridiem.scrollHeight : 0,
      behavior: 'smooth',
    })
  }
}

const hour24FromIndex = (i) => {
  const h12 = i % 12 || 12
  return isPMState ? (h12 === 12 ? 12 : h12 + 12) : h12 === 12 ? 0 : h12
}

const updateTimeInput = (hIdx, mIdx) => {
  timeInput.value = `${pad2(hour24FromIndex(hIdx))}:${pad2(mIdx)}`
}

// boundary flip state (with override phase baked in)
let prevWrapped = null // 0..59
let prevUnwrapped = null // continuous index
let lastOverride = false

function syncMeridiem(index0to59) {
  const i = mod60(index0to59 + (meridiemOverride ? 12 : 0)) // phase shift during override

  if (prevWrapped === null) {
    prevWrapped = i
    prevUnwrapped = i
    lastOverride = !!meridiemOverride
    return
  }

  if (lastOverride !== !!meridiemOverride) {
    // keep continuity when override toggles
    const shift = meridiemOverride ? +12 : -12
    prevWrapped = mod60(prevWrapped + shift)
    prevUnwrapped += shift
    lastOverride = !!meridiemOverride
  }

  let delta = i - prevWrapped // shortest path on ring
  if (delta > 30) delta -= 60
  else if (delta < -30) delta += 60
  if (delta === 0) return

  const before = Math.floor(prevUnwrapped / 12)
  const after = Math.floor((prevUnwrapped + delta) / 12)
  if (Math.abs(after - before) & 1) toggleMeridiem(true) // flip parity

  prevWrapped = i
  prevUnwrapped += delta
}

/*** =======================
 * factories
 * ======================= */
function createScrollWatcher(
  target,
  { frames = FRAMES, axis = 'vertical', onStart, onFrame, onStop } = {}
) {
  let last = null
  let repeats = 0
  let raf = null

  const getScrollPosition =
    target === window
      ? () => {
          if (axis === 'both') {
            return {
              x: document.scrollingElement?.scrollLeft ??
                document.documentElement.scrollLeft ??
                window.pageXOffset ??
                0,
              y: document.scrollingElement?.scrollTop ??
                document.documentElement.scrollTop ??
                window.pageYOffset ??
                0
            }
          }
          const prop = axis === 'horizontal' ? 'scrollLeft' : 'scrollTop'
          const fallback = axis === 'horizontal' ? 'pageXOffset' : 'pageYOffset'
          return document.scrollingElement?.[prop] ??
            document.documentElement[prop] ??
            window[fallback] ??
            0
        }
      : () => {
          if (axis === 'both') {
            return { x: target.scrollLeft, y: target.scrollTop }
          }
          return target[axis === 'horizontal' ? 'scrollLeft' : 'scrollTop']
        }

  const addOnce = () =>
    target.addEventListener('scroll', kick, { once: true, passive: false })

  const frame = () => {
    const position = getScrollPosition()
    onFrame?.(position)
    
    // For 'both' axis, check if either x or y changed
    const hasChanged = axis === 'both' 
      ? (position.x !== last?.x || position.y !== last?.y)
      : position !== last
    
    repeats = hasChanged ? 1 : repeats + 1
    last = position

    if (repeats >= frames) {
      onStop?.()
      cancelAnimationFrame(raf)
      raf = null
      last = null
      repeats = 0
      addOnce()
      return
    }
    raf = requestAnimationFrame(frame)
  }

  const kick = () => {
    onStart?.()
    if (raf) return
    last = getScrollPosition()
    repeats = 1
    raf = requestAnimationFrame(frame)
  }

  addOnce()
  return {
    destroy() {
      if (raf) cancelAnimationFrame(raf)
      target.removeEventListener('scroll', kick)
    },
    isRunning() {
      return !!raf
    },
  }
}

function createWheel({
  key,
  proxyEl,
  trigger,
  wheelSel,
  track,
  controller,
  bounds,
  onStart, // optional, expects Draggable `this` context
  onComplete, // (idx, rotation) => void
}) {
  Draggable.create(proxyEl, {
    type: 'rotation',
    trigger,
    inertia: true,
    ...(bounds ? { bounds } : {}),
    onDragStart: function () {
      // bind Draggable context so `this.rotation` works in user callback
      onStart?.call(this)
    },
    onDrag: function () {
      gsap.set(wheelSel, { rotateX: this.rotation * -1 })
      // complete hack to be refactored

      const trackBounds = track.getBoundingClientRect()
      if (!bounds) {
        const r =
          this.rotation < 0
            ? 360 - Math.abs(this.rotation % 360)
            : this.rotation
        gsap.set(track, {
          y: (1 - (r % 360) / 360) * -(trackBounds.height - 34),
        })
      } else {
        gsap.set(track, {
          y: gsap.utils.mapRange(
            0,
            -6,
            0,
            -(trackBounds.height - 34)
          )(this.rotation),
        })
      }

      const h = getScrollIndex(controllerHours)
      const m = getScrollIndex(controllerMinutes)
      // During hours drag, sync meridiem based on rotation, not scroll
      if (key === 'hours') {
        syncMeridiem(indexFromRotation(this.rotation))
        updateTimeInput(indexFromRotation(this.rotation), m)
      } else if (key === 'minutes') {
        syncMeridiem(h)
        updateTimeInput(h, indexFromRotation(this.rotation))
      } else {
        syncMeridiem(h)
        updateTimeInput(h, m)
      }
    },
    onThrowUpdate: function () {
      gsap.set(wheelSel, { rotateX: this.rotation * -1 })
      const trackBounds = track.getBoundingClientRect()
      if (!bounds) {
        const r =
          this.rotation < 0
            ? 360 - Math.abs(this.rotation % 360)
            : this.rotation
        gsap.set(track, {
          y: (1 - (r % 360) / 360) * -(trackBounds.height - 34),
        })
      } else {
        gsap.set(track, {
          y: gsap.utils.mapRange(
            0,
            -6,
            0,
            -(trackBounds.height - 34)
          )(this.rotation),
        })
      }

      const h = getScrollIndex(controllerHours)
      const m = getScrollIndex(controllerMinutes)
      // During hours throw, sync meridiem based on rotation, not scroll
      if (key === 'hours') {
        syncMeridiem(indexFromRotation(this.rotation))
        updateTimeInput(indexFromRotation(this.rotation), m)
      } else if (key === 'minutes') {
        syncMeridiem(h)
        updateTimeInput(h, indexFromRotation(this.rotation))
      } else {
        syncMeridiem(h)
        updateTimeInput(h, m)
      }
    },
    snap: snapRotation,
    onThrowComplete: function () {
      const idx = indexFromRotation(this.rotation)
      onComplete?.(idx, this.rotation) // also pass rotation if you want it
    },
  })
}

function setupScrollTriggers(defs) {
  if (CSS.supports('animation-timeline: scroll()')) return
  for (const { scroller, selector, factor, track } of defs) {
    ScrollTrigger.create({
      scroller,
      onUpdate: (self) => {
        const trackBounds = track.getBoundingClientRect()
        gsap.set(selector, { rotateX: self.progress * factor })
        gsap.set(track, {
          y: 1 - self.progress * (trackBounds.height - 34),
        })
      },
    })
  }
}

/*** =======================
 * wheels config (single source)
 * ======================= */
const WHEELS = [
  {
    key: 'hours',
    control: hours,
    controller: controllerHours,
    wheelSel: '.wheel--hours',
    track: hours.querySelector('.track--hours'),
    trigger: '.control--hours',
    proxy: PROXY_HOURS,
    scrollStart: () => { meridiemGuard = true },
    scrollFrame: (controller) => {
      const h = getScrollIndex(controllerHours)
      const m = getScrollIndex(controllerMinutes)
      syncMeridiem(h)
      updateTimeInput(h, m)
      maintainInfiniteLoop(controller)
    },
    scrollStop: () => {
      setProxyRotationFromIndex(PROXY_HOURS, getScrollIndex(controllerHours))
      meridiemGuard = false
    },
    dragStart: () => {
      meridiemGuard = true
      controllerHours.dataset.noSnap = true
    },
    dragComplete: (idx) => {
      const lis = controllerHours.querySelectorAll('li')
      const off = meridiemOverride ? idx - 12 : idx
      const target = lis[mod60(off)]
      target?.scrollIntoView()
      clearWheelPropsIfCSS(['.wheel--hours'])
      delete controllerHours.dataset.noSnap
      meridiemGuard = false
    },
    triggerFactor: 360,
  },
  {
    key: 'minutes',
    control: minutes,
    controller: controllerMinutes,
    track: minutes.querySelector('.track--minutes'),
    wheelSel: '.wheel--minutes',
    trigger: '.control--minutes',
    proxy: PROXY_MINUTES,
    scrollFrame: (controller) => {
      const h = getScrollIndex(controllerHours)
      const m = getScrollIndex(controllerMinutes)
      syncMeridiem(h)
      updateTimeInput(h, m)
      maintainInfiniteLoop(controller)
    },
    scrollStop: () => {
      setProxyRotationFromIndex(
        PROXY_MINUTES,
        getScrollIndex(controllerMinutes)
      )
    },
    dragStart: () => {
      controllerMinutes.dataset.noSnap = true
    },
    dragComplete: (idx) => {
      const lis = controllerMinutes.querySelectorAll('li')
      const target = lis[idx]
      target?.scrollIntoView()
      clearWheelPropsIfCSS(['.wheel--minutes'])
      delete controllerMinutes.dataset.noSnap
    },
    triggerFactor: 360,
  },
  {
    key: 'meridiem',
    control: meridiem,
    controller: controllerMeridiem,
    wheelSel: '.wheel--meridiem',
    track: meridiem.querySelector('.track--meridiem'),
    trigger: '.control--meridiem', // keep DOM spelling
    proxy: PROXY_MERIDIEM,
    bounds: { minRotation: 0, maxRotation: -DEG_STEP },
    scrollStart: () => {
      meridiemStart = getScrollIndex(controllerMeridiem, true)
    },
    scrollFrame: () => {
      // Don't sync during passive/programmatic scrolls to avoid conflicts
      if (!passiveTrigger) {
        syncMeridiem(getScrollIndex(controllerHours))
      }
    },
    scrollStop: () => {
      const idx = getScrollIndex(controllerMeridiem, true)
      gsap.set(PROXY_MERIDIEM, { rotation: idx === 0 ? 0 : -DEG_STEP })

      // Handle passive/programmatic updates first (these should always work)
      if (passiveTrigger) {
        clearTimeout(programmaticClear)
        programmaticClear = setTimeout(() => { passiveTrigger = false }, 500)
      } 
      // Only check guard for manual user interactions
      else if (idx !== meridiemStart && !meridiemGuard) {
        toggleMeridiem()
        meridiemOverride = !meridiemOverride
        const h = getScrollIndex(controllerHours)
        const m = getScrollIndex(controllerMinutes)
        updateTimeInput(h, m)
        meridiemStart = undefined
      }
    },
    dragStart: function () {
      meridiemStart = indexFromRotation(this.rotation)
      controllerMeridiem.dataset.noSnap = true
    },
    dragComplete: (idx) => {
      const lis = controllerMeridiem.querySelectorAll('li')
      const target = lis[idx === TOTAL ? 0 : idx]
      target?.scrollIntoView()
      clearWheelPropsIfCSS(['.wheel--meridiem'])
      delete controllerMeridiem.dataset.noSnap

      if (idx !== meridiemStart) {
        toggleMeridiem()
        meridiemOverride = !meridiemOverride
        const h = getScrollIndex(controllerHours)
        const m = getScrollIndex(controllerMinutes)
        updateTimeInput(h, m)
      }
      meridiemStart = undefined
    },
    triggerFactor: 360 / 60,
  },
]

/*** =======================
 * initial positions + meridiem
 * ======================= */
controllerHours.scrollTo(0, (controllerHours.scrollHeight / 61) * currentHours)
controllerMinutes.scrollTo(
  0,
  (controllerMinutes.scrollHeight / 61) * Math.min(59, currentMinutes)
)
controllerMeridiem.scrollTo(0, isPMState ? controllerMeridiem.scrollHeight : 0)
setMeridiem(isPMState)

timeInput.value = `${pad2(currentHours)}:${pad2(currentMinutes)}`

/*** =======================
 * wire scroll watchers (loop)
 * ======================= */
for (const { controller, scrollStart, scrollFrame, scrollStop } of WHEELS) {
  createScrollWatcher(controller, {
    onStart: scrollStart,
    onFrame: () => scrollFrame?.(controller),
    onStop: scrollStop,
  })
}

/*** =======================
 * wire draggables (loop)
 * ======================= */
for (const {
    proxy,
    trigger,
    wheelSel,
    controller,
    bounds,
    dragStart,
    dragComplete,
    track,
    key,
  } of WHEELS) {
    createWheel({
      key,
      proxyEl: proxy,
      trigger,
      wheelSel,
      controller,
      bounds,
      track,
      onStart: dragStart,
      onComplete: dragComplete,
    })
  }

/*** =======================
 * ScrollTrigger fallback (loop)
 * ======================= */
setupScrollTriggers(
  WHEELS.map(({ controller, wheelSel, triggerFactor, track }) => ({
    scroller: controller,
    selector: wheelSel,
    factor: triggerFactor,
    track,
  }))
)

/*** =======================
 * time input -> scroll wheels
 * ======================= */
timeInput.addEventListener('input', () => {
  const [hours, minutes] = timeInput.value
    .split(':')
    .map((v) => Number.parseInt(v, 10))
  controllerHours.scrollTo({
    top: (controllerHours.scrollHeight / 61) * hours,
    behavior: 'smooth',
  })
  controllerMinutes.scrollTo({
    top: (controllerMinutes.scrollHeight / 61) * minutes,
    behavior: 'smooth',
  })
})

/*** =======================
 * meridiem form toggles override phase
 * ======================= */
// document.querySelector(".meridien-form")?.addEventListener(
//   "change",
//   () => { meridiemOverride = !meridiemOverride; },
//   true
// );
