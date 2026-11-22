# Source-terminal p55 as a word-check tape: key-independent original-cipher obstruction

**Status: conditional original-input negative, 17 November 2026, Agent 1.** No unknown Liber Primus plaintext, historical key, or authorship of the proposed R4 repair family is established. This report excludes a precise finite bridge between the **76 original p55 runes** and hypothetical **74 ambiguous six-back repair words**. It does not reject all p55 uses or the independent R4 model.

## A possible original solve path and its weak premise

The unchanged LP2 p0–55 corpus contains 12,956 GP29 runes in 2,896 authentic printed words. Under the already documented Phase57 R4 operator `T(u)=24−2u (mod29)`, precisely **74 words** contain a nondegenerate six-back coincidence that could represent an overwritten nominal symbol. There are 69 one-ambiguity and five two-ambiguity words. A modulo29 additive word checksum, *if available from an independent source*, would distinguish every original repair-flag branch within its affected word; see [the original conditional inverse](lp2_phase57_word_checksum_original_inverse.md).

The terminal p55 contains **76 original GP29 runes**. A human might consider its 74 middle runes as a checksum appendix with two exterior sentinels, possibly relating to the solved p57 instruction to shed circumferences. The numerical 76↔74+2 correspondence is retrospective and supplies neither a documented packet format nor proof of R4 authorship. We tested this exact natural order and two exterior placements before proposing any cipher for the checksum appendix.

## Exact all-secret test on the original

Let `S_i` be the set of all GP29 sums of possible *nominal pre-overwrite* runes in the `i`th affected original word, with ambiguous repair flags independently free. Each `S_i` contains two or four distinct residues. For an unknown **single stationary substitution** `f: GP29→GP29`, the `i`th displayed p55 rune `g_i` would be a checksum symbol if `f(g_i) ∈ S_i`. If the same glyph `g` occurs in different p55 packet slots, there must be a value `f(g)` that lies in the intersection of every associated `S_i`. If that intersection is empty, no function, let alone a bijection, can represent the packet. This is independent of plaintext language, lookup/key choices and which repair flags were actually taken.

Using the original 76-rune p55 packet intact, test all contiguous 74-rune placements (remove two first, one from each end, or two last), in both physical reading directions. Count terminal-glyph identity classes with **empty intersections**:

| p55 reading | 74-rune offset 0 | offset 1 | offset 2 |
| --- | ---: | ---: | ---: |
| Forward | 18 | 17 | 17 |
| Reverse | 18 | 16 | 19 |

Every case has at least **16 distinct contradictory symbol classes**, with 25 distinct terminal symbols in each window. Therefore **no fixed secret 29-symbol substitution**, including an arbitrarily selected substitution or arbitrary secret keyed permutation, can turn those p55 positions into the required 74 per-word checksums. This rejects direct GP indices as the special case `f(g)=g` too.

A separate stronger-than-needed direct gate also tested the p55 GP-prime residues as explicit check values, with only **8, 13, or 11 compatible words** for the three forward 74-rune placements, versus the necessary 74; forward raw GP indices yield **7, 3, or 7**. These counts are diagnostic only: the all-secret contradictory-class gate already provides the decisive exact exclusion.

## Reproducibility and boundaries

[Windows-compatible CommonJS standalone test](../sims/lp2_p55_74word_r4_checksum_allsecret_sft.cjs) reads only `resources/liber-primus/lp2-transcription.txt` and `lp2-corpus.json`, asserts exact 2,896 words and 12,956 original canonical indices including 32 original physical-page carries, enumerates every original R4 mask, and checks all six packet placements. A source-native **planted positive** uses the same original ambiguity sets but emits a synthetic 74-check packet through the explicit bijection `f^{-1}(s)=13s+7 (mod29)`, bracketed by two control runes; it yields **zero** symbol-identity contradictions. Thus the condition would pass a valid stationary substituted check tape.

The failed hypothesis is: original p55 contains a one-to-one **natural-order** list of the checksums for all 74 R4-ambiguous words, with only two non-check terminal runes, and with at most one unknown global 29-way S-box. Reordered checks, position-dependent encryption, extra addressing, unequal-length compression, a different repair operator or another p55 function are outside its scope. None is currently selected by an original author clue. A new attempt requires such a selector and an original plaintext prediction; promoting the numerical 76↔74 match alone would be another unconstrained search.
