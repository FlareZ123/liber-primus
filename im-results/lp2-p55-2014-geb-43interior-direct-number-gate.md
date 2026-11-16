# Direct p55 43-interior to 2014 GEB numeric coordinates: bounded rejection

**Decision, 16 November 2026:** The apparent 43 = 14 × 3 + 1 coincidence cannot encode the historical 2014 GEB book-coordinate numbers through any fixed deterministic one-GP29-rune-per-number mapping, independently of ordering or marker position. This is a finite original-cipher obstruction. It is not a decryption or key recovery.

## Source-motivated model

The physical p55 contains 76 GP29 runes in 17 source-printed segments. Taking literally the p57 instruction to shed our own circumferences means strip both ends of each non-singleton word, and discard the singleton entirely: exactly 43 interior runes remain, alongside 33 outer glyphs. The preserved sources are resources/liber-primus/lp2-corpus.json and lp2-transcription.txt; the accompanying executable asserts exact equality of the two 76-rune readings.

The independently authentic 2014 Fifth-Onion signed message provides a Gödel–Escher–Bach book code in fourteen records of (chapter abbreviation, dialogue exchange, word, letter), followed by two literal address digits and an ONION marker. Its numeric coordinate triples are:

    6,1,3 / 1,1,1 / 19,9,1 / 5,3,1 / 13,10,1 / 8,6,1 / 3,7,2 / 5,23,6 / 1,8,1 / 4,5,3 / 6,2,1 / 2,17,5 / 3,17,1 / 2,8,1

Primary historical witness: https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/README.md . Count agreement alone does not select a GEB encoding for p55.

## Order-independent proof and stop rule

Across the authentic 42 GEB numeric fields, value 1 appears **13 times**. Across the unchanged 43 original p55 interior symbols, the highest frequency of any single GP29 rune is **4**; there are 21 different interior runes. Every fixed deterministic one-rune encoding of a numeric value must render those thirteen equal inputs as thirteen equal outputs. No choice of 42 positions out of the 43 source glyphs contains a rune even five times. Thus the candidate would force at least **nine** unequal positions, irrespective of transposition, direction, or which one rune is treated as a marker. Monoalphabetic and fixed affine numeric-symbol maps, including one fixed codebook, are excluded.

A varying-state symbol emission, multiple runes per value, homophonic encoding or a clock/key derived from the 33 exteriors remains logically possible. No first-party operation currently selects such a mechanism. The earlier p55/GEB 17-item and 43-interior coincidence is insufficient to justify searching unconstrained stateful keys.

## Reproduction and research decision

Executable: sims/lp2_p55_geb_coordinate_gate_sft.cjs. It checks the original 76/17/43/33 segmentation, the exact first-party historic 42 fields, the repeated-value obstruction, and an independent 42/42 planted affine GP29 positive.

Retire direct historical GEB coordinate substitution. Do not treat a reversible simulation as plaintext. Reopen only if an independent manuscript or 2014 source fixes a complete variable-state inverse, including its exterior role, that can be tested blind on original ciphertext. The waiting p55 decoder issue #41 receives no eligible handoff from this exclusion.
