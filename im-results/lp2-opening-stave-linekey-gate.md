# Opening stave line-tip key transfer — exact bounded negative

**Decision (28 November 2026, Agent 2):** Original p0–2 inward crossbar ink strips select eight physical line starts under a literal horizontal-projection rule. Their GP29 key is `B OE EO D M Y TH C` (17, 22, 12, 23, 19, 26, 2, 5). Direct transfer to the next entire chapter p3–7 (1,145 runes) fails ordinary additive Vigenère in both signs, and the transparent-plaintext-F variant has no legal full inverse in either sign. No unknown plaintext or authentic key recovered. The geometric relation is real under the stated rule; the choice to project horizontally, read the first rune and use the next chapter is hypothetical.

## Observable geometry and reproducibility

The existing independent visual audit rejected the Cistercian numeral reading; the repeated stave motif is a 180-degree counterpart, not six independent symbols. A distinct possible function of protruding crossbars is to point horizontally into printed lines. On original scans 17–19 (2400×3600), use the median foreground y in the inward crossbar strips (left x/y half-open rectangles `(310,330,1900,2110)`, `(380,410,2120,2300)`, `(470,500,2470,2680)`; exact 180-degree mirrored right strips). These are fixed representative inward crossbar ink regions, not a fitted ray or literal tip endpoint. Find printed line bands in central x=800..1649 by count of pixels below 100 exceeding 15, retaining vertical runs 100–125 pixels high. The detected bands are the 12,12,9 physical rune lines, matching transcription widths. At all four thresholds 64/100/128/192:

| Page | Left projected line numbers (1-based) | Right projected line numbers |
|---|---|---|
| p0 | 8, 9, 11 | none |
| p1 | 8, 9, 11 | none |
| p2 | 8, 9, absent | none |

Left median y ranges 2037–2039, 2198–2199, 2569; right ranges 1560–1562, 1400, 1029–1030. Right crossbars lie in the gaps after lines 5,4,2 respectively, not within rune bands. p2 lacks line 11. The selected 8 line-start glyphs are p0 B OE EO; p1 D M Y; p2 TH C. These are distinct from the existing complete 66-line-edge alphabet extraction. The exact source geometry does not itself establish that ink bands, rather than nearest baselines or oblique rays, are intended. Repeated source placement makes the 8 count dependent on page layout, not an independent key-length test.

## Executable transfer

Motivation: genuine LP1 uses an eight-rune DIVINITY Vigenère key; an opening visual sidecar yielding eight GP29 tokens is a candidate operand for the next chapter. Freeze the exact left line-start sequence in page/line reading order; no rotations, reordered keys, guessed shifts, other pages or fit to ciphertext. Use p3–7 including its heading, one continuous phase-zero GP29 clock, both global additive directions. In the alternate historical transparent-F sender, plaintext F emits F without key advance; every other plaintext rune consumes a key cell. Its inverse enumerates every legal F/non-F path using DP over phase and previous two plaintext symbols; if a consuming inverse would equal F, reject that branch. It does not incorrectly equate every ciphertext F with a hold. Score the best legal path using an add-0.5 GP29 trigram model from the first ten LP1 reference segments (1,585 runes; deterministic normalization in code). The direct clear p57 is the held native plant.

| Sender sign | F hold | Original result | p57 source-native plant |
|---|---|---|---|
| 1 | false | mean log likelihood -3.408567, exact 1,145/1,145 replay; nonprose | 95/95 exact |
| 1 | true | empty at zero-based rune 2 (GP12); 0 paths | 95/95 exact |
| -1 | false | mean log likelihood -3.415360, exact 1,145/1,145 replay; nonprose | 95/95 exact |
| -1 | true | empty at zero-based rune 19 (GP6); 0 paths | 95/95 exact |

Raw original mean log likelihood -3.410519; native p57 -2.799655. Both ordinary full outputs are preserved in the JSON. The F-hold result is an exact finite-state obstruction for this fixed key/phase/sign, independent of English scoring. It says nothing about different keys or schedules. The decoder core executed in connected V8; geometry independently executed in local Python against the supplied original ZIP. The Node filesystem wrapper has not separately run in CI. No new workflow was created.

Reproduce: [geometry](../sims/lp2_opening_stave_linekey_geometry.py), [inverse](../sims/lp2_opening_stave_linekey_sft.cjs), [full output](lp2-opening-stave-linekey-output.json). Inputs: original owner JPEG scans 17–19, transcription blob `43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7`, native reference blob `8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d`. See [previous stave report](lp2-p0-cistercian-staves-totient-partition-hypothesis.md) and [whole-edge alphabet](lp2-opening-line-edge-complete-alphabet.md).

**Next decision:** retire the literal horizontal-tip left-start eight-rune key transfer. Do not fit arbitrary ray slopes, nearest-line rules, gap encodings or key rearrangements to rescue it. Reopen only if a genuinely independent instruction selects another readout or receiver.
