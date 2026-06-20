# Adding real photos

The site ships with styled placeholders for four image areas. To use real
photographs, drop your files in this `images/` folder and point each slot at them.

There are two ways to wire an image in.

## Option A — edit the HTML directly (simplest)

In `index.html`, find the placeholder `<figure class="img-slot" ...>` for the slot
you want and put an `<img>` as its first child. The CSS already makes an `<img>`
inside `.img-slot` cover the area:

```html
<figure class="img-slot" data-img-slot="hero" style="position:absolute;inset:0;width:100%;height:100%">
  <img src="images/hero.jpg" alt="The Kanchenjunga range above Limbuwan">
  <div class="img-slot__inner">…</div>   <!-- you can delete this placeholder line -->
</figure>
```

## The four slots

| `data-img-slot` | Where it appears        | Suggested aspect | Suggested file        |
| --------------- | ----------------------- | ---------------- | --------------------- |
| `hero`          | Full-screen hero        | wide / landscape | `images/hero.jpg`     |
| `yuma`          | Yuma Sammang section    | 4 : 5 portrait   | `images/yuma.jpg`     |
| `dance`         | Dance & Drum section    | 5 : 4 landscape  | `images/dance.jpg`    |
| `tongba`        | Tongba section          | 5 : 4 landscape  | `images/tongba.jpg`   |

Tips:
- Keep files reasonably sized (ideally under ~500 KB each, max ~2000 px on the long
  edge) so the page loads fast.
- Always write a meaningful `alt` description for accessibility.
- The hero already has an illustrated Himalayan mountain backdrop, so it looks
  complete even without a photo — a hero image is optional.

> The reference maps that were pasted into the original design canvas live in
> `design-source/uploads/`. They are maps, not photos, so they are **not** wired into
> these photo slots, but they are kept there for reference.
