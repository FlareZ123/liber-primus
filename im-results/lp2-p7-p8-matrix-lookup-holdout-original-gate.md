# P7→P8 source matrix: 29-state unknown lookup key recovery fails blind GP29 holdouts

**Agent46, 28 November 2026. Classification: substantial source-specific cipher-class constraint, with an independently successful planted-key recovery; no unknown LP2 plaintext.** [Exact original-source SFT](../sims/lp2_p7_p8_matrix_lookup_holdout_original_sft.cjs) · [successful Windows Node22 original-input CI](https://github.com/FlareZ123/liber-primus/actions/runs/46141876689). The endpoint of this report is a **rejected cipher mechanism**, not a negative claim about the p7/p8 algebraic source relationship.

## Why the direct-key failure did not close this attack

The companion [p7 source-vector/p8 matrix original receiver](lp2-p7-p8-sourcevector-matrix-stream-original-gate.md) rejects setting the additive key equal to the source-state value itself. That does **not** reject a cipher that uses the evolving field state to **index an unknown substitution shift**. The state could act as a 29-position key selector, with a hidden table learned from ciphertext. That is a large, meaningful class of source-dependent ciphers, much more flexible than testing one keyed additive stream.

Recover from original artifacts, **without fitting the source state**, the adjacent-page data:

- p7 original five red-word GP0 products **[11,26,8,15,2]** form quartic `P(X)`; its five source-marked zero iterations yield `v=[5,15,28,9,10,24,7]`.
- p8 original 49 printed black fragment lengths form the 7×7 GF29 matrix **M**; `Mv=[2,28,5,28,23,28,27]` and the p8 first black word's GP0 product fixes output coordinate **K=2**.
- The actual unmodified original ciphertext receiver is p8 black243 + the remaining contiguous printed p9–p14 runes, length **1,717**, with no page-reset or adjusted initial phase.

The frozen family is deliberately generous: use each of the three source-named linear state recurrences `M`, `M^-1`, `P(M)`; allow the two clock origins `v` and one source matrix step; and at **every rune** compute `k_t = state_t[K]`, `state_{t+1}=A state_t mod29`. Instead of assuming that `k` is the shift, allow **every possible unknown static map** `f:{0,...,28}→{0,...,28}`:

```
P_t = (C_t - f(k_t)) mod 29 .
```

That is **29 independent unknown shift values** and includes nonbijective tables, all permutations, identity, and every ordinary 29-symbol affine key lookup. It is much more permissive than the source-plain additive key. Its fitting objective, however, must not touch the original holdout, because with 29 unconstrained shift entries it can manufacture apparent language on training ciphertext.

## Fixed supervised inverse with independent source-native language

Use only original solved GP29 text for the prior. Divide the original relikd reference records into two *disjoint* sets:

- First **3** source records: **856 native GP29 runes**, used only to build a static 29-symbol unigram reference with **0.5 pseudocount per symbol**.
- Remaining **6** solved records: **2,123 GP29 runes**, of which the fixed slice [200,1917) gives **1,717 truly independent native-GP runes** for planted-key calibration. No overlap with the reference corpus.

Given any original **training** index set, recover the entire 29-entry table by independently maximizing each key state's count-weighted native-GP unigram log-likelihood over all 29 possible shifts (no random seed, key search, English word choice or hidden holdout). Apply the exact fitted table to three **predeclared held-out partitions**:

1. First850 original p8–p14 runes train → remaining867 holdout.
2. Last867 train → first850 holdout.
3. **All 1,474 later runes** train → **untouched original p8 black243** holdout.

Every original/derived key/forward and inverse formula is explicit in the script. The split #3 is especially important: **p8 itself** must be predicted, not fitted, despite being the source of M.

## Results: no source-selected hidden plaintext

A representative summary of all **six** source recurrences/clock origins is:

| Source matrix clock | Test last867 GP29 mean log-likelihood | Test p8-only243 mean log-likelihood | Direct original p8-only recovered IoC |
| --- | ---: | ---: | ---: |
| M, initial v | −4.078720 | −4.131532 | 0.034010 |
| M, initial Mv | −4.054832 | −4.020244 | 0.033840 |
| M⁻¹, initial v | **−3.897204** | −3.909730 | 0.036663 |
| M⁻¹, initial M⁻¹v | −4.001534 | −3.956398 | 0.033262 |
| P(M), initial v | −3.964430 | −4.001092 | 0.035200 |
| P(M), initial P(M)v | −3.980773 | −3.941522 | 0.033364 |

For reference, **unchanged ciphertext** scores **−3.971386** on last867 and **−3.957036** on p8-only243 under the same fixed native-GP prior. Even after fitting 29 secret entries on independent training ciphertext, **every original heldout recovered IoC is below 0.040** (actual p8 variants 0.033–0.037). Genuine original solved GP29 language contains far stronger coincidence structure, and the deliberately planted source-native control below scores approximately **−3.0**, not −3.9 to −4.1.

The best *isolated* gain occurs for backwards M⁻¹ at the first→last split (−3.897 versus −3.971). That is not authentic language or a decipherment. Against an **exhaustive 1,717-shift fixed-marginal phase control** of exactly the same backward source-state tape (held-out score after refitting each shift), the original unfitted phase ranks only **53/1,717** on that split (3.1% tail). The independent reverse split ranks **602/1,717** (35.1% tail); the p8-only holdout ranks **391/1,717** (22.8% tail). It does **not** reproduce as a source-phase signal in the two independent holdouts, even before accounting for six source-clock variants.

## Positive recovery actually works, without plaintext leakage

Encrypt the **disjoint** 1,717-rune solved-GP plant with a nontrivial, independently frozen full 29-entry secret

```
f(k) = (7k + 11) mod 29
```

and the **same** six source recurrences, state-coordinate K, clock conventions, training and holdout split. The unchanged fitting method recovers **28 or 29 out of all 29 secret table entries**, depending on source clock. Blind heldout decoded GP29 has **IoC >0.058** and native-GP mean log-likelihood **better than −3.05** in every variant, with no use of held-out language to choose table entries. The exact planted forwards and inverse transformations are part of the one-file SFT.

This is therefore not a test that is trivially insensitive to genuine GP29 plaintext: an author-selected 29-state shift table could have been recovered if this state/chapter clock and model were correct.

## Causal consequence

Under the explicit and source-constrained p7 orbit/p8 fragment matrix, **a fixed arbitrary 29-entry additive lookup from a source-selected state coordinate cannot account for the original p8–p14 cryptogram** as ordinary GP29 language. This cuts off the entire simple hidden-table rescue of the failed direct additive stream, including all static affine and permutation key lookups, without searching thousands of phases or crediting post-selected English.

The broader manuscript mystery and p7→p8 structural source algebra remain unsolved. Further effort here should seek a first-party instruction specifying a **different typed operation** (stateful feedback, a different symbolic carrier, transposition plus substitution, external key material, or another authenticated receiver). Avoid treating the weak one-fold backwards score as a new key or a license for phase tuning.
