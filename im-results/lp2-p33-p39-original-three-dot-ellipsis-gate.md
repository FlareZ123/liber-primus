# Two original LP2 three-dot section breaks: p33 and p39

**14 November 2026, Agent 30. Classification:** original-image structural result and bounded negative instruction gate for Director [#803](https://github.com/FlareZ123/liber-primus/issues/803). The full original source makes the three-dot mark **a repeated, deliberate section-divider motif**, and the two instances reuse one near-identical scalable image template, while providing no unique reversible cipher operation. **No unknown-page plaintext or key was recovered.**

## What a 2014 reader could actually see

Physical **p39**, archive `56.jpg`, has six upper rune-text lines. The sixth ends with five ordinary black rune glyphs, a **red 13-dot terminal mark**, and three conspicuous isolated solid black dots at the same line height. Underneath a blank vertical gap, an enlarged **red X-shaped rune** starts a new lower text block. The previous [source-pixel glyph audit](../sims/lp2_p39_fiveglyph_typography_sft.py) already established that the five black glyphs on this upper line are ordinary runes; these three dots are separate punctuation.

Crucially, **physical p33**, original archive `50.jpg`, repeats the same *structural arrangement*: the first 91 original runes end in a red thirteen-dot marker; immediately below are **three isolated black circles aligned horizontally**; the following block begins with another large red rubric. This is an independently visible second occurrence of a triad at an intra-page text-unit seam, so p39's dots cannot responsibly be interpreted as an independently unique numerical instruction. The two red headings differ in shape, and no source instructs a cipher-state transfer from one to the other.

Original source images in `resources/liber-primus/` and their correct physical ordering are also summarized by [the original visual chapter map](lp2-global-original-visual-section-map.md). Both p33 and p39 belong to the **p33–39 top-level visual chapter**, which already ends at p39's separate final red terminal. These interior three-dot breaks therefore identify **additional subunit boundaries** inside that visual chapter. The original transcription's line breaks give **p33: 91 runes above / 123 below**, and **p39: 119 above / 121 below**. The latter p39 lower section begins with the large red X and has exactly the same **121-rune length** as independently inventoried physical p32. These counts are source-fixed but the apparent p32/p39 dimensional correspondence is not a source-selected cipher, page map, or confirmation; it is separately relevant to Director [#804](https://github.com/FlareZ123/liber-primus/issues/804). This classification is supported directly by the artwork without interpreting unknown words.

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

## Direct pixel registration: the two triads are one resized graphic

**Agent29, 14 November 2026, original-JPEG continuation to #813.** In the original `50.jpg` and `56.jpg`, the p33 dots and p39 dots have essentially identical **relative positions and actual disk masks after a single scale-and-translation transformation**. This is stronger evidence than the previously recorded three-dot recurrence: the triads appear to be a *reused source graphic* scaled to different sizes, consistent with a typographic divider. It does not specify a cipher state, numeric skip, page mapping or plaintext.

The [read-only exact original-template test](../sims/lp2_ellipsis_scaled_template_sft.py) pins the p33 and p39 original JPEG SHA-256s (`13ff4c8d8ab934032a001b8c1fda16433aa44a38dd7272b3ff0dd7ac8300c62d` and `d1b7ea5a6ffb79709753e3565d1d46e05edbe3d82ca70c3ed6065d46b131bd00`), then applies the same disk classifier to **all 75 source scans**, including all **17 solved LP1** scans 00–16. Only scan01 has two isolated circle-like components and scan13 has one, neither an LP2-shaped triad. The 58 LP2 scans retain the exact previously measured five- and three-dot groups. Therefore there is **no matching three-dot solved-LP1 convention** for calibrating a cipher-state action.

Let p33 disk x centres in source pixels be **[767, 1184, 1662.5]** and p39 centres **[1298, 1494, 1718.5]**. Use only the *outer* dots to fit an x-axis scale and translation: `x39=0.469570072585*x33+937.839754327` (translation computed in the SFT). The held-out p33 **middle-dot** centre forecasts p39 x=**1493.8107203**, while the actual centre is **1494.0**: **0.189280 original pixels** error. The y-axis registration uses just the source-measured first-dot heights **69 and 33 pixels** (y scale **0.47826087**) and their centres.

Rasterizing this source-only affine transform with nearest-neighbour interpolation, thresholding all three RGB channels, and comparing original target three-dot masks in fixed p39 ROI x[1270,1750), y[1668,1724) gives:

| Original RGB threshold | Correct source-scaled three-dot ink-mask F1 | Wrong x displacement +5 px | Wrong x displacement +10 px |
| ---: | ---: | ---: | ---: |
| 100 | **0.982486** | 0.778378 | 0.588541 |
| 150 | **0.986795** | 0.781388 | 0.583945 |
| 200 | **0.979154** | 0.791743 | 0.597855 |

F1 is `2 × intersection / (source-ink count + target-ink count)`; this is a *pixel identity/registration test*, not a probability of cipher intentionality. The held-out dot coordinate was never used for the transform. No per-dot rotations, rescalings, crop shifts, opacity fitting, threshold tuning or source-value changes were needed to obtain the 98.7% central-threshold match. All three dots share the one 2D affine transform. This establishes a near-exact **shared graphical template**; it does not establish whether the compositor attached any independent textual meaning to that motif.

**Cipher-state decision for #813:** The repeated triad is a deliberately reused layout mark at two original red-rubric boundaries. None occurs in solved LP1 with a known cipher reset, and solved p56's *five-dot* motif is a morphologically different art object. LP1's verified decryptions demonstrate changes at source-given chapter/segment and key boundaries, but supply no original rule assigning the **p33/p39 triad itself** a clock, key-update, skip or state-carry operation. The p39 121-rune lower segment is already excluded as a transposition/bijective relabelling of p32 by the exact histogram invariant below. No independent operation remains to apply unchanged at both dividers; a guessed three-step cipher at this stage would be numerical fitting. **The immediate state-handoff hypothesis is unsupported**, though a future recovered external instruction could repurpose the art. Do not generate a successor from the source-template registration alone.

**Reproduce:** `python sims/lp2_ellipsis_scaled_template_sft.py` with the repository's original `resources/liber-primus/*.jpg`, or pass `--zip` for the complete 75-image archive. NumPy and OpenCV are required. It has been executed successfully against the maintainer-provided original archive. The existing 58-scan triad SFT remains unchanged for its independent original inventory and explicit pixel areas.

## Adjacent 121-unit map-transfer gate (source-count follow-up for #804)

The p39 lower red-X section is exactly **121 GP29 runes**, the same length as physical p32's independently defined **121-rune** square. This offers a narrow, source-motivated candidate: p39 could be a rearranged copy of p32's 11×11 rune matrix, perhaps with one secret but fixed rune-substitution alphabet. An arbitrary transposition must preserve each symbol's count; additionally allowing a completely unknown 29-symbol bijection preserves the **sorted multiset of 29 histogram counts**, even if labels are permuted.

Under the frozen original physical reading order, compare all **121 original p32** rune indices with **p39 local runes 119–239** (the exact runic segment after the printed black dots). The first twelve sorted symbol frequencies on p32 are `[10,8,7,7,6,5,5,5,5,5,4,4]`; for p39 lower they are `[8,8,7,7,7,7,6,6,6,6,5,5]`. The histograms differ already at the maximum (10 versus 8), proving that **no arbitrary rune rearrangement plus one bijective secret GP29 relabeling** maps the entire first segment onto the second. Under unchanged labels, at most **92 of 121** rune identities can be preserved even after an arbitrary permutation. Only **6 of 121** physical positions have the same rune in their original relative positions. These are exact key-independent necessary-condition comparisons; they do not depend on linguistic scoring or a tuned grid traversal.

This closes a *direct same-rune-inventory 121↔121 overlay/transposition* idea, while leaving unrelated independent ciphertext streams, changing cipher states, additive masks and word-map paths unaffected. Neither number equality nor its exclusion supplies a historical map-reading opcode.

## Plausible operations and missing selector

The most economical reading of a horizontally aligned three-dot symbol at the end of one text block and before another is **ellipsis, omission or continuation punctuation**. Either might be a human-facing signal to connect the upper and lower passages, possibly to carry a cipher state across the visible division. A 2014 participant could notice the same structure on p33 and p39, as the original geometry itself invites comparison.

For a decipherment, however, no accompanying source instruction specifies **which three units** might be omitted or inserted, how many state updates are consumed, whether to bridge p33→p39, or how a reader would invert an operation on original rune ciphertext. The red thirteen-dot rubric already supplies a visible textual boundary; attaching an arbitrary skip count of 3, 13, 29 or 33 to the nearby black ellipsis would be an unmotivated extra assumption. No authenticated pre-LP2 instruction currently indexed in the repository assigns the ellipsis a cipher action. This is an **absence of an actionable selector in the examined source trail**, not a proof that such an instruction never existed.

A useful rival interpretation is simply the compositor's typographic device separating two units in the same chapter. This rival predicts both observed placements, alignment and lack of an explicit numerical operand, without requiring any new key.

**Director decision:** preserve the **two** authentic three-dot source boundaries at p33/p39 and their distinction from the three five-dot marks. Retire the free-standing p39 “3-step” cipher idea. Only commission a new consumer if an independent original page or historical instruction identifies a specific operation and phase, with original-cipher predictions on untouched runes. The present test requires no further brute-force cipher search.

**Reproducer:** `python sims/lp2_p39_three_dot_original_inventory_sft.py`, Python 3.11+, NumPy and OpenCV, runnable against all checked-in original scans or the original JPEG ZIP via `--archive`. The [original-JPEG GitHub Actions run 43540951489](https://github.com/FlareZ123/liber-primus/actions/runs/43540951489) executed the same complete input SFT successfully. It does not claim plaintext recovery.