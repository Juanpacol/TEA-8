# TEA-8 landing page

A living document. It describes how the project's commercial page is divided, what each section says and what is missing. Updated with each version.

The page itself is in English, because the hackathon submission requires English in all linked material.

## Principles

1. A single page, no login or accounts.
2. Each section answers a visitor's question, in this order: what is the problem, what does TEA-8 do, how does it work, why trust it, how does it look.
3. No claim without backing: what the page says, the tool really does, and the numbers come from verified sources.
4. The page supports the tool and does not replace it. The tool is the most important section.

## Structure reference

The structure is inspired by the Ether landing page, an earlier project by the author for another hackathon. The way sections are divided is taken. The text, images and code are new and are not copied. Ether is noted as a style reference in "References" at submission.

| Section in Ether | Question it answers | Equivalent in TEA-8 |
|---|---|---|
| Hero | What is this about? | Hero |
| Problem and solution | Why does it matter? | The problem |
| How it works (4 steps) | What does it do inside? | How it works |
| Safety ("we know when not to trust ourselves") | How far does it go, and where does it stop? | What it won't tell you |
| Demo | How does it look? | The tool |
| Open source | Can I inspect it? | Sources and code |
| Differentiators | Why does it hold up outside a demo? | Why it holds up |
| Call to action | What do I do now? | Call to action |

## Winners reference

How the 2025 winners present and sell their project, what is adopted in TEA-8 and the submission page template: see [winners-reference.md](winners-reference.md).

## Sections

### 1. Hero
- Goal: say in one sentence what TEA-8 does and that it does not replace the farmer.
- Headline draft: "TEA-8 doesn't tell farmers what to plant. It shows them what the data says."
- Subtitle (one line, with a figure): "In 2012, summer soil wetness in McLean County, Illinois fell to 0.51 against an average of 0.66." Verify the figure before publishing. Source: NASA POWER, root-zone wetness, June to August.
- Button: "Open the tool", which scrolls to section 5.
- Image: a botanical illustration of corn and another of soybean, large, with a feathered edge.

### 2. The problem
- Goal: place the problem with a real number.
- Content: one big figure and two sentences. Example structure: "Corn and soybeans alternate on about 91% of year-to-year changes in the McLean County fields we sampled." Source: CropScape, 23 fields, 2008 to 2023. Make clear it is a sample.
- Idea it conveys: a region with two alternating crops and few options to diversify.

### 3. How it works
- Four steps, each with one short sentence. Draft:
  1. Reads the weather and the soil: NASA POWER, USDA soil survey.
  2. Looks at what grew: CropScape history by year.
  3. Compares three rotations, including the current one.
  4. Shows its work: every statement tagged with its source.
- Step numbers use low opacity, as in the style reference.

### 4. What it won't tell you
- Goal: the honesty section. It is what most differentiates the project.
- Content, as a checked list: it gives no final score and no "best option"; alternative rotations are hypothetical and rest on cited sources; climate data comes from a grid of about 50 km, not a plot; without real yields, the comparison measures stress and exposure, not outcomes.
- Only what is true at publication time is declared. If it changes, it is updated.

### 5. The tool
- The main section: a map with a year control, three rotation cards, an evidence panel and a fixed notice.
- Shown in a dark panel with the defined palette, inside the light page. It is the only strong contrast on the page.
- Note under the panel: data origin and the notice "A prototype built for the NASA Space Apps Challenge, not agronomic advice."

### 6. Sources and code
- List of sources with links: NASA POWER, NASA GIBS, USDA Soil Data Access, CropScape.
- Link to the public repository.
- SI/AI use statement, in one line and with a link to CONTRIBUTING.

### 7. Why it holds up
- Three to four points, each with concrete proof in the tool:
  - Says when it isn't sure.
  - Every claim shows its source.
  - Built on open, public data.
  - Doesn't need a login or a server to run.
- Each point stays only if it is true in the final product.

### 8. Call to action
- "Try the tool", a link to the repository and to the team page on Space Apps.
- Author name and contact, to be decided.

### Footer
- NASA and USDA data credits.
- A short list of image references with their licenses.
- Notice: "Created for the NASA Space Apps Challenge." Check the Space Apps brand guidelines before using their logo.

## Visual design

Decision still to confirm: a light, soft page, with the tool in a dark panel.

- Page background: a light, warm tone, similar to the reference. Images should blend into it.
- Images: radial gradient mask to fade the edges, a grayscale or soft tint filter, partial opacity on decorative ones.
- Depth: overlapping layers with images behind the text. It is not real 3D. If a parallax effect is wanted, it is an optional add-on.
- Typography: a serif for headlines, a condensed face for labels and a text face for reading. Chosen and tested before fixing them.
- Motion: soft appearance per section. Respect `prefers-reduced-motion`. At most three animations in the tool.
- Tool panel: TEA-8 dark palette (see README).

## Images to obtain

Each image is verified before use: license, author and source link. Noted in "References".

| Image | Use | Status |
|---|---|---|
| Botanical illustration of corn | Hero and section 2 | To find |
| Botanical illustration of soybean | Hero and section 2 | To find |
| Soil profile or roots | Section 3 | To find |
| NASA satellite image of the area (NDVI or true color) | Section 5 and background | To find |
| Project icon (red gerbera in a ring) | Header and footer | To create (visible watermark if made with an AI image tool) |

## Status and version log

| Version | Date | Change |
|---|---|---|
| 0.1 | Nov 13, 2026 | Structure and text drafts. No code. |

To do:
- [ ] Confirm the content of each section with final data.
- [ ] Verify each cited figure against its source.
- [ ] Obtain and verify the images.
- [ ] Decide typefaces.
- [ ] Build the minimal version first: hero, two images with a mask, and the tool.
- [ ] Check legibility on mobile and small screens.
- [ ] Add the references to CONTRIBUTING.
