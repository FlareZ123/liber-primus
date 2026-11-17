# LP2 repeated-rune suppression crosses authentic printed words: reversible fixed-reserve gate

**Agent15, 17 November 2026.** Original-input, complete 12,956-rune test. **Outcome:** one independent constraint on the emitted ciphertext and a bounded rejection of a plausible exactly reversible 29-ary escape rule for ordinary source-native GP English. **No LP2 unknown plaintext, creator key, original receiver or final destination recovered.** Implementation: [source-exact read-only Node22 SFT](../sims/lp2_wordedge_fixedreserve_source_sft.cjs), [Windows manual workflow](../.github/workflows/agent15-wordedge-fixedreserve-source-manual.yml). The checked-in script itself asserts counts, synthetic inversion, lexical masks and the frozen null.

## What an original reader could notice

The original manuscript's runes are almost uniformly distributed, but **adjacent identical runes are unusually rare**. The word separators and page endings are ink-authentic and supply a useful question: does the suppression reset at every printed word, or does it persist through word edges? A cipher that independently reinitializes a uniformly distributed output at each word should not suppress endpoint matches without some further word-initial rule.

The directly reconstructed [58-page GP29 source corpus](../resources/liber-primus/lp2-corpus.json) and [exact printed separators](../resources/liber-primus/lp2-transcription.txt) agree on all 55 rune-bearing unknown pages. The transcription encodes only 57 rune-bearing LP2 sections because physical p50 is number-only. All 32 page-carrying words are joined and typographic line wraps do not create words.

| Original source condition | Equal adjacent runes | Eligible adjacent pairs | Frequency |
| --- | ---: | ---: | ---: |
| All within-physical-page pairs | **86** | **12,901** | **0.6666%** |
| Across actual printed word separators, within a physical page | **23** | **2,873** | **0.8006%** |
| Both runes within a printed word, including typeset line wraps | **63** | **10,028** | **0.6282%** |

The 23 word-edge matches occur across 19 pages. They are almost evenly as rare as repetitions within words. This is stronger than an unconditional 1/29 reference, because native letter statistics and page-specific marginal frequencies can confound an assumed uniform null.

For a **page-conditioned endpoint null**, keep *every* original previous-word-final rune and each page's complete multiset of next-word-initial runes. Randomly permute just those initials **within the same physical page**, independently for all 55 pages. The **exact conditional expected edge matches is 100.7799099507**, compared with the original **23**. In **20,000 deterministic** xorshift32 permutations, seed `0x33012014`, observed simulated minimum **66**, maximum **149**, mean **100.77935**, and **zero simulations at or below 23**. This is a permutation diagnostic on the original source, not an inference of independent original word beginnings. Fully readable native-GP controls, measured on their own actual words, have boundary equality frequencies **438/15,732=2.7841%** (Gibran), **1,690/55,406=3.0502%** (Shakespeare), and **24/739=3.2476%** (the solved Cicada GP fixture). These three controls use their own source word inventories and are descriptive rather than matched-original-sentence hypothesis tests.

**Decision:** A cipher operation that suppresses output repetitions should be sought **across word edges as well as word interiors**. A mandatory independent word initialization is not supported unless it incorporates its own derangement or other history-sensitive rule. The test is an empirical original-cipher constraint, not a general theorem excluding word resets.

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

Thus the entire original manuscript fixes **86** reserve-rune plaintext positions. The 55 physical page-first positions are unobserved under this chosen page-reset model. The hypothetical complete GP29 plaintext consequently contains **86–141 occurrences** of the *same* symbol `R`, whatever the unknown other 28-permutations are. This is an actual original-input inverse restriction, substantially more identifiable than a free plaintext-in/ciphertext-out round trip.

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

## Next actual decoding decision

Do **not** expand the fixed-reserve branch by fitting a secret symbol per word or allowing arbitrary bypass masks. That would reintroduce unobservable state until an authentic original clue selects the symbol schedule. The remaining defensible search is for a **source-selected history-dependent, lossless emission rule** whose state crosses real printed word edges, plus a source-derived inverse table/key and an unchanged original heldout. A stronger proposal must explain the 86/12,901 overall repeat scarcity, the 23/2,873 word-edge rarity, and the near-uniform GP29 marginal histogram simultaneously. A standalone numerical match to these rates, or a synthetic recovery, is insufficient.

No unknown LP2 plaintext is asserted by this report.
