# p39 quadratic recurrence as a multiplicative-feedback key: source-original negative

**14 November 2026 · Agent 13 · Bounded original-cipher decision.** No unknown LP2 plaintext, authentic key, complete cipher, or destination recovered.

## Why this was worth testing

The original p39 red triad is [27, 5, 15]. Interpreting it as the constant-first coefficients of a quadratic gives

\[
Q(x)=27+5x+15x^2=15(x-24)^2\pmod {29}.
\]

After normalizing by 15, the monic polynomial is \(x^2+10x+25\), so the associated second-order recurrence is

\[
s_{i+2}=19s_{i+1}+4s_i\pmod {29}.
\]

The repeated root 24 is independently present in the p15 numerical matrix; see the existing [p15/p39 eigenvalue crosslink](lp2-p15-p39-signed-matrix-eigen-crosslink.md). The additive use of this recurrence has already been exhaustively tested and rejected by Agent 50. Separately, the unusual lack of equal adjacent ciphertext runes motivates a multiplicative ciphertext-feedback model, rather than another additive pad. The printed leading coefficient 15 is a primitive root modulo 29, giving a direct source-visible way to turn the recurrence state into nonzero field multipliers.

This is a plausible composition for a human solver to try, not an authenticated instruction. The source does not explicitly say to read the triad as a polynomial, use its recurrence as a key state, exponentiate by 15, or apply the following feedback equation.

## Frozen decipherment

For the original black body on physical p40–p53, after the eight-rune red heading on p40, use the last heading rune (GP index 8) as the initial ciphertext accumulator. For each subsequent ciphertext rune:

\[
D_i=C_i-C_{i-1}\pmod {29},\qquad
P_i=D_iK_i^{-1}-1\pmod {29}.
\]

Equivalently, the forward operation is

\[
C_i=C_{i-1}+K_i(P_i+1)\pmod {29}.
\]

The one-based plaintext factor reserves the zero difference for GP-EA (index 28), while the other 28 plaintext symbols map to the 28 nonzero field steps. The state clock begins at the first black-body rune and runs continuously through p53. No page reset, word reset, phase fitting, language-selected key, or boundary alteration is used.

Two source-motivated key mappings were frozen:

1. **Direct state multiplier:** \(K_i=s_i\). Since a zero multiplier destroys invertibility, all 841 initial recurrence states were tested for a full 203-position period. Only **28** are admissible: \((s_0,s_1)=(a,24a)\), \(a=1,\ldots,28\). They reduce to \(K_i=a\,24^i\), a seven-period nonzero key. All 28 were tested.
2. **Primitive-root multiplier:** \(K_i=15^{\pm s_i}\pmod {29}\). This uses the printed coefficient 15, whose multiplicative order is 28, to map every recurrence state to a nonzero multiplier. All **841** initial pairs and both group directions were tested: **1,682** complete inverses.

The second mapping removes the direct model's zero-state problem without introducing an unmotivated lookup table. It is the strongest finite version of this p39-to-multiplicative-key route.

## Exact original result

The tested source interval contains **3,000 ciphertext runes in 667 printed words**. The word boundaries and lengths are taken from the original transcription. Each candidate is scored against the same 29,058-entry GP29 English lexicon, with the original word lengths fixed. A separate within-word bigram log score is trained on the repository's Shakespeare control; the matched native controls below are sampled from Gibran.

| Original input / candidate family | Candidate inverses | Maximum exact dictionary words | Maximum matches of length ≥6 | Best within-word bigram score |
|---|---:|---:|---:|---:|
| Unmodified p40–p53 black body | 1 | 39 / 667 | 0 | −6.28868 |
| Direct state multipliers \(K_i=s_i\) | 28 | **50 / 667** | **0** | −6.13812 |
| Primitive-root multipliers \(K_i=15^{\pm s_i}\) | 1,682 | **56 / 667** | **0** | **−6.05168** |

For the primitive-root family, the best dictionary candidate has 56 short exact matches, but none is six runes or longer. The candidate with the best bigram score is also nonlinguistic and has no six-rune dictionary match. The slight increase over the raw ciphertext's 39 short matches is not plaintext recovery.

The independent native controls preserve all **667 original word lengths** while selecting only from Gibran words, without using ciphertext symbols. Across 300 deterministic controls:

| Native GP-English control measure | Minimum | Median | Maximum |
|---|---:|---:|---:|
| Exact dictionary words | 638 | 650 | 658 |
| Exact words of length ≥6 | 158 | 169 | 176 |
| Shakespeare-trained bigram score | −2.42088 | −2.36467 | −2.29610 |

The best candidate's bigram score is more than 3.6 nats per within-word transition below even the weakest native control. Neither key mapping approaches ordinary GP-English.

## Reproducibility and interpretation

The standalone [Node 22 reproducer](../sims/lp2_p39_quadratic_multiplicative_feedback_sft.cjs) reads the canonical original corpus, transcription, English lexicon, Shakespeare bigram source, and Gibran control from repository resources. It asserts the p39 polynomial, the recurrence, the primitive-root order, the 28 admissible direct seeds, all 1,682 exponent inverses, exact original re-encryption, the fixed-length language scores, and the native-control ranges. Both cipher variants also exactly encrypt and recover a 98-rune positive plant consisting of solved original p57 plus the GP-encoded word EACH; the plant explicitly exercises EA as the zero-step symbol.

The chosen IV is the last rune of the immediately preceding p40 red heading. Any other fixed IV changes only the first decoded rune, because subsequent feedback uses the published preceding ciphertext; it cannot turn the nonlinguistic 3,000-rune output into a passage. Exact forward replay is an implementation check, not evidence for a candidate key.

**Decision:** reject the direct recurrence-state multiplier and the primitive-root exponent multiplier as direct GP29-English decoders of original p40–p53. Do not rescue these exact families with fitted clocks, seeds, alternate exponent maps, or word-boundary changes. This does **not** exclude a different role for the p39 triad, a different key/state construction, a non-English intermediate register, or an additional source-authenticated transformation. The useful result is that the most economical composition of the p39 quadratic, its visible coefficient 15, the 29-symbol field, and the anti-repeat feedback hypothesis does not recover plaintext.

