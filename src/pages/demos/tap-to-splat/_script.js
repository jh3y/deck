import gsap from 'gsap'
import { SVG } from '@svgdotjs/svg.js'
import { Pane } from 'tweakpane'

const config = {
  deviation: 10,
  matrix: 25,
}

const ctrl = new Pane({ title: 'config' })
ctrl.addBinding(config, 'deviation', {
  min: 0,
  max: 50,
  step: 1,
  label: 'stdDeviation',
})
ctrl.addBinding(config, 'matrix', { min: 0, max: 50, step: 1, label: 'alpha' })
ctrl.on('change', () => {
  gsap.set('feGaussianBlur', {
    attr: {
      stdDeviation: config.deviation,
    }
  })
  gsap.set('feColorMatrix', {
    attr: {
      values: `
        1 0 0 0 0
        0 1 0 0 0
        0 0 1 0 0
        0 0 0 ${config.matrix} -10
  `
  }
})})
ctrl.addButton({ title: 'reset' }).on('click', () => {
  document.querySelector('.splats').innerHTML = ''
})
let count = 0
const SIZE = 100
const SPLAT_SOUND = new Audio('https://cdn.freesound.org/previews/445/445117_9159316-lq.mp3')

const generateSplat = ({ x, y }) => {
  count++
  const splat = SVG();
  const COUNT = gsap.utils.random(2, 10);
  splat.viewbox(`0 0 ${SIZE} ${SIZE}`);
  const splats = splat.group()
  const circles = []
  const groups = []
  const color = `hsl(${count < 5 ? 299 : gsap.utils.random(0, 359)} 100% 69%)`

  for (let i = 0; i < COUNT; i++) {
    const circle = splat.circle(SIZE);
    circle.fill(color)
    circle.stroke({
      color: 'hsl(0 0% 0%)',
      width: 2,
    })
    const group = splat.group();
    group.add(circle);
    splats.add(group);
    groups.push(group.node)
    circles.push(circle.node)
  }
  
  // splats.filterWith(filterOp)
  splat.addTo(".splats");
  
  gsap.set(splat.node, {
    '--x': x,
    '--y': y,
  })

  gsap.set(groups, {
    transformOrigin: "50% 50%",
    rotate: () => gsap.utils.random(0, 359)
  });

  gsap.set(circles, {
    transformOrigin: '50% 100%',
    yPercent: () => gsap.utils.random(-100, 100),
    scale: () => gsap.utils.random(0.5, 1.5)
  });
  
  gsap
    .fromTo(
      circles,
      {
        scale: () => gsap.utils.random(0, 0.25),
        yPercent: 0
      },
      {
        onStart: () => {
          SPLAT_SOUND.currentTime = 0
          SPLAT_SOUND.play()
        },
        duration: () => gsap.utils.random(0.1, 0.5),
        yPercent: () => gsap.utils.random(-100, 100),
        scale: () => gsap.utils.random(0.5, 1.5)
      }
    );
  // Now we need to add a filter   
  // <filter id="fancy-goo">
  //   <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
  //   <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
  //   <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
  // </filter>
};

document.body.addEventListener("click", generateSplat);