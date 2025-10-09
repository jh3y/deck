import { codeToHtml } from 'shiki'
import gsap from 'gsap'
import Matter from 'matter-js'
import { Pane } from 'tweakpane'

const main = document.querySelector('main')
let render
let characterBodies = []
const config = {
  theme: 'system',
  lang: 'css',
  code: `/* do not touch this code */
:root {
  --font-width-min: 320;
  --font-width-max: 1500;
  --font-size-min: 17;
  --font-size-max: 20;
  --font-ratio-min: 1.2;
  --font-ratio-max: 1.33;
}
/* equal to something like clamp(1.125rem, 1.0815rem + 0.2174vi, 1.25rem); */
.fluid {
  --fluid-min: calc(
    var(--font-size-min) * pow(var(--font-ratio-min), var(--font-level, 0))
  );
  --fluid-max: calc(
    var(--font-size-max) * pow(var(--font-ratio-max), var(--font-level, 0))
  );
  --fluid-preferred: calc(
    (var(--fluid-max) - var(--fluid-min)) /
      (var(--font-width-max) - var(--font-width-min))
  );
  --fluid-type: clamp(
    (var(--fluid-min) / 16) * 1rem,
    ((var(--fluid-min) / 16) * 1rem) -
      (((var(--fluid-preferred) * var(--font-width-min)) / 16) * 1rem) +
      (var(--fluid-preferred) * var(--variable-unit, 100vi)),
    (var(--fluid-max) / 16) * 1rem
  );
  font-size: var(--fluid-type);
}`,
  fizzy: false,
}

const ctrl = new Pane({
  title: 'Config',
  expanded: true,
})

let walls = []
const createWalls = () => {
  if (walls.length) {
    for (const wall of walls) {
      Matter.Composite.remove(engine.world, wall)
    }
    walls = []
  }
  requestAnimationFrame(() => {
    const thickness = 2000
    walls = [
      Matter.Bodies.rectangle(
        window.innerWidth * 0.5,
        window.innerHeight * -1 - thickness * 0.5,
        window.innerWidth * 10,
        thickness,
        {
          collisionFilter: {
            category: 0x0001,
          },
          isStatic: true,
        }
      ),
      Matter.Bodies.rectangle(
        window.innerWidth * 0.5,
        window.innerHeight + thickness * 0.5,
        window.innerWidth * 10,
        thickness,
        {
          collisionFilter: {
            category: 0x0001,
          },
          isStatic: true,
        }
      ),
      Matter.Bodies.rectangle(
        window.innerWidth + thickness * 0.5,
        0,
        thickness,
        window.innerHeight * 10,
        {
          collisionFilter: {
            category: 0x0001,
          },
          isStatic: true,
        }
      ),
      Matter.Bodies.rectangle(
        thickness * -0.5,
        0,
        thickness,
        window.innerHeight * 10,
        {
          collisionFilter: {
            category: 0x0001,
          },
          isStatic: true,
        }
      ),
    ]
    Matter.Composite.add(engine.world, walls)
  })
}

const createCharacters = () => {
  const chars = Array.from(
    document.querySelectorAll('.line > span > span')
  ).filter((node) => node.textContent.trim() !== '')
  for (let i = 0; i < chars.length; i++) {
    const bounds = chars[i].getBoundingClientRect()

    const first = Math.random() > 0.5
    const characterBody = Matter.Bodies.rectangle(
      bounds.x + bounds.width * 0.5,
      bounds.y + bounds.height * 0.5 + window.scrollY,
      bounds.width,
      bounds.height,
      {
        collisionFilter: {
          category: first ? 0x0002 : 0x0004,
          mask: first ? 0x0001 | 0x0002 : 0x0001 | 0x0004,
        },
        restitution: config.fizzy ? 1.28 : 1,
        elem: chars[i],
        startX: bounds.x + bounds.width * 0.5,
        startY: bounds.y + bounds.height * 0.5 + window.scrollY,
      }
    )
    chars[i].style.setProperty('--delay', Math.random())
    chars[i].style.setProperty('--speed', Math.random() * 0.2 + 0.1)
    characterBodies.push(characterBody)
  }
}
let detector
const renderCode = async () => {
  gsap.ticker.remove(render)
  // Here we need to remove all bodies and add some new ones...
  if (characterBodies.length) {
    characterBodies.map((body) => {
      Matter.Composite.remove(engine.world, body)
    })
  }
  // Reset the Array
  characterBodies = []
  // Once you've cleared out the bodies, create the code
  const html = await codeToHtml(config.code, {
    lang: config.lang,
    theme: 'night-owl',
    transformers: [
      {
        span(node) {
          const newKidsOnTheBlock = []
          const textContent = node.children[0].value.split('')
          for (let c = 0; c < textContent.length; c++) {
            newKidsOnTheBlock.push({
              type: 'element',
              tagName: 'span',
              properties: {
                class: 'character',
              },
              children: [
                {
                  type: 'text',
                  value: textContent[c],
                },
              ],
            })
          }
          node.children = newKidsOnTheBlock
        },
      },
    ],
  })
  // Set the innerHTML
  main.innerHTML = html
  // Now create your Matter Bodies
  createCharacters()
  // Add them to the world
  Matter.Composite.add(engine.world, characterBodies)
  // create walls
  createWalls()
  // Create collision detector
  // detector = Matter.Detector.create({
  //   bodies: characterBodies,
  // })
}

renderCode()

ctrl
  .addBinding(config, 'fizzy', {
    label: 'Fizzy',
  })
  .on('change', renderCode)
const update = () => {
  document.documentElement.dataset.theme = config.theme
}

const sync = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== 'Theme'
  )
    return update()
  document.startViewTransition(() => update())
}

ctrl.on('change', sync)
update()

// Matter JS Engine code for characters
const engine = Matter.Engine.create({
  render: {
    options: {
      pixelRatio: window.devicePixelRatio,
    },
  },
})
engine.gravity.x = 0
engine.gravity.y = 0
engine.gravity.scale = 0.01

// Static Bodies for the Viewport

render = () => {
  for (let c = 0; c < characterBodies.length; c++) {
    const char = characterBodies[c]
    const ty = char.position.y - char.startY
    const tx = char.position.x - char.startX
    char.elem.style.setProperty('--ty', Math.floor(ty))
    char.elem.style.setProperty('--tx', Math.floor(tx))
  }
  Matter.Engine.update(engine)
}

main.addEventListener('click', () => {
  gsap.ticker.add(render)
  main.dataset.active = true
  engine.gravity.y = 0.25
})

const reset = () => {
  engine.gravity.y = 0
  for (let i = 0; i < characterBodies.length; i++) {
    const char = characterBodies[i]
    Matter.Body.setPosition(char, {
      x: char.startX,
      y: char.startY,
    })
    gsap.ticker.remove(render)
    main.dataset.active = false
    char.elem.style.setProperty('--tx', 0)
    char.elem.style.setProperty('--ty', 0)
  }
}

// Add mouse drag
const mouseConstraint = Matter.MouseConstraint.create(engine, {
  element: document.querySelector('header'),
})

// Remove the scroll interception so we can scroll past
mouseConstraint.mouse.element.removeEventListener(
  'wheel',
  mouseConstraint.mouse.mousewheel
)
mouseConstraint.mouse.element.removeEventListener(
  'DOMMouseScroll',
  mouseConstraint.mouse.mousewheel
)
Matter.Composite.add(engine.world, [mouseConstraint])

ctrl.addButton({ title: 'Reset' }).on('click', reset)

window.addEventListener('resize', renderCode)
