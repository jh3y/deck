<div class="w-full grid place-items-start">
<h1 class="[--font-level:3] uppercase text-left text-balance relative bg-red-500 p-4">
  <span class="flex flex-col leading-[0.9] text-white font-[900]">
    <span>Design Idea</span>
    <span>to Engineer</span>
  </span>
</h1>
</div>
<Demo src="/demos/balloon-bear/" title="Balloon Bear"></Demo>
---
<!-- @theme="dark" -->
<Demo src="/demos/trading-card/" title="Trading Card"></Demo>
---
<button style="border: revert; background: revert; padding: revert;">Sweat.</button>
---
<video autoplay muted loop src="/videos/tik-toggle.mp4" loading="lazy" />
---
<Demo src="/demos/day-night-toggle/index.html" title="Day and Night Toggle" />
---

```html [] toggle.html
<button
 class="theme-toggle"
 aria-pressed="true">
   <!-- A whole lotta SVG -->
   <span class="sr-only">Toggle theme</span>
</button>
```

```css [] toggle.css
.theme-toggle {
  container-type: inline-size;
}
.theme-toggle__indicator {
  transition: translate var(--speed) var(--slide-ease);
  translate: calc(var(--dark, 0) * (100cqi - 100%)) 0;
}
.theme-toggle[aria-pressed=true] {
	--dark: 1;
}
```

<BrowserSupport className="fixed top-4 right-4" properties="css.properties.custom-property,css.at-rules.container" captions="custom properties,@container" />
---
<img src="/images/peter-sees-button.png" class="w-[600px] max-w-full"/>
<!--
<video autoplay muted loop src="/videos/fury-faceoff.mp4" loading="lazy" />
-->
---
<!-- @theme="dark" -->
<Demo src="/demos/golden-era/index.html" title="It's a golden era" />
---
<Demo src="/demos/trombone-bear/index.html" title="Trombone Bear" />
---
<div class="text-left font-serif fluid font-[400]">
  <h1 class="font-serif font-[400] font-2xl mb-2" style="--fluid-max: 80">Design Engineer</h1>
  <h2 class="font-serif font-[300]" style="--fluid-max: 30">[duh-zine en-juh-neeuh]: noun</h2>
  <hr class="my-6 h-2"/>
  <p class="fluid font-[300] font-serif italic leading-[1.5]" style="--font-level: 1.2"><span class="line-through">Taste.</span> Make cool stuff with care and quality.</p>
  <p class="fluid font-[300] font-serif italic leading-[1.5]" style="--font-level: 1.2">Put it on the internet.</p>
</div>
---
<Demo src="/demos/duke-ellington/index.html" title="Duke Ellington" />
---
<!-- @theme="dark" -->
<div class="flex items-center">
  <blockquote data-quote="true" class="quote bottom-[14rem] left-0 text-left absolute z-20 fluid after:content-[''] after:inset-0 after:fixed after:bg-black after:opacity-50 after:-z-20" style="--font-level: 3.4">
    caring about craft really matters... practice the simple things — <span class="italic">Lady Gaga</span>
  </blockquote>
  <img class="inset-0 h-full w-full object-bottom fixed object-cover"  src="/images/gaga.png" alt="Lady Gaga">
</div>
---
<h2 className="quote">
  Practice the "little details".
</h2>
---
<Demo src="/demos/intention-of-hover/index.html" alt="Intention of hover" />
---
<Demo src="/demos/variant-picker-follow/index.html" alt="Intention of hover" />
---
<Demo src="/demos/password-input/index.html" alt="Passcode Reveal" />
---
<Demo src="/demos/flip-to-tip/index.html" alt="Passcode Reveal" />
---
<Demo src="/demos/add-to-cart/index.html" alt="Passcode Reveal" />
---
<h2 className="quote">
  Take on "side quests".
</h2>
---
<Demo src="/demos/gradients-suck/index.html" alt="Gradients suck."/>
---
<Demo src="/demos/trackpad-concept/index.html" alt="Gradients suck."/>
---
<Demo src="/demos/bezier-control/index.html" alt="Gradients suck."/>
---
<Demo src="/demos/easing-controls/index.html" alt="Gradients suck."/>
---
<h2 className="quote">
  Be curious. Stack your tool belt.
</h2>
---
<!-- @theme="dark" -->
<Demo src="/demos/field-sizing/index.html" title="Field Sizing" />
---
<!-- @theme="light" -->
```css [2>5,6] textarea.css
textarea {
	field-sizing: content;
	min-height: 2lh;
	max-height: 8lh;
	scrollbar-color: var(--accent) transparent;
	scrollbar-width: thin;
}
```
<div className="fixed top-4 right-4 flex flex-col gap-y-2">
<BrowserSupport properties="css.properties.field-sizing,css.properties.scrollbar-color" captions="field-sizing,scrollbar-color"></BrowserSupport>
</div>
