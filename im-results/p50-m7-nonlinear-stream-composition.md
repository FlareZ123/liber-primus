# p50 table × M7 nonlinear stream composition — negative gate

**Status:** bounded source-motivated composition tested; no plaintext or key recovered. The exact composition below is rejected. This does not disprove other roles for the p50 table or M7 map.

## Source premise and hypothesis

The source-derived M7 Möbius map acts on P¹(GF29), with 30 states including infinity. Its pole cycle is the seven-state orbit [2,7,∞,11,16,10,8]. The p50 page supplies a 256-cell table, and the M7 fragment partition leaves 10,240 runes, exactly 40×256. This motivates one finite composition: use the p50 table values reduced mod29 as a period-256 key, combine them additively with the 10,240-rune complement, then apply M7 or its inverse. Treat the projective infinity output as a word separator.

This is a hypothesis, not an instruction authenticated by the source. In particular, interpreting infinity as a separator is an explicit modelling choice. The test asks whether this simple, clue-constrained composition produces language; it does not search for an arbitrary key or KDF.

## Fixed model family and controls

The 16 models exhaust only these source-visible choices:

- target sequence: fragment rank order or M7 orbit order;
- p50 key sequence: printed row-major table order or the existing ranked-row order;
- additive sign: + or −;
- nonlinear layer: M7 or M7⁻¹;
- key period: exactly 256, repeated 40 times across the 10,240-rune target.

No phase shifts, alternate moduli, arbitrary permutations, or extra cipher layers were searched. A matched null uses 512 deterministic random permutations of the original 256 table bytes, preserving their multiset and rebuilding the same ranked-row order; each null table is scored over the same 16-model family.

The English control is the repository's Gibran text, tokenized into 15,733 words / 62,696 GP runes, with 2,482 distinct normalized words. Trigram likelihood is scored within the candidate's output words. A mathematical round-trip check exhaustively verifies every ciphertext state 0–28, every key residue 0–28, both signs and both M7 directions.

## Reproducible result

- The source structure rechecks: 31 thirteen-dot marks, 32 fragments, empty fragments 9 and 12, 30 ranked fragments, pole cycle [2,7,∞,11,16,10,8] containing 2,896 runes, and a 10,240-rune complement. The p50 table has 256 bytes, 161 distinct byte values and all 29 residues mod29.
- The exhaustive inverse/round-trip check passes. This verifies the implementation's algebra only; it is not evidence of plaintext.
- Best of the 16 actual models: rank-order target, table-order key, positive additive sign, forward M7. Word-aware trigram score **−12.95256**; actual score is below the matched-null median **−12.94876**.
- Matched null: 512 table permutations; 95th percentile **−12.9292**, maximum **−12.9052**; add-one p-value **0.647** and actual percentile **35.35%**. The real table ordering is not exceptional.
- Best output has only **3.53%** separator states, **349** words, mean **28.30** runes/word, median **20**, and only **2.86%** of output words in the Gibran control vocabulary. The prefix is not readable English.

## Decision

Reject this exact M7 × p50 period-256 nonlinear-stream composition on the 10,240-rune complement. The output is no better than the matched key-order null and has implausibly long word runs. Do not expand it with phase, orientation or key-order tuning. The structural 40×256 correspondence and the M7 map remain observations, not a decipherment.

The separate 317→331 reference in the tree-prime report is **not a PGP key transition**. It is a byte-position anchor in the 2014 signed artifact: the sixth p32 first-clause word's prime sum 184 lands at byte 317, the start of the literal PGP SIGNATURE delimiter; the seventh word's step 14 lands at byte 331, its central space. Any further M7 traversal proposal must specify a source-derived mapping and predict held-out packet bytes beyond these selected delimiter positions. Without that, do not continue M7 composition searches.

## Reproduction

- Script: [sims/p50_m7_nonlinear_stream_sft.cjs](../sims/p50_m7_nonlinear_stream_sft.cjs)
- Workflow probe: [grid-256-tests.yml](../.github/workflows/grid-256-tests.yml), input `m7-nonlinear-stream`
- Successful CI run: [43018444066](https://github.com/FlareZ123/liber-primus/actions/runs/43018444066)