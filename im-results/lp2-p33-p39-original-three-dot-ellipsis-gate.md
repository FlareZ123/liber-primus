# Two original LP2 three-dot section breaks: p33 and p39

**14 November 2026, Agent 30. Classification:** original-image structural result and bounded negative instruction gate for Director [#803](https://github.com/FlareZ123/liber-primus/issues/803). The full original source makes the three-dot mark **a repeated, deliberate section-divider motif**, while providing no unique reversible cipher operation. **No unknown-page plaintext or key was recovered.**

## What a 2014 reader could actually see

Physical **p39**, archive `56.jpg`, has six upper rune-text lines. The sixth ends with five ordinary black rune glyphs, a **red 13-dot terminal mark**, and three conspicuous isolated solid black dots at the same line height. Underneath a blank vertical gap, an enlarged **red X-shaped rune** starts a new lower text block. The previous [source-pixel glyph audit](../sims/lp2_p39_fiveglyph_typography_sft.py) already established that the five black glyphs on this upper line are ordinary runes; these three dots are separate punctuation.

Crucially, **physical p33**, original archive `50.jpg`, repeats the same *structural arrangement*: the first 91 original runes end in a red thirteen-dot marker; immediately below are **three isolated black circles aligned horizontally**; the following block begins with another large red rubric. This is an independently visible second occurrence of a triad at an intra-page text-unit seam, so p39's dots cannot responsibly be interpreted as an independently unique numerical instruction. The two red headings differ in shape, and no source instructs a cipher-state transfer from one to the other.

Original source images in `resources/liber-primus/` and their correct physical ordering are also summarized by [the original visual chapter map](lp2-global-original-visual-section-map.md). Both p33 and p39 belong to the **p33–39 top-level visual chapter**, which already ends at p39's separate final red terminal. These interior three-dot breaks therefore identify **additional subunit boundaries** inside that visual chapter. This classification is supported directly by the artwork without interpreting unknown words.

## Complete 58-image morphological inventory

The accompanying [read-only original-JPEG SFT](../sims/lp2_p39_three_dot_original_inventory_sft.py) reads **all 58 original LP2 scans**, archive `17.jpg` through `74.jpg`, in published order. It uses RGB all channels below 150 to identify connected black ink components; near-solid discs must measure 25–120 original pixels in both dimensions, width/height 0.70–1.30 and filled area 0.58–0.88. This rule is fixed across all scans. It detects the two three-dot motifs as well as three independent five-dot controls, and no other solid circular components meeting that particular size/shape range:

| Original scan | Physical page | Shape | Matched original pixel boxes |
| --- | ---: | --- | --- |
| `24.jpg` | p7 | Five isolated black discs | 5 components; source-known five-dot motif |
| `40.jpg` | p23 | Five isolated black discs | 5 components; source-known five-dot motif |
| `50.jpg` | **p33** | **Three horizontal black discs** | **(732,1710,70,69), (1149,1710,70,69), (1628,1710,69,69)** |
| `56.jpg` | **p39** | **Three horizontal black discs** | **(1282,1677,32,33), (1478,1677,32,33), (1702,1677,33,33)** |
| `73.jpg` | p56, solved | Five isolated black discs | 5 components; source-known five-dot motif |

The p33 triad's component ink areas are **3,559, 3,542, 3,533** pixels; p39's are **784, 784, 817** pixels. They are scaled differently, with all three elements exactly aligned in a single row within each scan. Both triads remain three discs under separate RGB thresholds **100, 150 and 200**. The p39 source JPEG's SHA-256 is pinned independently at `d1b7ea5a6ffb79709753e3565d1d46e05edbe3d82ca70c3ed6065d46b131bd00`.

This is a **specific morphology and source-structure inventory**, not an assertion that there are no other small circular glyphs, red dots, cuneiform circles or decorative marks. The three five-disc source controls in pp7/23/56 matter because a loose “there are dots” comparison would conflate visually different motifs. The exact count and two independent intra-page placements are what survive this targeted test.

## Plausible operations and missing selector

The most economical reading of a horizontally aligned three-dot symbol at the end of one text block and before another is **ellipsis, omission or continuation punctuation**. Either might be a human-facing signal to connect the upper and lower passages, possibly to carry a cipher state across the visible division. A 2014 participant could notice the same structure on p33 and p39, as the original geometry itself invites comparison.

For a decipherment, however, no accompanying source instruction specifies **which three units** might be omitted or inserted, how many state updates are consumed, whether to bridge p33→p39, or how a reader would invert an operation on original rune ciphertext. The red thirteen-dot rubric already supplies a visible textual boundary; attaching an arbitrary skip count of 3, 13, 29 or 33 to the nearby black ellipsis would be an unmotivated extra assumption. No authenticated pre-LP2 instruction currently indexed in the repository assigns the ellipsis a cipher action. This is an **absence of an actionable selector in the examined source trail**, not a proof that such an instruction never existed.

A useful rival interpretation is simply the compositor's typographic device separating two units in the same chapter. This rival predicts both observed placements, alignment and lack of an explicit numerical operand, without requiring any new key.

**Director decision:** preserve the **two** authentic three-dot source boundaries at p33/p39 and their distinction from the three five-dot marks. Retire the free-standing p39 “3-step” cipher idea. Only commission a new consumer if an independent original page or historical instruction identifies a specific operation and phase, with original-cipher predictions on untouched runes. The present test requires no further brute-force cipher search.

**Reproducer:** `python sims/lp2_p39_three_dot_original_inventory_sft.py`, Python 3.11+, NumPy and OpenCV, runnable against all checked-in original scans or the original JPEG ZIP via `--archive`. The fixed original archive SFT passed with three-rune and five-rune motif counts as shown; it does not claim plaintext recovery.