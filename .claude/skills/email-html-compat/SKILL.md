---
name: email-html-compat
description: Rules for generating HTML that renders correctly across email clients (Gmail, Outlook desktop, Apple Mail, mobile). Load before editing src/utils/export.ts or adding a block's export renderer.
---

# Email HTML compatibility

The exporter (`src/utils/export.ts`) targets the lowest common denominator:
Outlook desktop (Word rendering engine), Gmail web/app (strips `<style>` in
some contexts, no `<head>` fonts), Apple Mail, and Android/iOS clients.

## Structure

- Tables only for layout: `<table role="presentation" cellpadding="0" cellspacing="0" border="0">`.
  Use the shared `TABLE` attribute string. Never use flexbox, grid, `position`,
  `float` or `<div>` widths for layout.
- Every content block is wrapped by `wrap(inner, padding, align)` which yields
  a single-cell table carrying the block's outer padding and alignment.
- Rows: outer 100% table (row background) → cell with row padding →
  MSO conditional fixed-width table → inner `class="container"` table with
  `max-width: contentWidth` → one `<td>` per column with `width="N%"` AND
  `style="width:N%"`.
- Column cells get `class="stack"` when the row's `stack` flag is on; the media
  query in `<head>` turns them into `display:block; width:100%` on small screens.

## Styling

- Inline every style. The `<style>` block is only for resets, the link colour
  and the mobile media query; assume it may be dropped.
- Set colours twice where Outlook cares: `bgcolor="#hex"` attribute AND
  `background-color` in style. Use `bgAttr()` and `rgbaToCss()`.
  Transparent colours (alpha 0) must emit nothing, not `#rrggbb00`.
- Always emit 6-digit hex. No `rgba()`, no CSS variables, no `rem`/`em`, no
  shorthand `font:`.
- Fonts: emit the full stack (`Arial, Helvetica, sans-serif`). `'inherit'` on
  a block means "use the canvas font", resolve it with `resolveFont`.
- Text colour `inheritColor: true` resolves to the canvas colour via `resolveColor`.
- Border radius, `background-size`, and `background-image` on `<td>` do not
  render in Outlook desktop; treat them as progressive enhancement and provide a
  plain fallback (the video block shows the pattern with `<!--[if mso]>`).

## Per-device visibility

- Every content wrapper table and row table may carry `class="hide-mobile"`
  and/or `class="hide-desktop"` via `visibilityClass(p)`.
- `hide-desktop` blocks are hidden by default with inline
  `display:none;max-height:0;overflow:hidden;mso-hide:all` and re-shown in the
  media query (`display:table !important`, `div.hide-desktop` gets `block`).
  Outlook desktop ignores media queries, so mobile-only content never shows
  there and desktop-only content always does; that is expected.

## Images and media

- `<img>` must have `display:block`, `border:0`, explicit `width` attribute in
  px when the width is known, `max-width:100%; height:auto` in style, and `alt`.
- Never emit SVG or `data:` URIs in real output. The editor placeholder
  (`PLACEHOLDER_IMAGE`) is a data URI; users must supply hosted URLs.
- Video cannot play in email: render a poster image linking to the video URL.
  `videoThumbnail()` derives YouTube/Vimeo posters.
- Social icons without a custom `iconUrl` are rendered as coloured table cells
  with a short label, which is universally supported and needs no hosting.

## Buttons and links

- Buttons: table cell with `bgcolor` + `border-radius`, containing an
  `<a style="display:inline-block; padding:…">`. Padding on the `<a>` gives the
  clickable area in Gmail; the cell colour gives the shape in Outlook.
- Escape every user-supplied attribute value with `escapeHtml()`. Rich-text
  bodies (Heading/Text/List/HTML) are emitted raw on purpose.

## Head

- Keep the `<!DOCTYPE html>`, `xmlns:v`/`xmlns:o` namespaces, the
  `x-apple-disable-message-reformatting` meta, and the `OfficeDocumentSettings`
  XML. They fix scaling on Apple Mail and DPI in Outlook.
- Preheader: hidden `<div>` right after `<body>`, padded with `&#847;&zwnj;&nbsp;`
  so inbox previews do not pull in body text.

## Checking a change

Run `exportHtml(template.build())` for each entry in `src/utils/templates.ts`
in Node (see `email-builder-dev` for the esbuild recipe) and eyeball the output.
If a real client test is possible, the cheapest check is pasting the HTML into
an `.eml` and opening it in Outlook desktop and the Gmail app.
