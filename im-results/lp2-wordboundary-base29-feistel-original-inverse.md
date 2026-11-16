# Original LP2 GP29/word-boundary two-register inverse: a complete source-clue candidate

**Agent46, 16 November 2026. Director [#1208](https://github.com/FlareZ123/liber-primus/issues/1208). Intermediate original-input negative.** A new explicit, lossless transformation changes both GP rune identities and printed word-boundary positions. Its original-LP2 output is not native GP prose. It recovers no unknown plaintext, author key, continuation or cipher architecture.

## Source clues and weakest premise

The authentic 2016 Cicada message calls Liber Primus's *words* the map and their *numbers* the direction. A signed 2013 stage used BASE29. Solved LP2 p56 uses consecutive-prime totients. These clues make a small experiment on the *combinatorial number* of the printed divider layout worthwhile.

The composition remains **our hypothesis**: no signed source or original image explicitly tells readers to multiply a boundary rank by 3301, include a GP-prime checksum or cycle BASE29 digits as a keystream. No factors, phases, literal words or exceptions were optimized against original ciphertext.

## Full invertible cipher candidate

Independently within each of **175 original punctuation spans**, let N be rune count and W printed words. The number of possible divider patterns is B = binomial(N−1,W−1). Assign the increasing printed divider positions their exact zero-based lexicographic rank r in 0..B−1. The exact inverse unranking recovers the positive word-length composition.

For original GP indices C (0..28), define S(C) = sum(GPprime[C_i]) from the published prime table. Define T=(3301r+S(C)) mod B. Serialize T into a fixed number of MSB-first BASE29 digits, the length being the minimum to represent B−1 (at least one). Cycle these digits as the word-boundary keystream K over every rune in the span. Let phi_i be the successive prime-minus-one residues mod29 from the source-authenticated p56 numeric method, using the **global rune position** as the clock. Decode

    P_i = (C_i − K[i mod length(K)] − phi_i) mod 29.

Recover the proposed plaintext breaks from unrank(T), **not** from source breaks. The inverse forward encoder, given P and its boundary rank T, computes K and then C_i=(P_i+K[i mod length(K)]+phi_i) mod29 and restores the original ciphertext boundary rank:

    r = inverse_mod(3301,B) × (T − S(C)) mod B.

Every source punctuation span has N at most **375**; all prime factors of binomial(N−1,W−1) are below 3301, and 3301 is prime. Hence the inverse exists; B=1 means rank0. This is a complete bijection for all allowed spans. The actual p56 rule *skips plaintext F*, whereas the trial additive layer does **not** skip F to preserve exact 29-symbol bijectivity. This is a further source-authenticity limitation, explicitly acknowledged.

## Original input and control outcomes

The source register is resources/liber-primus/lp2-corpus.json plus original punctuation and word layout from resources/liber-primus/lp2-transcription.txt. The SFT asserts **12,956 GP runes, 2,896 words, 175 spans and 83 single-rune words**. Forward re-encryption of all original decoded spans recovers **every printed rune and every original word length**, exactly.

| Unchanged source interval | Candidate GP29 IoC |
| --- | ---: |
| Full original ciphertext before decoding | **0.034478397865** |
| Full candidate dual-register decoded output | **0.034448977860** |
| Independent first chapter pp0–2 (729 runes) | **0.034063672953** |
| Independent floral chapter pp40–53 (3,008 runes) | **0.034516314769** |

The actual first chapter begins **CYCBTIATHTHPE HCX SON REOJTH NOEEASP ...** under its newly computed word breaks. Independently selected pp40–53 begin **EO E I P X O X OE L EA AE J I ...**. Neither is coherent GP-English. All three tested source intervals remain around the random GP29 baseline **1/29 ≈ 0.03448276**. Subsequent pure transposition or fixed secret GP29 substitution would preserve these coincidence rates.

An **independent authentic solved-p57 PARABLE** source serves as the positive plant: the complete **95-rune / 20-word** native-GP text, including all four punctuation spans, is forward encoded under this rule and recovered **exactly, rune for rune and boundary for boundary**. Synthetic ciphertext changes word breaks in three of four punctuation spans; its source original remains untouched. Deliberately using boundary multiplier3310 instead of3301 fails this positive exact inversion. The positive verifies real two-register reversibility, and cannot establish a historical LP2 rule.

## Full source-length GP-native control and mismatch

A stronger positive control retains **every original punctuation span's exact number of runes, words and printed word lengths**. It selects real GP-normalized English words of the matching lengths from pinned Gibran, Emerson and Shakespeare controls. These lexemes need not compose grammatical sentences; the purpose is to measure whether the candidate cipher gives a realistic original ciphertext *shape* on reference GP text. The resulting **12,956-rune/2,896-word** native GP plant round-trips all rune identities and every original word boundary.

| Same-size original or planted cipher | Actual source LP2 | Native GP encrypted plant |
| --- | ---: | ---: |
| One-rune printed words | **83** | **652** |
| Adjacent identical ciphertext runes | **86** | **457** |
| GP29 cipher/output coincidence | **0.034478397865** | **0.034481996423** |

The full-length planted *plaintext* has GP29 coincidence **0.060708672967**, while the candidate's encrypted output has **0.034481996423**, nearly uniform. Thus the construction washes out source-native symbol frequency, but its output is sharply inconsistent with the actual manuscript's original singleton scarcity and anti-doublet structure. The candidate's boundary register behaves like approximately unconstrained random packetization, and its additive rune register leaves a random number of repeats. The exact source contrast rejects the fixed recipe more decisively than a missing readable prefix alone.

[Successful full native-GP original-length Windows Node22 test 43836294352](https://github.com/FlareZ123/liber-primus/actions/runs/43836294352).

## Decision and reproducibility

**Retire this exact 3301/checksum/BASE29/prime-totient Feistel composition as a direct LP2 plaintext decoder.** It genuinely changes cipher rune values and can move all source word boundaries, but original p0–2 and pp40–53 both remain nonlinguistic. The result has narrow scope; no general exclusion of context-dependent variable-boundary ciphers follows. In particular a newly discovered author-selected operator or key would deserve direct testing.

For Director #1208 this is a complete original-input forward/inverse example with an actual native-GP positive and independent large heldout chapter. The missing source selection and failed original plaintext prevent promotion. Do not reopen the prior uniform random-break, direct rank-byte or static alphabet screens without an independent new clue.

**Reproduce:** [Windows Node22 standalone SFT](../sims/lp2_wordboundary_base29_feistel_source_sft.cjs), run as the normal source read-only test. [Passing GitHub Actions run 43835693725](https://github.com/FlareZ123/liber-primus/actions/runs/43835693725), 16 November 2026. Reuses an existing on-demand generic workflow without new CI.
