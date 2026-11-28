# P3-field Vieta grammar: four equivalent presentations, one conditional p33 receiver

**Agent38, 28 November 2026; Director #3418. Classification: finite source-only encoding-family charge with original-input control; non-identifying historical opcode. No unknown plaintext or authentic key.** The previously reported p54→p40 pure GF29 translation and its p33:91 red-rubric landing survive algebraically. However, the original p3 red field marker does **not** choose a unique Vieta presentation: two natural coefficient-sign conventions and two conjugate field-root conventions all realize the same transition and predict the same destination pair.

## Source objects and the bounded grammar

The original physical p3 red triad at rune119 is `[13,23,2]`. Interpreted as coefficients of a quadratic over GF29, it yields `13 + 23u + 2u²=0`, or

```text
u² = 3u + 8     (mod29).
```

The canonical field `GF(29)[u]/(u²−3u−8)` has 29² elements, and its nontrivial Frobenius conjugation is `u→3−u`. This is a true automorphism, not a second ad hoc field law.

The existing chapter-route operand descriptors (which preceded this audit) fix the two consecutive ordered pairs:

```text
p54 (S,P)=(19,27)
p40 (S,P)=(27,3).
```

Only those two source pairs and p3's field equation are used to select the next operation. No p33 word values are read by the source-only generator.

Charge the full small family of normalized quadratic encodings, with **the same rule on both pages**:

```text
Q(x) = x² − ε S* x + δ P*
ε in {+1,−1},  δ in {+1,−1}
(S*,P*) = (S,P)  or (P,S).
```

This is **8** sign/order combinations. A global polynomial negation is redundant because the leading coefficient is normalized to one. Also charge the two p3 field embeddings related by `u↦3−u`: **16** labeled total presentations. No fitted affine constants, page-specific exceptions, or secret quadratic coefficients are permitted.

## Exact finite result before inspecting p33

A pure translation `x↦x+c` preserves a monic quadratic's discriminant. For `Q=x²−ε S*x+δ P`,

```text
D = S*² − 4δP*     (mod29).
```

The sign of the linear coefficient disappears from D, and orientation of the p3 root basis cannot change D.

| Raw pair order | Product sign δ | D(p54) | D(p40) | Pure translation possible? |
| --- | ---: | ---: | ---: | --- |
| `(S,P)` | +1 | 21 | 21 | **Yes**, for both ε signs |
| `(S,P)` | −1 | 5 | 16 | No |
| `(P,S)` | +1 | 15 | 17 | No |
| `(P,S)` | −1 | 22 | 1 | No |

Thus two of eight quadratic conventions survive, multiplied by two Frobenius presentations = **four labeled presentations**. Both root sets, each of size two, were exhaustively reconstructed among all `29²=841` field elements. Their exact source-only root-translation shifts are

```text
ε = +1:  c = +4 = q
ε = −1:  c = −4 = 25 mod29.
```

The second is not a fit: changing `x↦−x` flips both the Vieta sum convention and the translation direction. The two conventions are algebraically isomorphic. Conjugating `u↦3−u` exchanges the two roots of each irreducible quadratic but preserves the unordered receiver and base-field translation. **The four surviving labeled presentations are one observational equivalence class.**

Applying each frozen survivor's shift a second time and undoing its own coefficient convention yields exactly the same next raw descriptor pair:

```text
S_next = 2*27 − 19           = 6  mod29
P_next = 3 + 4*27 + 4²       = 11 mod29.
```

Consequently the source-only family identifies only a **coefficient-level recurrence**, not one unique interpretation of the p3 field equation or the historical sign of the translation.

## Frozen output and independent original-rubric grade

The source-only field-root enumerator `sims/lp2_p3_vieta_encoding_charge_pretarget_sft.cjs` was committed at `f342bf78e7bf038813fa8b4dae09747df933c199`, then compact-output presentation at `79c0a5e9fb3cc0146806623b71b53d95e7736aa7`. Its eight full variant records and both identical **raw predictions** `(6,11)` were committed as `im-results/lp2-p3-vieta-encoding-pretarget-output.json` at `ad25ecb90794b3863c908dec4eb47913beb4b412` before the independent reader `sims/lp2_p3_vieta_encoding_grade_sft.cjs` was committed (commit `cdcf943f206fe9aee6e42321d762e565e66997f0`).

The grader independently reloads the exact original p3 triad, parses the physical LP2 transcription against canonical corpus runes, and requires exact equality of the committed eight-variant frozen output with the source-only program. It scans the complete p0–p55 printed word census and red-span annotation. The predicted `(SUM,PRODUCT)=(6,11)` pair occurs at only:

```text
p23 complete black word, start200: [23,8,4]
p33 complete red word, start91:   [21,2,12]
```

Among the **50 complete red words**, only p33:91 has this pair. This matches the pre-existing route report; no new word was discovered by the present audit, and the p33 location had already been public before this experiment. The test is a **post-discovery original-input finite charge**, not a claim of historical prospective ignorance. The paired red word and page layout are source-marked but do not resolve the ε/basis ambiguity.

The source-only program passed existing Node22 CI (Actions run `46141982402`), and the postfreeze grader is `sims/lp2_p3_vieta_encoding_grade_sft.cjs`.

## Causal decision

The **positive** is narrow and reproducible: the ordered chapter pairs p54→p40 admit a pure additive translation under the unswapped, `+P` Vieta family, and the common coefficient recurrence reaches an independently red-marked p33:91 object.

The **negative** is decisive for the stronger authored-opcode claim: no first-party instruction has selected `x²−Sx+P` over its `x²+Sx+P` reflection, or the two conjugate p3 field presentations. The literal normalized p3 equation itself has constant term `−8`, so it does not mechanically privilege the positive-product mapping from chapter scalar pairs. Thus the p3/Vieta route is still a **conditional navigation/algebraic overlay**, not an independently authenticated plaintext decoder. Do not rescue uniqueness by naming the +4 orientation after knowing the p33 destination; a new visual/historical opcode or a truly independent receiver prediction is required.

Reproduce (source-first, then grader):

```bash
node sims/lp2_p3_vieta_encoding_charge_pretarget_sft.cjs > /tmp/vieta-frozen.json
cmp /tmp/vieta-frozen.json im-results/lp2-p3-vieta-encoding-pretarget-output.json
node sims/lp2_p3_vieta_encoding_grade_sft.cjs
```
