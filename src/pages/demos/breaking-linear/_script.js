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
  --sine: linear(
    0, 0.007 5.35%, 0.0282 10.75%, 0.0638 16.26%,
    0.1144 21.96%, 0.1833 28.16%, 0.2717 34.9%, 0.6868 62.19%,
    0.775 68.54%, 0.8457 74.3%, 0.9141 81.07%, 0.9621 87.52%,
    0.9905 93.8%, 1
  );
  --bounce: linear(
    0, 0.0039, 0.0157, 0.0352, 0.0625 9.09%,
    0.1407, 0.25, 0.3908, 0.5625, 0.7654, 1,
    0.8907, 0.8125 45.45%, 0.7852, 0.7657, 0.7539, 0.75,
    0.7539, 0.7657, 0.7852, 0.8125 63.64%, 0.8905, 1 72.73%,
    0.9727, 0.9532, 0.9414, 0.9375, 0.9414, 0.9531, 0.9726,
    1, 0.9883, 0.9844, 0.9883, 1
  );
  --elastic: linear(
    0, 0.0009 8.51%, -0.0047 19.22%, 0.0016 22.39%,
    0.023 27.81%, 0.0237 30.08%, 0.0144 31.81%,
    -0.0051 33.48%, -0.1116 39.25%, -0.1181 40.59%,
    -0.1058 41.79%, -0.0455, 0.0701 45.34%, 0.9702 55.19%,
    1.0696 56.97%, 1.0987 57.88%, 1.1146 58.82%, 1.1181 59.83%,
    1.1092 60.95%, 1.0057 66.48%, 0.986 68.14%, 0.9765 69.84%,
    0.9769 72.16%, 0.9984 77.61%, 1.0047 80.79%, 0.9991 91.48%, 1
  );
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
