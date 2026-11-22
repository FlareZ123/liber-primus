# LP2 p3–p22 original-artwork inventory

## Scope and source coordinates

This is a bounded, source-first visual inventory of LP2 pages p3, p5–p6, p8, p10–p14, and p16–p21, using the original 2400×3600 JPEGs in `resources/liber-primus/`. The combined 75-image archive places LP2 page (p) at image filename (p+17). Exact source files inspected:

- p3: `20.jpg`
- p5–p6: `22.jpg`, `23.jpg`
- p8: `25.jpg`
- p10–p14: `27.jpg`–`31.jpg`
- p16–p21: `33.jpg`–`38.jpg`

The inventory is intentionally limited to three visible feature groups. No cipher-family sweep or generic steganography search was run.

## 1. Scroll/bracket ornaments on p3, p5, p6

The three pages use a repeated four-curl margin ornament: paired spiral-like forms at the left and right margins, vertically framing the text. p5 and p6 have pixel-identical left-margin crops after grayscale conversion at crop box `(0,400)-(450,3200)`; p3 uses a similar but non-identical rendering. The motif is therefore a reusable page illustration, not a page-specific variable.

**Plausible human observation:** the curls resemble spirals or brackets and could prompt a solver to consider an inside-out or spiral reading, or to treat the text as a bracketed block.

**Why this does not select an operation:** the pages supply no marked start, handedness, traversal direction, number of turns, or explicit mapping from the ornament to rune positions. A spiral/bracket interpretation therefore leaves the key coordinates and receiver unconstrained. The strongest rival is decorative framing.

## 2. Bare-tree ornament on p8, p10–p12, p14

A bare tree with visible branches and roots appears in the left margin on p8, p10, p12, and p14; p11 carries a visually mirrored copy on the right. p10, p12, and p14 have pixel-identical grayscale crops at `(0,450)-(520,3000)`. p8 is a different tree rendering. p13 has no tree illustration. The repeated art is thus a reusable ornament with a layout-side variation, not a distinct tree encoding on each page.

**Plausible human observation:** roots and branches could suggest a rooted tree, branching path, or traversal.

**Why this does not select an operation:** the illustration labels no nodes, edges, branch order, root, leaves, or traversal convention. It gives no modulus, key, starting point, or receiver. A tree traversal, root extraction, or graph-walk would require analyst-chosen details not supplied by the page. The strongest rival is decorative margin art, supported by the exact repeated crops and p11 mirroring.

## 3. Isolated winged insect on p14

p14 contains one winged, long-tailed insect drawing in the lower-right area (approximate connected dark-ink bounding box: `x=1043..1816, y=2115..2569` in the 2400×3600 source image). It is visually distinct from the large cicada illustration on terminal p55; no repeated instance or accompanying label, arrow, or numerical annotation appears in the audited pages.

**Plausible human observation:** an insect might suggest Cicada, emergence, metamorphosis, or a life-cycle reference.

**Why this does not select an operation:** the image does not establish a species, cycle length, direction, key, or correspondence to a ciphertext span. No source-visible rule turns the insect into a reversible transformation. Treating it as a specific species or lifecycle instruction would be conjectural.

## Plain-text controls: p16–p21

p16–p21 are plain text pages in the inspected images: no additional illustration or distinctive marginal object supplies a visual selector. Their regular page layout does not by itself identify a transposition width, reset, or cipher operation.

## Decision

**Bounded negative: no source-selected reversible route is supported by these three visual feature groups.** The scrolls can suggest spirals/brackets, the trees can suggest roots/branches, and the p14 insect can suggest an insect/lifecycle theme, but none fixes an executable operation, coordinates, key source, and untouched ciphertext prediction. The repeated-art controls favor decoration/layout over a cipher instruction.

Do not fund generic spiral traversals, tree traversals, biological-cycle keys, or further image-byte searches from these observations alone. Reopen only if an independent Cicada source fixes the missing operation and receiver, or if a new page-specific visual difference is found.
