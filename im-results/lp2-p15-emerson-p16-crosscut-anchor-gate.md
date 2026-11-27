# #3246 — Frozen Emerson p15→p16 cross-cut anchor gate

**Agent16 · 27 November 2026. Classification: conditional boundary discriminator, authentication gate negative. No unknown LP2 plaintext/key recovered.**

## Why this one candidate was allowed

The candidate was fixed from two independent historical/source facts before comparing any p16 word lengths:

1. Cicada's signed 2014 first-onion stage genuinely selected Ralph Waldo Emerson's *Self-Reliance*, and the repository pins the exact participant-era text witness that reproduces the historical book-code result.
2. LP2 physical p15 independently contains the established red-centered 16-cell spiral read from center outward. The first paragraph of that exact Emerson witness literally says **“for the inmost in due time becomes the outmost”**.

The frozen candidate plaintext unit is exactly that clause, not a search over Emerson quotations. The frozen receiver is physical **p16 rune 0**, immediately after the p15 illustration. The only operation family used for the boundary test is an order- and length-preserving rune-value transform; no key is inferred and no offset is optimized.

This is stronger source motivation than a generic literary donor, but it still lacks a first-party LP2 instruction saying that p15 reuses the 2014 Emerson source as p16 plaintext or key material. That missing relation is the decisive authentication gate.

## Exact GP29 boundary prediction

Canonical GP normalization gives:

| word | GP rune length | cumulative end |
|---|---:|---:|
| FOR | 3 | 3 |
| THE | 2 | 5 |
| INMOST | 6 | 11 |
| IN | 2 | 13 |
| DUE | 3 | 16 |
| TIME | 4 | 20 |
| BECOMES | 7 | 27 |
| THE | 2 | 29 |
| OUTMOST | 7 | 36 |

Thus the frozen plaintext boundaries before the last word are **3, 5, 11, 13, 16, 20, 27, 29**.

The unchanged p16 ciphertext begins with printed group lengths **13, 8, 1, 5, 5, 2, 3, 3, 6, 5, …**, so its first cuts are **13, 21, 22, 27, 32, 34, 37, …**.

If the Emerson clause truly began at p16 rune0 under any order/length-preserving rune-value transform, plaintext boundaries at **3, 5, 11, 16, 20, and 29** would lie strictly inside printed ciphertext groups. Only the boundaries at **13** and **27** coincide. In particular, the first printed 13-rune group would contain the complete plaintext sequence **FOR / THE / INMOST / IN**, with three real plaintext cuts hidden inside one printed group.

That would be exactly the kind of cross-cut anchor #3246 seeks and would falsify strict “printed group = plaintext word” use for this receiver.

## Solved control

The same boundary-projection code is calibrated on the independently clear solved p57 PARABLE section. Its source-native GP word lengths are [7,4,2,6,7,2,2,7,2,4,4,3,3,14,4,2,8,5,3,6] and the original manuscript's printed p57 groups have the identical sequence. The projection therefore reproduces a real known Cicada source/receiver boundary relation exactly; the p16 calculation is not a parser artifact.

## Authentication decision

**Do not promote the six p16 cross-cuts to known plaintext.**

The exact 2014 Emerson witness is authentic, the p15 center-out visual relation is authentic, the clause is exact, the p16 receiver is fixed by adjacency, and the boundary consequence is deterministic. But the crucial source-to-receiver statement is absent: no known first-party LP2 instruction says that the p15 spiral means “reuse Self-Reliance here,” that the quoted clause is p16 plaintext, or that the earlier 2014 book-code has become an LP2 rune-value operation.

That missing link is not repairable by the attractive boundary mismatch itself; using the mismatch as evidence that the quote is correct would be circular.

Therefore this task ends under its stated negative fork:

- retire this exact Emerson-clause → p16-start plaintext anchor unless a contemporaneous Cicada source independently supplies the missing transfer;
- preserve the calculated cross-cut coordinates because they become an immediate locked prediction if such source evidence is later found;
- do not slide the quote, change editions, search other Emerson phrases, or optimize the receiver after seeing p16 groups.

No genuine H-shuffle/H-decoy decision follows yet.

## Reproduction

sims/lp2_p15_emerson_p16_crosscut_anchor_gate.cjs

Pinned inputs:
- resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt
- resources/liber-primus/lp2-transcription.txt
- resources/liber-primus/lp2-corpus.json
- resources/external/relikd-solved-gp29-native-v1.json
