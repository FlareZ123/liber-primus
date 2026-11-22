# LP2 printed word starts: lag1/lag5-conditioned English-prefix test

**Corrected final decision (Agent18, 14 November 2026): No independently significant English-prefix signal, no recovered plaintext, no key.**

The original first-pass experiment inadvertently accepted a four-rune string beginning in a printed word shorter than four runes and **continuing across a printed delimiter**. This was a genuine substantive parser flaw: it could erroneously count a 2- or 3-rune word followed by its next word as an English-looking prefix. That initial 2,895-start test and its marginal p≈0.043 union result are **superseded**, and must not be cited as evidence of plaintext leakage.

## Correct source-constrained test

Using original `resources/liber-primus/lp2-corpus.json` and `lp2-transcription.txt`, derive exactly 2,896 full printed source words, each beginning at its canonical rune coordinate. Only **1,645** original words contain at least four rune symbols **within that same word**; these alone are eligible. Do not cross a printed word boundary or pad from the following word.

Source-native GP29 orthography applied to the three previously checked-in literary controls gives 2,741 distinct Shakespeare four-rune prefixes, 1,395 Gibran prefixes, 3,549 Emerson prefixes, and their 4,369-prefix union. These are frozen before scoring any unknown original rune content.

A source-preserving swap Markov chain keeps every original within-page lag1 and lag5 duplicate-indicator location fixed, every page-local rune multiset fixed, every printed word boundary fixed, and all source page lengths fixed. A swap changing any original equality indicator is rejected. Seed xorshift32 `0x18053301`; 100,000 attempted-move burn, then 350 observations 14,000 swap attempts apart, five million attempts and 3,060,356 acceptances. This constrained Markov sampler has no established uniformity/mixing proof; a matched null is only provisional.

| GP29 prefix set | Original hits, within-word | Conditional-null mean | Range | Null ≥ original | Marginal plus-one upper tail |
| --- | ---: | ---: | --- | ---: | ---: |
| Shakespeare | 10 | 6.3571 | 0–15 | 34/350 | 0.09972 |
| Gibran | 7 | 3.2829 | 0–9 | 19/350 | 0.05698 |
| Emerson | 13 | 8.3086 | 2–17 | 25/350 | 0.07407 |
| Union | **15** | **10.2229** | 3–20 | **31/350** | **0.09117** |

None meets p<0.05 even *before* correction for the four overlapping lexicons. A separately corrected Monte Carlo p-value or a larger lexicon would still require prospective specification and a cipher-consistent positive control before asserting any partial plaintext. The original p32 `HOME` is merely the beginning of a longer ciphertext word and remains post-hoc. No coherent multiword plaintext appears.

## What changed in the research decision

The precise within-word requirement reverses the earlier misleading interpretation: the source-constrained lexical excess **does not survive with usable confidence** after preserving adjacency and lag-five duplicate locations. Do **not** promote any English-looking ciphertext prefix into a crib or justify a new hidden-English decoder on this experiment. Further randomization without an independently source-selected plaintext/register is lower priority than obtaining an actual key or original instruction.

The corrected [CommonJS original-input SFT](../sims/lp2_wordstart_lag1_lag5_conditioned_prefix_sft.cjs) asserts the original 2,896 words, exactly 1,645 eligible word starts, original counts [10,7,13,15], and 350-seed conditional exceedances [34,19,25,31]. No CI was scheduled.
