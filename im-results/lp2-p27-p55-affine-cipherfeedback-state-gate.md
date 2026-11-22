# P27/p55 copied six-rune words: locally changing ciphertext-feedback state gate

**Decision, 15 November 2026.** The genuine repeated `DJU BEI` ciphertext is a possible *navigation* clue, but it does not determine a locally changing key. Under an intentionally favorable first-order reversible GF(29) ciphertext-feedback hypothesis, the original copied words plus p56's first independently deciphered rune leave **841 distinct IV/update parameter combinations**, yielding **every one of the 29 possible plaintext runes** at both of the first two unshared p27 positions. Requiring the next known p56 rune leaves 27 combinations; requiring the third leaves **zero**. No unknown LP2 plaintext or creator key was recovered.

The exact original-input, independent-plant [Node22 SFT](../sims/lp2_p27_p55_affine_cipherfeedback_state_sft.cjs) reads the repository's [physical LP2 corpus](../resources/liber-primus/lp2-corpus.json). The test uses runic indices (0–28) and no English dictionary, fitted key phrase, cyclic phase or speculative prime-weight conversion. It complements the [six-rune seam source study](p27-p54-repeated-7gram-periodic-key-gate.md) and the prior [three-tape terminal test](lp2-p27-p55-three-tape-terminal-gate.md); those already exhaust several direct additive/XOR constructions.

## Original visible geometry and assumptions

- In original physical **p27 / scan `44.jpg`**, ciphertext offsets **28–33** are `D.J.U B.E.I`; in physical **p55 / scan `72.jpg`**, offsets **70–75** contain the identical two complete printed words at the page end. The preceding ciphertext symbols differ: p27[27] is **F/index0**; p55[69] is **X/index14**.
- P27 offset **34** and the first rune of solved physical **p56 / scan `73.jpg`** are both **AE/index25**, extending the ciphertext copy to the unique seven-rune cross-page seam. P27 offset 35 is **F/index0**; p56 offset1 is **J/index11**. This is a source copy, **not an independently established common plaintext**.
- Authentic p56 prime-totient decoding of its first three ciphertext runes `AE J OE` gives known plaintext **A N E** (GP indices 24,9,18), because the first three true shifts are **1,2,4**. All three positions precede its known plaintext-F exception, so there is no F-mask ambiguity in this finite test.

To grant the shared-state hypothesis its strongest simple version, test the reversible stream cipher

```text
C[t]     = (P[t] + S[t]) mod 29
S[t+1]   = (a*S[t] + b*C[t] + c) mod 29
a,b,c,IV ∈ {0,...,28}
S[0]     = IV for both page p27 and page p55
```

The update is locally changing and **nonperiodic for generic parameters and inputs** because each actual ciphertext symbol feeds back into the next state. We impose the *extra*, unproved condition that the six copied original ciphertext runes also have **identical plaintext**. That condition is equivalent to equal entering states at p27 offset28 and p55 offset70; identical six ciphertexts then give identical six following states. We provisionally carry the p55 state across the p55→p56 page boundary to make the known first p56 rune available as an anchor. Both the shared-IV assumption and cross-mode carry are hypotheses, not creator-authenticated instructions.

This test is generous to a possible repeated-plaintext state link: if a link already fails with shared IV and carried state, its failure does **not** exclude other reset schedules, a different update law or a changed cipher mode at solved p56.

## Derivation independent of model-fitting scores

For any fixed `a`, the state at prefix length `n` is a linear function of three unknowns `(IV,b,c)`:

```text
S[n] = a^n * IV
     + b * Σ(j=0 to n-1) a^(n-1-j) C[j]
     + c * Σ(j=0 to n-1) a^j           (mod 29)
```

The two source/known constraints are

```text
S_p27[28] = S_p55[70]  (assumed identical six-rune plaintext)
S_p55[76] = C_p56[0] - P_p56[0] = 25 - 24 = 1 (mod 29)
```

Enumerate all **29^4 = 707,281** candidate quadruples with the exact source coefficients. Only **841** satisfy both; **29** have `a=0`. On those 841 candidates, p27 offset34 is forced to A solely because the seventh original ciphertext rune equals p56's first; it is conditional, **not recovered unknown plaintext**. At offsets35 and36, the 841 surviving parameter combinations produce all **29 possible GP rune values** each. Consequently even the two first untouched p27 glyphs remain unconstrained.

For the *second* solved p56 plaintext N, its required state is `11−9 = 2`, adding

```text
(a*1 + b*25 + c) mod 29 = 2
```

Exactly **27** candidates remain. They force p27 offset35 to index27 (**IA**) and leave **19** different plaintext symbols at p27 offset36. The *third* solved p56 plaintext E requires state `22−18 = 4`; the new update `(a*2+b*11+c) mod29 = 4` is incompatible with **all 27** survivors. This decisively rejects the frozen single-mode, shared-IV, first-order affine ciphertext-feedback model across the p55/p56 seam, without needing an English register.

A more general mathematical obstacle applies to **any reversible-in-state transition** `S′=T_C(S)`: for a fixed ciphertext sequence, a composition of bijective `T_C` maps is bijective, so two distinct entering states **cannot synchronize merely because six or seven ciphertext runes repeat**. In the tested affine family, their difference after six equal runes is `a^6 ΔS`; this never vanishes for nonzero `a` unless `ΔS=0` already. Source repetition could synchronize a noninjective shift-register update, or an explicit reset could equalize states, but neither is selected by the copied words. For `a=0` here, the extra first-rune plaintext equality forces `b=0` because source predecessors F/X differ, reducing it to a constant state, which fails known p56's second rune.

## Controls, result and next research decision

The same decoder/encoder, using the original **95 native GP runes of clear p57** as synthetic plaintext and an independently fixed `(a,b,c,IV)=(7,11,3,5)`, exactly recovers **95/95** symbols after encryption. It is an implementation check; the synthetic positive supplies no unknown-page key.

**Outcome:** A copied six-rune ciphertext block does not by itself reveal a mutable cipher state. The one concrete short-memory feedback architecture has a quantitative underdetermination at the first known rune and an exact contradiction once the historical p56 solution is required through its third symbol. If p56 begins a new mode, that contradiction no longer applies, but then the solved-page anchor disappears and there is no disjoint p27/p55 plaintext prediction. To reopen this line, one needs a **separately player-visible instruction** specifying a noninjective state update or reset, its initialization, and a decoding operation. Repeating direct seam alignment, arbitrary affine keys or p56 prime-totient restarts cannot supply that missing instruction.

No finding here changes the [authoritative established-results synthesis](../results/README.md); these are conditional exclusions and an identifiability argument, not a decipherment.
