# The identical-insect triptych cannot hide native GP29 prose behind one secret 3×3 page mixer

**Agent50, 22 November 2026. Original-input all-secret architecture test.** No unknown Liber Primus plaintext, authored matrix, source-selected invertible cipher, or continuation destination recovered. This independently tests an interpage *linear mixer* rather than the existing shared per-position affine pad or five-lane evolving ciphertext-feedback mechanisms.

## Original image selector and competing explanations

The original LP2 physical manuscript pages **p24, p25 and p26** (archive scans `41.jpg`, `42.jpg`, `43.jpg`) display the same bilateral insect illustration, with p24/p26 source art identical and p25's version shifted about one raster pixel. The three original ciphertext pages are 270, 273 and 265 GP29 runes respectively, each arranged into **12 genuine printed lines**. One plausible but historically unprescribed interpretation is that the triptych carries *three channels of one cipher at each synchronized rune position*. A Hill-style GF29 mixing matrix would be a compact fully reversible instruction if a period solver had an independently supplied matrix. The **rival** is that these are three ordinary typeset pages with a reused decorative template, with no cross-page cryptography.

The previously completed [three-way affine same-position common-key gate](lp2-p24-p26-insect-threeway-affine-allsecret-exact-gate.md) allows a free multiplier and intercept on each rune but never combines different page plaintext symbols. The present hypothesis **mixes all three page channels by an arbitrary unknown invertible 3×3 matrix**, a substantially different cryptographic architecture. The original artwork supplies an intelligible motivation to test an interpage operation; it does **not** specify the matrix, number field, word boundary role or even that interpage mixing was intended.

## Exact all-secret theorem and original-source clocks

At a synchronized rune position `t`, use the untouched three original cipher runes `C(t)=(C24,C25,C26)`. Grant an entirely secret *single constant* `M∈GL(3,GF29)` and secret per-track offsets `b`:

```text
C(t) = M P(t) + b                    modulo 29
P(t) = M^-1 (C(t) - b)              modulo 29
```

Every original plaintext output track must therefore be **one fixed nonzero vector** `v·C(t)` followed by an additive constant. Any unknown nonzero scalar multiple of `v`, additive offset or further fixed one-to-one substitution of that output cannot change **equality between its rune values**, hence cannot change its index of coincidence (IoC). Exhaust *every possible one-output inverse*, rather than trying any particular guessed key.

Every nonzero GF29 three-vector is a scalar multiple of exactly one normalized **projective direction**. The exhaustive set contains exactly `29²+29+1 = 871` unique entries:

```text
(1,b,c) : b,c = 0..28   -> 841
(0,1,c) : c   = 0..28   ->  29
(0,0,1)                     ->   1
                                     871
```

For each direction, calculate **exact integer symbol-pair collisions** on the corresponding original output tape and divide by `N(N−1)`; no English-key fitting, dictionary crib, chosen phase, floating optimum or matrix-size search is involved. Every invertible matrix's three inverse rows occur in this 871-direction universe, up to a scalar, so the largest score is an exact **upper bound on the best possible recovered plaintext channel**, under the stated one-fixed-matrix law. It is even valid with completely arbitrary, unguessed **static bijective output alphabets** on the decoded channels.

Two alignments are independently selected by actual artwork/text layout, without tuning them to language:

1. **Physical page-local rune ordinal** `t=0..264`, the 265 shared positions of all three pages. Five p24 and eight p25 trailing runes lack three-track partners and cannot repair a contradiction already present in those common positions.
2. **Physical printed line ordinal plus within-line rune column**, matching each of the 12 original lines and using the common shorter width per line. This gives precisely **255** three-track rune positions. No guessed cyclic phase or subpixel shift moves original words.

## Exact original-cipher results

| Original fixed clock | Matched 3-way positions | All nonzero inverse classes | Highest achievable decoded IoC | Winning normalized inverse row | Projective rows with IoC ≥0.048 |
| --- | ---: | ---: | ---: | --- | ---: |
| Page-local rune ordinal | **265** | **871** | **0.0375071469411092** | `(0,1,11)` | **0** |
| Printed-line ordinal + rune column | **255** | **871** | **0.03810406052184653** | `(1,10,6)` | **0** |

These are **exact maxima over all coefficients**, independent of whether a conventional nonlinear key search would have found any matrix. Even if a hidden matrix recovers an unselected GP-register, no single decoded channel has the symbol concentration seen in ordinary GP-native English prose of comparable word lengths.

As a secondary *clock-alignment diagnostic*, use deterministic cyclic shifts between the three unchanged source-page symbol tapes (not new candidate decoding offsets). Across 100 shifted controls for the page-local original alignment, **100/100** shuffled triples yield a higher attainable top inverse IoC than the actual 0.0375071. Across 40 shifted controls for the printed-line alignment, **31/40** match/exceed the actual 0.0381041. Thus the actual same-artwork alignment exhibits **no unusually strong linear recovered-language channel** even relative to misaligned original-ciphertext tapes. The 100/40 rotations are controls, not a license to search for a better phase.

## Source-native plaintext sensitivity and genuine positive cipher

The separate reference sample uses the pinned Shakespeare, Gibran and Emerson sources and solved-LP GP29 spelling, including period-known **ING→NG**, **IO→IA**, **QU→CW**, and V/K/Q/Z normalization. At every p24/p25/p26 printed word-fragment slot, independently select one source word of its **exact original GP29 length**. This preserves all **808 physical page positions**, actual line-wrapping, each page's first carried-word fragment lengths **3/2/1**, and the same two fixed alignment clocks. Repeatedly drawing original-length word slots produces **1,000 independent synthetic three-page manuscripts per author**. There are **3,000 per-page GP-native receiver streams per author**, **9,000 in total**.

| Native-GP reference register | Word-shape-matched page-stream controls | Lowest genuine native IoC, page-ordinal 265 | Lowest genuine native IoC, line/column 255 | Native streams at/below original **maximum possible** |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | 3,000 | **0.04971412235563179** | **0.04965261695229273** | **0/3,000** both clocks |
| Gibran | 3,000 | **0.04854202401372212** | **0.04786166435077968** | **0/3,000** both clocks |
| Emerson | 3,000 | **0.04988564894225272** | **0.04974525243168133** | **0/3,000** both clocks |

**All 9,000 matched native-GP reference streams exceed the entire original 871-key upper envelope for both alignments.** These are finite, source-defined English register controls, not a theorem that *all possible* English or other-language plaintexts must have the same frequency.

The positive uses unchanged original printed word-fragment lengths, samples genuine GP29 words from the pinned TextBlob reference, and mixes three independently selected 265-rune tracks under a **nontrivial complete invertible matrix**:

```text
M = [ 1  2  3
      5  7 11
     13 17 19 ]                   det(M) = 24 (mod 29)
```

All three genuine inverse rows are recovered by the *same 871-direction search*, without giving the solver `M`:

```text
P24 = 5 * (C24 + 25*C25 + 22*C26)   (mod29)
P25 = 2 * (C24 +  2*C25 + 17*C26)   (mod29)
P26 = 7 * (C24 + 13*C25 + 15*C26)   (mod29)
```

For the **265-position global** plant, their normalized directions are **ranks 3, 2 and 1**, with true GP-native IoCs **0.05074328, 0.05817610 and 0.06469411**; exact all-795-rune plaintext recovery and forward replay pass. Repeating the complete operation on the **255 genuine line/column positions** recovers all three original plaintext tracks, with all three correct inverse rows again ranking top three and source-native IoCs **0.05048634, 0.05675467, 0.06558592**. This confirms that the actual search detects and inverts a genuine all-three-page linear cipher on precisely these source shapes. Any single-source word not dictionary-listed is irrelevant to the **key-independent equality theorem**.

## Decision and bounded next move

**Reject one constant 3×3 invertible GF29 interpage Hill-style transform**, with arbitrary secret full matrix and per-channel additive offsets, as an explanation of ordinarily ordered GP29 English-like plaintext hidden under the repeated p24–p26 artwork. Even further **arbitrary fixed per-output GP29 bijections** cannot evade the exact maximum-IoC constraint. The original art supplies a recognizable triple, yet the original combined ciphertext has **no** native-GP-like linear readout under either unspeculative physical alignment.

The inference does **not** exclude a matrix changing after each word/line, a nonlinear mixing function, independently encrypted streams, a rare language/technical register with nearly uniform runes, moved word boundaries, or a non-GP binary intermediate. Such more elaborate alternatives require an independently selected instruction, key or plaintext, rather than continuing the same exhaustively excluded matrix search.

**Reproduce:** [original-sources CommonJS SFT](../sims/lp2_p24p26_three_track_gl3_allsecret_sft.cjs), with exhaustive 871-key bounds, 140 unchanged-source clock rotations, 9,000 GP-native controls, genuine source-shaped three-track encryption, inverse-row recovery, and all-runic source replay. Executed constituent exhaustive original and seeded native-positive calculations directly with the exact remote corpus, transcript and source references in V8 on 22 November 2026; the checked-in Node.js22 single-file test is the consolidated reproduction. Full **Windows Node.js22 PASS** [GitHub Actions run 45026157372](https://github.com/FlareZ123/liber-primus/actions/runs/45026157372), including both original alignments, all 871 projective inverse classes, 9,000 GP-native controls, wrong-alignment cycles and genuine 3-track native plaintext recovery.
