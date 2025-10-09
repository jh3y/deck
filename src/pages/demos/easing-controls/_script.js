import gsap from 'gsap'
import Draggable from 'gsap/Draggable'
import CustomEase from 'gsap/CustomEase'
import { Pane } from 'tweakpane'
gsap.registerPlugin(Draggable, CustomEase)

// TrackpadControl Web Component
class TrackpadControl extends HTMLElement {
  constructor() {
    super();
    
    // Instance variables
    this.isTracking = false;
    this.activePoint = null;
    this.hoveredPoint = null;
    this.pointerLockActive = false;
    this.accumulatedPercent = { x: 0, y: 0 }; // Simplified: store percentages directly
    this.markers = [];
    this.controls = null;
    this.inputs = new Map();
    this.abortController = null;
  }
  
  connectedCallback() {
    this.setup();
  }
  
  disconnectedCallback() {
    this.removeEventListeners();
  }
  
  setup() {
    // Clear existing mappings
    this.inputs.clear();
    
    // Query for internal elements
    this.trackpadElement = this.querySelector('.trackpad');
    this.controls = this.querySelector('.trackpad-controls');
    this.markers = Array.from(this.querySelectorAll('.trackpad-marker'));
    
    // Map markers to their corresponding inputs
    for (const [index, marker] of this.markers.entries()) {
      const inputs = this.controls.querySelectorAll('input[type="range"]');
      if (this.markers.length === 1) {
        // Single marker uses all inputs
        this.inputs.set(index, {
          x: inputs[0],
          y: inputs[1]
        });
      } else {
        // Multiple markers - each gets a pair
        const startIdx = index * 2;
        this.inputs.set(index, {
          x: inputs[startIdx],
          y: inputs[startIdx + 1]
        });
      }
    }
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize marker positions from input values
    this.updateMarkerPositions();
  }
  
  // Public method to refresh/resync the component with DOM changes
  refresh() {
    // Remove existing event listeners to avoid duplicates
    this.removeEventListeners();
    
    // Reset tracking state
    this.isTracking = false;
    this.activePoint = null;
    this.hoveredPoint = null;
    this.pointerLockActive = false;
    
    // Re-run setup to pick up new elements
    this.setup();
  }
  
  // Public method to set values programmatically
  setValue(values) {
    // Handle single value or array of values
    const valueArray = Array.isArray(values[0]) ? values : [values];
    
    for (const [index, coords] of valueArray.entries()) {
      if (index < this.markers.length && coords.length >= 2) {
        const inputs = this.inputs.get(index);
        if (inputs) {
          inputs.x.value = Math.round(this.clampPercent(coords[0]));
          inputs.y.value = Math.round(this.clampPercent(coords[1]));
        }
      }
    }
    
    // Update visual state and dispatch event
    this.updateMarkerPositions();
  }
  
  setupEventListeners() {
    // Create new AbortController for this setup
    this.abortController = new AbortController();
    const { signal } = this.abortController;
    
    // Trackpad events
    this.trackpadElement?.addEventListener('pointermove', this.handleTrackpadHover, { signal });
    this.trackpadElement?.addEventListener('pointerleave', this.handlePointerLeave, { signal });
    this.trackpadElement?.addEventListener('pointerdown', this.handlePointerDown, { signal });
    
    // Input change events
    this.controls?.addEventListener('input', this.updateMarkerPositions, { signal });
    
    // Pointer lock events
    document.addEventListener('pointerlockchange', this.handlePointerLockChange, { signal });
    document.addEventListener('pointerlockerror', this.handlePointerLockError, { signal });
  }
  
  removeEventListeners() {
    // Abort all listeners at once
    this.abortController?.abort();
    
    // Clean up any temporary abort controllers
    this.tempAbortController?.abort();
  }
  
  updateMarkerPositions = () => {
    for (const [index, marker] of this.markers.entries()) {
      const { x: xPercent, y: yPercent } = this.getInputValues(index);
      marker.style.setProperty('--marker-x', xPercent);
      marker.style.setProperty('--marker-y', yPercent);
    }
    
    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('trackpadchange', {
      detail: this.getValues(),
      bubbles: true
    }));
  }
  
  getValues = () => {
    const values = {};
    for (const [index, inputs] of this.inputs.entries()) {
      values[index] = this.getInputValues(index);
    }
    return values;
  }
  
  // DRY helper methods
  getInputValues = (index) => {
    const inputs = this.inputs.get(index);
    if (!inputs) return { x: 0, y: 0 };
    
    return {
      x: Number.parseFloat(inputs.x.value) || 0,
      y: Number.parseFloat(inputs.y.value) || 0
    };
  }
  
  setMarkerState = (marker, state, value = true) => {
    if (!marker) return;
    
    if (value) {
      marker.dataset[state] = '';
    } else {
      delete marker.dataset[state];
    }
  }
  
  getPositionFromEvent = (event) => {
    if (!this.trackpadElement) return { xPercent: 0, yPercent: 0 };
    
    const rect = this.trackpadElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    return {
      xPercent: (x / rect.width) * 100,
      yPercent: (y / rect.height) * 100
    };
  }
  
  handleTrackpadHover = (event) => {
    if (this.isTracking || this.pointerLockActive) return;
    
    const { xPercent, yPercent } = this.getPositionFromEvent(event);
    const closestIndex = this.markers.length === 1 ? 0 : this.getClosestPoint(xPercent, yPercent);
    
    if (closestIndex !== this.hoveredPoint) {
      this.setMarkerState(this.markers[this.hoveredPoint], 'hover', false);
      this.hoveredPoint = closestIndex;
      this.setMarkerState(this.markers[this.hoveredPoint], 'hover', true);
    }
  }
  
  handlePointerLeave = () => {
    if (!this.isTracking) {
      // For single marker, always clear hover
      // For multiple markers, clear all hover states
      this.clearHoverStates();
    }
  }
  
  handlePointerDown = (event) => {
    if (!this.trackpadElement) return;
    
    // For single marker, no need to calculate closest point
    if (this.markers.length === 1) {
      this.activePoint = 0;
    } else {
      // Multiple markers - find closest
      const { xPercent, yPercent } = this.getPositionFromEvent(event);
      this.activePoint = this.getClosestPoint(xPercent, yPercent);
    }
    
    this.isTracking = true;
    
    // Clear hover states when starting to track
    this.clearHoverStates();
    
    // Set active state on marker
    this.setMarkerState(this.markers[this.activePoint], 'active');
    
    if (this.usePointerLock && !this.pointerLockActive) {
      // Initialize accumulated values as percentages
      const { x, y } = this.getInputValues(this.activePoint);
      this.accumulatedPercent = { x, y };
      
      this.trackpadElement.requestPointerLock();
    } else if (!this.usePointerLock) {
      // Create temporary controller for drag events
      this.tempAbortController = new AbortController();
      const { signal } = this.tempAbortController;
      
      document.addEventListener('pointermove', this.handlePointerMove, { signal });
      document.addEventListener('pointerup', this.handlePointerUp, { signal });
      document.addEventListener('pointercancel', this.handlePointerUp, { signal });
      
      this.updateFromTrackpad(event);
    }
  }
  
  handlePointerMove = (event) => {
    if (this.isTracking && this.activePoint !== null && !this.pointerLockActive) {
      this.updateFromTrackpad(event);
    }
  }
  
  handlePointerUp = () => {
    this.isTracking = false;
    this.activePoint = null;
    
    // Remove active state from all markers
    for (const marker of this.markers) {
      this.setMarkerState(marker, 'active', false);
    }
    
    // Abort temporary drag listeners
    this.tempAbortController?.abort();
  }
  
  handlePointerLockChange = () => {
    this.pointerLockActive = document.pointerLockElement === this.trackpadElement;
    
    // Update visual state
    if (this.trackpadElement) {
      this.trackpadElement.classList.toggle('pointer-lock-active', this.pointerLockActive);
    }
    
    if (this.pointerLockActive) {
      // Create temporary controller for pointer lock events
      this.tempAbortController = new AbortController();
      const { signal } = this.tempAbortController;
      
      document.addEventListener('pointermove', this.handlePointerLockMove, { signal });
      document.addEventListener('pointerup', this.handlePointerLockUp, { signal });
    } else {
      // Abort any active pointer lock listeners
      this.tempAbortController?.abort();
      this.isTracking = false;
      this.activePoint = null;
      
      // Remove active state from all markers
      for (const marker of this.markers) {
        this.setMarkerState(marker, 'active', false);
      }
    }
  }
  
  handlePointerLockError = () => {
    console.error('Pointer lock failed');
    this.pointerLockActive = false;
    this.isTracking = false;
    this.activePoint = null;
  }
  
  handlePointerLockMove = (event) => {
    if (!this.pointerLockActive || !this.isTracking || this.activePoint === null || !this.trackpadElement) return;
    
    const rect = this.trackpadElement.getBoundingClientRect();
    
    // Add movement as percentage deltas (simplified!)
    const deltaXPercent = (event.movementX * this.sensitivity / rect.width) * 100;
    const deltaYPercent = (event.movementY * this.sensitivity / rect.height) * 100;
    
    this.accumulatedPercent.x += deltaXPercent;
    this.accumulatedPercent.y += deltaYPercent;
    
    this.updateFromValues(this.accumulatedPercent.x, this.accumulatedPercent.y, this.activePoint);
  }
  
  handlePointerLockUp = () => {
    if (this.pointerLockActive && this.isTracking) {
      this.isTracking = false;
      document.exitPointerLock();
    }
  }
  
  updateFromTrackpad = (event) => {
    if (!this.trackpadElement) return;
    
    const { xPercent, yPercent } = this.getPositionFromEvent(event);
    this.updateFromValues(xPercent, yPercent, this.activePoint);
  }
  
  updateFromValues = (xPercent, yPercent, pointIndex) => {
    // Apply wrap-around if pointer lock is active
    let x = xPercent;
    let y = yPercent;
    if (this.usePointerLock && this.pointerLockActive) {
      x = this.wrapPercent(x);
      y = this.wrapPercent(y);
      // Update accumulated values with wrapped values for pointer lock
      this.accumulatedPercent.x = x;
      this.accumulatedPercent.y = y;
    } else {
      x = this.clampPercent(x);
      y = this.clampPercent(y);
    }
    
    // Update the appropriate inputs
    const inputs = this.inputs.get(pointIndex);
    if (inputs) {
      inputs.x.value = Math.round(x);
      inputs.y.value = Math.round(y);
      inputs.x.dispatchEvent(new Event('input', { bubbles: true }));
      inputs.y.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    this.updateMarkerPositions();
  }
  
  clearHoverStates = () => {
    for (const marker of this.markers) {
      this.setMarkerState(marker, 'hover', false);
    }
    this.hoveredPoint = null;
  }
  
  getClosestPoint = (xPercent, yPercent) => {
    // This should only be called when there are multiple markers
    let closestIndex = 0;
    // biome-ignore lint/style/useNumberNamespace: Number.Infinity breaks hotspot detection
    let closestDistance = Infinity;
    
    for (const [index, marker] of this.markers.entries()) {
      const { x: markerX, y: markerY } = this.getInputValues(index);
      const distance = this.getDistance(xPercent, yPercent, markerX, markerY);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    }
    
    return closestIndex;
  }
  
  // Utility methods
  clampPercent = (value) => {
    return Math.max(0, Math.min(100, value));
  }
  
  wrapPercent = (value) => {
    if (value < 0) return 100 + (value % 100);
    if (value > 100) return value % 100;
    return value;
  }
  
  getDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
  
  // Getters for attributes
  get usePointerLock() {
    return this.hasAttribute('use-pointer-lock');
  }
  
  get sensitivity() {
    return Number.parseFloat(this.getAttribute('sensitivity')) || 0.5;
  }
}

// Register the custom element
customElements.define('trackpad-control', TrackpadControl);

const config = {
  theme: 'light',
  start: 0,
  end: 50,
  images: true,
  steps: 2,
  colorOne: 'hsla(0,0%,0%,0.9)',
  colorTwo: 'hsla(0,0%,0%,0)',
  alphaEase: '',
  posEase: '',
}

const ctrl = new Pane({
  title: 'config',
  expanded: true,
})
// biome-ignore lint/style/useConst: These are assigned later after DOM setup
let updateSVGElements
// biome-ignore lint/style/useConst: These are assigned later after DOM setup
let getCubicBezierString
// biome-ignore lint/style/useConst: These are assigned later after DOM setup
let alphaHolder
// biome-ignore lint/style/useConst: These are assigned later after DOM setup
let posHolder
// biome-ignore lint/style/useConst: These are assigned later after DOM setup
let alphaTrackpad
// biome-ignore lint/style/useConst: These are assigned later after DOM setup
let posTrackpad
const updateStuff = (event) => {
  if (updateSVGElements) {
    updateSVGElements(alphaHolder);
    updateSVGElements(posHolder);
  }
  // update the easing gradient
  if (getCubicBezierString) {
    const alpha = getCubicBezierString(alphaHolder);
    config.alphaEase = alpha;
    const pos = getCubicBezierString(posHolder);
    config.posEase = pos;
    ctrl.refresh()
    document.documentElement.style.setProperty('--color-one', config.colorOne)
    document.documentElement.style.setProperty('--color-two', config.colorTwo)
    const easedGradient = easedHslGradient({
      from: config.colorOne,
      to: config.colorTwo,
      steps: config.steps,
      angle: 0,
      start: config.start,
      end: config.end,
      easing: {
        // pos: gsap.parseEase('power1.in'), // positions bias toward the end
        // pos: gsap.parseEase('sine.in'), // positions bias toward the end
        pos: gsap.parseEase(pos), // positions bias toward the end
        
        a: gsap.parseEase(alpha), // positions bias toward the end
        // a: gsap.parseEase('0.4,0,0.5,1'), // alpha rises slowly then accelerates
        // keep hue/sat/light linear (defaults), or set them too:
        // h: E.linear, s: E.linear, l: E.linear
        // l: gsap.parseEase('power1.out'),
      },
    })
    document.documentElement.style.setProperty(
      '--bg',
      easedGradient
    )
    document.documentElement.style.setProperty('--gradient-end', `${config.end}%`)
    document.documentElement.style.setProperty('--gradient-start', `${config.start}%`)
  }
}

const update = () => {
  document.documentElement.dataset.theme = config.theme
  document.documentElement.dataset.images = config.images
  updateStuff();
}

const sync = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== 'theme'
  )
    return update()
  document.startViewTransition(() => update())
}

document.querySelector('.tp-rotv_c').appendChild(document.querySelector('.implant--alpha'))
document.querySelector('.implant--alpha .bezier-control').removeAttribute('style')
document.querySelector('.tp-rotv_c').appendChild(document.querySelector('.implant--pos'))
document.querySelector('.implant--pos .bezier-control').removeAttribute('style')

ctrl.addBinding(config, 'theme', {
  label: 'theme',
  options: {
    system: 'system',
    light: 'light',
    dark: 'dark',
  },
})


ctrl.addBinding(config, 'colorOne', { color: {alpha: true }})
ctrl.addBinding(config, 'colorTwo', { color: {alpha: true }, view: 'color'})

ctrl.addBinding(config, 'start', {
  min: 0,
  max: 100,
  step: 1,
})

ctrl.addBinding(config, 'end', {
  min: 0,
  max: 100,
  step: 1,
})

ctrl.addBinding(config, 'steps', {
  min: 2,
  max: 30,
  step: 1,
})

ctrl.addBinding(config, 'images')
ctrl.addBinding(config, 'alphaEase', {
  disabled: true,
  label: 'alpha ease'
})
ctrl.addBinding(config, 'posEase', {
  disabled: true,
  label: 'stops ease'
})

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

// demo logic
// minimal easing
// Tiny easing helpers
const E = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  pow: (p) => (t) => t ** p, // e.g. E.pow(3) for stronger "in"
  rev: (f) => (t) => 1 - f(1 - t), // turn "in" into "out"
}

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x)

// Parse CSS4 HSL: "hsl(210 90% 50% / .5)" or "hsl(210 90% 50%)" or legacy "hsla(210, 90%, 50%, 0.5)"
function parseHsl(str) {
  const m = str.trim().match(/^hsla?\((.+)\)$/i)
  if (!m) throw new Error('Use hsl()/hsla()')
  const isHsla = str.trim().toLowerCase().startsWith('hsla')
  const body = m[1].replace(/,/g, ' ').replace(/\s+/g, ' ').trim()
  
  // Check if it contains a slash (modern syntax)
  if (body.includes('/')) {
    // Modern CSS4 syntax: hsl(h s% l% / a)
    const [left, aPart] = body.split('/').map((s) => s?.trim())
    const [hRaw, sRaw, lRaw] = left.split(' ')
    const h = Number.parseFloat(hRaw)
    const s = Number.parseFloat(sRaw)
    const l = Number.parseFloat(lRaw)
    let a = 1
    if (aPart != null)
      a = /%$/.test(aPart) ? Number.parseFloat(aPart) / 100 : Number.parseFloat(aPart)
    return { h, s, l, a: Number.isNaN(a) ? 1 : a }
  }
  // Legacy syntax: hsl(h, s%, l%) or hsla(h, s%, l%, a)
  const parts = body.split(' ')
  const h = Number.parseFloat(parts[0])
  const s = Number.parseFloat(parts[1])
  const l = Number.parseFloat(parts[2])
  let a = 1
  
  // If it's hsla() and has a 4th value, that's the alpha
  if (isHsla && parts[3] != null) {
    a = Number.parseFloat(parts[3])
    // If it's a percentage, convert to 0-1
    if (parts[3].includes('%')) {
      a = a / 100
    }
  }
  
  return { h, s, l, a: Number.isNaN(a) ? 1 : a }
}
const fmt = (n, d = 2) => +n.toFixed(d)

// shortest-path hue interpolation at parameter u
function lerpHsl(A, B, u) {
  const dh = ((B.h - A.h + 540) % 360) - 180
  return {
    h: A.h + dh * u,
    s: A.s + (B.s - A.s) * u,
    l: A.l + (B.l - A.l) * u,
    a: A.a + (B.a - A.a) * u,
  }
}

/**
 * Eased HSL gradient with separate easings
 * @param {string} from  - 'hsl(H S% L% / A)'
 * @param {string} to    - 'hsl(H S% L% / A)'
 * @param {number} steps - exact number of color stops to generate
 * @param {string|number} angle - 'to bottom' or 0..360
 * @param {number} start,end - start/end positions in %
 * @param {object} easing - { pos, h, s, l, a } each a function(t) in [0,1]
 */
function easedHslGradient({
  from,
  to,
  steps = 12,
  angle = 'to bottom',
  start = 0,
  end = 100,
  easing = {},
}) {
  const A = parseHsl(from)
  const B = parseHsl(to)
  const easePos = easing.pos || E.inOutCubic
  const easeH = easing.h || E.linear
  const easeS = easing.s || E.linear
  const easeL = easing.l || E.linear
  const easeA = easing.a || E.linear

  const dir = typeof angle === 'number' ? `${angle}deg` : angle
  const stops = []

  for (let i = 0; i < steps; i++) {
    const t = steps === 1 ? 0 : i / (steps - 1) // master 0..1
    const tp = clamp01(easePos(t)) // eased position
    // independently eased channels
    const uH = clamp01(easeH(t))
    const uS = clamp01(easeS(t))
    const uL = clamp01(easeL(t))
    const uA = clamp01(easeA(t))

    // mix channels with their own u's
    const { h } = lerpHsl(A, B, uH)
    const { s } = lerpHsl(A, B, uS)
    const { l } = lerpHsl(A, B, uL)
    const { a } = lerpHsl(A, B, uA)

    const pos = (start + (end - start) * tp).toFixed(2)
    const color =
      a >= 1
        ? `hsl(${fmt(h)} ${fmt(s)}% ${fmt(l)}%)`
        : `hsl(${fmt(h)} ${fmt(s)}% ${fmt(l)}% / ${+a.toFixed(5)})`

    stops.push(`${color} ${pos}%`)
  }
  return `linear-gradient(${dir}, ${stops.join(', ')})`
}
// document.documentElement.style.setProperty('--color-one', 'hsl(0 0% 0% / 0.7)')
// document.documentElement.style.setProperty('--color-two', 'hsl(0 0% 0% / 0)')
document.querySelector('.tp-rotv_c').appendChild(document.querySelector('.implant--alpha'))
document.querySelector('.implant--alpha .bezier-control').removeAttribute('style')
document.querySelector('.tp-rotv_c').appendChild(document.querySelector('.implant--pos'))
document.querySelector('.implant--pos .bezier-control').removeAttribute('style')
alphaHolder = document.querySelector('.implant--alpha')
posHolder = document.querySelector('.implant--pos')
alphaTrackpad = alphaHolder.querySelector('trackpad-control')
posTrackpad = posHolder.querySelector('trackpad-control')
updateSVGElements = (holder) => {
  const inputs = holder.querySelectorAll('input');
  const x1 = Number.parseFloat(inputs[0].value);
  const y1 = Number.parseFloat(inputs[1].value);
  const x2 = Number.parseFloat(inputs[2].value);
  const y2 = Number.parseFloat(inputs[3].value);
  
  const controlLines = holder.querySelectorAll('.control-line');
  const bezierCurve = holder.querySelector('.bezier-curve');
  
  // Update control lines
  controlLines[0].setAttribute('x1', '0');
  controlLines[0].setAttribute('y1', '100');
  controlLines[0].setAttribute('x2', x1.toString());
  controlLines[0].setAttribute('y2', y1.toString());
  
  controlLines[1].setAttribute('x1', '100');
  controlLines[1].setAttribute('y1', '0');
  controlLines[1].setAttribute('x2', x2.toString());
  controlLines[1].setAttribute('y2', y2.toString());
  
  // Update bezier curve path
  const path = `M 0,100 C ${x1},${y1} ${x2},${y2} 100,0`;
  bezierCurve.setAttribute('d', path);
};

const percentToFraction = (percent) => percent / 100;

getCubicBezierString = (holder) => {
  const inputs = holder.querySelectorAll('input');
  const x1 = percentToFraction(Number.parseFloat(inputs[0].value));
  const y1 = 1 - percentToFraction(Number.parseFloat(inputs[1].value)); // Invert Y
  const x2 = percentToFraction(Number.parseFloat(inputs[2].value));
  const y2 = 1 - percentToFraction(Number.parseFloat(inputs[3].value)); // Invert Y
  
  return `${x1.toFixed(2)},${y1.toFixed(2)},${x2.toFixed(2)},${y2.toFixed(2)}`;
};

alphaTrackpad.addEventListener('trackpadchange', updateStuff);
updateSVGElements(alphaHolder);
posTrackpad.addEventListener('trackpadchange', updateStuff);
updateSVGElements(posHolder);
updateStuff();