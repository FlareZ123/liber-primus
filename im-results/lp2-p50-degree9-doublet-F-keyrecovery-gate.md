# Original p50 primitive degree-nine key recovered from LP2 adjacent-repeat markers: bounded negative

**Original-source result, 15 November 2026, Agent41.** No unknown plaintext or author-selected key recovered. This report closes a specific, executable route from a real 2014 mathematical object to a key, without generating or searching random keys.

## Source-constrained proposal

The original 256-cell terminal grid has an exact **primitive degree-nine** irreducible factor over GF(29), in ascending coefficients

`[11,15,0,9,1,5,10,20,12,1]`.

The factor was established independently in the [p54 source factor and primitive-field analysis](lp2-p54-red9-triple-linear-factor-gate.md). A degree-nine linear recurrence may generate a full-length GP29 key from nine secret initial runes. The actual unsolved book has 86 adjacent-equal GP ciphertext sites across original physical pages p0–p55. Earlier authentic solved-page ciphers have a special literal plaintext F bypass, which suggests an explicitly **conditional** attack: suppose each adjacent repeat marks an underlying plaintext F, and the unknown-page cipher is direct additive `C_i=P_i+K_i (mod29)`. Then each marked site fixes `K_i=C_i`. A related degree-four source-factor experiment previously failed, but the source degree-nine primitive factor with nine unconstrained starting key runes was not thereby excluded.

This proposal has three unverified premises: the numerical-table factor is intended as a key recurrence; each doublet means plaintext F; and the entire 12,956-rune stream uses one uninterrupted additive clock. The actual p56 F rule alone does not imply a doublet marker. These caveats prevent treating the recovered mathematical state as a genuine historical key.

## Original-input inverse and withheld prediction

Run [the standalone read-only Node22 CommonJS SFT](../sims/lp2_p50_degree9_doublet_F_keyrecovery_sft.cjs). It consumes the canonical original `resources/liber-primus/lp2-corpus.json`, fixes the source polynomial, and expresses every key position as a GF29-linear combination of nine unknown initial symbols. Only the **first nine** source doublets are used to infer the seed:

| Role | Original zero-based manuscript rune offsets | Source values |
| --- | --- | --- |
| Nine key equations | 122, 207, 456, 653, 782, 909, 932, 979, 1038 | 2, 14, 28, 11, 20, 25, 15, 21, 6 |
| First untouched prediction | 1591 | 25 |
| Second untouched prediction | 1981 | 9 |

The nine equations have full rank **9/9**, fixing exactly one seed:

`[22,23,4,12,14,21,18,24,0]`.

The resulting recurrence predicts **25** at held-out offset1591, agreeing with its source value25. It predicts **0** at the next held-out original repeat, offset1981, whereas the actual source rune is **9**. This falsifies the complete fixed recurrence/clock/doublet-F hypothesis before any English scoring. Of all subsequent **77** source repeat sites, only **5** decode to F. The combined **86-site** linear system is inconsistent.

Independently, decrypting all 12,956 original ciphertext runes with the fitted pad produces GP29 index of coincidence **0.03450004879502503**, 446 plaintext-F candidate runes distributed throughout the book, and no intelligible prose; full forward additive reencryption restores **12,956/12,956** source ciphertext runes exactly. Forward restoration merely proves arithmetic consistency. The SFT plants a separate nine-symbol GF29 state into the same exact original repeat-site coordinates, recovers **all nine seed symbols**, and predicts **all 86/86** planted site values as a positive control.

## Decision

Reject the **single continuous degree-nine source-factor additive stream with every original adjacent repeat representing plaintext F**. The first apparently correct withheld event is a one-symbol coincidence; the next independently held-out original event contradicts the key. Do not optimize a replacement seed or resynchronization phase to rescue this fixed hypothesis.

This leaves open all historically unselected operations, different page or chapter state clocks, ciphertext feedback, escape handling, and any alternative use of the table's exact field factor. No unknown LP2 plaintext, authenticated creator key, or final destination follows. Further effort on this branch needs a distinct original clue selecting one of those modifications.
