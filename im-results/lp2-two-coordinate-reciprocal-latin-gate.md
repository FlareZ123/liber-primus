# Two-coordinate reciprocal Latin transition: scoped rejection (#3197)

**Decision (27 November 2026):** retire this exact all-consuming three-parameter receiver. It recovers all three hidden native-plaintext plant keys and all 2,050 plaintext runes, but the exhaustive original p40–43 fit and frozen p44–48 continuation are null-like. No authentic key, unknown plaintext, or source-selected operation recovered. Repeat-matched positive calibration is not established; this is a finite language-score rejection of a specific equation, not a theorem about all two-coordinate Latin tables.

## Reversible law and independent scope

With canonical GP0–28, arithmetic mod 29, reciprocal (R(0)=0), (R(x)=x^{-1}) for nonzero x, freeze

```
C_i = C_(i-1) + a R(P_i + b P_(i-1) + t)
P_i = a R(C_i - C_(i-1)) - b P_(i-1) - t
a,b in 1..28; t in 0..28; P_-1=C_-1=0
```

All runes consume; punctuation, words and interior physical-page boundaries do not reset. For each previous plaintext/ciphertext pair the row is a permutation in P_i; with the other two coordinates fixed it is also a permutation in P_(i-1) and C_(i-1). No independent rows or side information. Unlike #2766's arbitrary previous-C row, this row depends on recovered plaintext; unlike #3161 it does not introduce conjugating permutations; Agent36's digraph A/π map has only previous ciphertext feedback. No historical source selects this particular reciprocal law, so no parameter extension is justified.

For fixed alphabet and IV, the first-symbol permutation uniquely determines t (zero-step preimage) and a (input P=1-t); varying the previous plaintext determines b from the next symbol. Hence the 28×28×29 = 22,736 key triples are inequivalent as full senders. If a private affine plaintext relabeling P'=uP+v and transformed IV are allowed, the same ciphertext follows with a'=ua, b'=b, t'=ut-(1+b)v. This is an alphabet/IV gauge outside the frozen native GP labeling, not an additional fitted key.

The public reciprocal difference tape turns key inference into the exact recurrence above. Adjacent equal ciphertext iff P_i+bP_(i-1)=-t. For **any** stationary permutation replacing R in the same pair-sum architecture, the unordered ciphertext difference-frequency multiset equals the plaintext pair-sum frequency multiset. Across nine solved-native records (2,979 runes, 2,970 within-record transitions), the smallest single pair-sum category over all 28 slopes contains 32 events (1.0774%, b=23); even the smallest maximum category is 151 (5.0842%, b=24). Original continuous unknown p0–55 has 86/12,955 equal adjacent pairs (86/12,901 within-page), a difference histogram whose largest category is 510/12,955 (3.9367%). These pooled native vs original descriptive differences do not alone exclude unseen native prose; individual native sections have rarer categories. The three plants below do not match original repeat suppression even though their b,t were selected to minimize a category on separate training records.

## Blind native-key recovery and frozen original prediction

Train smoothed native trigram conditional scores (unigram pseudocount .5, bigram prior weight 5, trigram prior weight 10) on six disjoint solved records: WARNING, WISDOM, jpg107-167, jpg229, p56 and p57 (929 runes). Select the three lowest-frequency pair-sum slope/class pairs from this training corpus only, and use fixed a=7,13,23 in that order. The three held records WELCOME, KOAN1, LOSS OF DIVINITY are each enciphered as a separate plant. Exhaustively score all 22,736 keys on the first floor(2n/3) ciphertext symbols; freeze the best and decode the rest without further fitting. Repeat the same blind search on two wrong-sender controls per held record (uniform additive independent pad seeded xorshift32 0x3197c1ca and static affine substitution 11P+17).

| Plant | Fit / held nats per scored rune | Key (a,b,t) | Exact recovery | Adjacent repeats |
|---|---|---|---|---|
| WELCOME | -2.723012 / -2.669594 | 7,13,24 | 515/515 | 17/514 |
| KOAN1 | -2.507830 / -2.873532 | 13,14,17 | 780/780 | 14/779 |
| LOSS | -2.773607 / -2.727703 | 23,21,16 | 755/755 | 13/754 |

All three key ranks are first; runner-up fit-score gaps are 1.655764–1.696870 nats/rune. All six wrong-model controls fail the fixed weakest native-held score gate (-2.873532); their held scores range from -5.136896 to -4.867370. Exact forward replay passes for every selected inverse, including all wrong-model controls, and therefore does not authenticate a key.

Using the unchanged score and key search, the 1,050-rune original p40–43 fit selects (a,b,t)=(26,9,28); best score -4.668788, runner-up gap .004373. **Every key** fails even the lowest native plant fit score (-2.773607). With that one key and state frozen, all 1,358 following runes of p44–48 decode at -4.848839 nats/rune, near wrong-model controls and far below the native gate. Full 2,408-rune round trip passes. The first 120 decoded GP tokens and complete candidate tape are in the raw output. The continuation is unreadable and no authentic plaintext is claimed.

The positive controls are authentic native plaintext encrypted with the proposed hypothetical sender, not historically encrypted authentic examples of it. Neither the low-repeat profile nor original fit/held geometry is matched. Thus the exhaustive fit-score bound is exact for this family and model, while the interpretation is conditional and no statistical confidence or universal language exclusion is claimed. Do not tune the reciprocal map, resets, F-hold, or key selection to rescue the result without an independent source operand.

## Reproduction

- [SFT](../sims/lp2_two_coordinate_reciprocal_latin_sft.cjs); run `node sims/lp2_two_coordinate_reciprocal_latin_sft.cjs` from a checked-out repository.
- [Exact raw output](lp2-two-coordinate-reciprocal-latin-output.json), including original candidate and all per-slope pooled counts.
- Inputs: [native GP29](../resources/external/relikd-solved-gp29-native-v1.json) blob `1b064ef6d85819b7d96adaff31a82d1ec551598f`, [physical-page corpus](../resources/liber-primus/lp2-corpus.json) blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`.
- Computational core executed in connected V8 using exact fetched JSON; standalone Node wrapper was not separately run. No new CI workflow.
