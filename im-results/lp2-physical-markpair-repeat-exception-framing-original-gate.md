# Original punctuation bracketing as a constrained-code exception channel

**Status: original-input negative for the exact one-exception-per-two-physical-marks interpretation.** No unknown Liber Primus plaintext or key was recovered. The rejected mechanism is one sharply bounded answer to [Director Issue #2273](https://github.com/FlareZ123/liber-primus/issues/2273); it says nothing about more general keyed or variable-capacity punctuation encodings.

## Source-led idea and its decisive prediction

The unknown LP2 glyph stream has **12,956** GP29 runes and only **86** immediate identical-glyph transitions. An encoder using the **28** nonrepeating successors of each rune would require a way to carry the rare equality exceptions. The original 2014 printed manuscript has **175 source-visible punctuation marks** after excluding known derivative-transcription errors. The numerical relation **175 = 2 × 86 + 3** motivates the simplest concrete physical reading: bracket each of 86 exceptional transitions between two adjacent marks, leaving three visible header/trailer marks.

This is an *explicit hypothesis*, rather than evidence that the author intended it. Because the original manuscript fixes both the glyphs and the marks, the scheme has a particularly cheap necessary test: **each of the 86 paired marker intervals must contain exactly one true adjacent-equal rune transition**. If an interval contains zero or two or more, this literal encoding cannot specify its exception.

All four allocations of the three unused marks between the head and tail were frozen as the complete non-overlapping physical-order pairing family: skip the first 0, 1, 2, or 3 marks, then consume the next 172 in 86 consecutive pairs. No glyph reordering, uncertain byte key, invented marks, or keyed phase is allowed.

## Original result

The authoritative [punctuation image audit](../resources/liber-primus/lp2-punctuation-identity.json) has 180 derivative event rows. Exactly five fail the source-image test: four editorial p15 numeric-row stops (indices 57–60) and one missing source glyph on p37 (index 125). This leaves **175 physical marks**, including the original comma and large-dot shapes, in reading order. Independently, the [canonical original ciphertext](../resources/liber-primus/lp2-corpus.json) has **86 adjacent-equal transitions**.

| Unused marks at start | One-repeat intervals | Zero-repeat intervals | Multiple-repeat intervals | Total paired intervals |
|---:|---:|---:|---:|---:|
| 0 | 24 | 56 | 6 | 86 |
| 1 | 15 | 60 | 11 | 86 |
| 2 | 23 | 57 | 6 | 86 |
| 3 | 14 | 60 | 12 | 86 |

Even the best allocation brackets exactly one repeat in only **24/86** intervals, while **56** have no repeat and **6** have multiple. The four candidate bracketing registers therefore fail on the printed original. The same conclusion holds if one reinterprets pairs as successive two-mark *block ends*: 40 of the 88 source-order blocks are empty and only 29 contain one repeat.

An independent three-pair synthetic positive has exactly one planted event per pair and the same counter reports all 3/3. The [read-only CJS reproduction](../sims/lp2_physical_markpair_repeat_framing_original_sft.cjs) derives excluded mark identifiers from the published original-image audit, then computes every bracket placement from the original rune indices.

## Meaning for decipherment

The 175/86 near-2:1 ratio is a **whole-book count coincidence**, insufficient to infer a physical exception transport. A true source-selected punctuation channel must explain *how* marks encode exception locations or bits, survive the actual pagewise/sequential geometry, and yield a complete inverse whose plaintext is recognizable on untouched pages. An adjustable combinadic assignment can always fit the data after the fact and is not a cryptanalytic result.

This decision retires only the literal source-order one-repeat bracket family. It does not remove the general constrained-code possibility, and the original punctuation still matters as authentic potential side information. The next research choice needs a demonstrable authored bracket/index rule or an independently grounded key; further reassignments of these 175 marks without such a rule have no causal route to plaintext.
