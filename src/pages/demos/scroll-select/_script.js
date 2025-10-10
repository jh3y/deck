import gsap from 'gsap'
import ScrollToPlugin from 'gsap/ScrollToPlugin'
import { Pane } from 'tweakpane'

gsap.registerPlugin(ScrollToPlugin)

const config = {
  options: 20,
  theme: 'dark',
}

const ctrl = new Pane({
  title: 'Config',
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

const main = document.querySelector('main')
main.innerHTML += `
<select class="custom-select" name="options" id="custom">
        <button>
          <selectedcontent></selectedcontent>
          <!-- <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-chevron-down"
        >
          <path d="m6 9 6 6 6-6"></path>
        </svg> -->
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
          >
            <path
              class="chevron-top"
              d="M7 9L12 4"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              class="chevron-top--left"
              d="M17 9L12 4"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              class="chevron-bottom"
              d="M7 15L12 20"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              class="chevron-bottom--right"
              d="M17 15L12 20"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <div class="scroller">
        <div class="options">
        <!-- generated on the JavaScript side -->
        <option>select</option>
        <option>design</option>
        <option>prototype</option>
        <option>solve</option>
        <option>build</option>
        <option>develop</option>
        <option>debug</option>
        <option>learn</option>
        <option>cook</option>
        <option>ship</option>
        <option>prompt</option>
        <option>collaborate</option>
        <option>create</option>
        <option>inspire</option>
        <option>follow</option>
        <option>innovate</option>
        <option>test</option>
        <option>optimize</option>
        <option>teach</option>
        <option>visualize</option>
        <option>transform</option>
        <option>scale</option>
        <option>do it</option>
        </div>
        </div>
      </select>
`

const select = main.querySelector('.custom-select')
const scroller = select.querySelector('.scroller')
const options = select.querySelector('.options')

const getScrollTopToCenterElement = (container, element) => {
  if (!container || !element) return 0

  const style = getComputedStyle(container)
  const paddingTop = Number.parseFloat(style.paddingTop)
  const paddingBottom = Number.parseFloat(style.paddingBottom)

  const containerScrollTop = container.scrollTop
  const containerTop = container.getBoundingClientRect().top
  const elementTop = element.getBoundingClientRect().top

  // Relative offset from the scrollTop baseline, including current scroll
  const offsetInsideContainer = elementTop - containerTop + containerScrollTop

  const containerHeight = container.clientHeight
  const elementHeight = element.offsetHeight

  const scrollTarget =
    offsetInsideContainer -
    (containerHeight - paddingTop - paddingBottom) / 2 +
    elementHeight / 2 -
    paddingTop

  return scrollTarget
}

const isCentered = (el, container) => {
  const elRect = el.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()

  const elCenter = elRect.top + elRect.height / 2
  const containerCenter = containerRect.top + containerRect.height / 2

  return Math.abs(elCenter - containerCenter) <= 1
}

const assignProximityValues = (items, selectedIndex, distanceValueMap) => {
  return items.map((item, index) => {
    const distance = Math.min(3, Math.abs(index - selectedIndex))
    item.style.setProperty('--proximity', distance)
  })
}
let scrollmax
const syncSelect = () => {
  if (select.matches(':open')) {
    window.addEventListener('pointerdown', syncCenter, { once: true })
    window.addEventListener('click', syncSelect, { once: true })
  }

  const selected =
    select.querySelector(':focus') || select.querySelector(':checked')

  if (selected) {
    const top = getScrollTopToCenterElement(scroller, selected)
    const centered = isCentered(selected, scroller)
    select.dataset.centered = centered
    if (scrollmax?.isActive()) scrollmax.kill()
    if (!centered) {
      scrollmax = gsap.to(scroller, {
        scrollTo: top,
        duration: 0.26,
        overwrite: 'auto',
        onComplete: () => {
          gsap.set(scroller, { clearProps: 'all' })
        },
        ease: 'power2.out',
      })
    }
  }
}

const syncCenter = () => {
  const selected =
    select.querySelector(':focus') || select.querySelector(':checked')
  const centered = isCentered(selected, scroller)
  select.dataset.centered = centered
}

const syncProximity = () => {
  const selected = options.querySelector(':checked')
  assignProximityValues(
    [...options.children],
    [...options.children].indexOf(selected) || 0
  )
}

select.addEventListener('focus', syncSelect, true)
select.addEventListener('keydown', syncCenter, true)
select.addEventListener('input', syncProximity)

// generate the options
syncProximity()
