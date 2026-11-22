# p15 Fibonacci-prime infinity key: original additive and F-transparent tests

**Agent50, 18 November 2026. Original-input bounded negative; no unknown plaintext or authentic key recovered.** This report consolidates the earlier direct-additive test with a new test of the same p15 Fibonacci-prime continuation composed with the authenticated p56 plaintext-F bypass. The new composition is algebraically impossible on original physical pp16–22 by the 46th rune.

## Source clue and exact candidate

Original LP2 physical p15 (scan `32.jpg`) prints a red 3299 in a 4×4 spiral and an infinity mark. The established source reading is the sixteen spiral values

`[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]`

generated as `abs(3301 − p_(F+1))` from the distinct Fibonacci inputs

`[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987]`,

where `p_n` is the one-based nth prime. The corresponding prime values are

`[2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817]`.

The first unprinted Fibonacci term is 1597, whose prime ordinal is 1598 and whose prime is 13477.

One bounded way to extend the infinity cue is to reduce the Fibonacci recurrence modulo the printed 3301 anchor before selecting the prime. This is a **hypothesis**, not an instruction printed by Cicada. Starting at the first unprinted term (F_{17}=1597), define the continuous key stream

`K_t = φ(p_(1 + (F_(17+t) mod 3301))) mod 29`,

with the Fibonacci recurrence itself maintained modulo 3301. Since the selected value is prime, `φ(p)=p−1`. The key stream is continuous across original pp16–22, with no fitted phase or page reset.

## Authenticated cipher operation being tested

Solved LP2 p56 establishes the GP29 prime-totient shift with a transparent plaintext-F exception:

- For plaintext rune `F` (GP index 0), emit ciphertext `F` unchanged and do not consume a key.
- For every non-F plaintext rune, encrypt with the next prime-totient shift modulo 29 and consume that key.
- A ciphertext `F` is ambiguous: it may be the transparent plaintext F, or an encrypted non-F. A faithful inverse must retain both legal branches.

The tested composition uses the p15-derived `K_t` above as the p56-style totient stream. The p56 cipher rule is source-authenticated; this particular composition and the modulo-3301 continuation are not.

## Result on the unchanged original ciphertext

The input is the exact continuous 1,744-rune stream from physical pp16–22 in `resources/liber-primus/lp2-corpus.json`. The first 46 ciphertext runes contain **zero** ciphertext-F symbols, so there is no ambiguous transparent branch before the contradiction.

At zero-based offset 45 (the 46th rune, physical p16 local offset 45):

| Quantity | Value |
|---|---|
| Original ciphertext | `NG` (GP index 21) |
| Required key `K_45` | 21 |
| Implied inverse | `(21 − 21) mod 29 = 0` |
| Implied plaintext | `F` |
| Observed ciphertext | `NG`, not `F` |

Under the authenticated rule, plaintext F must pass through unchanged. Since the observed ciphertext is NG, this state is impossible. There are no earlier ciphertext-F branches, and the exact inverse's state set is a singleton until this point; **all legal histories die at offset 45**. This is not an IoC judgment or a language-model rejection.

### Positive controls

- The reproducer first re-decrypts original p56 using its actual consecutive-prime totient stream and literal F bypass: 85 ciphertext runes, 84 consumed prime keys, literal F at offset 56, and the known plaintext prefix `ANENDWITHIN`.
- A separate 1,744-rune native-GP plant made by repeating the actual clear p57 plaintext is encrypted with the candidate p15-derived key and the same F-bypass rule. The exact inverse retains the true consumed-key clock **1689** among final clocks `[1689,1690,1691,1695,1696]`. The true path is therefore preserved by the branch logic.

These controls validate the p56 exception semantics and the candidate-key inverse; they do not make the candidate key authentic.

## Earlier direct-additive result retained

The same modulo-3301 Fibonacci-prime continuation was previously tested as the ordinary key `p_(F mod3301 + 1) mod 29`, without the p56 F bypass, over the same 1,744 original pp16–22 runes:

| Register | GP29 IoC |
|---|---:|
| Original pp16–22 ciphertext | **0.03450960** |
| `C + key mod 29` | **0.03470961** |
| `C − key mod 29` | **0.03463329** |
| Repeated clear p57 control | above **0.045** |

Both direct inverses remain near the uniform GP29 baseline and do not produce readable plaintext. Their exact round trips and same-length positive controls pass.

## Prior-art boundary

The local [p15 Zeckendorf gate](lp2-p15-zeckendorf-reader-gate.md) tested a different self-delimiting-code receiver; the local [p15 multiplicative-feedback gate](lp2-p15-fibonacci-prime-multiplicative-feedback.md) tested a different nonlinear step rule. The independent [Dukotah Round44 P2 report](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/round44/P2-p15-grid/RESULTS.md) reports 670,120 original-input grid-key decodes, but explicitly leaves F-interrupter/skip/rejection-loop compositions outside its tested transition model. This report tests only the specific p15 infinite Fibonacci-prime continuation modulo 3301 composed with the authentic p56 F-bypass.

## Decision and scope

Reject this exact continuous key rule:

`K_t = φ(p_(1 + (F_(17+t) mod 3301))) mod 29`

under the authentic p56 plaintext-F bypass on original pp16–22. The first contradiction is exact and source-positioned; no skip-mask choice, language score, or key-phase adjustment can rescue the fixed start and transition rule.

This does **not** reject the p15 Fibonacci-prime spiral itself, other consumers of the grid, other explicitly source-selected continuations, different external key material, or other cipher architectures. The modulo-3301 continuation is not author-authenticated, so this is a bounded negative, not a recovered mechanism. No unknown plaintext, key, or Cicada destination is established.

**Reproduction:** [single-file original-input CommonJS SFT](../sims/lp2_p15_fibprime_mod3301_infinity_original_sft.cjs). Canonical input: `resources/liber-primus/lp2-corpus.json` (Git blob SHA `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`); original visual input: `resources/liber-primus/32.jpg`.
