# LP2 repeated-rune suppression crosses authentic printed words: reversible fixed-reserve gate

**Agent15, 17 November 2026.** Original-input, complete 12,956-rune test. **Prior-work reconciliation:** [Agent20 had already constructed the fixed-escape reversible transducer and rejected its native-English site-count/first/last-word profile](lp2-fixed-escape-repeat-site-native-language-gate.md). The present independent extension contributes a **page-conditioned, actual-endpoint rune permutation null** and **exact every-word lexical occurrence masks** for each candidate escape, which Agent20's three aggregate site counts did not impose. The fixed-escape architecture itself is earlier work, not newly proposed here. **Outcome:** one independent constraint on the emitted ciphertext and a bounded rejection of a plausible exactly reversible 29-ary escape rule for ordinary source-native GP English. **No LP2 unknown plaintext, creator key, original receiver or final destination recovered.** Implementation: [source-exact read-only Node22 SFT](../sims/lp2_wordedge_fixedreserve_source_sft.cjs), [Windows manual workflow](../.github/workflows/agent15-wordedge-fixedreserve-source-manual.yml). The checked-in script itself asserts counts, synthetic inversion, lexical masks and the frozen null.

## What an original reader could notice

The original manuscript's runes are almost uniformly distributed, but **adjacent identical runes are unusually rare**. The word separators and page endings are ink-authentic and supply a useful question: does the suppression reset at every printed word, or does it persist through word edges? A cipher that independently reinitializes a uniformly distributed output at each word should not suppress endpoint matches without some further word-initial rule.

The directly reconstructed [58-page GP29 source corpus](../resources/liber-primus/lp2-corpus.json) and [exact printed separators](../resources/liber-primus/lp2-transcription.txt) agree on all 55 rune-bearing unknown pages. The transcription encodes only 57 rune-bearing LP2 sections because physical p50 is number-only. All 32 page-carrying words are joined and typographic line wraps do not create words.

| Original source condition | Equal adjacent runes | Eligible adjacent pairs | Frequency |
| --- | ---: | ---: | ---: |
| All within-physical-page pairs | **86** | **12,901** | **0.6666%** |
| Across actual printed word separators, within a physical page | **23** | **2,873** | **0.8006%** |
| Both runes within a printed word, including typeset line wraps | **63** | **10,028** | **0.6282%** |

The 23 word-edge matches occur across 19 pages. Within physical pages, the boundary repeat rate is 23/2,873 = 0.8006%, versus 63/10,028 = 0.6282% for within-word transitions. A page-stratified conditional test fixes each page's total number of adjacent repeats and treats their positions as exchangeable among that page's same-page transitions. The exact convolution of the 55 pagewise hypergeometric distributions gives an expected 18.9725 boundary repeats (SD 3.8287), upper-tail P(X ≥ 23) = 0.17735 and two-sided probability-ordering p = 0.29654. This diagnostic finds no additional word-edge-specific suppression beyond the general page-local anti-repeat effect; the observed edge count is consistent with the same repeat process affecting word interiors and boundaries. It is not a causal test of arbitrary cipher architectures: exchangeability is a stated null, not a proven property of the manuscript. Across 54 physical page-edge transitions, there are zero equalities: 32 are carried-word continuations and 22 are actual word boundaries. This is compatible with state continuity across page breaks but does not by itself identify a transducer.

For a **page-conditioned endpoint null**, keep *every* original previous-word-final rune and each page's complete multiset of next-word-initial runes. Randomly permute just those initials **within the same physical page**, independently for all 55 pages. The **exact conditional expected edge matches is 100.7799099507**, compared with the original **23**. In **20,000 deterministic** xorshift32 permutations, seed `0x33012014`, observed simulated minimum **66**, maximum **149**, mean **100.77935**, and **zero simulations at or below 23**. This is a permutation diagnostic on the original source, not an inference of independent original word beginnings. Fully readable native-GP controls, measured on their own actual words, have boundary equality frequencies **438/15,732=2.7841%** (Gibran), **1,690/55,406=3.0502%** (Shakespeare), and **24/739=3.2476%** (the solved Cicada GP fixture). These three controls use their own source word inventories and are descriptive rather than matched-original-sentence hypothesis tests.

**Decision:** The anti-repeat effect is present across word edges as well as word interiors, but the page-stratified contrast finds no additional boundary-specific suppression. The 32 carried words and 54 nonrepeating page-edge transitions are compatible with a history-dependent process spanning words and page breaks; they do not identify a special per-word reset or advance. A source-selected history-dependent emission rule remains possible, but a separate word-boundary state transition should not be added without an original selector. The endpoint-permutation null above answers a different question (whether already-enciphered words can be independently shuffled) and should not be read as evidence of extra suppression at word boundaries. These are empirical constraints, not a theorem excluding word-aware ciphers.

## Cheapest lossless local explanation, tested as a typed cipher

A human could try the simplest reversible way to reserve exactly one output rune per step. Fix one secret GP29 plaintext symbol `R`. At each position after the physical-page first symbol, map `R` to the preceding emitted ciphertext value. Map the other 28 plaintext runes bijectively to the other 28 ciphertext values. One explicit reversible choice, with `rank_R(p)=p-[p>R]`, is

```text
C[0] = P[0]
C[i] = C[i-1]                                    if P[i] = R
C[i] = (C[i-1] + 1 + rank_R(P[i])) modulo 29      otherwise

If C[i] = C[i-1]:          P[i] = R
Otherwise, let d = (C[i] - C[i-1] - 1) modulo 29;
                          P[i] = d + [d >= R].
```

This is a strict **29-to-29 lossless bijection conditional on the previous ciphertext**, without a repair bit, rejection sampler or guessed collision history. The SFT inverts all 95 native clear LP2 p57 symbols under five different planted reserves and rechecks its equality indicator at every site. An arbitrary secret permutation of the other 28 outputs, perhaps selected by a real authored key, preserves the decisive invariant:

**For every original within-page site after the page's first rune, `C[i]=C[i-1]` if and only if `P[i]=R`.**

Thus the entire original manuscript fixes **86** reserve-rune plaintext positions. The explicit demonstration maps each page-first symbol unchanged, but the lexical gate conservatively allows those **55 page-first positions** to use unknown initialization. Under that broader starting-state allowance, the hypothetical complete GP29 plaintext must contain **86–141 occurrences** of the *same* symbol `R`, whatever the unknown other 28-permutations are. This is an actual original-input inverse restriction, substantially more identifiable than a free plaintext-in/ciphertext-out round trip.

## Original printed-word lexical compatibility

Keep the **2,896 original printed word lengths and all 86 exact within-page repeated-rune positions**, including the original 32 carried words. For each candidate `R`, ask whether **each** original word has at least one independently attested source-native GP29 English word of the same runic length with `R` in exactly the known marked positions and absent at the other observed positions. The candidate lexicon is the union of 6,897 distinct words of GP lengths 1–14 from the frozen [Gibran](../resources/control/gibran_prophet_58585.txt), [Shakespeare](../resources/control/shakespeare_first300k.txt) and [native solved-Cicada](../resources/external/relikd-solved-gp29-native-v1.json) controls. The English encoder uses the original-solved **ING and IO single-rune orthography**, not naive ASCII substitution.

| Proposed reserved plaintext rune | Original printed words with no compatible native-GP lexicon item |
| --- | ---: |
| **S** | **0** |
| R, C, H, T | 1 each |
| F, N, M, L | 4 each |
| EA | 15 |
| I, NG | 19 each |
| IA/IO | 45 |
| X | 52 |
| J | 56 |
| AE | 65 |
| OE | 68 |
| EO | 73 |

For example, original p27 printed word index1476 (zero-based), rune text `EORNSOOCAEYEE`, has **two repeat sites at word positions 5 and 11**. Only the reserve `S` is compatible with all original word masks in this finite dictionary; a single attested English match for that 12-rune mask is Shakespeare's `PREPOSTEROUS`. **This is a lexical possibility, not a recovered crib.**

The symbol `S` faces an independent full-book count contradiction under ordinary GP29 English. If actual source-native words are independently sampled with exactly the 2,896 source word lengths, their expected total `S` occurrences are **910.10 ± 28.15** (Gibran), **942.77 ± 26.55** (Shakespeare), and **891.33 ± 26.76** (solved Cicada GP), where the margins are the exact standard deviations for each fixed word-length empirical sampling distribution. The inferred source demands at most **141**, at least **750 below** the smallest control mean. Rare symbols with counts comparable to 86, such as NG, EA and IA, instead fail **19**, **15** and **45** observed original word-mask compatibility checks. No fixed plaintext symbol simultaneously survives those two independent native-English diagnostics.

These finite lexical dictionaries cannot disprove an unknown word, a different underlying language, artificial plaintext, nonstandard source spelling, or a mechanism whose reserved plaintext symbol changes with state. Frequency conclusions assume GP-native ordinary English, original word boundaries preserving plaintext word boundaries, and the specified page-first handling. The exact mathematical invariant applies only to the stated local-reserve family.


## Independent Latin GP29 language-register extension (Agent3, 17 November 2026)

The existing English result leaves different plaintext languages open, so we tested an independently pinned, **source-native Latin Vulgate New Testament** control. It is already GP29-contracted in [the retained Latin reference](../resources/control/latin-vulgate-gp-wholewords.txt), using fixed word boundaries and the manuscript's digraph convention: **39,785 whole-word tokens and 7,267 unique GP spellings of lengths 1–14**. The complete **same 2,896 authentic source words, 86 repeat sites and 55 physical-page-first unknown positions** were held unchanged. No Latin→GP29 re-tokenization or original punctuation was modified.

For each of all 29 fixed candidate reserved plaintext runes, the unchanged source-word repeat-mask requires a matching authentic Latin word of exactly that GP length, having the rune *precisely* at the original known repeat positions and absent at every original known nonrepeat position. Separately, independently sampling Latin source words matched to every one of the 2,896 original word lengths determines the **expected full-book count and its exact source-empirical sampling standard deviation** for the same plaintext rune. The fixed-reserve cipher permits **86–141 total occurrences**, allowing a completely free unknown starting rune on every page.

| Fixed reserved GP symbol | Original words without any Latin mask-compatible word | Vulgate length-matched expected occurrences ± SD | Decision |
| --- | ---: | ---: | --- |
| O | **0** | 702.53 ± 24.53 | All masks fit, native source frequency far too high |
| M | **0** | 754.37 ± 24.49 | All masks fit, native source frequency far too high |
| S | **0** | 1041.76 ± 28.41 | All masks fit, native source frequency far too high |
| T | **0** | 1137.92 ± 26.43 | All masks fit, native source frequency far too high |
| IA / IO | **17** | 114.64 ± 10.42 | Plausible total count, failed original words |
| AE | **20** | 96.31 ± 9.69 | Plausible total count, failed original words |
| F | **48** | 98.50 ± 9.79 | Plausible total count, failed original words |
| G | **28** | 119.74 ± 10.78 | Plausible total count, failed original words |
| EA | **36** | 26.92 ± 5.10 | Both diagnostics fail |

**All 29 marker identities were tested**, not merely the nine illustrated. Exactly **O, S, T and M**, in original GP chart order, have *zero* original-word-mask incompatibilities; each requires a symbol that is hundreds of occurrences too common for independently sampled words from this pinned Latin register. No candidate combines zero incompatible original words with a remotely ordinary occurrence count under this empirical source. This is a **finite Vulgate word-dictionary and source-sampling incompatibility**, not an algebraic impossibility for a specially selected rare Latin passage, a different Latin register, uncommon words, altered word boundaries, or a state-changing marker. The distribution statistics assume independent length-matched source-word sampling; the exact original-word mask contradictions are deterministic only against the 7,267-word lexicon.

The same checked-in [reproducer](../sims/lp2_wordedge_fixedreserve_source_sft.cjs) now asserts the original source geometry, 39,785 Latin tokens, all 29 exact marker masks, and independent length-conditioned means. The **source-native Windows/Node22 run [44075526989](https://github.com/FlareZ123/liber-primus/actions/runs/44075526989) completed successfully** with all assertions. This extends the previous native-English exclusion without changing its stronger source-wide word-edge finding. **No original key, unknown-page text or decoder is recovered.**

## Next actual decoding decision

Do **not** expand the fixed-reserve branch by fitting a secret symbol per word or allowing arbitrary bypass masks. That would reintroduce unobservable state until an authentic original clue selects the symbol schedule. The remaining defensible search is for a **source-selected history-dependent, lossless emission rule** that explains the 86/12,901 overall repeat scarcity and spans genuine word edges plus the 32 carried-word page transitions. The source must specify whether a printed word edge advances, resets or otherwise changes state; the current boundary-vs-interior comparison supplies no independent evidence for an extra edge event. A source-derived inverse table/key and an unchanged original holdout remain mandatory. A standalone numerical match to these rates, or a synthetic recovery, is insufficient.

No unknown LP2 plaintext is asserted by this report.
