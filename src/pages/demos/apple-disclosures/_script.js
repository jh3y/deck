import gsap from 'gsap'
import Draggable from 'gsap/Draggable'
import { Pane } from 'tweakpane'
gsap.registerPlugin(Draggable)

const config = {
  theme: 'system',
}

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

// Navigation functionality for details elements
const detailsElements = document.querySelectorAll('details[name="feature"]')
const nextButton = document.querySelector('button[data-action="next"]')
const previousButton = document.querySelector('button[data-action="previous"]')
const exitButton = document.querySelector('button[data-action="exit"]')

// Find the currently open details element
const getOpenDetails = () => {
  return Array.from(detailsElements).findIndex(details => details.open)
}

// Navigate to next details
nextButton?.addEventListener('click', () => {
  const currentIndex = getOpenDetails()
  
  // Only proceed if there's currently an open details element
  if (currentIndex !== -1) {
    // Close current
    detailsElements[currentIndex].open = false
    // Open next (wrap to first if at end)
    const nextIndex = (currentIndex + 1) % detailsElements.length
    detailsElements[nextIndex].open = true
  }
})

// Navigate to previous details
previousButton?.addEventListener('click', () => {
  const currentIndex = getOpenDetails()
  
  // Only proceed if there's currently an open details element
  if (currentIndex !== -1) {
    // Close current
    detailsElements[currentIndex].open = false
    // Open previous (wrap to last if at beginning)
    const previousIndex = (currentIndex - 1 + detailsElements.length) % detailsElements.length
    detailsElements[previousIndex].open = true
  }
})

// Exit current details
exitButton?.addEventListener('click', () => {
  const currentIndex = getOpenDetails()
  
  if (currentIndex !== -1) {
    // Close the currently open details
    detailsElements[currentIndex].open = false
  }
})
