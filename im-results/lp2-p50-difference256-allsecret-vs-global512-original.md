# LP2 table-cell difference ciphers: exact 256-cell and global512-digit all-key native-language obstruction

**Agent12, 22 November 2026.** This is an independently executed and reproducible **negative cryptanalytic decision** on the unchanged original GP29 source; **no new plaintext, authentic key, or final Cicada destination** has been found.

## Source-visible clue and fully reversible hypothesis

Original LP2 p49–51 prints a 32×8 field of **256 two-character numeric cells**, giving **512 individual printed characters**. The source's 55 rune-bearing unknown physical pages contain 12,956 GP29 ciphertext runes in 2,896 printed words, with **12,901** within-page predecessor comparisons and **86** literal repeated neighbors. Cicada's solved LP1 explicitly names primes and totients, motivating a GF29 difference inverse with a key clock over these exact table dimensions. This is a human-plausible *candidate operation*, not an authenticated creator instruction.

For within-page rune position i, define D_i=(C_i−C_(i−1)) mod29. Under a hypothesized cipher, a secret phase-indexed permutation π_phase of all **29** GP29 symbols maps difference D_i to plaintext P_i. A different completely secret **29! permutation** can be used in each table-cell (period256) or printed-digit (period512) phase. Crucially, the plaintext value of **zero difference may change at every phase**; we do not assume one fixed exceptional rune. The key clock may run continuously through all physical-page first runes, or restart at each page. First runes are excluded from all difference statistics, since their predecessor might be unknown.

This is broader than a literal source-mask Vigenère difference cipher P_i=D_i−K_phase mod29, and encompasses all position-fixed 29-way substitutions of the observed differences. A narrower fixed-zero interpretation had **already been excluded independent of phase size** by the [prior all-841 global-anchor source-word-ordinal theorem](lp2-zeroanchor-root8-allsecret-original-gate.md); this test therefore explicitly allows *changing zero anchors*.

## Exact all-key phase frequency bound

For every phase r, let n[r,d] be the actual untouched original count of GP29 ciphertext difference d in0..28. A bijection can produce a selected plaintext symbol such as the E rune from **one and only one** d per phase. Thus the exact maximum E count over **every possible combination of phase keys** is

\[
U_m=\sum_{r=0}^{m-1}\max_{d=0}^{28}n[r,d].
\]

The computed original values are:

| Clock period | Global rune clock: maximum plaintext E | Page-reset clock: maximum E |
| ---: | ---: | ---: |
| 8 | 579 | 584 |
| 32 | 720 | 730 |
| 64 | 853 | 836 |
| 128 | 1,015 | 1,010 |
| **256 source cells** | **1,276** | **1,279** |
| **512 printed digit glyphs** | **1,671** | **1,310** |

The independently calibrated [5,000 original-word-length solved-Cicada GP-native controls](lp2-cprev-secret-table-majorization-original-gate.md) expect **1,591 E runes**, with the lowest observed **1,468** among all 5,000. This rejects *all secret* period256 and the page-reset512 source-shaped ciphers, even if the zero mapping varies freely by phase. But the **global512** source clock has capacity1,671, so this unigram bound alone cannot exclude it.

## Stronger key-independent global512 equality invariant

Any fixed phase permutation, however secret or nonlinear, preserves equality: two inputs at the same phase are equal **if and only if** their decrypted outputs are equal. The original phase-conditioned collision statistic

\[
Q_m=\frac{\sum_{r,d}n[r,d](n[r,d]-1)}
{\sum_r n[r](n[r]-1)}
\]

therefore cannot change under **any** of the (29!)^512 choices of globally repeating512-phase secret key, including phase-specific exceptional-zero assignments.

The exact original 12,901-site difference tape has:

- **Period512 global:** **11,148 / 312,334** ordered equal pairs; Q=**0.035692559887812406**.
- **Period256 global:** **22,710 / 637,366** ordered equal pairs; Q=**0.035631018912210564**.

Independent deterministic controls assemble **500 entire 12,956-rune GP29 books** from **740 genuine solved Cicada words**, choosing words of exactly the 2,896 original printed word lengths and omitting the exact 55 page-first positions. Their **period512 native plaintext Q** is minimum **0.058463055575121506**, median **0.06064661548214412**, maximum **0.0634513053333931**. Thus all 500 native-GP control plaintexts are mathematically inaccessible from the unchanged original ciphertext under **any** fixed 512-phase secret difference permutation. The apparent 512-global source clock is **retired as an ordinary original-printed-word-space native-GP English decoder**, despite clearing the earlier single-letter ceiling.

This is a structural all-key no-go, not a failure of an insufficient key search. A changing keyed clock dependent on additional ciphertext/rune state, changing word boundaries, other plaintext registers or extra reversible layers is outside the theorem.

## Genuine source-native positive encryptions

The dedicated [global512 original-source equality SFT](../sims/lp2_p50_512_phase_difference_allsecret_equality_sft.cjs) constructs an independently chosen full-length native GP positive plant, then encrypts every rune with **the literal printed 512 digits as additive difference keys mod29**. Every **12,956/12,956** plaintext rune is recovered perfectly. As the theorem requires, its plaintext Q and ciphertext-difference Q are **identically 19,046/312,334 = 0.06097959235946135**. Under the same literal key the *real* original unknown source simply reencrypts exactly and yields only **464** non-page-initial E runes, versus **1,619** in the native planted book. Native controls show that a true GP29-English encipherment would pass the collision invariant.

A complementary [period256/512 all-secret occupancy + additive/dlog original inverse SFT](../sims/lp2_p50_delta256_allsecret_native_e_gate_sft.cjs) covers all29 outputs, actual 256 source table cells and 512 printed digits, exact physical pages, both clocks, and full original/native reencryption. Early versions only tested an old, independently excluded fixed-zero subclass, and its expanded variable-zero source implementation was repaired after a Windows CI failure. Do not infer that ciphertext roundtrips authenticate either literal source key.

[Global512 original equality test: Windows Node22 PASS, run45079569684](https://github.com/FlareZ123/liber-primus/actions/runs/45079569684). [Original 256/512 source-literal fixed-zero controls: Windows Node22 PASS, run45078950990](https://github.com/FlareZ123/liber-primus/actions/runs/45078950990).

## Decision

**Retire a single-layer GP29 cipher consisting of arbitrary secret 29-symbol substitutions of the consecutive ciphertext difference in one fixed globally repeated 256- or 512-position source-table clock, and fixed page-reset clocks of those periods, as an ordinary authentic-native-GP English decoder at the original printed word positions.** The all-secret per-phase E ceiling eliminates 256 and page-reset512; the exact same-phase equality invariant eliminates even the more expressive globally repeating512 full29 alphabet. The original cipher is still unsolved. Do not spend resources guessing this exhausted phase-family's keys. A useful next step needs an independently selected **changing state, nonperiodic key, lossless word-boundary change or different original ciphertext receiver**, and ultimately an authenticated independent plaintext prediction.
