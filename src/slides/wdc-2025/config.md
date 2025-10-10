<h2 class="quote">
  Math. 😬
</h2>
---
<Demo windowed="true" src="/demos/fluid-typography/index.html" title="Fluid Typography" />
---
<!-- @theme="dark" -->

<BrowserSupport className="fixed top-4 right-4" properties="css.types.pow" captions="pow()"></BrowserSupport>
<Demo src="/demos/breaking-typography/index.html" title="breaking typography" ></Demo>
---
<Demo windowed="true" src="/demos/fluid-typography-in-action/index.html" title="Fluid Typography in Action" />
---
<Demo src="/demos/text-rings/" title="Text Rings"></Demo>
---
```html [] text-rings.html
<h1
  class="ring"
  style="--char-count: 39; --font-size: 2; --character-width: 1.2;"
>
  <span aria-hidden="true" class="char" style="--char-index: 0;">M</span>
  <span aria-hidden="true" class="char " style="--char-index: 1;">a</span>
  <span aria-hidden="true" class="char " style="--char-index: 2;">d</span>
  <!-- Obfuscated -->
  <span class="sr-only">Made by Jhey with CSS Trig functions • </span>
</h1>
```
```css [] text-rings.css
.ring {
  --inner-angle: calc((360 / var(--char-count)) * 1deg);
  --character-width: 1.2;
  --radius: calc((var(--character-width) / sin(var(--inner-angle))) * -1ch);
}
.char {
  transform: translate(-50%, -50%)
    rotate(calc(var(--inner-angle) * var(--char-index)))
    translateY(var(--radius));
}
```
---
<!-- @theme="dark" -->
<h2 class="quote">
  Blurring.
</h2>
---
<!-- @theme="dark" -->
<Demo windowed="true" src="/demos/blur-sandbox/" title="Blur Sandbox" />
---
<!-- @theme="dark" @className="[&_[data-code-block]]:w-[82ch]" -->
```css [] progressive-blur.css
.blur {
  --layers: 5;
}

/* Each layer has an index and can access the layer count */
[data-use="sin"] .blur .layer {
  --blur: calc(sin(((var(--layers) - var(--i)) / var(--layers)) * 90deg) * 30);
  --stop: calc(sin(((var(--i)) / var(--layers)) * 90deg) * 15);
}

[data-use="pow"] .blur .layer {
  --blur: calc(pow(2, var(--layers) - var(--i)) * 2);
  --stop: calc(pow(2, var(--i)) * 0.75);
}

.blur .layer {
  backdrop-filter: blur(calc(var(--blur) * 1px));
  mask: radial-gradient(
    150% 130% at 45% 90%,
    #000 15%,
    #0000 calc((15 + var(--stop)) * 1%)
  );
}
```
<BrowserSupport className="fixed top-4 right-4" properties="css.types.pow,css.types.sin" captions="pow(),sin()" />
---
<Demo src="/demos/osaka-card/index.html" title="Osaka Blur Card" />
---
<video className="rounded-lg max-w-prose w-full mx-auto" src="/videos/osaka-card.mp4" autoplay muted loop></video>
---
<h2 class="quote">
  Color.
</h2>
---
<!-- @theme="dark" -->
<Demo src="/demos/color-mixer/" title="Color Mixing" />
---
<Demo windowed="true" src="/demos/relative-colors/index.html" title="Relative Colors" />
---
<!-- @className="[&_[data-code-block]]:w-[82ch]" -->
```css [] color-palette.css
[data-type="success"] {
  --color: oklch(47.06% 0.17 148.76);
}
@supports (color: color-mix(in oklch, red, white)) {
  aside {
    border-color: color-mix(in oklch, var(--color) 5%, oklch(100% 0 0 / 15%));
    background: color-mix(in oklch, var(--color), oklch(0% 0 0 / 50%));
    color: color-mix(in oklch, var(--color), oklch(100% 0 0));
  }
}
@supports (color: rgb(from white r g b)) {
  aside {
    border-color: oklch(from var(--color) l c h / 0.25);
    background: oklch(from var(--color) calc(l * 0.75) c h / 0.5);
    color: oklch(from var(--color) calc(l * 1.5) c h);
  }
}
```
<BrowserSupport className="fixed top-4 right-4" properties="css.types.color.color-mix,css.types.color.color.relative_syntax" captions="color-mix,relative" />
---
<!-- @transition="fade" -->
<h2 class="quote">
  <span style="view-transition-name:--header;">View Transitions.</span>
</h2>
---
<!-- @transition="bounce" @className="[&_[data-code-block]]:w-[40ch]" -->
<h2 class="quote mb-8">
  That was an example of <span class="fluid" style="view-transition-name:--header; --font-level: 4;">View Transitions.</span>
</h2>

```css [] cross-document-vt.css
@view-transition {
  navigation: auto;
}
h1 {
  view-transition-name: --heading;
}
```
---
<!-- @transition="fade" -->
```js [] theme-toggle.js
// It's a DOM Update and a progressive enhancement!
const toggleTheme = () => {
  const isDark = themeToggle.matches("[aria-pressed=true]") ? false : true
  themeToggle.setAttribute("aria-pressed", isDark)
  document.documentElement.dataset.theme = isDark ? "dark" : "light"
}
const handleTheming = () => {
  if (!document.startViewTransition) toggleTheme()
  document.startViewTransition(toggleTheme)
}
themeToggle.addEventListener("click", handleTheming)
```
```css [] view-transitions.css
::view-transition-new(root) {
  animation: reveal 1s;
  clip-path: inset(0 0 0 0);
}
::view-transition-old(root) {
  animation: none;
}
[data-theme="dark"] { --from: 0 0 100% 0; }
[data-theme="light"] { --from: 100% 0 0 0; }
@keyframes reveal {
  from { clip-path: inset(var(--from)); }
}
```
<BrowserSupport className="fixed top-4 right-4"  properties="api.ViewTransition" captions="View Transitions" />
---
<Demo windowed="true" src="/demos/view-transition-showcase/index.html" title="View Transitions" />
---
```css [] theming.css
/* Theming */
[data-theme=dark] { color-scheme: dark; }
[data-theme=light] { color-scheme: light; }
/* System Colors */
body {
  background: canvas;
  color: canvasText;
}
h1 {
  color: light-dark(hsl(10 90% 50%), hsl(25 84% 45%));
}
```
<BrowserSupport className="fixed top-4 right-4"  properties="css.types.color.light-dark" captions="light-dark()" />
---
<Demo windowed="true" src="/demos/fez-transition/index.html" title="View Transitions" />
---
<h2 class="quote">
  Timing is everything.
</h2>
---
<Demo src="/demos/passcode-reveal" title="Passcode Reveal"></Demo>
---
<!-- @className="[&_[data-code-block]]:w-[84ch]" -->
```css [] passcode-delay.css
[data-style="blanket"] .dummy__char:not(.dummy__char--static) span {
  --delay: 0;
}
[data-style="linear"] .dummy__char:not(.dummy__char--static) span {
  --delay: calc(var(--index) * 0.075s);
}
[data-style="sin"] .dummy__char:not(.dummy__char--static) span {
  --spread: 45deg;
  --speed: 1.25s;
  --delay: calc((sin((var(--index) / 12) * var(--spread)) * var(--speed)) * 1s);
}

.dummy__char:not(.dummy__char--static) span {
  transition-duration: calc(var(--transition) * 1s);
  transition-delay: var(--delay);
}
```
---
<Demo src="/demos/linear-grid/index.html" title="Easings grid"></Demo>
---
<!-- @theme="dark" -->
<Demo src="/demos/mrr-counter/index.html" title="MRR Counter"></Demo>
---
<!-- @theme="dark" -->
<BrowserSupport className="fixed top-4 right-4"  properties="css.types.easing-function.linear-function" captions="linear()"></BrowserSupport>
<Demo src="/demos/breaking-linear/index.html" title="linear()"></Demo>
---
<Demo src="/demos/signature-flow/index.html" title="Signature flow"></Demo>
---
<Demo src="/demos/tuggable-lightbulb/index.html" title="Signature flow" windowed="true"></Demo>
---
<h2 class="quote">
  SVG Filters.
</h2>
---
<Demo src="/demos/tap-to-splat/index.html" title="Tap to splat"></Demo>
---
```html [] goo.svg
<svg>
  <defs>
    <filter id="goo">
      <feGaussianBlur in="SourceGraphic" stdDeviation="10 10">
      </feGaussianBlur>
      <feColorMatrix
        values="
          1 0 0 0
          0 0 1 0 
          0 0 0 0
          1 0 0 0
          0 0 25 -10
        " type="matrix"></feColorMatrix>
    </filter>
  </defs>
</svg>
```
```css [] goo.css
.goo {
  filter: url(#goo);
}
```
---
<!-- @theme="dark" -->
<Demo src="/demos/flames/index.html" title="Tap to splat"></Demo>
---
<!-- @theme="dark" -->
```html [] filters.svg
<!-- flames -->
<filter id="flames">
  <feTurbulence
    type="fractalNoise"
    baseFrequency="0.05"
    numOctaves="3"
    result="noise"
  ></feTurbulence>
  <feDisplacementMap
    in="SourceGraphic"
    in2="noise"
    scale="20"
  ></feDisplacementMap>
</filter>
<!-- mosaic -->
<filter id="tiled">
  <feFlood
    x="0"
    y="0"
    height="1"
    width="1"
    flood-color="red"
    flood-opacity="1"
  />
  <feComposite width="10" height="10" operator="over" />
  <feTile result="a" />
  <feComposite in="SourceGraphic" in2="a" operator="in" />
  <feMorphology operator="dilate" radius="5" />
</filter>
```
---
<Demo src="/demos/mosaic/index.html" title="Mosaic"></Demo>
---
<Demo src="/demos/stickers/index.html" title="Mosaic"></Demo>
---
<!-- @theme="dark" -->
```html [] spotlight.svg
<feSpecularLighting
  result="lighting"
  in="blur"
  surfaceScale="5"
  specularConstant="0.5"
  specularExponent="120"
  lighting-color="#ffffff"
>
  <fePointLight x="50" y="50" z="300"></fePointLight>
</feSpecularLighting>
```
---
<!-- @theme="dark" -->
<Demo src="/demos/lighting/index.html" title="Lighting"></Demo>
---
<!-- @theme="dark" -->
<Demo src="/demos/glass/index.html" title="Liquid Glass"></Demo>
<BrowserSupport className="fixed top-4 right-4"  properties="css.properties.backdrop-filter" captions="backdrop-filter"></BrowserSupport>
---
<Demo src="/demos/liquid-toggle/index.html" title="Liquid Glass"></Demo>
---
<h2 class="quote">
  Transitioning height.
</h2>
---
<Demo src="/demos/sidebar/index.html" title="Sidebar"></Demo>
---
```css []
li > div[inert] { grid-template-rows: 0fr; }
li > div {
  grid-template-rows: 1fr;
  transition: grid-template-rows .26s;
}
```
<BrowserSupport className="fixed top-4 right-4" properties="html.global_attributes.inert" captions="inert"></BrowserSupport>
---
<Demo src="/demos/exclusive-details/index.html" title="Exclusive Details"></Demo>
---
```html [2]
<section role="group">
  <details name="accordion">
    <summary>Exclusive</summary>
    <span
      >Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae
      et sed consectetur aperiam repellendus, accusantium, facere id earum
      omnis autem aspernatur perferendis labore ad obcaecati eveniet quasi
      fuga nemo qui.</span
    >
  </details>
```
```css []
details {
  interpolate-size: allow-keywords;
}
details::details-content {
  transition: content-visibility, opacity, height, background, filter, translate;
  transition-behavior: allow-discrete;
}
[open]::details-content {
  height: fit-content;
}
```
<BrowserSupport className="fixed top-4 right-4" properties="css.properties.interpolate-size,css.selectors.details-content" captions="interpolate-size,:details-content"></BrowserSupport>
---
<Demo src="/demos/apple-disclosures/index.html" title="Apple Disclosures" />
---
<h2 class="quote">
  Transitioning display: none.
</h2>
---
<Demo windowed="true" src="/demos/entry-exit-dialog/index.html" title="Dialog @starting-style" />
---
```css [] dialog.css
/* The "magic" piece powered by custom properties */
dialog {
  --present: 0;
  opacity: var(--present);
  filter: blur(calc((1 - var(--present)) * 10px));
  translate: 0 calc((1 - var(--present)) * 50%);

  /* Acts like a hold animation */
  transition-property: display, overlay, translate, opacity, filter;
  transition-duration: 0.875s;
  transition-behavior: allow-discrete;

  /* Define with some nesting */
  &[open] {
    --present: 1;
    display: flex;

    @starting-style {
      --present: 0
    }
  }
}
```
<BrowserSupport className="fixed top-4 right-4"  properties="css.at-rules.starting-style" captions="@starting-style" />
---
<h2 class="quote">
  Popovers & Anchor Positioning.
</h2>
---
```html [] popover.html
<!-- Trigger -->
<button popovertarget="context" id="trigger" popovertargetaction="toggle">
  Open Menu
</button>
<!-- Popover -->
<nav id="context" anchor="trigger" popover="auto">
  <ul>
    <li><a>Go to artist</a></li>
  </ul>
</nav>
```
```css [] popover.css
#pop {
  transition-property: display, overlay, scale, opacity;
  transition-duration: 0.5s;
  transition-behavior: allow-discrete;
  &:popover-open {
    opacity: 1;
    scale: 1;
    @starting-style {
      opacity: 0;
      scale: 0.9;
    }
  }
}
```
<sub>Light dismiss. Auto focus. No z-index issues.</sub>
<BrowserSupport className="fixed top-4 right-4"  properties="css.selectors.popover-open" captions="Popover" />
---
<Demo src="/demos/anchor-positioning-album/index.html" title="Anchor Positioning 2024" />
---
```css [] anchor.css
[popovertarget] {
  anchor-name: --trigger;
}
[popover] {
  position-anchor: --trigger;
  top: anchor(bottom);
  left: unset;
  right: anchor(right);
  position-try-fallbacks: flip-block, flip-inline;
}
```
<sub>No JavaScript necessary, aside from the dragging</sub>
<BrowserSupport className="fixed top-4 right-4"  properties="css.types.anchor" captions="Anchor Positioning" />
---
<!-- @theme="dark" -->
<Demo src="/demos/cyber-popover/index.html" title="Scroll Select" />
---
<Demo src="/demos/magnetic-links/index.html" title="Apple Disclosures"></Demo>
<sub className="fixed bottom-8 left-1/2 -translate-x-1/2 [&_a]:text-red-400">One of my Chrome demos raised [an issue](https://issues.chromium.org/issues/40248883) for getting transitions for anchoring.</sub>
---
<h2 class="quote">
  Styleable select.
</h2>
---
<Demo src="/demos/drop-down/" title="Drop Down" />
---
```css []
select,
::picker(select) {
  appearance: base-select;
}
::picker(select) {
  top: anchor(bottom);
  width: anchor-size(width);
}
```
<BrowserSupport className="fixed top-4 right-4"  properties="css.selectors.popover-open,css.types.anchor,css.properties.offset-path" captions="Popover, Anchor Positioning, Offset Path"></BrowserSupport>
---
<!-- @theme="dark" -->
<Demo src="/demos/scroll-select/" title="Scroll Select" />
---
<Demo src="/demos/parachute-bears/" title="Parachute Bears" />
---
<h2 class="quote">
  Popovers in disguise.
</h2>
---
<Demo src="/demos/animated-disclosure/index.html" title="Animated Disclosures" />
---
```css [] disclosure.css
[popover] {
  position-anchor: --control;
  width: anchor-size(width);
  height: anchor-size(height);

  &:popover-open {
    height: 300px;
    width: 320px;

    @starting-style {
      width: anchor-size(width);
      height: anchor-size(height);
    }
  }
}
```
<sub>Anchor the Popover to the button and FLIP it.</sub>
<BrowserSupport className="fixed top-4 right-4"  properties="css.types.anchor-size" captions=" anchor-size" />
---
<Demo src="/demos/osx-downloads/" title="OSX Downloads Menu"></Demo>
---
```css [] arc.css
[popover] {
  position-anchor: --anchor;
  bottom: anchor(top);
  left: anchor(center);
}
[popover] .arc {
  position: absolute;
  height: calc(var(--height, 150) * 1vh);
  width: calc(var(--width, 120) * 1vw);
  border-radius: calc(var(--radius) * 1%);
}
[popover]:popover-open .arc li {
  offset-distance: calc(-24% + (var(--index) * 80px));
  offset-path: border-box;
  offset-anchor: 50% 0;
  transition: offset-distance 0.875s var(--spring-ease);
  @starting-style {
    offset-distance: -24%;
  }
}
```
<BrowserSupport className="fixed top-4 right-4"  properties="css.selectors.popover-open,css.types.anchor,css.properties.offset-path" captions="Popover, Anchor Positioning, Offset Path" />
---
```css [] dock-magnifier.css
:root {
  --lerp-0: 1;
  --lerp-1: calc(sin(30deg));
  --lerp-2: calc(sin(20deg));
}
.blocks {
  display: flex;
}
.block {
  flex: calc(0.2 + (var(--lerp) * 1.5));
}
.block__item {
  translate: 0 calc(var(--lerp) * -75%);
}
.block:hover {
  --lerp: var(--lerp-0);
}
.block:has(+ .block:hover),
.block:hover + .block {
  --lerp: var(--lerp-1);
}
.block:has(+ .block + .block:hover),
.block:hover + .block + .block {
  --lerp: var(--lerp-2);
}
```
<BrowserSupport className="fixed top-4 right-4"  properties="css.selectors.has,css.types.sin" captions=":has(), sin()" />
---
<Demo src="/demos/scroll-introduction/" title="Scroll Introduction" ></Demo>
---
```css [] scroll-hello-world.css
img {
  animation: reveal both linear;
  animation-timeline: view();
  animation-range: entry;
}
@keyframes reveal {
  0% {
    scale: 0;
  }
}
```
<Demo src="/demos/view-timeline-basic/" title="View Timeline Basic"></Demo>
<BrowserSupport className="fixed top-4 right-4"  properties="css.properties.view-timeline" captions="view-timeline" />
---
<Demo windowed="true" src="/demos/playbook-scroll/" title="You can scroll" ></Demo>
---
<Demo windowed="true" src="/demos/you-can-scroll/" title="You can scroll" ></Demo>
---
<Demo windowed="true" src="/demos/knockout-scroller/" title="Knockout scroller" ></Demo>
---
<!-- @theme="dark" -->
<Demo src="/demos/scroll-to-type/" title="Scroll to type" ></Demo>
---
<Demo windowed="true" src="/demos/scroll-micro-header/" title="Scroll Micro Header" ></Demo>
---
```css [] scroll-parallax.css
.avatar {
  animation: scale-down both ease-in-out;
  animation-timeline: scroll(root);
  animation-range: calc(var(--header-height) * 0.5) var(--header-height);
}
@keyframes scale-down {
  to {
    scale: 0.35;
    translate: 0 -50%;
  }
}
```
<BrowserSupport className="fixed top-4 right-4"  properties="css.properties.scroll-timeline" captions="scroll-timeline" />
---
<!-- @theme="dark" -->
<Demo windowed="true" src="/demos/scroll-index/" title="Scroll index" ></Demo>
---
<!-- @theme="dark" -->
<Demo windowed="true" src="/demos/scroll-goo/" title="Scroll Goo" ></Demo>
---
<h2 class="quote">
  Sliders.
</h2>
---
<!-- @theme="dark" -->
<Demo src="/demos/balance-sliders/index.html" title="Balance Sliders" />
---
```css [] balance-slider.css
@property --slider-complete {
  initial-value: 0;
  syntax: "<number>";
  inherits: true;
}

@keyframes sync { to { --slider-complete: 1; }}

.slider {
  timeline-scope: --thumb;
  animation: sync both linear reverse;
  animation-timeline: --thumb;
  animation-range: contain;
}

.slider [type="range"]::-webkit-slider-thumb {
  view-timeline: --thumb inline;
}
/* Wrapper elements */
.slider__track {
  transform-origin: 0 50%;
  scale: var(--slider-complete) 1;
}
```
<BrowserSupport className="fixed top-4 right-4"  properties="css.properties.timeline-scope" captions="timeline-scope" />
---
<Demo src="/demos/liquid-slider/index.html" title="Liquid Slider"></Demo>
---
<h2 class="quote">
  Put it all together.
</h2>
---
<!-- @theme="dark" -->
<Demo src="/demos/scroll-driven-carousel/index.html" title="Scroll Driven Carousel" />
---
<!-- @theme="dark" -->
<video className="rounded-lg max-w-prose w-full mx-auto" src="/videos/scroll-carousel.mp4" autoplay muted loop></video>
---
<!-- @theme="dark" -->
<video className="w-1/2 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" src="/videos/ios-barrel.mp4" loop autoplay muted></video>
---
<!-- @theme="dark" -->
<Demo src="/demos/ios-barrel/index.html" title="ios barrel"></Demo>
---
## &lt;/Sprint&gt;
<Demo src="/demos/matter-words/" title="Matter words"></Demo>
