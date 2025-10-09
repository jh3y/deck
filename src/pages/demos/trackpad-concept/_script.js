import { Pane } from 'https://cdn.skypack.dev/tweakpane@4.0.4';
import { gsap } from 'https://cdn.skypack.dev/gsap@3.13.0';
import Draggable from 'https://cdn.skypack.dev/gsap@3.13.0/Draggable';
gsap.registerPlugin(Draggable);

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

// Import the TrackpadControl component from the prototype 12


const addHotspot = () => {
  // Generate a random UUID for the new hotspot
  const uuid = crypto.randomUUID();
  
  // Get references to the trackpad control elements
  const trackpadControl = document.querySelector('trackpad-control');
  const trackpadControls = trackpadControl.querySelector('.trackpad-controls');
  const trackpad = trackpadControl.querySelector('.trackpad');
  const featureImage = document.querySelector('.feature-image');
  
  // Create new inputs for the trackpad controls
  const xLabel = document.createElement('label');
  xLabel.setAttribute('for', `x-${uuid}`);
  xLabel.textContent = 'x(%)';
  
  const xInput = document.createElement('input');
  xInput.id = `x-${uuid}`;
  xInput.type = 'range';
  xInput.min = '0';
  xInput.max = '100';
  xInput.step = '1';
  xInput.value = '50'; // Default to center
  
  const yLabel = document.createElement('label');
  yLabel.setAttribute('for', `y-${uuid}`);
  yLabel.textContent = 'y(%)';
  
  const yInput = document.createElement('input');
  yInput.id = `y-${uuid}`;
  yInput.type = 'range';
  yInput.min = '0';
  yInput.max = '100';
  yInput.step = '1';
  yInput.value = '50'; // Default to center
  
  // Add inputs to trackpad controls
  trackpadControls.appendChild(xLabel);
  trackpadControls.appendChild(xInput);
  trackpadControls.appendChild(yLabel);
  trackpadControls.appendChild(yInput);
  
  // Create new trackpad marker
  const marker = document.createElement('div');
  marker.className = 'trackpad-marker';
  trackpad.appendChild(marker);
  
  // Create new button and popover for the feature image
  const button = document.createElement('button');
  button.setAttribute('aria-label', 'Open hotspot');
  button.setAttribute('popovertarget', `hotspotPopover-${uuid}`);
  button.setAttribute('popovertargetaction', 'toggle');
  // Set unique anchor name for this button
  button.style.anchorName = `--hotspot-${uuid}`;
  
  const popover = document.createElement('div');
  popover.setAttribute('popover', 'auto');
  popover.id = `hotspotPopover-${uuid}`;
  popover.className = 'hotspot';
  popover.textContent = 'New hotspot!';
  // Set position-anchor to reference this button's anchor
  popover.style.positionAnchor = `--hotspot-${uuid}`;
  
  // Add button and popover to feature image (before the img element)
  const img = featureImage.querySelector('img');
  featureImage.insertBefore(button, img);
  featureImage.insertBefore(popover, img);
  
  // Call refresh on the trackpad control
  trackpadControl.refresh();
}

const removeHotspot = () => {
  // Get references
  const trackpadControl = document.querySelector('trackpad-control');
  const trackpadControls = trackpadControl.querySelector('.trackpad-controls');
  const trackpad = trackpadControl.querySelector('.trackpad');
  const featureImage = document.querySelector('.feature-image');
  
  // Check how many input pairs we have
  const inputs = trackpadControls.querySelectorAll('input[type="range"]');
  const inputPairs = inputs.length / 2;
  
  // If only one pair left, don't remove
  if (inputPairs <= 1) {
    return;
  }
  
  // Remove the last pair of inputs and their labels
  const lastYInput = trackpadControls.lastElementChild;
  const lastYLabel = lastYInput.previousElementSibling;
  const lastXInput = lastYLabel.previousElementSibling;
  const lastXLabel = lastXInput.previousElementSibling;
  
  trackpadControls.removeChild(lastYInput);
  trackpadControls.removeChild(lastYLabel);
  trackpadControls.removeChild(lastXInput);
  trackpadControls.removeChild(lastXLabel);
  
  // Remove the last trackpad marker
  const markers = trackpad.querySelectorAll('.trackpad-marker');
  if (markers.length > 1) {
    trackpad.removeChild(markers[markers.length - 1]);
  }
  
  // Remove the last button and popover pair (excluding the img)
  const buttons = featureImage.querySelectorAll('button');
  const popovers = featureImage.querySelectorAll('[popover]');
  
  if (buttons.length > 0 && popovers.length > 0) {
    const lastButton = buttons[buttons.length - 1];
    const lastPopover = popovers[popovers.length - 1];
    
    featureImage.removeChild(lastButton);
    featureImage.removeChild(lastPopover);
  }
  
  // Call refresh on the trackpad control
  trackpadControl.refresh();
}

const config = {
  theme: 'system',
  usePointerLock: false,
  sensitivity: 0.5,
  reveal: false,
  aspectRatio: 1,
  trackpad: false,
};

const ctrl = new Pane({
  title: 'config',
});


ctrl.addBinding(config, 'trackpad') 
const trackpadFolder = ctrl.addFolder({ title: 'trackpad', hidden: !config.trackpad })
trackpadFolder.addBinding(config, 'reveal') 
trackpadFolder.addBinding(config, 'usePointerLock', {
  label: 'pointer lock',
})

const sensitivity = trackpadFolder.addBinding(config, 'sensitivity', {
  label: 'sensitivity',
  min: 0.1,
  max: 2.0,
  step: 0.1,
})
trackpadFolder.addBinding(config, 'aspectRatio', {
  label: 'aspect ratio',
  min: 0.5,
  max: 2.0,
  step: 0.1,
})
ctrl.addButton({ title: 'add hotspot'}).on('click', addHotspot)
ctrl.addButton({ title: 'remove hotspot'}).on('click', removeHotspot)
ctrl.addBinding(config, 'theme', {
  label: 'theme',
  options: {
    system: 'system',
    light: 'light',
    dark: 'dark'
  }
})


const update = () => {
  document.documentElement.dataset.theme = config.theme
  document.documentElement.dataset.reveal = config.reveal
  document.documentElement.dataset.trackpad = config.trackpad
  document.documentElement.style.setProperty('--aspect-ratio', config.aspectRatio)
  sensitivity.disabled = !config.usePointerLock
  trackpadFolder.hidden = !config.trackpad
  // Update trackpad control with config
  const trackpad = document.querySelector('trackpad-control');
  if (trackpad) {
    if (config.usePointerLock) {
      trackpad.setAttribute('use-pointer-lock', '');
      trackpad.setAttribute('sensitivity', config.sensitivity);
    } else {
      trackpad.removeAttribute('use-pointer-lock');
    }
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

ctrl.on('change', sync)

// tell styles if config is raw
const isRaw = new URLSearchParams(window.location.search).get('raw') === 'true';
if (isRaw) document.documentElement.dataset.raw = 'true'

// Draggable controls
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

// Call update initially to set correct states
update()

// X/Y Controller Logic - Using the TrackpadControl web component
const trackpadControl = document.querySelector('trackpad-control');

// Listen to trackpad changes to update the hotspot position
trackpadControl.addEventListener('trackpadchange', (event) => {
  // Get all trackpad markers and feature image buttons
  const markers = trackpadControl.querySelectorAll('.trackpad-marker');
  const buttons = document.querySelectorAll('.feature-image button');
  
  // Loop through event details and set CSS variables on each marker and button
  for (const [index, values] of Object.entries(event.detail)) {
    const idx = Number.parseInt(index);
    if (idx < markers.length) {
      const xPercent = values.x;
      const yPercent = values.y;
      
      // Set CSS variables on the trackpad marker
      markers[idx].style.setProperty('--marker-x', xPercent);
      markers[idx].style.setProperty('--marker-y', yPercent);
      
      // Set CSS variables on the corresponding button if it exists
      if (idx < buttons.length) {
        buttons[idx].style.setProperty('--marker-x', xPercent);
        buttons[idx].style.setProperty('--marker-y', yPercent);
      }
    }
  }
});

// Set initial values using setValue method
trackpadControl.setValue([50, 50]);

// Also set initial CSS variables for the first marker and button
const initialMarker = trackpadControl.querySelector('.trackpad-marker');
const initialButton = document.querySelector('.feature-image button');
if (initialMarker) {
  initialMarker.style.setProperty('--marker-x', 50);
  initialMarker.style.setProperty('--marker-y', 50);
}
if (initialButton) {
  initialButton.style.setProperty('--marker-x', 50);
  initialButton.style.setProperty('--marker-y', 50);
}
