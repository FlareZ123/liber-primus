# P6 red11 as three p55 exterior key blocks: source-selector gate

**Decision (21 November 2026): negative for the proposed repeated-red11 receiver.** The 11/33 correspondence remains a structural observation. It does not supply the author-selected key, operation, reset, reversible mapping of all 76 p55 runes, or recovered original-cipher plaintext. This report addresses only Director #2052; it does not test arbitrary 11-symbol periodic ciphers or supersede existing p55 43/33 research.

## Original source and independently fixed split

Original LP2 physical p6 is `resources/liber-primus/23.jpg`; p15 is `32.jpg`; p55 is `72.jpg`; solved p57 is `74.jpg`. `resources/liber-primus/lp2-ink-annotations.json` records the p6 red span at rune offset 71 with length 11, and a second distinct red span of **the same length** on p15 at offset 9. Their GP0 rune sums are respectively **181** and **120**. Hence the length condition needed for 33=3×11 selects **at least two** original red key sources, before any cipher is applied.

Original p55 has 17 page-local rune segments of lengths

`[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`.

Segment 0 is the one-rune incoming p54 word carry; the other 16 are complete p55 word segments. Following solved p57's “We must shed our own circumferences” literally, keep the carry in the exterior and separate the first/last rune of each complete segment. This gives **33 exterior** positions (1+2×16) and **43 strict interiors** (76−33). The source-order exteriors have GP-Latin transliteration `NGAEWSBXMSAEFUWRBEOMFBCEOEEASESTHOECXDUBI`, as established in the prior direct exterior-key gate.

## Why the three 11-rune clocks do not follow

Partitioning the 33 exterior runes in printed order as `[0,11),[11,22),[22,33)` creates resets at exterior indices 11 and 22. Exterior index 21 is the **first** rune of p55 page-local segment 11, and index 22 is the **last** rune of that same printed word. Therefore the second clock boundary **bisects a word's two retained boundary symbols**. This is unlike the literal word-aware SHED extraction: the source has no visible three-block separators, key reset markers, or instruction to split an endpoint pair.

The p6 red span's `4|1|4|2` word shape distinguishes it from p15, but neither p55 nor the solved p57 wording selects that shape as a key-selector rule. No source selects which of p6/p15 to consume, three consecutive consumption passes, reading direction, zero/one-based phase, input/output alphabet or mapping, handling of the carry, or a reversible recovery of the 43 interiors. The 2016 words/map/numbers/direction text does not resolve these missing choices. The necessary source-selector gate therefore fails *before* any plaintext search.

## Independent checks and scope

`sims/lp2_p6_p55_triplicate_selector_gate_sft.cjs` reads the fixed corpus, original red-ink annotations and p55 transcription to assert both candidate red spans, 76/43/33 counts, and the word-splitting reset at index 22. Existing `im-results/p55-exterior-interior-direct-selfkey-gate.md` already tests a different set of 14 exact exterior→interior additive/autokey consumers, with native controls and no plaintext. Re-running those methods or searching arbitrary Vigenère signs, repeated-key variants, transpositions or resets would not repair the absent source rule.

**What would change this decision:** an independently sourced p6-specific selection clue accompanied by a complete typed 76-rune inverse, a solved native control, and a genuinely untouched original-cipher prediction. Until then #41 should remain waiting. No original LP2 plaintext is claimed.
