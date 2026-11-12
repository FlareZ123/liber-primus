# P15 Fibonacci-square self-indexed plaintext-key gate

**Scope (Agent 15, 12 November 2026):** A finite, reversible original-cipher hypothesis involving the fully solved numerical 4×4 grid on LP2 physical p15. **Result: negative for the exact tested family. No unknown plaintext or authentic cipher key recovered.** Reproducer: [single-file SFT](../sims/lp2_p15_plaintext_selfindex_key_sft.cjs).

## Source constraint and candidate inverse

The original p15 square has 16 decimal values. The independently recovered mathematical operation is `abs(3301 - prime(F_n+1))`, where `F_n` runs through the first sixteen *distinct* Fibonacci values; [the p15 result](../results/lp2-p15-fibonacci-prime-spiral.md) gives all original print readings and the spiral start. Because the printed values all fit inside the book's **12,956** unknown runes, test a literal book-address interpretation, in which **16 unknown plaintext runes at the p15-selected addresses** form a repeating period-16 GP29 additive key. This tests a plaintext-selected key rather than simply reading ciphertext at those addresses, which an existing [source-key test](../sims/fibonacci_self_index_key.cjs) had already examined.

Let `a_j` be one of six complete source-valued address lists, and `b` its zero- or one-based offset. Hypothesize `K_j=P[a_j-b]` for `j=0..15`, and `C_i=(P_i+s K_{(i+phi) mod 16}) mod 29`, where `s=±1` and `phi=0..15`. The original ciphertext directly supplies 16 simultaneous GF(29) equations:

`K_j + s K_{(a_j-b+phi) mod 16} = C[a_j-b] (mod 29)`.

Gaussian elimination therefore solves all compatible keys **without a language model, a guessed crib, or any unknown-input fitting**. An inconsistent system is impossible under that exact variant. A consistent full-rank system fixes a unique key, whose inverse is tested on every original rune. A consistent underdetermined system is represented by one zero-free-variable witness and is insufficient to exclude all possible choices of its remaining key coordinates.

## Frozen family and original results

Six lists: printed p15 16 values in spiral or printed row order; the 16 source-derived prime values in both orders; the sixteen distinct Fibonacci inputs; and their one-based prime ordinals. For each list, two address origins, two additive signs and all sixteen repeating-key phases were evaluated. Negative address positions are marked invalid rather than wrapped to a new location.

| Outcome | Exact count |
|---|---:|
| Total attempted configurations | 384 |
| Algebraically consistent | 96 |
| Consistent printed-spiral / printed-row | 10 / 16 |
| Consistent prime-spiral / prime-row | 25 / 19 |
| Consistent Fibonacci / Fibonacci ordinal | 9 / 17 |
| Best original-consistent global IoC | **0.034554193995** |
| Original ciphertext global IoC | **0.034478397865** |
| Solved p57 GP-native plaintext IoC (context only) | **0.062709966405** |

Best consistent candidate is **prime values, source spiral, one-based absolute rune addresses, +1 encrypting sign, phase12**, with unique rank16. Its recovered period16 key is GP indices `[12,19,23,4,26,8,28,14,8,1,18,26,12,25,28,2]`. Its decoded original has ciphertext-like rune frequencies and no authentic readable GP prose; exact reencryption is automatic for any algebraically admissible key. Other candidates likewise do not recover language.

The SFT checks the 12,956 original runes, source-visible 16-value arrays, every equation, every full original re-encryption, exact histogram results, and a 12,956-rune **known-plaintext planted control** whose key is derived from its own plaintext at the same addresses. The rank16 positive recovers all 16 planted key symbols and every planted plaintext rune exactly. The plant validates implementation; it does not validate author intent.

## Decision

Retire direct 16-period additive GP29 decoding with the tested original p15 source addresses and self-referential plaintext key. Some source variants can be made algebraically consistent for *any* ciphertext; these are not candidate partial decryptions. The p15 grid is demonstrably a mathematical generator, but no original source instructs the conversion to plaintext-based whole-book addresses, the modulus29 repeating-key consumer, or the tested reset/phase convention. A different independently source-selected consumer, state clock or intermediate register remains untested.

This report does not supersede the established exact p15 spiral mechanism or claim an unknown rune decryption.
