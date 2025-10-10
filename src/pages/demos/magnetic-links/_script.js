const supportsAnchorPos = 'anchorName' in document.documentElement.style
const nav = document.querySelector('[data-magnetic]')
nav.innerHTML += `<style type="text/css"></style>`
const sheet = nav.querySelector('style')
const anchors = nav.querySelectorAll('a')
console.info({ sheet, anchors })
const sync = (nav, anchors) => () => {
  sheet.innerHTML = ''
  for (let i = 0; i < anchors.length; i++) {
    anchors[i].style.setProperty('view-transition-name', `item-${i + 1}`)
    if (!supportsAnchorPos) {
      const bounds = anchors[i].getBoundingClientRect()

      // Also need to append to the sheet
      sheet.innerHTML += `
        [data-no-anchor] ul:has(li:nth-of-type(${
          i + 1
        }) a:is(:hover, :focus-visible)) {
          --item-active-y: ${bounds.top};
          --item-active-x: ${bounds.left};
          --item-active-width: ${bounds.width};
          --item-active-height: ${bounds.height};
        }
        [data-no-anchor] ul:has(li:nth-of-type(${i + 1}) a:target) {
          --target-y: ${bounds.top};
          --target-x: ${bounds.left};
          --target-width: ${bounds.width};
          --target-height: ${bounds.height};
        }
      `
    }
  }
}
/**
 * If there's no Anchor Positionioning support fill the gap ourselves.
 * The Oddbird polyfill struggles with dynamic anchoring
 * We can just set the positions via custom properties when there is a
 * layout change
 * */
const calibrate = sync(nav, anchors)
if (!supportsAnchorPos) {
  document.documentElement.dataset.noAnchor = true
  calibrate()
  window.addEventListener('resize', calibrate)
}

/**
 * Regardless of whether you have anchor positioning or not, a progressive touch
 * is to store the previously hovered piece so on pointerleave you get the fade out
 * */
const falloff = (index) => () => {
  if (supportsAnchorPos) {
    nav.style.setProperty('--item-active', `--item-${index + 1}`)
  } else {
    nav.style.setProperty('--item-active-x', `var(--item-${index + 1}-x)`)
    nav.style.setProperty('--item-active-y', `var(--item-${index + 1}-y)`)
    nav.style.setProperty(
      '--item-active-width',
      `var(--item-${index + 1}-width)`
    )
    nav.style.setProperty(
      '--item-active-height',
      `var(--item-${index + 1}-height)`
    )
  }
}
for (let i = 0; i < anchors.length; i++) {
  anchors[i].addEventListener('pointerenter', falloff(i))
}

const deactivate = async () => {
  const transitions = document.getAnimations()
  if (transitions.length) {
    const fade = transitions.find(
      (t) =>
        t.effect.target === nav.firstElementChild &&
        t.transitionProperty === 'opacity'
    )
    await Promise.allSettled([fade.finished])
    if (supportsAnchorPos) {
      nav.style.removeProperty('--item-active')
    } else {
      nav.style.removeProperty('--item-active-x')
      nav.style.removeProperty('--item-active-y')
      nav.style.removeProperty('--item-active-width')
      nav.style.removeProperty('--item-active-height')
    }
  }
}

nav.addEventListener('pointerleave', deactivate)
nav.addEventListener('blur', deactivate)

/**
 * Change orientation with a button click
 * */
const orientator = document.querySelector('.direction-handler')
const orient = () => {
  orientator.setAttribute(
    'aria-pressed',
    orientator.matches('[aria-pressed=false')
  )
  calibrate()
}

const changeOrientation = () => {
  document.documentElement.dataset.flipUi = true
  if (!document.startViewTransition) return orient()
  const transition = document.startViewTransition(orient)
  transition.finished.finally(() => {
    document.documentElement.dataset.flipUi = false
  })
}
calibrate()
orientator.addEventListener('click', changeOrientation)

/**
 * Theme switching
 * */
// const toggle = document.querySelector('button.theme')

// const switchTheme = () => {
//   const isDark = !toggle.matches('[aria-pressed=true]')
//   toggle.setAttribute('aria-pressed', isDark)
//   document.documentElement.className = isDark ? 'light' : 'dark'
// }

// const handleToggle = () => {
//   if (!document.startViewTransition) {
//     console.info('Hey! Try this out in Chrome 111+')
//     switchTheme()
//   }
//   document.startViewTransition(switchTheme)
// }

// toggle.addEventListener('click', handleToggle)
