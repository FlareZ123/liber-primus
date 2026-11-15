# Complementary Möbius source test: opposite divisor direction and chapter resets

**Decision (15 November 2026).** Original LP1 p05 says **MOBIUS** and explicitly foregrounds primes and Euler's totient. The direct GP29 **divisor-sum** inverse with *continuous-book and physical-page clocks* was **already tested** in [Agent29's source-exact Dirichlet report](lp2-mobius-dirichlet-original-inverse.md), with identical IoC values **0.034479208136** and **0.034489133962**. [Agent10's arithmetic report](lp2-arithmetic-mobius-totient-inverse.md) separately confirms the whole-book divisor inverse. Those two outcomes are replicated in the new SFT as regression controls, and **are not newly discovered**.

This complementary study tests exactly **four distinct, previously unreported reset/direction combinations**: (i) the mathematically different *sum-over-multiples* zeta inverse on the book, each page, and each of the nine visually delimited chapters; and (ii) the standard sum-over-divisors inverse with **nine-chapter resets**, absent from the prior book/page audit. No one-step native-GP plaintext emerges.

## Frozen original assumptions

- Original LP1 p05's mixed numerical/rune-cell matrix spells MOBIUS at row 3, col 5 and names the totient; source operation remains **hypothetical**. Nothing Cicada-authenticated selects divisor arithmetic, its operand register or a reset.
- Standard divisor-zeta encoding: C[n] = sum(P[d] for d dividing n) mod29. Standard opposite *multiple-zeta* encoding: C[n] = sum(P[m] for m a positive multiple of n) mod29. The two are **different matrices** on the same 1-based length-N finite stream. The divisor inverse proceeds upward, the multiple inverse downward.
- Input is unchanged `resources/liber-primus/lp2-corpus.json`: GP29 indexed original p0–55 in printed order, 12,956 runes, page50 empty. The frozen chapter lengths are 729,1145,1729,1903,1021,1433,1680,3008,308. No ciphertext-selected key, phase, modulus, printed-word remapping, or F exception.
- The existing book/page divisor models are retained only to show exact reproduction of the older published baselines.

## Exact original-cipher outcomes

| Clock | Divisor inverse IoC | Multiple inverse IoC | Research standing |
| --- | ---: | ---: | --- |
| Whole book | 0.034479208136 | **0.034485869044** | divisor prior; multiple new |
| Nine visual chapters | **0.034495675712** | **0.034440910893** | both new |
| 55 original rune-bearing pages | 0.034489133962 | **0.034470104498** | divisor prior; multiple new |

The original ciphertext GP29 IoC is **0.034478397865**. The original solved clear p57 has **0.062709966405**. All **four new** inverse outputs remain indistinguishable from the roughly uniform source register under this single whole-book statistic, and their continuous opening is nonlinguistic. Whole-book multiple inversion begins `NG M T F M W X E H C W S F A U X P T I R D NG E EA H L F TH P`. Chapter-multiple inversion starts `I X X F EO NG S R OE O B R E S A G TH L T J M TH NG D F L N N N`.

## Reproducer and decision

[One-file Windows Node22 CommonJS original-cipher SFT](../sims/lp2_mobius_divisor_inversion_original_sft.cjs) independently checks both directions, forward/reverse exact 12,956/12,956 reconstruction, and all-95 original p57 GP-native positive plants. The duplicated divisor book/page baselines agree numerically with the earlier report. The four new models are narrow finite exclusions for **direct one-layer GP-native English recovery**; they cannot rule out an external key, non-English intermediate, altered segmentation or geometric Möbius operation. A new historical selector for the direction and operand is needed before any further inversion family is warranted. No original p0–55 plaintext or author-derived key was recovered.
