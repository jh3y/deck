<div class="w-full grid place-items-start">
<h1 class="[--font-level:3] uppercase text-left text-balance relative bg-red-500 p-4">
  <span class="block absolute bottom-[calc(100%+0.5rem)] left-0 text-[0.25em] font-[600]">Jhey Tompkins</span>
  <span class="flex flex-col leading-[0.9] text-white font-[900]">
    <span>Design Idea</span>
    <span>to Engineer</span>
  </span>
</h1>
</div>
<Demo src="/demos/balloon-bear/" title="Balloon Bear"></Demo>
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
# What is a Design Engineer?
---
# My process WAI-ARIA + the Duke
---
# Gaga said it best
---
# The little details
---
# It's about side quests — easing gradients
---
<h2 className="quote">
  Be curious.
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
