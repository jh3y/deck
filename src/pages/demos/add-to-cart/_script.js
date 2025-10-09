import { Pane } from 'tweakpane';
import { gsap } from 'gsap';
import Draggable from 'gsap/Draggable';
gsap.registerPlugin(Draggable);

const config = {
  theme: 'light',
  style: 'alternate',
  color: 'custom',
  custom: 'hsl(140, 100%, 50%)',
  timing: 'sequential',
  include: false,
  play: false,
  speed: 1,
  shouldError: false,
};


const COLORS = [
  'oklch(62.32% 0.20671135203311433 255.1916692835456)',
  'oklch(73.87% 0.1070786497070297 201.59493356613996)',
  'oklch(84.85% 0.17406745322149955 86.29886848579457)',
  'oklch(66.83% 0.20633437948063887 20.156816263959513)',
  'oklch(74.67% 0.09006824938632453 344.36705431384325)',
]

const ctrl = new Pane({
  title: 'config',
});

ctrl.addBinding(config, 'theme', {
  label: 'theme',
  options: {
    system: 'system',
    light: 'light',
    dark: 'dark'
  }
})

ctrl.addBinding(config, 'shouldError', {
  label: 'simulate error',
})

ctrl.addBinding(config, 'play')

const stylCtrl = ctrl.addBinding(config, 'style', {
  hidden: !config.play,
  options: {
    line: 'line',
    wiggle: 'wiggle',
    alternate: 'alternate',
    random: 'random'
  }
})
const timingCtrl = ctrl.addBinding(config, 'timing', {
  hidden: !config.play,
  options: {
    uniform: 'uniform',
    alternate: 'alternate',
    sequential: 'sequential',
    random: 'random'
  }
})

const colorCtrl = ctrl.addBinding(config, 'color', {
  hidden: !config.play,
  options: {
    match: 'match',
    vibrant: 'vibrant',
    custom: 'custom',
  }
})

const customColor =ctrl.addBinding(config, 'custom', {
  hidden: config.color !== 'custom'
})

const includeCtrl = ctrl.addBinding(config, 'include', {
  hidden: !config.play || config.color !== 'custom',
})

const speedCtrl = ctrl.addBinding(config, 'speed', {
  hidden: !config.play,
  min: 0.1,
  max: 2,
  step: 0.1,
})
const playground = document.querySelector('.playground')
const playButton = ctrl.addButton({ title: 'play', hidden: !config.play })
  .on('click', async () => {
    if(playButton.title === 'reset') {
      playground.dataset.play = 'false'
      playButton.title = 'play'
      return
    }
    gsap.set('.burst g', {
      '--d': () => gsap.utils.random(0, .4, 0.01)
    })
    gsap.set('.burst g', {
      '--color': () => COLORS[gsap.utils.random(0, COLORS.length - 1, 1)]
    })
    playButton.disabled = true
    playground.dataset.play = 'true'
    playButton.title = 'reset'
    await Promise.all(playground.getAnimations({ subtree: true }).map(a => a.finished))
    playButton.disabled = false
  })

const update = () => {
  document.documentElement.dataset.theme = config.theme
  document.documentElement.dataset.style = config.style
  document.documentElement.dataset.color = config.color
  document.documentElement.dataset.timing = config.timing
  document.documentElement.dataset.include = config.include
  document.documentElement.dataset.play = config.play
  document.documentElement.style.setProperty('--custom-color', config.custom)
  document.documentElement.style.setProperty('--speed', 1 / config.speed)
  stylCtrl.hidden = timingCtrl.hidden = colorCtrl.hidden = speedCtrl.hidden = playButton.hidden = !config.play
  customColor.hidden = includeCtrl.hidden = config.color !== 'custom' || !config.play
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

// Add your prototype logic here...
// faux "Add to cart" flow
const addToCart = () => {
  return new Promise((resolve, reject) => {
    // Simulate API delay (0.5-2.5 seconds)
    const delay = 500 + Math.random() * 2000;
    setTimeout(() => {
      if (config.shouldError) {
        reject(new Error('Failed to add item to cart'));
      } else {
        resolve();
      }
    }, delay);
  });
}
const button = document.querySelector('.add-to-cart');
// const btnText = button.querySelector('[data-btn-text]');
const statusRegion = document.getElementById('cart-status');
async function handleAddToCart() {  
  console.info('clicked')
  gsap.set('.burst g', {
    '--d': () => gsap.utils.random(0, .4, 0.01)
  })
  gsap.set('.burst g', {
    '--color': () => COLORS[gsap.utils.random(0, COLORS.length - 1, 1)]
  })
  // Loading state
  button.dataset.adding = 'true'
  button.disabled = true;
  button.setAttribute('aria-disabled', 'true');
  statusRegion.textContent = 'Adding item to cart...';
  try {
    await addToCart();
    // Success state
    // btnText.textContent = 'Added';
    // button.setAttribute('aria-label', `Product added to cart`);
    statusRegion.textContent = 'Product has been added to your cart';
    console.info('added')
    await Promise.all(button.getAnimations({ subtree: true }).map(a => a.finished))
    // Reset after 3 seconds
    setTimeout(() => {
      console.info('tidy up')
      delete button.dataset.adding
      button.disabled = false;
      button.removeAttribute('aria-disabled');
      statusRegion.textContent = '';
    }, 500);
    
  } catch (error) {
    // Error state
    console.info('oops')
    delete button.dataset.adding
    statusRegion.textContent = 'Failed to add item to cart. Please try again.';
    button.disabled = false;
    button.removeAttribute('aria-disabled');
  } finally {
    console.info('finally')
  }
}

button.addEventListener('click', handleAddToCart);

document.querySelector('.tp-rotv_c').appendChild(playground)