# The omitted 180 Cicada-2013 primes do not unlock LP2 under fixed cyclic-source key models

**Evidence class:** executed, bounded source-key exclusion with original page-disjoint holdout and independently planted English-positive controls. Agent 19, 2026-11-10. **No recovered unknown LP2 plaintext, true key, cipher algorithm or endpoint.**

## Historical input and sharply defined conjecture

The archived Cicada 2013 telnet `primes` display jumps from prime **71** to prime **1229**, omitting the **180 consecutive primes from 73 through 1223**. The two known solved closing pages of LP2, physical pages **56 and 57**, contain **85+95=180 runes**. This exactly matched length is an *exploratory cross-year coincidence*, not an authenticated instruction to combine them. The source is the historical analysis of the original 2013 *remote telnet-service* transcript in [HINTS-NEVER-USED.md](https://github.com/krisyotam/cicada3301/blob/master/liber-primus/analysis/HINTS-NEVER-USED.md). Its original binary/server program has not been authenticated here. The separate recovered 2013 **bootable ISO** script [prime_echo](https://github.com/neuroretransmit/cicada/blob/main/2013/002-3301/rootfs-contents/usr/local/bin/prime_echo) prints all **464** primes from 2 to 3301 and cannot establish how the remote telnet service printed. Moreover, the alleged gap from the **21st through 200th primes** spans exactly **18 complete ten-prime lines** under the ISO script's 10-per-row formatting; a missing or recopied terminal block remains a competing historical interpretation. These provenance limits do not affect the finite mathematical experiment below, which tests the historical *reported* 180-prime data as-is. See the [cross-source gate](historical-may2-whitespace-source-gate.md). The ciphertext and known closing runes are taken from [the canonical LP2 corpus](../resources/liber-primus/lp2-corpus.json).

Define the 180-step candidate keys `K[j]`, reduced modulo 29, for positions `j=0..179`:

1. `p_j`, the jth omitted 2013 prime from 73 through 1223.
2. `p_j + A_j`, where `A` is the observed 180-rune *already solved* LP2 closing ciphertext.
3. `p_j - A_j`.

Test each with two signs, all **180** circular key phases, and two clocks: reset at each physical rune-bearing page or continue through the complete unsolved text. All original decrypted-symbol scores are computed once on even-numbered rune-bearing pages to **select** a candidate, then reported on the disjoint odd-numbered pages **without re-fitting**.

There are three separate, explicit inverses: direct GP additive `P=(C ± K) mod29`; or preceding-ciphertext-excluded **28-symbol rank** extraction followed by `P=(rank ± K) mod28`, using either sorted or cyclic available-rune ordering. For both rank layers, the first observed symbol after reset and any repeated adjacent ciphertext symbol are unknown erasures, never filled with guessed plaintext. A continuous rank clock keeps the prior emitted rune through page breaks. Thus the complete finite family is **3 layers × 3 keys × 2 scopes × 2 signs × 180 phases = 6,480** models.

## Genuine LP2 data and outcome

Original unsolved LP2 is **55 rune-bearing pages**, **12,956 runes**. Its native direct index of coincidence (IoC) is **0.034478397865**, close to the uniform 29-symbol reference **1/29=0.034482758621**. For the three 2,160-setting decoders, selecting *only* by training IoC yields:

| Inverse layer | Selected source and policy | Even-page train IoC | Frozen odd-page IoC | Uniform comparison |
|---|---|---:|---:|---:|
| Direct 29-symbol | `primes + known closing`, page reset, sign +, phase 10 | **0.03466431** | **0.03446474** | 0.03448276 |
| Sorted 28-symbol exclusion | `primes − known closing`, continuous clock, sign −, phase 68 | **0.03589620** | **0.03569102** | 0.03571429 |
| Cyclic 28-symbol exclusion | `primes + known closing`, page reset, sign +, phase 146 | **0.03594761** | **0.03570316** | 0.03571429 |

**No recovered plain-language or GP-English frequency signal.** Training winners have heldout symbol-collision rates extremely close to the appropriate flat-alphabet baselines. The source length relation does not independently select a cipher, clock or phase, and its post-selected appearance must not be treated as a cryptographic proof.

## Constructive power tests on unrelated source plaintext

Use the first 12,956 GP runes of the independently stored Shakespeare source to generate artificial ciphertext on **exactly the original 55 page lengths**, using the actual omitted-primes key, **page reset, phase 37**, and source GP plaintext that the original-ciphertext parameter search never examines.

- **Direct additive plant:** repair **351** attempted consecutive equal glyphs with a different glyph (deterministically, 81% conditional probability). The same blind 2,160-model train scan recovers the planted **omitted-primes/page/sign+/phase37** as its top candidate; heldout IoC **0.06038125** (source GP IoC **0.06106332**).
- **Sorted no-repeat-rank plant:** encode each synthetic source GP rune into the 28-way rank, publish the exact sorted 28-of-29 predecessor-exclusion ciphertext. With page starts as visible literal seed runes, the same blind scan recovers the correct missing-prime key and phase at **rank 1**; heldout IoC **0.06189095**.

These plants are a power check for a genuinely source-matched key and ordinary GP-English-like source register. They cannot exclude skip-driven, AES-KDF, non-periodic or unknown-alphabet key material derived from the same historic artifacts, nor can they establish that the 2013 gap refers to the 2014 ending.

## Implementation and decision

[Complete CommonJS reproducer](../sims/telnet2013_missing_primes_holdout.cjs) reads the two original repository sources, computes the prime list instead of trusting a typed table, asserts the page and 180-rune contracts, runs all **6,480** original candidates, and validates the strict independent planted-key winners. [Successful manual-only CI run 42773742374](https://github.com/FlareZ123/liber-primus/actions/runs/42773742374) executed these assertions using Node 22. No scheduled/per-commit job exists.

**Decision:** retire direct cyclic reuse of these three 180-symbol arithmetic sources as an English-register LP2 key hypothesis. A new test involving the 2013 gap needs an independently sourced key-consumption/derivation rule that predicts an original heldout ciphertext span and exactly reproduces its glyphs. The coincidence of two independently published 180-symbol counts is not sufficient to keep searching arbitrary variants.
