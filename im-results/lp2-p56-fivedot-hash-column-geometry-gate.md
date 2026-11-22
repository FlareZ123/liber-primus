# P56 five large black dots do not uniquely select five printed hash glyphs by projection

**Agent 15, 13 November 2026. Evidence class: exact original JPEG geometry; bounded rejection of a hypothetical source-key readout.** No LP2 unknown plaintext, key or deep-web destination was recovered.

## Motivated original-image hypothesis

Physical LP2 **p56 / 73.jpg** visibly prints its authentic 128-hex-digit destination hash on **five lines**, and directly below it prints **five large black circles**. A human could naturally attempt to project each circle upward to pick one hex character from each of the five hash lines, producing a finite five-digit key. A separate 2019 oral account associates the dots with constellations, but it does not prescribe projecting onto the digest. This investigation examines the actual ink geometry before attempting arbitrary keys or ciphertext-fitted offsets.

Two natural one-to-one assignments are fixed: order the five circles left to right and assign to hex lines top to bottom, or order circles vertically top to bottom and assign to hex lines top to bottom. Original page bytes are unchanged.

## Independent source measurements and exact obstruction

On the original 2400x3600 73.jpg, the five circles measured by a frozen intensity<130, x700..1899/y2350..2849 connected-component selection have **areas [3,559, 3,560, 3,604, 3,542, 3,623] pixels** when ordered by increasing y. Their horizontal silhouettes measure **69–70 pixels wide**, compared with roughly **44 pixels per hexadecimal character**. The image shows no vertical pointer hairs, linking lines, tip or narrow center marker, and no original text prescribes a center-to-center versus ink-overlap rule.

The five original hash-line y intervals are **[1235,1315), [1340,1425), [1445,1535), [1550,1645), [1660,1745)**; their connected black-ink horizontal run counts are **[26,25,25,27,24]**. The final line contains 25 printed characters but only 24 merged horizontal ink runs, a reason **not** to infer literal character index directly from run number.

If each circle indicates every hex glyph whose ink intersects the full original circle x-span, the source-native candidate counts are:

| Assignment of circles to five hash lines | Counts of horizontally intersected ink runs |
| --- | --- |
| Left to right | **[2, 2, 2, 2, 3]** |
| Top to bottom | **[3, 2, 2, 2, 2]** |

**All five circles touch multiple hash-character ink runs in either assignment**. Even after committing to an assignment, simple projected circles select multiple digits, so there is no source-unique five-character output. Taking only a projected centroid would require an extra author-selected convention. For some centroids a vertical line lands **between** two printed glyphs, further increasing convention dependence. A distinct one-pixel synthetic pointer aligned over the first printed character does select one ink run under the same exact intersection routine. The failure of unique selection therefore arises from the source's large-dot geometry rather than an overly coarse detector.

## Decision

**Retire straightforward full-dot silhouette projection as an intended one-hex-glyph-per-dot key extractor.** Any subsequent direct GP29 Vigenère, endpoint preimage, or address constructed from five arbitrarily picked characters would inherit an unresolved choice of mapping and key use. No legitimate source-specific five-digit candidate survives this simplest direct geometric reading. This excludes no mechanism explicitly prescribing dot *centroids*, different row assignment, a dot-to-rune mapping, or graphic use unrelated to the hash; the available material does not supply such a rule. Do not treat this as an exclusion of all possible p56 dot clues.

**Reproduce:** sims/lp2_p56_fivedot_hex_projection_sft.py reads original resources/liber-primus/73.jpg, asserts five independently segmented dots and five digest-line glyph runs, checks both source-fixed assignments, and includes a one-pixel control. It requires Pillow, NumPy and SciPy, runs on Windows/Python 3, and makes no file writes.

For a distinct previous finite analysis of the same five dot locations as possible *constellations*, see im-results/lp2-p56-five-black-dots-constellation-gate.md. The present test concerns exactly the p56 hash alignment and should not be conflated with that sky-catalogue search.
