# Opening pp0–2 crossed-border geometry and a source-fixed 180° reversal gate

**Status:** original-image observation and bounded negative, 17 November 2026. No previously unknown plaintext, authentic key, or historical reading instruction was recovered. This report is supporting evidence, not an established LP2 decipherment.

## Physical prompt to a 2014 solver

Original 2014 LP2 physical pp0–2, archived as [17.jpg](../resources/liber-primus/17.jpg), [18.jpg](../resources/liber-primus/18.jpg), and [19.jpg](../resources/liber-primus/19.jpg), have **two large black multi-bar crosses per page**. One is upper-right and the other lower-left; they face each other across upright lines of GP29 runes. The runes do not themselves switch direction. The distinct p0 8+5 red heading, corrected thirteen-dot marker at offset13, and p2 cicada illustration are separate features. This investigation deliberately excludes the red-title key hypotheses addressed by [#1363](https://github.com/FlareZ123/liber-primus/issues/1363).

The crosses resemble an inverted/rotated three-bar Orthodox cross, an interpretation also noted in [historical community art commentary](https://uncovering-cicada.fandom.com/wiki/Symbols/Drawing/Art_of_Liber_Primus). This symbol identity is a visual classification, **not** a creator-signed cipher instruction.

## Independently measured source geometry

The [reproducer](../sims/lp2_opening_cross_geometry_180inverse_sft.py) pins the SHA-256 for all three actual 2400×3600 JPEGs, thresholds original grayscale pixels at intensity 125 and reads the same unmodified rectangles on all three images:

| Figure | Original-pixel rectangle (x0,y0) to (x1,y1) | Source property |
|---|---|---|
| Lower left | (57,1684) to (547,2960) | same bounding box on p0, p1, p2 |
| Upper right | (1853,640) to (2343,1916) | same bounding box on p0, p1, p2 |

* On physical **p1 and p2**, both figure masks agree **pixel-for-pixel**, down to the binary threshold.
* On **p0 and p1**, mask intersection/union is **0.9693998** (left) and **0.9705052** (right); differences are thin edge/print variations, with the same silhouettes and bounding boxes.
* On **p0**, rotating the left figure by exactly 180° and comparing it to the right gives mask intersection/union **0.9872133**, rather than 0.1114473 without rotation. Thus the strongest literal action suggested by the *pair* is a 180-degree reversal.
* Crucially, **neither orientation nor arm count changes among the three pages**. The figures contribute no distinguishing per-page state or arm selector. The repeated cross by itself does not fix whether the *rune text* should be reversed by character, by line, by page, or across a whole chapter, nor any GP29 value/key rule.

This directly bounds the picture's independent information content and prevents fitting a new per-page clock to three copies of one figure. Differences in compressed image pixels are not evidence for an authored glyph-key code.

## One frozen original-cipher reading test

Take the literal 180° relation to motivate **reversing the rune order of each complete physical black-text page**. Keep the source p0 red 13-rune heading untouched and excluded; p0 black has 249 runes, p1 266, and p2 201, so the original intact black body is **716 runes**. Preserve the GP29 rune values. The *separate* historically authenticated value inverse is LP2 p56's first-prime totient sequence, where plaintext F (GP29 index0) passes unchanged without advancing the prime clock, while an encrypted non-F can also yield a ciphertext F. Start with original first prime 2. This fixed decoder gives an inexpensive **necessary legality test** before any natural-language scoring.

An exact DP carries *all* legal F-skip interpretations, rather than inferring the bypass from ciphertext-F locations. It gives the following first impossible rune ordinal, counted from the start of each evaluated source stream:

| Original-source input | Valid under p56 prime-totient/F model? | Earliest contradiction |
|---|---|---|
| Authentically solved p56, normal order (85 runes) | Yes (five legally reachable final clock states) | None |
| p0–2 black716 in printed order | No | 44 |
| Each physical black page reversed separately, then concatenated | No | **119** |
| Whole black chapter reversed once (secondary 180° interpretation) | No | 10 |

At the failure point every possible prime-key clock would require a non-F ciphertext to decode to plaintext F, contradicting the authentic plaintext-F bypass forward rule. This is a mathematical impossibility for the **particular** page-reversal plus p56-value-inverse choice, independent of an English-language dictionary or a fitted crib. The solved p56 positive verifies legal handling of its 85 original ciphertext runes. Exact source arrays, masks, checksums and assertions live in the single Python SFT. Neither test restores 150 coherent original plaintext runes, and no source-selected alternative value key exists to test here.

## Decision and remaining path

The repeated paired crosses make **180° rotation a legitimate clue candidate**, but the original pages contain **identical border diagrams** and no instruction selecting the required rune-level traversal, its start/stop, or a source-derived value key. The most literal complete page-wise reversal cannot coexist with the authentic prime-totient/F cipher when applied to this original chapter. One can invent different inverses, but there is no causal justification for enumerating variants until another original Cicada clue specifies a traversal and key.

Retire this exact direct cross→180° page reversal→p56-family branch. The broader possibility that the crosses are thematic, indicate some other simple operation, or reference an external historical object remains open **only if** an independent source selects a complete decoder. Do not conflate this with #1363's p0 red-heading instruction or the p23–32 insect/wing plate inquiries.
