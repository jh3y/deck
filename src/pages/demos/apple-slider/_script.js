import { Pane } from 'tweakpane';
import { gsap } from 'gsap';
import Draggable from 'gsap/Draggable';
gsap.registerPlugin(Draggable);

const config = {
  theme: 'dark',
  gap: 2,
  radius: 2,
  aspect: 0.3,
  full: false,
  width: 42,
  below: false,
  offset: 6,
  scale: 1,
  motion: false,
};

const ctrl = new Pane({
  title: 'config',
});

ctrl.addBinding(config, 'aspect', {
  min: 0.1,
  max: 2,
  step: 0.01,
})
ctrl.addBinding(config, 'full')
ctrl.addBinding(config, 'below')
ctrl.addBinding(config, 'width', {
  min: 10,
  max: 100,
  step: 1,
})
ctrl.addBinding(config, 'gap', {
  min: 0,
  max: 10,
  step: 1,
})
ctrl.addBinding(config, 'radius', {
  min: 0,
  max: 10,
  step: 1,
})
ctrl.addBinding(config, 'motion')

const offset =ctrl.addBinding(config, 'offset', {
  min: 0,
  max: 12,
  step: 0.5,
  hidden: !config.motion
})
const scale = ctrl.addBinding(config, 'scale', {
  min: 0,
  max: 1,
  step: 0.1,
  hidden: !config.motion
})
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
  document.documentElement.dataset.below = config.below
  document.documentElement.dataset.full = config.full
  document.documentElement.dataset.motion = config.motion
  document.documentElement.style.setProperty('--gap', config.gap)
  document.documentElement.style.setProperty('--radius', config.radius)
  document.documentElement.style.setProperty('--aspect', config.aspect)
  document.documentElement.style.setProperty('--width', config.width)
  document.documentElement.style.setProperty('--offset', config.offset)
  document.documentElement.style.setProperty('--scale', config.scale)
  offset.hidden = scale.hidden= !config.motion
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
update()

// DraggableScroll Web Component
class DraggableScroll extends HTMLElement {
  static get observedAttributes() {
    return ['drag-threshold'];
  }
  
  constructor() {
    super();
    
    // Drag state
    this.dragState = null;
    this.animationId = null;
    this.dragController = null;
    
    // Configuration
    this.dragThreshold = 5; // pixels
  }
  
  get isDragging() {
    return this.dragState !== null && this.dragState.isDragging;
  }
  
  connectedCallback() {
    // Only enable on desktop
    if (!window.matchMedia('(pointer: fine)').matches) return;
    
    this.scrollContainer = this.querySelector('ul, ol, [data-scrollable]') || this.firstElementChild;
    if (!this.scrollContainer) return;
    
    this.slides = this.scrollContainer.querySelectorAll('li, [data-slide]');
    
    // Get configuration from attributes
    const threshold = this.getAttribute('drag-threshold');
    if (threshold) {
      this.dragThreshold = parseInt(threshold, 10);
    }
    
    // Store original scroll-snap-type
    const computedStyle = window.getComputedStyle(this.scrollContainer);
    this.originalSnapType = computedStyle.scrollSnapType || 'x mandatory';

    this.scrollWatcher = createScrollWatcher(this.scrollContainer, {
      frames: 10,
      axis: 'horizontal',
      onStop: () => {
        if (this.snapping) {
          this.scrollContainer.style.scrollSnapType = this.originalSnapType;
          this.scrollContainer.dataset.dragging = true;
          this.snapping = false;
        }
      },
    });
    
    // Only add mousedown listener initially
    this.scrollContainer.addEventListener('mousedown', this.handleStart);
  }
  
  disconnectedCallback() {
    // Cleanup
    if (this.scrollContainer) {
      this.scrollContainer.removeEventListener('mousedown', this.handleStart);
    }
    
    // Remove any active drag listeners
    this.removeDragListeners();
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'drag-threshold' && newValue) {
      this.dragThreshold = parseInt(newValue, 10);
    }
  }
  
  addDragListeners = () => {
    this.dragController = new AbortController();
    const signal = this.dragController.signal;
    
    window.addEventListener('mousemove', this.handleMove, { signal });
    window.addEventListener('mouseup', this.handleEnd, { signal });
    this.scrollContainer.addEventListener('mouseleave', this.handleMouseLeave, { signal });
  }
  
  removeDragListeners = () => {
    if (this.dragController) {
      this.dragController.abort();
      this.dragController = null;
    }
  }
  
  handleStart = (e) => {
    // Only handle mouse events
    if (!e.type.includes('mouse')) return;
    
    // Cancel any ongoing inertia animation
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Read scroll position
    const currentScrollLeft = this.scrollContainer.scrollLeft;
    
    // Create potential drag state
    this.dragState = {
      startX: e.clientX,
      lastX: e.clientX,
      lastTime: Date.now(),
      scrollLeft: currentScrollLeft,
      velocity: 0,
      isDragging: false // Not dragging until threshold is met
    };
    
    // Add drag listeners
    this.addDragListeners();
    
    e.preventDefault();
    e.stopPropagation();
  }
  
  handleMove = (e) => {
    if (!this.dragState || !e.type.includes('mouse')) return;
    
    e.preventDefault();
    const clientX = e.clientX;
    const deltaX = clientX - this.dragState.startX;
    
    // Check if we've exceeded the drag threshold
    if (!this.dragState.isDragging) {
      if (Math.abs(deltaX) < this.dragThreshold) {
        return; // Haven't moved enough to start dragging
      }
      
      // Start actual dragging
      this.dragState.isDragging = true;
      this.scrollContainer.dataset.dragging = true;
      this.scrollContainer.style.scrollSnapType = 'none';
    }
    
    const currentTime = Date.now();
    const deltaTime = currentTime - this.dragState.lastTime;
    
    // Calculate velocity with smoothing
    if (deltaTime > 0 && deltaTime < 100) {
      const instantVelocity = (clientX - this.dragState.lastX) / deltaTime;
      this.dragState.velocity = this.dragState.velocity * 0.7 + instantVelocity * 0.3;
    }
    
    // Apply scroll
    this.scrollContainer.scrollLeft = this.dragState.scrollLeft - deltaX;
    
    this.dragState.lastX = clientX;
    this.dragState.lastTime = currentTime;
  }
  
  handleEnd = (e) => {
    if (!this.dragState || (e && !e.type.includes('mouse'))) return;
    
    // Remove drag listeners
    this.removeDragListeners();
    // If we never started dragging (didn't exceed threshold), just clean up
    if (!this.dragState.isDragging) {
      this.dragState = null;
      return; 
    }
    
    // Get final velocity from drag state
    const velocity = this.dragState.velocity;
    
    // Clear drag state
    this.dragState = null;
    
    // Physics constants - tuned for smooth, natural motion
    const friction = 0.95; // Higher friction for quicker deceleration
    const minVelocity = 0.1; // Higher threshold to prevent long tails
    const velocityMultiplier = 16; // Adjusted for better control
    
    // Calculate natural stopping point based on physics
    const calculateNaturalEndPosition = (initialVelocity, currentPosition) => {
      let v = initialVelocity;
      let pos = currentPosition;
      
      // Simulate the physics to find where it would naturally stop
      while (Math.abs(v) > minVelocity) {
        pos -= v * velocityMultiplier;
        v *= friction;
      }
      
      return pos;
    };
    
    // Find the best snap point for a given position
    const findBestSnapPoint = (targetPosition) => {
      const viewportCenter = targetPosition + (this.scrollContainer.offsetWidth / 2);
      let bestSlide = null;
      let bestDistance = Infinity;
      let bestTargetScroll = 0;
      
      this.slides.forEach((slide) => {
        const slideCenter = slide.offsetLeft + (slide.offsetWidth / 2);
        const distance = Math.abs(slideCenter - viewportCenter);
        
        if (distance < bestDistance) {
          bestDistance = distance;
          bestSlide = slide;
          bestTargetScroll = slideCenter - (this.scrollContainer.offsetWidth / 2);
        }
      });
      
      return { slide: bestSlide, targetScroll: bestTargetScroll };
    };
    
    // Calculate where natural physics would end
    const currentScroll = this.scrollContainer.scrollLeft;
    const naturalEndPosition = calculateNaturalEndPosition(velocity, currentScroll);
    
    // Find the best snap point for that natural end position
    const { targetScroll } = findBestSnapPoint(naturalEndPosition);
    
    // Calculate the adjusted physics parameters to land exactly on the snap point
    const totalDistance = targetScroll - currentScroll;
    
    // If velocity is too low or distance is very small, just snap directly
    if (Math.abs(velocity) < 0.15 || Math.abs(totalDistance) < 50) {
      // Use our own smooth animation to avoid conflicts with scroll-snap
      const startScroll = this.scrollContainer.scrollLeft;
      const distance = targetScroll - startScroll;
      const duration = 300; // ms
      const startTime = performance.now();
      
      const smoothSnap = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out cubic)
        const eased = 1 - Math.pow(1 - progress, 3);
        
        this.scrollContainer.scrollLeft = startScroll + (distance * eased);
        
        if (progress < 1) {
          this.animationId = requestAnimationFrame(smoothSnap);
        } else {
          this.scrollContainer.scrollLeft = targetScroll;
          this.animationId = null;
          // Re-enable scroll snap after animation completes with a small delay
          requestAnimationFrame(() => {
            this.scrollContainer.style.scrollSnapType = this.originalSnapType;
            this.scrollContainer.dataset.dragging = false;
          });
        }
      };
      
      this.animationId = requestAnimationFrame(smoothSnap);
      return;
    }
    
    // Calculate the required initial velocity to reach the target exactly
    // We'll use a more sophisticated approach that accounts for the discrete nature of the animation
    
    let adjustedVelocity = velocity;
    const direction = Math.sign(totalDistance);
    const naturalDirection = Math.sign(velocity);
    
    // If we're already going in the right direction, adjust the velocity to land perfectly
    if (naturalDirection === direction || velocity === 0) {
      // Binary search to find the perfect initial velocity
      let low = 0;
      let high = Math.abs(velocity) * 2 || 2;
      let bestVelocity = velocity;
      let iterations = 0;
      
      while (iterations < 20) {
        const mid = (low + high) / 2;
        const testVelocity = mid * direction;
        
        // Simulate where this velocity would end
        let simVelocity = testVelocity;
        let simPosition = currentScroll;
        
        while (Math.abs(simVelocity) > minVelocity) {
          simPosition -= simVelocity * velocityMultiplier;
          simVelocity *= friction;
        }
        
        const simDistance = Math.abs(simPosition - targetScroll);
        
        if (simDistance < 0.5) {
          bestVelocity = testVelocity;
          break;
        }
        
        if ((simPosition < targetScroll && direction > 0) || 
            (simPosition > targetScroll && direction < 0)) {
          low = mid;
        } else {
          high = mid;
        }
        
        iterations++;
      }
      
      adjustedVelocity = -bestVelocity;
    } else {
      // If we need to reverse direction, use a calculated velocity
      const absDistance = Math.abs(totalDistance);
      const frames = Math.ceil(Math.log(minVelocity) / Math.log(friction));
      
      // Sum of geometric series for friction
      const sum = (1 - Math.pow(friction, frames)) / (1 - friction);
      
      adjustedVelocity = -totalDistance / (sum * velocityMultiplier);
    }
    
    // Animate with adjusted physics
    let currentVelocity = adjustedVelocity;
    let lastPosition = currentScroll;
    let oscillationDamping = 0.3; // Prevent oscillation near target
    
    const applyInertia = () => {
      const distanceToTarget = Math.abs(this.scrollContainer.scrollLeft - targetScroll);
      
      // If we're very close to target, snap and finish
      if (distanceToTarget < 1 || Math.abs(currentVelocity) < minVelocity) {
        this.scrollContainer.scrollLeft = targetScroll;
        this.animationId = null;
        // Re-enable scroll snap after a tiny delay to ensure position is set
        requestAnimationFrame(() => {
          this.scrollContainer.style.scrollSnapType = this.originalSnapType;
          this.scrollContainer.dataset.dragging = false;
        });
        return;
      }
      
      // Apply velocity
      const newScrollLeft = this.scrollContainer.scrollLeft - (currentVelocity * velocityMultiplier);
      
      // Prevent overshooting the target
      const currentDirection = Math.sign(targetScroll - this.scrollContainer.scrollLeft);
      const newDirection = Math.sign(targetScroll - newScrollLeft);
      
      if (currentDirection !== newDirection) {
        // We would overshoot, so apply damping
        currentVelocity *= oscillationDamping;
        this.scrollContainer.scrollLeft = targetScroll;
      } else {
        // Check boundaries
        const maxScroll = this.scrollContainer.scrollWidth - this.scrollContainer.offsetWidth;
        if (newScrollLeft < 0) {
          this.scrollContainer.scrollLeft = 0;
          currentVelocity *= -0.5;
        } else if (newScrollLeft > maxScroll) {
          this.scrollContainer.scrollLeft = maxScroll;
          currentVelocity *= -0.5;
        } else {
          this.scrollContainer.scrollLeft = newScrollLeft;
        }
      }
      
      // Track if we're stuck (not making progress)
      if (Math.abs(this.scrollContainer.scrollLeft - lastPosition) < 0.1) {
        this.scrollContainer.scrollLeft = targetScroll;
        this.animationId = null;
        // Re-enable scroll snap after a tiny delay to ensure position is set
        requestAnimationFrame(() => {
          this.scrollContainer.style.scrollSnapType = this.originalSnapType;
          this.scrollContainer.dataset.dragging = false;
        });
        return;
      }
      
      lastPosition = this.scrollContainer.scrollLeft;
      currentVelocity *= friction;
      
      this.animationId = requestAnimationFrame(applyInertia);
    };
    
    this.animationId = requestAnimationFrame(applyInertia);
  }
  
  handleMouseLeave = () => {
    if (this.dragState) {
      this.handleEnd();
    }
  }
}

// Register the web component
customElements.define('draggable-scroll', DraggableScroll);

// Add your prototype logic here...
const slideshow = document.querySelector('.slideshow');
const draggableScroll = slideshow.querySelector('draggable-scroll');
const slideshowList = slideshow.querySelector('ul');
const slides = slideshowList.querySelectorAll('li');
const prevButton = slideshow.querySelector('button:first-of-type');
const nextButton = slideshow.querySelector('button:last-of-type');

let currentSlideIndex = 0;

// Function to get the current slide based on scroll position
const getCurrentSlideIndex = () => {
  const scrollLeft = slideshowList.scrollLeft;
  const slideWidth = slides[0].offsetWidth;
  const gap = parseFloat(getComputedStyle(slideshowList).gap) || 0;
  
  // Calculate which slide is closest to center
  let closestIndex = 0;
  let closestDistance = Infinity;
  
  slides.forEach((slide, index) => {
    const slideCenter = slide.offsetLeft + (slide.offsetWidth / 2);
    const viewportCenter = scrollLeft + (slideshowList.offsetWidth / 2);
    const distance = Math.abs(slideCenter - viewportCenter);
    
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });
  
  return closestIndex;
};

// Function to update button states
const updateButtonStates = () => {
  prevButton.disabled = currentSlideIndex === 0;
  nextButton.disabled = currentSlideIndex === slides.length - 1;
};

// Function to scroll to a specific slide
const scrollToSlide = (index) => {
  if (index < 0 || index >= slides.length) return;
  
  const slide = slides[index];
  const slideCenter = slide.offsetLeft + (slide.offsetWidth / 2);
  const viewportCenter = slideshowList.offsetWidth / 2;
  const scrollPosition = slideCenter - viewportCenter;
  
  slideshowList.scrollTo({
    left: scrollPosition,
    behavior: 'smooth'
  });
  
  currentSlideIndex = index;
  updateButtonStates();
};

// Previous button handler
prevButton.addEventListener('click', () => {
  // Don't trigger if dragging
  if (draggableScroll && draggableScroll.isDragging) return;
  
  currentSlideIndex = getCurrentSlideIndex();
  if (currentSlideIndex > 0) {
    scrollToSlide(currentSlideIndex - 1);
  }
});

// Next button handler
nextButton.addEventListener('click', () => {
  // Don't trigger if dragging
  if (draggableScroll && draggableScroll.isDragging) return;
  
  currentSlideIndex = getCurrentSlideIndex();
  if (currentSlideIndex < slides.length - 1) {
    scrollToSlide(currentSlideIndex + 1);
  }
});

const FRAMES = 10;
function createScrollWatcher(
  target,
  { frames = FRAMES, axis = 'vertical', onStart, onFrame, onStop } = {}
) {
  let last = null,
    repeats = 0,
    raf = null

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

// Update current slide index when user scrolls manually
let scrollTimeout;
createScrollWatcher(slideshowList, {
  frames: FRAMES,
  axis: 'horizontal',
  onFrame: () => {
    currentSlideIndex = getCurrentSlideIndex();
    updateButtonStates();
  },
});

// Initialize button states
updateButtonStates();