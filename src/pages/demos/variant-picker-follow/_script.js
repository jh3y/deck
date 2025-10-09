import gsap from 'gsap'
import Draggable from 'gsap/Draggable'
import { Pane } from 'tweakpane'
gsap.registerPlugin(Draggable)


// for a radio that uses hop, we can track the direction on change/input
const resizeContainer = document.querySelector('.resize-container')
let fieldset
let fields
let radios
let labels
let initialChecked
let initialIndex = 0
let maskContainer
// Track [current, previous] indices - only ever 2 items
let checkedIndices

// Fast lookup function using cached positions

const svgMask = document.querySelector('.svg-mask')

const config = {
  theme: 'system',
  style: 'hop',
  match: true,
  wrap: true,
  knockout: 'filter',
  duration: 0.2,
  variants: 5,
  options: ['128GB', '256GB', '512GB', '1TB', '2TB', '4TB', '8TB'],
}

const ctrl = new Pane({
  title: 'config',
})

const buildFieldsets = () => {
  resizeContainer.innerHTML = `
  <div class="fields">
  <div class="pill"></div>
    <fieldset>
      <legend>capacity</legend>
      <div class="content">
        ${new Array(config.variants).fill().map((_, i) => `
          <label for="${config.options[i]}">
            <span class="variant-option__button-label__text">${config.options[i]}</span>
          </label>
          <input class="sr-only" ${i === initialIndex ? 'checked data-current-checked="true"' : ''} data-input-index="${i}" aria-label="${config.options[i]}" type="radio" name="capacity" value="${config.options[i]}" id="${config.options[i]}">
        `).join('')}
      </div>
    </fieldset>
    <fieldset aria-hidden="true" class="mask-layer">
      <legend>capacity</legend>
      ${new Array(config.variants).fill().map((_, i) => `
        <label>
          <span class="variant-option__button-label__text">${config.options[i]}</span>
        </label>
      `).join('')}
    </fieldset>
  </div>
  `
  fields = resizeContainer.querySelector('.fields')
  fieldset = resizeContainer.querySelector('fieldset')
  radios = [...fieldset.querySelectorAll('input')]
  labels = [...fieldset.querySelectorAll('label')]
  maskContainer = resizeContainer.querySelector(
    'fieldset:first-of-type > div',
  )
  initialChecked = fieldset.querySelector('input:checked')
  initialIndex = radios.indexOf(initialChecked)
  // Track [current, previous] indices - only ever 2 items
  checkedIndices = [initialIndex]
  fieldset.style.setProperty(
    '--pill-width',
    `${labels[initialIndex].offsetWidth}px`,
  )
  initialChecked.dataset.currentChecked = true
}
buildFieldsets()

ctrl.addBinding(config, 'variants', {
  min: 2,
  max: config.options.length,
  step: 1,
}).on('change', buildFieldsets)


ctrl.addBinding(config, 'duration', {
  min: 0,
  max: 2,
  step: 0.01,
})

ctrl.addBinding(config, 'style', {
  options: {
    anchor: 'anchor',
    hop: 'hop',
  },
})
const wrap =ctrl.addBinding(config, 'wrap', {

  hidden: config.style !== 'hop',
})

const match = ctrl.addBinding(config, 'match', {
  hidden: config.style !== 'hop',
})

const knockout = ctrl.addBinding(config, 'knockout', {
  options: {
    filter: 'filter',
    mask: 'mask',
    none: 'none',
  },
  hidden: config.style === 'hop',
})

ctrl.addBinding(config, 'theme', {
  label: 'theme',
  options: {
    system: 'system',
    light: 'light',
    dark: 'dark',
  },
})

const update = () => {
  document.documentElement.dataset.theme = config.theme
  document.documentElement.dataset.style = config.style
  document.documentElement.dataset.match = config.match
  document.documentElement.dataset.knockout = config.knockout
  document.documentElement.dataset.wrap = config.wrap
  document.documentElement.style.setProperty('--duration', config.duration)
  knockout.hidden = config.style === 'hop'
  match.hidden = wrap.hidden = config.style !== 'hop'
  ctrl.refresh()
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
const isRaw = new URLSearchParams(window.location.search).get('raw') === 'true'
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

// Add your prototype logic here...
const updateMask = () => {
  const { left, top } = maskContainer.getBoundingClientRect()
  svgMask.setAttribute(
    'viewBox',
    `0 0 ${maskContainer.offsetWidth} ${maskContainer.offsetHeight}`,
  )
  const maskString = new Array(radios.length)
    .fill()
    .map((_, i) => {
      const { x, y, width, height } = labels[i].getBoundingClientRect()
      return `<rect x="${x - left}" y="${y - top}" width="${width}" height="${height}" rx="${height * 0.5}" ry="${height * 0.5}" fill="#000"></rect>`
    })
    .join('')
  svgMask.innerHTML = maskString
  const encoded = encodeURIComponent(svgMask.outerHTML)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22')
  const dataUri = `data:image/svg+xml;utf8,${encoded}`
  document.documentElement.style.setProperty('--svg-mask', `url(${dataUri})`)
}

const resizeHandler = new ResizeObserver(() => {
  if (
    config.style === 'anchor'
  ) {
    updateMask()
    if (!CSS.supports('anchor-name: --active')) {
      cacheBase()
      syncChecked()
    }
  }
})
resizeHandler.observe(resizeContainer)

const positions = []
// syncs the positions of the labels
const syncChecked = () => {
  const checked = fieldset.querySelector(':checked')
  const index = radios.indexOf(checked)
  fields.style.setProperty('--top', positions[index].top)
  fields.style.setProperty('--left', positions[index].left)
  fields.style.setProperty('--width', positions[index].width)
  fields.style.setProperty('--height', positions[index].height)
  fields.style.setProperty('--marker-top', positions[index].top)
  fields.style.setProperty('--marker-left', positions[index].left)
}
// this caches the positions of the labels
const cacheBase = () => {
  console.info('cacheing')
  const { x: fieldX, y: fieldY } = fields.getBoundingClientRect()
  const { x, y } = fieldset.querySelector('label').getBoundingClientRect()
  fields.style.setProperty('--left', x - fieldX)
  fields.style.setProperty('--top', y - fieldY)


  console.info({fieldX, fieldY, x, y})
  document.documentElement.style.setProperty('--marker-top', y - fieldY)
  document.documentElement.style.setProperty('--marker-left', x - fieldX)
  positions.length = 0
  for (const label of labels) {
    const { height, width, left, top } = label.getBoundingClientRect()
    positions.push({
      width,
      height,
      left: left - fieldX,
      top: top - fieldY,
    })
  }
}

resizeContainer.addEventListener('input', (event) => {
  // const currentIndex = radios.indexOf(event.target

  // )
  if (config.style === 'hop') {
    const inputIndex = Number.parseInt(event.target.dataset.inputIndex || '');
    const [currentIndex, previousIndex] = checkedIndices;
    if (currentIndex !== undefined && radios[currentIndex]) {
      radios[currentIndex].dataset.previousChecked = 'false';
    }
    if (previousIndex !== undefined && radios[previousIndex]) {
      radios[previousIndex].dataset.previousChecked = 'false';
    }

    // Update checked indices array - keep only the last 2 selections
    checkedIndices.unshift(inputIndex);
    checkedIndices.length = Math.min(checkedIndices.length, 2);

    // Update the new states
    const newCurrentIndex = checkedIndices[0]; // This is always inputIndex
    const newPreviousIndex = checkedIndices[1]; // This might be undefined

    // newCurrentIndex is guaranteed to exist since we just added it
    if (newCurrentIndex !== undefined && radios[newCurrentIndex]) {
      radios[newCurrentIndex].dataset.currentChecked = 'true';
      fieldset.style.setProperty(
        '--pill-width-current',
        `${radios[newCurrentIndex].previousElementSibling?.offsetWidth || 0}px`
      );
    }

    if (newPreviousIndex !== undefined && radios[newPreviousIndex]) {
      radios[newPreviousIndex].dataset.previousChecked = 'true';
      radios[newPreviousIndex].dataset.currentChecked = 'false';
      fieldset.style.setProperty(
        '--pill-width-previous',
        `${radios[newPreviousIndex].previousElementSibling?.offsetWidth || 0}px`
      );
    }
  } else if (config.style === 'anchor') {
    if (!CSS.supports('anchor-name: --active')) {
      syncChecked()
    }
  }
})
// need to polyfill for cases where anchor positioning is not supported
if (!CSS.supports('anchor-name: --active')) {
  console.info('polyfill anchor positioning by cacheing positions + sizes')
  requestAnimationFrame(() => {
    cacheBase()
    syncChecked()
    fields.dataset.initiated = true
  })
}

