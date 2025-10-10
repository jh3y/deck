import { Pane } from 'tweakpane'

const containerSupport = CSS.supports('container-type: scroll-state')
const scrollSupport = CSS.supports(
  '(animation-timeline: scroll()) and (animation-range: 0 100%)'
)
const config = {
  theme: 'light',
  method: containerSupport ? 'container' : 'intersection',
}

const nav = document.querySelector('.nav__intersector')
const sections = document.querySelectorAll('main section')
const anchors = document.querySelectorAll('nav ul a')
const handleObserve = (entries) => {
  const navEntry = entries.filter((e) => e.target.tagName === 'DIV')[0]
  const sectionEntries = entries.filter(
    (e) => e.target.tagName === 'SECTION' && e.isIntersecting
  )
  if (navEntry) {
    document.documentElement.style.setProperty(
      '--expanded',
      navEntry.isIntersecting || navEntry.boundingClientRect.y > 0 ? 0 : 1
    )
  }

  if (sectionEntries.length) {
    anchors.forEach((a) => a.style.removeProperty('--active'))
    for (const entry of sectionEntries) {
      const active = Array.from(anchors).filter((a) => {
        return a.getAttribute('href') === `#${entry.target.id}`
      })[0]
      active.style.setProperty('--active', 1)
    }
  }
}
const observer = new IntersectionObserver(handleObserve, {
  threshold: 0.25,
  rootMargin: '0% 0% 0% 0%',
})

const ctrl = new Pane({
  title: 'Config',
  expanded: true,
})

const update = () => {
  document.documentElement.dataset.theme = config.theme
  document.documentElement.dataset.useMethod = config.method
  if (config.method === 'intersection') {
    observer.observe(nav)
  } else {
    document.documentElement.style.removeProperty('--expanded')
    observer.unobserve(nav)
  }
  if (config.method !== 'scroll') {
    sections.forEach((s) => observer.observe(s))
  } else {
    anchors.forEach((a) => a.style.removeProperty('--active'))
    sections.forEach((s) => observer.unobserve(s))
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

const options = {
  'Intersection Observer': 'intersection',
}
if (containerSupport) options['Container Query'] = 'container'
if (scrollSupport) options['Scroll Animation'] = 'scroll'

ctrl.addBinding(config, 'method', {
  label: 'Method',
  options,
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

const CTA = document.querySelector('.cook')

CTA.addEventListener('click', () => console.info('🧑‍🍳'))