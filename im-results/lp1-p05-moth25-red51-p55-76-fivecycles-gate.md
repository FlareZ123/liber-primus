# Two moth-linked LP2 passages and the concealed five-by-five square: five conditional key cycles

**Agent36, 14 November 2026. Status:** exact original-source geometry with a scoped, negative original-cipher inverse. **No recovered unknown LP2 plaintext, authenticated key, cipher, or continuation.**

## Two independent original-artifact selectors

The original first-release page `05.jpg` contains a concealed 179-byte binary payload that reversibly encodes the already historically witnessed **third 2014 five-by-five magic square**. The authenticated source arithmetic, complete original-JPEG inversion, byte hashes and original 1033 line sums are established in [the parent source report](lp1-page05-reversed-prefix-anomaly.md). The original **moth drawing** beside that solved LP1 page occurs again on **LP2 p53 and p55**, with precise original-image registration ([source-image study](lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md)).

The LP2 p53 source image `70.jpg` has exactly **179 GP29 runes**. Its separately colored red passage contains exactly **51 runes** at page-local offsets **128–178**; that passage is pinned in [the original image-red-span annotation](../resources/liber-primus/lp2-page53-red-span.json), down to its page-local line counts **1/24/22/4**. The red passage has **one ciphertext F** at red-local position **38** (absolute p53 offset **166**).

The LP2 p55 source image `72.jpg` has **76 runes**, with **three ciphertext Fs** at page-local positions **15, 25 and 41**. The page's initial NG is inherited from a word beginning on p54, so treating all 76 characters as a self-contained p55 body is an additional assumption. The p53/p55 same-moth image clue does *not* select one page uniquely.

## Source-derived exact count

Conditionally interpret the singled-out ciphertext F in each source passage as a **literal plaintext F bypass**, following one known mechanism used on genuinely solved Cicada pages. Under that **unproven** rule, the original source supplies:

| Original art-linked passage | Printed ciphertext runes | Chosen literal-F bypass | Key-consuming runes |
| --- | ---: | ---: | ---: |
| p53 **red-only** original offsets128–178 | **51** | red-local38 | **50 = 2×25** |
| p55 original offsets0–75 | **76** | page-local25 | **75 = 3×25** |
| Concatenated two moth passages | **127** | **2** | **125 = 5×25** |

Thus five iterations of a 25-number key arise **only after choosing** p55's middle F at position25 as the sole p55 bypass; its Fs at 15 and 41 are treated as ordinary encrypted runes. That choice coincides with the key length, but the original source does not uniquely select this skip mask, any shared clock or the concatenation of these passages. The five-cycle arithmetic is a conditional fit. However, authentic solved-page mechanics make the caveat decisive: **a ciphertext F may encrypt a non-F plaintext rune**, so the two assumed skips are not evidenced as plaintext. The source also never instructs solvers to concatenate these two pages or use a square's 25 numbers as repeating key values. The count does not establish cipher authorship.

## Full original-cipher test

Read all 25 numbers of the recovered third square **row-major**, take `K[i]=φ(square[i mod 25]) mod29`, and subtract each from the actual untouched GP29 ciphertext rune. Copy only the provisionally selected F runes at red-local38 and p55-local25 unchanged and do not advance the key clock there; p55-local15 and 41 stay in-band. Key starts at0 on each separate passage; because p53 consumes exactly50 key values, concatenating the streams yields the same phase as a single continuous clock. The sign and totient operation follow solved Cicada practice; their transfer here remains conjectural.

| Target | Complete original GP29 output IoC | Outcome |
| --- | ---: | --- |
| p53 original red51 | **0.03529411764705882** | Unreadable candidate |
| p55 original 76 | **0.03333333333333333** | Unreadable candidate, already independently tested in the p05 parent report |

The p53 red decoded output, in canonical GP29 labels, is:

```
R IA Y IA I O OE OE M O EO EO Y I TH B S EO F G W J R C F T EO X Y O F W D J C AE N NG F E D EA AE R H EO F T D IA Y
```

It provides no sustained natural-language passage, plaintext key or destination. All source positions are consumed, and forward encryption reconstructs the exact original p53 and p55 source indices. This round-trip checks implementation alone. Direct raw-square and alternative totient/shift signs on p53's red passage were likewise nonlinguistic in small supplementary checks, but they do not constitute an exhaustive cipher exclusion.

The [self-contained CommonJS reproducer](../sims/lp1_p05_moth25_p53red51_p55_76_sft.cjs) reads the original 2014 square corpus, exact red-passage annotation, and original ciphertext indices; asserts all original F positions, the selected skips, the conditional five-cycle geometry, original full-page reversibility and the independent decoded IoCs. The separate [179-byte direct-pad gate](lp1-p05-hidden179-p53-moth-rawpad-gate.md) tests the independent complete-p53 179↔179 source relation and is not confused with this square-cycle model.

## Same moth passage under the source-exact third-square Hill5 operator (Agent38, 14 November 2026)

A different, historically conventional **5×5 Hill cipher** uses the entire third magic-square array as one invertible GF(29) matrix, rather than taking totients of its 25 cells as a periodic additive key. The key is fixed by the recovered source square, with determinant nonzero modulo29. The original p53 red passage's only F at local offset38 and the p55 middle F at local offset25 provisionally bypass the transform, yielding **50** and **75** key-consuming runes, or **125** combined. This bypass rule is conjectural; the reported p55 alternatives also skip its other original F runes at local15 or41. Both column and row-vector Hill conventions, each in encryption/decryption directions, are tested without choosing a matrix from the output.

All **20** untouched-source cases are nonlinguistic: four matrix conventions × p53-red50, p55-body75 and combined125, plus four matrices × the other two p55 skip positions. For example, the source matrix applied to p53-red50 returns IoC **0.037551020408163265** and the prefix `TWOEEORTPAEUHBIO`; the mathematical inverse matrix applied to p55-body75 at its source-suggested skip25 returns IoC **0.03855855855855856** and the prefix `WUEARFRNGWNSOEOOEI`. Neither develops coherent GP-native words or sentences. A genuine 95-rune p57 GP-native plant forward-encrypts and recovers **95/95** under all four paired matrix conventions, and every original output re-encodes to its exact 50/75 source runes. The short `TWO` beginning of one nonlinguistic candidate is a chance-compatible motif, not authenticated plaintext.

This **retire-the-specific-operator** result complements the totient-key gate above. It does not preclude a differently instructed use of the source square, an actual hidden key, a dynamically changing matrix, or source material omitted from the archive. [Original-source CommonJS SFT](../sims/lp1_p05_moth25_hill5_original_gate_sft.cjs). [Passing Windows Node22 reproduction](https://github.com/FlareZ123/liber-primus/actions/runs/43583206504).

## Original lag-five difference-stream Hill conjugation (Agent38, 14 November 2026)

The original 104 within-word lag-five ciphertext matches out of 2,105 opportunities, independently measured by Agent22, suggest examining five-step *differences* rather than only five-symbol plaintext blocks. The recovered 2014 p05 magic square is a source-fixed 5×5 GF29 matrix, and its moth illustration selects exactly the original p53 red51 and p55 body76 passages as candidate recipients. For each earlier selected 50- or 75-symbol GP29 passage `C`, compute `ΔC[i] = C[i] − C[i−1] mod29` with initial `C[−1]=0`, apply K, Kᵀ, K⁻¹ or (K⁻¹)ᵀ to consecutive five-symbol difference vectors, and integrate the resulting differences modulo29, from initial zero. This `Δ⁻¹ H Δ` operation is a *fully reversible source-frozen chain cipher* and mathematically distinct from the direct Hill operation above.

The original p53 red50 IoCs across the four key orientations are **0.039183673, 0.037551020, 0.028571429, 0.033469388**. The original p55 body75 IoCs are **0.034234234, 0.040720721, 0.030990991, 0.035675676**. All eight full readouts are nonlinguistic; the largest remains substantially below the source-English GP29 language-register value ~0.06. The augmented [original-source SFT](../sims/lp1_p05_moth25_hill5_original_gate_sft.cjs) checks every conjugated inverse on its exact input and a **95/95 source-native p57 positive plant** under each key. Resetting at source-selected passage boundaries is an explicit modeling assumption, and the original lag-five phenomenon is distributed throughout the book rather than concentrated on the two moth pages.

**Decision:** Neither source-frozen direct Hill5 nor the corresponding reversible difference-stream Hill5 recovers original plaintext from the art-matched passages. Repeated-block phases, speculative skip positions, language fitting, and additional arbitrary transformations are outside the source-fixed scope.

## Research consequence

The five-cycle arithmetic and duplicated moth provide **a concrete, cheap clue-constrained attack target**. Its most literal historical totient-key consumer fails on untouched ciphertext. This does not rule out an alternative source-selected use of the **five-by-five square, original decimal-token reversals, 179 binary bytes, or visible p53 red typography**, and it does not validate the two plaintext-F assumptions. Further computational work should require a new original clue that fixes a reversible key rule and produces an exact, held-out plaintext prediction, rather than fitting arbitrary transformations to the five-cycle coincidence.
