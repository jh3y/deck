<h2 className="quote">
  Border styles.
</h2>
---
<!-- @theme="dark" -->
```css [] masked-border.css
article {
  background:
    linear-gradient(var(--bg), var(--bg)) padding-box,
    radial-gradient(
        100px 100px at calc(var(--x) * 1px) calc(var(--y) * 1px),
        red 75%,
        transparent
      )
      border-box,
    hsl(0 0% 50% / 0.5);
  background-blend-mode: hard-light;
  background-attachment: fixed;
  border: 4px solid transparent;
}
```
<BrowserSupport className="fixed top-4 right-4" properties="css.properties.background-origin,css.properties.background-clip," captions="background-origin,background-clip" />
---
<!-- @theme="dark" -->
<Demo windowed="true" src="/demos/gradient-border/index.html" title="Gradient Borders" />
---
<!-- @theme="dark" -->
```css [] masked-border.css
/* use a reusable pseudo element */
article::after {
  border: 4px solid transparent;
  background: var(--my-pointer-tracking-background);
  mask:
    linear-gradient(#0000, #0000),
    linear-gradient(#000, #000);
  mask-clip: padding-box, border-box;
  mask-composite: intersect;
}
```
<BrowserSupport className="fixed top-4 right-4" properties="css.properties.mask-composite" captions="mask-composite" />
---
<!-- @theme="dark" -->
<Demo width="100" windowed="true" src="/demos/glow-card/index.html" title="Glow Card" />
---
<h2 className="quote">
  Animate it.
</h2>
---
<!-- @theme="dark" -->
<Demo windowed="true" src="/demos/border-glow-styles/" title="Border Glow Styles" />
---
```css [] animated-mask.css
@property --mask {
  initial-value: 0deg;
  syntax: "<angle>";
  inherits: true;
}

.gradient::after {
  mask: linear-gradient(#0000, #0000),
    linear-gradient(#000, #000),
    conic-gradient(
      from var(--mask, 0deg),
      #0000, #000 25%, #0000 25%
    );
  mask-clip: padding-box, border-box, border-box;
  mask-composite: intersect;
  animation: mask-rotate 6s infinite linear;
}

@keyframes mask-rotate {
  to {
    --mask: 360deg;
  }
}
```
<BrowserSupport className="fixed top-4 right-4" properties="css.at-rules.property" captions="@property" />
---
```css [] offset-path.css
.border::after {
  offset-path: xywh(0 0 100% 100% round 12px);
  offset-anchor: 100% 0;
  animation: journey 6s infinite linear;
}

@keyframes journey {
  to {
    offset-distance: 100%;
  }
}
```
<BrowserSupport className="fixed top-4 right-4" properties="css.properties.offset-path" captions="offset-path" />
