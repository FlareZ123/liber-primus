# Fibonacci 233 nonzero-step clock: all-secret phase-bijection exclusion

**Classification: exact original-input cryptanalytic exclusion of a deliberately bounded 28-symbol direct-GP architecture.** The factorization below is genuine source arithmetic, but the hypothesis that Cicada used it was proposed after examining the ciphertext. No LP2 plaintext, key, encryption mechanism or historical continuation was recovered.

## Source and proposed 55 × 233 register

The [canonical unsolved original LP2 corpus](../resources/liber-primus/lp2-corpus.json) has 55 rune-bearing pages, 12,956 GP ciphertext symbols and 86 equal adjacent rune pairs within those pages. Remove the 55 page-first independent initializers. Each of the 86 repeated-output steps is now treated as a separately carried marker, so the number of *nonzero* predecessor steps is exactly:

```text
12,956 − 55 − 86 = 12,815 = 55 × 233.
```

Both 55 and 233 are Fibonacci numbers. The latter is also a prime, but the arithmetic alone carries **no evidence** for a 233-symbol cipher key. A 466-step period models a two-bank alternation of the same hypothetical 233-position register.

Two invertible 28-rank transports are admitted for every non-repeated ciphertext pair with previous glyph `a` and current glyph `b` (canonical GP ordinal 0–28):

- **Cyclic**: `d=(b−a+28) mod 29`, producing 0–27 when `b≠a`.
- **Sorted deletion**: `d=b−1[b>a]`, again 0–27.

The model gives a *completely unrestricted secret 28-way bijection* `sigma[phase]` to each phase, shared at all positions whose **nonzero-step clock** is congruent modulo 233 or modulo 466. The clock either continues across physical rune pages or restarts on each one; a repeated step does **not** advance it. A source plaintext letter other than GP-EA maps to exactly one rank value at its phase. The 55 page initial runes and the 86 marker sites may be any independent symbols, so they cannot invalidate the exclusion. This architecture allows up to **466 independent arbitrary 28! keys**. The model still presumes a *direct native-GP plaintext register*, fixed per-phase bijections, one payload glyph per nonzero step and exactly those nonpayload marker sites.

The 233/466 hypothesis differs materially from prior 1–128 direct rank tests and 8/16/32/64/128/256 absolute-rune clock tests: it **compresses out all 86 repeated ciphertext steps before assigning the phase**.

## Key-independent exact theorem

For any phase `r`, write `n[r,d]` for the occurrences of an observed rank `d` in that phase and let `N[r]=sum_d n[r,d]`. The secret `sigma[r]` is a bijection, so an arbitrary fixed plaintext GP symbol may be assigned to *at most one* observed rank `d` in that phase. Consequently:

```text
number of any one plaintext GP rune
  <= CAP = sum_r max_d n[r,d].
```

This is a deterministic whole-book maximum over **all possible secret phase permutations**, independent of English dictionaries, a guessed key, or a language score. A second secret-key-independent invariant follows: the number of equal-symbol pairs in the same phase is exactly

```text
PAIRS = sum_r sum_d n[r,d] (n[r,d] - 1) / 2.
```

A fixed bijection preserves all of those equalities; choosing a secret key cannot increase `PAIRS`.

Original complete-corpus calculations (one nonzero-step rank per payload symbol):

| Rank convention | Key period | Clock | Maximum count of *any* plaintext GP symbol | Same-phase equal pairs / all comparable pairs | Native-GP control result |
| --- | ---: | --- | ---: | ---: | --- |
| Cyclic | 233 | Book continuous | **1,224** | 12,404 / 346,005 | Frequency cap excludes all |
| Cyclic | 233 | Page reset | **1,212** | 13,190 / 368,299 | Frequency cap excludes all |
| Sorted | 233 | Book continuous | **1,218** | 12,299 / 346,005 | Frequency cap excludes all |
| Sorted | 233 | Page reset | **1,220** | 13,104 / 368,299 | Frequency cap excludes all |
| Cyclic | 466 | Book continuous | 1,597 | **6,166 / 169,857** | Equality invariant excludes all |
| Cyclic | 466 | Page reset | **1,283** | 10,943 / 307,634 | Frequency cap excludes all |
| Sorted | 466 | Book continuous | 1,599 | **6,079 / 169,857** | Equality invariant excludes all |
| Sorted | 466 | Page reset | **1,293** | 10,949 / 307,634 | Frequency cap excludes all |

The period-233 book key has about **55 rank observations per phase**; a source GP rune that would need 1,225 occurrences or more cannot be produced even if its ciphertext identity is chosen optimally at every phase.

## Exhaustive native GP source windows and power

The independently checked-in Shakespeare, Gibran and Emerson reference texts were GP-transliterated with the 29-symbol canonical map, including conventional two-letter GP runes and fixed spelling normalization, and their GP-EA characters were **removed**. This is favorable to the candidate interpretation of the 86 authentic ciphertext doubles as separately placed EA markers: the other 12,815 positions may be filled by a contiguous window of non-EA source letters, without requiring the source's own EA positions to align.

For *every* contiguous length-12,815 window of each reference, compute the frequency of its most common GP symbol, then minimize over all possible windows. Period-233 and page-reset 466 are impossible whenever this minimum exceeds the exact original bound above. For continuous 466, compute the *minimum same-phase equality count* over every window, which must be at most the original ciphertext count for a perfect source plaintext match.

| Corpus | All length-12,815 source windows | Minimum possible maximum single-letter count | Minimum period-466 same-phase equal pairs |
| --- | ---: | ---: | ---: |
| Shakespeare | 204,353 | **1,393** | **9,828** |
| Gibran | 49,694 | **1,407** | **10,267** |
| Emerson | 309,592 | **1,475** | **10,313** |
| **All three** | **563,639** | **≥1,393** | **≥9,828** |

Every original 233-period key, in either alphabet and clock, caps every plaintext GP letter at at most **1,224**, less than the minimum **1,393** in *all 563,639 reference windows*. Both page-reset 466 variants cap at at most 1,293, also below 1,393. The continuous 466 variants permit more of one letter but have **at most 6,166** source-phase equalities, strictly fewer than the minimum **9,828** in the source windows, independent of every unknown secret key.

These are exact finite-reference exclusions, *not* p-values for all possible languages, hidden source texts or ciphers. They would not refute a constructed plaintext with nearly uniform GP frequencies, a precompressed/binary intermediary, hidden clock drift, changing phase keys, variable-length tokens, symbols inserted/removed at additional unmarked positions, or any alternative state architecture.

The same script constructs **eight independent secret-key positive cases**, one per listed model, with genuine source-native Shakespeare GP characters, 28! phase permutations, the original page layout and exactly the original 86 repeated-output slots. All eight inversions recover **12,815/12,815** source payload symbols, re-emit **12,956/12,956** generated ciphertext runes, and produce same-phase native-language equality rates around 0.062. Those synthetic round trips verify code consistency and power under the planted architecture; like every true bijective inverse they **do not identify historical keys**.

## Decision and reproduction

The exact 55×233 count is a useful way to make a Fibonacci clue candidate sharply testable. A **single static table of 233 or 466 secret phase permutations in the nonzero-step clock cannot hide a direct source-native GP prose stream of the three tested kinds**, even when every table entry is an unrestricted unknown mapping. Larger brute-force searches for the same table are unnecessary because both invariants hold for every possible key.

This report makes no claim that 233 is a genuine Cicada parameter, nor that other key schedules or GP-to-byte transports are excluded. The next productive investigation should furnish an independently specified, recoverable evolving state or a non-GP intermediate that predicts actual original words.

- [Standalone original-source CommonJS proof and independent hidden-key plants](../sims/fibonacci233_nonzero_phase_gate.cjs), Node 22.
- [Successful manually dispatched complete CI, run 42846361933](https://github.com/FlareZ123/liber-primus/actions/runs/42846361933), using the existing [repeat-rank manual workflow](../.github/workflows/repeat-rank-periodic.yml) option `attack=fibonacci233`.
- [Authoritative frontier and model identification standard](../workplace/integrated-original-inversion-challenge.md).
