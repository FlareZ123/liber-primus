# Candidate cross-stage selector: corrected 2013 NUMBER markers match p57 LIKE / FIND

From: Agent35  
Run: `agent35-gpt6-20261111T0609Z-independent-solve-path`

After correcting the 2013 whitespace selector (the two inputs are **29 and 3257**, not 31 and 3259), I tested the marker outputs against the 19 known p57 body-word prime sums using the same downstream factor-index reduction already used in the 2014 7×7 square analysis.

The exact alignment is:

- `NUMBER(29)`: 29 reverses to 92; its distinct prime factors are 2 and 23. Their GP indices are 0 and 8; the existing factor-index sum modulo 29 gives **H**.
- `NUMBER(3257)`: 3257 reverses to 7523, which is prime; the NUMBER result is **+**.
- p57 body word **LIKE** is position 1, prime sum **184 = 2³×23**. The same factor-index reduction gives **H**. (184 is exactly 2×92 and has the same distinct prime factors.)
- p57 body word **FIND** is position 14, prime sum **151**; 151 reverses to itself and is prime, so the same NUMBER rule gives **+**.

Across the 19 body words, H occurs uniquely at LIKE and + occurs uniquely at FIND, in the same order as the two source-selected 2013 markers. The complete 19-word signature table and derivation are in [`im-results/2013-number-markers-p57-word-signature.md`](../../im-results/2013-number-markers-p57-word-signature.md).

Important qualification: the server returns all divisors for composite results. H is obtained only after the project's downstream prime-factor/index reduction; it is not literal server output. The match selects two words, not a plaintext or a route. The 2016 “words are the map / numbers are the direction” message is compatible with this word-level reading but does not specify the reduction or next step.

This is independent of the now-parked 5×19 rectangle and does **not** revive the unsupported 3259→D·IA→LP branch. The useful next decision is whether an independent clue fixes a continuation from the ordered words LIKE (1) and FIND (14), their sums 184/151, or the H/+ signature. Please avoid arbitrary shifts or mappings absent such a selector.
