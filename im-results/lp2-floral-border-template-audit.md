# LP2 pp40–55: one bilaterally mirrored, page-static floral border

**Current result, 12 November 2026, Agents 34 and 16.** The source border is a fixed original-artifact template, and its two sides are almost perfectly horizontally mirrored. Three pre-2014 ornamental-art source candidates have no distinctive visual junction match. The image therefore supplies a recognizable **reflection geometry**, but no authenticated artist, source text, reversible cipher instruction, key, or unknown plaintext. Repeated border dots cannot encode page-changing state.

## Original immutable observations

LP2 physical pp40–55 are archive images **57.jpg–72.jpg**. All 16 source JPEGs are different complete files of exactly 2400×3600 RGB. [Existing 16-image original-crop SFT](../sims/lp2_floral_border_template_sft.py) verifies:

| Native original crop | Bounding box (x0,y0,x1,y1) | Distinct decoded RGB crops across 16 pages | SHA-256 of crop bytes |
|---|---|---:|---|
| Entire left margin | (0,0,500,3600) | **1** | `52fe77caca9d6a8841acec9bb2dfa7a19fdfe2df727386fcfff3c81b365aa490` |
| Entire right margin | (1900,0,2400,3600) | **1** | `090a4a52e3188abc694b7a619c372eb14acca5c16df077153f6741ea9b599728` |
| Central control | (500,0,1900,3600) | **16** | Per-page hashes in the SFT |

Both complete side margins, including the five-dot ink groups, are exactly reused from page to page. In particular, different leaf tips, stem orientations, page-specific dot masks and hidden per-page states do not occur in these coordinates.

### The p55 13/31 circle motif is shared by all sixteen borders

The five-ring clusters described on physical p55 are at original coordinates left **x367–424/y1477–1540** and right **x1975–2032/y1477–1541**. Both lie entirely inside the byte-identical side strips above and therefore **occur unchanged on all p40–55**, including rune-free p50. Independent exact original-RGB crop hashes for the left `(355,1460,440,1560)` and right `(1950,1460,2050,1560)` each have **one distinct value across all sixteen** source JPEGs. Reading their shared hollow/filled centers in ordinary row order yields the candidate `01101₂=13` and `11111₂=31` on every page. The two pale rings are real image features, but **cannot independently point to p55, set a page-specific key, or favor the final tree page**. The distinct central p55 artwork and any separately argued p55 address remain potentially relevant. [Ten-center SFT](../sims/p55_binary_ornaments.py) checks all sixteen source margins; [interpretation and limits](red-microdot-motif-inventory.md).

## A new, independent geometric property: the right is a mirror of the left

The left and right decoded RGB bytes are different, but this does not mean that their underlying artwork differs. Read the original archive **59.jpg** (physical p42) without cropping beyond the fixed 500-pixel side strips. Convert each to grayscale and make an ink mask using a predetermined threshold **pixel intensity less than 180**. Compare the left mask to the right under only the source-visible bilateral reflection and three exact geometric controls, with no rotation/scaling/registration/threshold fitting.

| Right-margin orientation against original left | Ink-pixel intersection/union | IoU | F1 |
|---|---:|---:|---:|
| Unchanged | 17,299 / 235,090 | 0.07358458 | 0.13708204 |
| **Horizontal mirror** | **125,046 / 127,343** | **0.98196210** | **0.99089897** |
| Vertical mirror | 18,348 / 234,041 | 0.07839652 | 0.14539461 |
| Both reflections (180°) | 17,418 / 234,971 | 0.07412830 | 0.13802503 |

There are 125,798 left and 126,591 right dark pixels in the two native 500×3600 strips. The horizontal pairing recovers **125,046 matching dark pixels**, over 99% of the smaller ink mask. Since these original strips remain byte-for-byte unchanged on all sixteen pages, the mirror property generalizes to every page in this block. The tiny difference is compatible with independently JPEG-compressed edge pixels and dots, without establishing the original drawing/vector pipeline. No spatial scaling, crop tweaking or selection over other pages was performed.

**Reproducer:** [fixed original-JPEG 16-page plus exact four-control SFT](../sims/lp2_floral_border_mirror_source_sft.py). The measurement also ran on the original supplied JPEGs in the local runtime, and [the manual original-source CI regression passed](https://github.com/FlareZ123/liber-primus/actions/runs/43125999759) under Python 3.12 with Pillow.

This is a human-visible **reflective** design choice, consistent with putting a flipped copy of one decorative stem on opposite sides of a text column. It does not uniquely specify Atbash, reversed page order, book-page folding, alternating sign, byte reflection or any particular hidden transform. No cipher or plaintext is inferred from this geometry alone.

## Finite pre-2014 ornamental-source comparison (Director Issue #434)

Original left-side motif traits: broad **open spiral near its upper tip**, thin branching tree-like stems, an open large middle coil, a cluster of pointed leaves, roots spreading at the base, and no grape cluster or large flower blossom. We selected three documented period printing/design comparators because they are actual published **pre-2014** botanical vine/scroll illustrations of the relevant visual class:

| Candidate published source | Independent historical evidence | Critical distinctive difference |
|---|---|---|
| **Franz Sales Meyer, *Handbook of Ornament*, 1904**, Roman [“Scroll Ornament Vine”](https://etc.usf.edu/clipart/59300/59345/59345_scroll_vine.htm), ClipArt ETC | Public educational scan explicitly labels a Roman relief pattern and identifies the 1904 source book | The relief is a repeated continuous classic vine-scroll, rather than LP2's isolated rooted stem with open broad upper coil |
| **William Morris, two border designs, 1894**, [Victoria and Albert Museum image reproduced by Victorian Web](https://victorianweb.org/painting/morris/drawings/2.html) | The original ink designs are documented as vine leaves, grapes and entwining tendrils | Dense grapevine-and-leaf intersections absent in the LP2 border; no matching branch/root outline |
| **Brothers Dalziel, vine-leaf title-page border for *Good Words* 1872**, recorded in [*A Record of Fifty Years' Work* (1901)](https://www.fromoldbooks.org/Dalziel-RecordOfWork/pages/000-front-cover-good-words-1872/) | The plate is explicitly identified as an engraved vine-leaf and fruit border | Continuous grape/fruit foliation differs from LP2's bare spiral, pointed leaves and roots |

**Negative scope:** this is finite *visual source screening*, based on historical source reproductions rather than original-sized downloaded/computationally registered plates. These comparators are visibly different at the defining stem-and-root junctions; there is **no identified near-exact transferred period engraving** and no exact associated text/page caption to use as a crib. It would overstate the evidence to exclude all Victorian, Art Nouveau, medieval or online clip-art sources. Modern generic stock/vector previews are not independent historical sources, so they do not count as matches.

## Decision and next action

The exact template reuse, complete bilateral mirror and the mismatch to these three historical examples support the economical interpretation of a **single reusable mirrored decorative frame**. The established positive property is its horizontal reflection; the hypothesis that an external source once supplied a reading instruction remains unproved.

Retire page-specific floral-dot keys or hidden margin variations. Do not open a new Atbash/rotation sweep solely because the border is mirrored: any source-selected reversal would still need a key or an independently held-out plaintext prediction. Reopen this branch only if a specific pre-2014 illustration is recognized by distinctive junctions **and** its title/caption/associated text provides a player-actionable operation for the adjacent p40–55 text.
