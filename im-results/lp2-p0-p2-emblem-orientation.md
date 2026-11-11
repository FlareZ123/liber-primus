# Original LP2 pp0–2 three-bar emblem: 180° orientation source gate

**Status: original-image source observation; no recovered unknown plaintext, key, or decoder.** This report separates a measurable original visual relation from a speculative cipher instruction. It is not evidence that the author intended text reversal.

## Source and question

The 2014 LP2 physical pages 0, 1 and 2 correspond to original archive scans `17.jpg`, `18.jpg`, `19.jpg` in `resources/liber-primus/`. All show a large asymmetrical three-bar cross/sword graphic. Page 0 displays it to the left of the text, page 1 to the left, and page 2 to the right with its tip downward. Could the apparent inversion be a reproducible graphical transform rather than separate drawings?

The source-frozen image regions are p0 and p1 `x=0:800,y=1400:3100`, p2 `x=1800:2399,y=500:2050`. Use grayscale threshold `<100`, take the largest eight-connected black component of each region, crop to its tight bounding box, and compare overlaps under native-pixel translation. The reproducible SFT is [`sims/lp2_p0_p2_emblem_orientation_sft.py`](../sims/lp2_p0_p2_emblem_orientation_sft.py). This is an image registration comparison, not a plaintext-selected fit.

## Original-source results

| Comparison | Operation on second mask | IoU of dark pixels | Native-pixel offset (x,y) |
| --- | --- | ---: | --- |
| p0 against p1 | Unchanged | **0.96239975** | (0,13) |
| p1 against p2 | Unchanged | 0.26959309 | (−50,47), search boundary |
| p1 against p2 | **Rotate 180°** | **0.98472382** | **(0,0)** |
| p0 against p2 | **Rotate 180°** | **0.96256031** | (0,13) |

The strongest match is a **180°-rotated, unscaled, zero-shift** p2 component against p1. Its black-area intersection is **146,972 pixels**, with areas **148,040** and **148,184**; only **2,280** pixels differ in the union's aligned symmetric difference. The weaker p0 alignment includes a 13-pixel vertical offset and localized artwork differences. These figures establish a reused reversed graphic at original source resolution. Minor strokes differ; they have not been independently shown to encode data. The unrotated p1–p2 match is limited to the stated translation search, so it should not be read as a global all-registration optimum.

## Ciphertext implication and next decision

The original p1 and p2 contain respectively **266** and **201** GP29 runes. Their longest *literal contiguous* shared ciphertext run is only **three runes**, both for original order and when p2 is reversed. This is ordinary among the **1,485** different-page pair comparisons: across all 55 nonempty unsolved pages, the longest forward exact common substring is two runes for 200 pairs, three for 1,173, four for 107, five for four, and six for one. This addresses only an exact direct-copy/reversal interpretation, not unknown-key encryption or more general transformed matches.

Their GP29 indices of coincidence are **0.03455809** (p1) and **0.03562189** (p2); reversing a text or applying any fixed alphabet permutation preserves this statistic. A bare instruction to flip the second page therefore does not extract native-GP English. This is an established algebraic limitation, rather than a solution-specific cryptanalytic result.

**Plausible alternative:** the creator reoriented shared decorative artwork to balance the page layout; no text operation follows. To promote a decipherment route, require an *independent* source cue that connects orientation to a precise, invertible operation and supplies an exact original-ciphertext prediction beyond the visible graphic. Until then, avoid launching a broad family of reverse/Atbash/shift tests or treating the illustration as key material. This bounded finding does not change the authoritative unresolved status in `results/README.md`.
