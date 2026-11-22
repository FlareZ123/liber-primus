# LP2 differential-affine constant-anchor all-secret obstruction

**Agent24, 22 November 2026. Original-input mathematical narrowing. No recovered unknown LP2 plaintext, source-authenticated decoder, or final Cicada destination.**

## Decisive original-cipher result

Original physical pp0–55 contain **12,956 GP29 runes** in **2,896 authentic complete printed words**, including **32** cross-page-carried words. The manuscript contains only **86** adjacent-identical rune pairs. Original p7 red-word arithmetic has the field factor `X²−8`, and 8 generates all 28 nonzero GF29 elements; this motivated examining invertible difference transport over GF29.

A broad candidate cipher architecture is

```text
D[i] = (C[i] − C[i−1]) mod 29
D[i] = b + A[i] × (P[i] − r) mod 29
P[i] = r + inverse(A[i]) × (D[i] − b) mod 29
```

where both **constant anchors `b,r` are entirely unknown** GP29 values, and the secret multiplier **`A[i]` is any independently unrestricted nonzero GF29 element at every rune**. It may depend on prior ciphertext, unknown keys, or arbitrary plaintext feedback. The operation is reversible for every choice of secret multipliers. Its critical keyless necessary condition is:

```text
D[i] = b    if and only if    P[i] = r
```

This must hold at the exact original printed within-word ordinal regardless of **all 29×29=841** unknown anchor combinations and all changing secret multipliers. Exclude every first rune of the manuscript's 55 rune-bearing physical pages, because its external predecessor state may be unknown. There remain **12,901** indisputable same-page ciphertext predecessor positions. Keep the authentic printed whole-word boundaries and the exact physical-page omission masks.

The position bins are `j=0,1,2,3,4,5,≥6`. For every `b`, count `D=b` at each actual original printed word ordinal. For every `r`, obtain expected `P=r` occurrences by sampling only **genuine solved Cicada GP29 words** of the *same lengths* into all 2,896 original positions; omit the same 55 original page-first coordinates. Use each donor pool's exact per-bin mean and variance. Score each pair by the seven-bin squared standardized mismatch, with a lower variance bound of one.

The best of **all 841** original pairs is **`b=0, r=G (GP index6)`**. Even this best case has mismatch **82.68045685467047**:

| Within-word ordinal | 0 | 1 | 2 | 3 | 4 | 5 | ≥6 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Original `D=0` counts | 23 | 12 | 21 | 7 | 8 | 6 | 9 |
| Solved-GP native `P=G` expectation | 23.764 | 16.684 | 29.977 | 39.829 | 45.708 | 14.743 | 19.431 |

The substantive conflict is in the positional distribution; the count of rare glyphs alone is misleading. In particular, only seven/eight original zero steps occur at ordinals3/4, against approximately40/46 native G rune events. All 840 other secret constant-anchor pairs have larger mismatch under the same declared authentic solved-GP register.

### Source-native full-book calibration

The [source-original Windows Node22 SFT](../sims/lp2_delta_affine_anchor_allsecret_original_sft.cjs) creates **1,500 separate 12,956-rune full-length native GP29 books** by independently selecting genuine solved Cicada words of each of the 2,896 correct original printed lengths. For every book, the statistic is evaluated for each of all29 possible true plaintext anchors `r`; its *maximum* across29 is retained, conservatively allowing an adversary to select the least-fitting true key.

Across the resulting **1,500 worst-key controls**: 95th percentile **22.06165145**, 99th **27.39531086**, maximum **33.65421925**. **Zero of 1,500 controls** reach the authentic original best-case **82.68045685**. This is a length- and word-position-conditioned solved-native calibration, **not** an unconditional claim about all languages or author behavior. Independent GP29-normalized literary controls agree with the narrow native-language objection: Gibran's best all-841 mismatch **50.03746**, Emerson's **46.51810**, Shakespeare's **52.36820**. They are useful alternative English writing registers, without a separate formal familywise significance claim.

The SFT also generates a genuinely invertible source-root8 variant `A[i]=8^(C[i−1])` for five distinct secret-constant pairs including `(b,r)=(0,6),(0,28),(4,3),(17,17),(19,20)`. Every original-length **12,956/12,956** native-runic planted symbol and independent **95/95** solved-p57 rune is decoded exactly; each plant satisfies the anchor identity at every transition. It **PASSED [Windows Node22 run 45061380334](https://github.com/FlareZ123/liber-primus/actions/runs/45061380334)**.

## Why the 86-event/EА marginal coincidence is insufficient

The source-original 86 equal adjacent ciphertext runes among 12,901 within-page predecessor positions give **0.6666%**. The authenticated solved GP29 donor has **20 `EA` (GP index28) runes among 2,979 total = 0.6714%**. These strikingly similar rates superficially support the special case `b=0,r=28`, for which

```text
C[i] = C[i−1] + A[i] × (P[i]+1) mod29
```

would force `C[i]=C[i−1]` exactly when plaintext `P[i]=EA`.

However, the genuine original has **12** repeated ciphertext events in the second rune of complete printed words (within-word position1). Authentic solved Cicada GP29 words length-matched into all 2,896 original whole-word slots produce **52.1961019401 expected EA at that position**, with an **exact Poisson-binomial lower-tail `Pr(X≤12)=1.468071636745234×10⁻¹¹`**. Independent GP29 English registers give:

| Register | Expected EA at second rune | Exact `Pr(X≤12)` |
| --- | ---: | ---: |
| Authenticated solved Cicada | 52.1961 | 1.4681×10⁻¹¹ |
| Gibran, *The Prophet* | 59.8516 | 3.0733×10⁻¹⁴ |
| Emerson, *Essays* | 49.3183 | 1.5049×10⁻¹⁰ |
| Shakespeare source slice | 56.8890 | 3.3611×10⁻¹³ |

Each tail is conditional on independent sampling from that particular English donor register and the correct original whole-word lengths. The narrower exact EA test and original ciphertext round trips are independently reproduced by [the EA/root8 SFT](../sims/lp2_zeroanchor_root8_original_sft.cjs) ([Windows PASS 45060758299](https://github.com/FlareZ123/liber-primus/actions/runs/45060758299)).

## Actual source-root8 inverse, negative plaintext result

The narrow operational hypothesis `A[i]=8^(C[i−1])`, together with its reciprocal direction `8^(−C[i−1])`, decodes and re-encodes all **12,956 original unknown ciphertext runes**, and independently recovers all **95 solved-p57 PARABLE runes** from planted encryption. Original unknown-book full decoded IoCs are **0.0352993696922** and **0.0352935548028**, with no sustained authentic-GP English text. These tests establish reversibility of the proposed operations; the source does not select those operations as Cicada's actual cipher.

## Decision and scope

**Retire one whole-book GP29 differential-affine cipher with any fixed two anchors, source-preserved word positions, arbitrary evolving secret nonzero rune multipliers, and ordinary native-GP English plaintext.** The all-secret necessary condition fails in every constant-anchor choice, independently of any multiplier search or cryptanalytic optimizer.

This result leaves a changing exceptional difference or plaintext symbol, page-specific independently reset anchors, altered plaintext/ciphertext word boundaries, non-native linguistic registers, variable-length encoding, noninvertible transformations with authentic side information, and a missing historical key instruction open. Do not generalize this exclusion to those models. The source p7 arithmetic independently licenses generator8 as an exploratory operand but specifies no authenticated original unknown-page cipher.

**Reproduction:** `node sims/lp2_delta_affine_anchor_allsecret_original_sft.cjs` and `node sims/lp2_zeroanchor_root8_original_sft.cjs` on Windows 11/Node.js22. Source inputs and controls are unchanged repository `resources/` artifacts. The key next decision is an independently clue-selected variable-state/key operation that predicts an untouched original unknown-page plaintext run, rather than another arbitrary constant-anchor search.
