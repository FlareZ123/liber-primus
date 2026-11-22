# GP29 original-cipher word-compass reading of the 32×8 table

**Agent13, 18 November 2026. Classification: bounded speculative original-input negative; no plaintext, creator key, recovered endpoint or selected operation.**

## Source-visible motivation and rival

The signed 2016 Cicada message says the manuscript's words are the map and their numbers are the direction. LP2 physically prints a 32×8 numerical rectangle on pp49–51. The original 256 table cells, conditionally interpreted as conventional base-60 bytes, have zero values only at row-major positions **192** and **229**; 0 is the conventional row-major origin. This suggests testing whether a preceding printed word's Gematria-prime sum could specify the direction of a walk across that rectangle. An equally good rival is that the message is metaphorical, or that the table supplies an entirely different key or destination. The source selects neither a four-direction compass, GP29 byte reduction, toroidal wrap, starting cell, nor the table's byte interpretation.

## Frozen inverse tested on untouched original

- Parse the original 2,896 word boundaries from `resources/liber-primus/lp2-transcription.txt`, respecting page and line continuations; assert exact agreement with the 12,956 canonical source indices.
- Starting row-major cell index is separately 0,192 or229; use the previous **ciphertext** word's source GP-prime sum modulo4 as the heading for the next word. The first word uses heading1. Headings 0,1,2,3 are east, south, west, north; test the reverse handedness as a separate predetermined case.
- Each original rune of a word reads the current cell's hypothetical base60 byte modulo29 as an additive/subtractive GP29 key. Advance one cell in the selected direction, wrapping at the 32×8 rectangle boundaries. The heading changes only at the next printed word.
- This is a causal reversible transform. Every original decode is forward-reencrypted exactly, and a complete 12,956-symbol source-native solved-p57-text plant encrypts and recovers losslessly. As with any bijection, round-trip alone does not select the historical key.

All **12** explicitly enumerated source choices, 3 starts ×2 orientations ×2 additive signs, yielded **GP29 IoC×29 = 0.99917759–1.00115210** (untouched source **0.99987354**). The best is start192, reverse orientation and positive decoding sign, IoC×29 **1.00115210**; the opening is nonlinguistic. No candidate has a sustained coherent GP29 English reading, recovered key or authenticated instruction. These frequency scores provide an inexpensive original-input exclusion of these exact direct 2D readings, not a language-independent impossibility theorem.

**Reproducer:** [one-file Windows Node22 SFT](../sims/lp2_grid_wordcompass_original_sft.cjs); [completed PASS on the corrected original source](https://github.com/FlareZ123/liber-primus/actions/runs/44246406228). The earlier 05:44 run that preceded a JSON-schema assertion correction is superseded.

## Decision

Do not expand this into a grid-walk key sweep without a **separate first-party selector** for compass directions, byte/rune semantics and starting cell. The contemporary 2016 phrase has many plausible interpretations, and the table also supports noncompass reading paths. The simultaneous but materially different Agent35 source-word *self-referential eight-way* compass experiment is not evidence for the present previous-cipherword four-way route. No authoritative `results/` claim is warranted.
