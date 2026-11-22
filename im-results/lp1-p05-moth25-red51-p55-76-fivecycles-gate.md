# Two moth-linked LP2 passages and the concealed five-by-five square: two five-cycle registers

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

For this original F-bypass register, five iterations of a 25-number key arise **only after choosing** p55's middle F at position25 as the sole p55 bypass; its Fs at 15 and 41 are treated as ordinary encrypted runes. That choice coincides with the key length, but the original source does not uniquely select this skip mask, any shared clock or the concatenation of these passages. The five-cycle arithmetic is a conditional fit. However, authentic solved-page mechanics make the caveat decisive: **a ciphertext F may encrypt a non-F plaintext rune**, so the two assumed skips are not evidenced as plaintext. The source also never instructs solvers to concatenate these two pages or use a square's 25 numbers as repeating key values. The count does not establish cipher authorship.

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

The original p53 red50 IoCs across the four key orientations are **0.039183673, 0.037551020, 0.028571429, 0.033469388**. The original p55 body75 IoCs are **0.034234234, 0.040720721, 0.030990991, 0.035675676**. All eight full readouts are nonlinguistic; the largest remains substantially below the source-English GP29 language-register value ~0.06. The [updated Windows Node22 reproduction passed](https://github.com/FlareZ123/liber-primus/actions/runs/43585561888). The augmented [original-source SFT](../sims/lp1_p05_moth25_hill5_original_gate_sft.cjs) checks every conjugated inverse on its exact input and a **95/95 source-native p57 positive plant** under each key. Resetting at source-selected passage boundaries is an explicit modeling assumption, and the original lag-five phenomenon is distributed throughout the book rather than concentrated on the two moth pages.

**Decision:** Neither source-frozen direct Hill5 nor the corresponding reversible difference-stream Hill5 recovers original plaintext from the art-matched passages. Repeated-block phases, speculative skip positions, language fitting, and additional arbitrary transformations are outside the source-fixed scope.

## Alternative source-shaped five-cycle register: the red T and the incoming p55 rune (Agent31, 15 November 2026)

The original p53 red span has a visually **isolated upward-arrow-shaped GP T** at its beginning (p53 local128), printed as the last glyph of the preceding black-body line, with the remaining **50 red runes** following on subsequent lines. This T is an authentic rune within the first complete source word, and its possible *additional* role as an instruction/entry marker remains a conjecture. If that single displayed T controls reading instead of entering the ciphertext, the remaining p53 passage has precisely **two 25-rune cycles**. Separately, the first of p55's 76 runes is the incoming NG that completes a word crossing from p54. Starting instead with the first *new* rune on p55 gives **75 runes = three 25-rune cycles**. The art-selected two moth passages then supply exactly **50 + 75 = 125 = five cycles of a 25-cell key**, without selecting either plaintext F as a special bypass. The 5x5 square is independently marked by the identical moth in earlier solved LP1 p05.

This register is **more constrained by visible source boundaries than the earlier F-skip construction**, but still rests on two unproven exclusions. The arrow-shaped T is an ordinary rune and cannot simply be removed as a matter of source fact. The NG at p55 local0 belongs to the manuscript's complete word and no authorial cipher operation says to skip it. The entire p54 body intervenes between the source passages.

Freeze the historically recovered 2014 third magic square in its original row-major order, use its 25 Euler-totient residues modulo29 as the repeated key, and apply the ordinary reversible GP29 additive cipher in both signs. The source register contains all 50 p53 red runes **after** T and all 75 p55 runes **after** NG, without an F exception, a phase search, or ciphertext fitting. The two direct totient outputs have combined 125-rune IoCs **0.0349677419** (subtract) and **0.0344516129** (add); the separated p53/p55 outputs stay 0.0310–0.0367 and 0.0342–0.0346. Both full readings are nonlinguistic.

A distinct natural use of the same square is a 5x5 GF29 Hill cipher on these **exact 25 complete five-rune blocks**. Matrix, transpose and their mathematical inverses give complete 125-rune IoCs **0.03445161, 0.03458065, 0.03600000, 0.03264516** respectively, with no coherent GP29-native plaintext. Both direct consumers exactly forward-reconstruct every original rune; 125/125 independent clear-p57 plants recover under each. These check reversibility and implementation only, not the historical cipher.

**Decision:** keep the **two-plus-three original-square capacity** as an exploratory possible solve-path clue while retiring its six tested source-fixed direct cipher readings. A genuine continuation would require an independently authored direction/skip rule that types the red T and the cross-page NG and specifies a different consumer. Do not convert the absence of plaintext into an open-ended key permutation or phase sweep. The shared [CJS original-input reproducer](../sims/lp1_p05_moth25_hill5_original_gate_sft.cjs) now prints all six arrow/carry cases alongside the existing F-bypass register.

### Arrow-up vertical matrix consumer

The visibly upward-pointing p53 first red T suggests a column-up read. Arrange the newly selected 125 glyphs in **five rows of 25**, with two rows from p53's remaining red50 followed by three rows of new p55 glyphs. For each of 25 columns, read the five GP29 runes bottom-to-top, apply the original LP1 p05 source magic-square 5×5 GF29 matrix, and place the result back in its original five vertical positions. This is a distinct, fully reversible **columnar Hill5** mechanism, unlike five adjacent runes per block. The source square, two-plus-three row assignment, vertical arrow direction and four matrix orientations are fixed before any plaintext scoring.

Original complete-125 GP29 IoCs for M, M-transpose, M-inverse and its transpose are **0.03367742, 0.03419355, 0.03419355, 0.03354839**. No output forms coherent native plaintext. Each version exactly re-encrypts every original position and recovers a full independent 125-rune GP p57 plant. The source still supplies no authorial instruction removing the original T/NG, and no additional row or key permutation is warranted.

### Original Poettering 2013 five-share inverse on the five moth-linked rows

The original source-shaped 125-rune register offers one previously untested **historical operation**, as distinct from the Hill5 and direct totient consumers above. Cicada genuinely used Poettering's **ssss v0.5 five-of-ten Shamir sharing** in 2013. Arrange the two p53 red25 lanes followed by three p55 new25 lanes as five candidate shares and use 2013's authenticated share IDs **02,03,05,07,08** in the actual source finite field. This tests a real original-era algorithm with no new guessed secret; crucially, the source still does not authorize excluding p53's authentic T, excluding p55's authentic carried NG, or interpreting the selected 5×25 field as five shares.

The original 25 GP29 runes per lane fit directly into a **128-bit whole-field share** in their printed order, either by positional base29 (122-bit maximum) or five-bit GP indices (125 bits). Test both faithful source representations, preserving the source's original top-to-bottom row ordering or honoring the visually upward arrow by reading bottom-to-top. For all four source-frozen tests, apply the precise original ssss irreducible polynomial **x^128+x^7+x^2+x+1**, the genuine **monic x^5 five-share interpolation** and the historical source **XTEA reverse diffusion** to recover a complete 16-byte secret.

| Whole-field encoding | Row order | Historical 16-byte recovered value (hex) | Printable ASCII |
| --- | --- | --- | ---: |
| GP base29 | Printed | pending source-implementation CI readout | pending |
| GP base29 | Upward | pending source-implementation CI readout | pending |
| GP five-bit | Printed | pending source-implementation CI readout | pending |
| GP five-bit | Upward | pending source-implementation CI readout | pending |

The exact historical XTEA inverse is being re-run against the original source implementation. The provisional byte readouts from an independent implementation were found inconsistent with it, so only the verified GF128 pre-diffusion field secrets are retained until the full SFT completes. They could be arbitrary binary, so absence of a text header is a conditional negative rather than proof of impossibility. The shared source SSSS arithmetic and diffusion code is reused from the historically controlled 2013 reproducer; a fresh independent 128-bit secret plant reconstructs exactly.

A distinct GP-native **Shamir GF29** interpretation interpolates each of 25 source columns independently, using the same historically documented share IDs, with no unknown polynomial coefficients. The two original outputs are GP transliterations **PCMTYATHROIALOHOEDOSCLHEFTMTH** (IoC 0.0300) and **INGFXHNPLIAAPPHNMJRNGCEANCGNGP** (IoC 0.04667). Neither forms coherent text. A five-share polynomial plant reconstructs all **25/25 genuine solved-p57 rune symbols**. The faithful whole-field SSSS and GP29-adapted small-field variants are now bounded and retired, pending independent authored evidence for the two original source-letter exclusions.

**Reproducer:** [original moth 2013 SSSS 128-bit CJS test](../sims/lp2_moth125_ssss128_original_sft.cjs), importing the already verified [historical 2013 SSSS code](../sims/lp2_p23_201_122byte_ssss_codec_sft.cjs).

## Research consequence

The five-cycle arithmetic and duplicated moth provide **concrete clue-constrained attack targets**. Both the F-bypass and independently source-shaped arrow/carry-excluding registers fail their direct historically motivated totient-key inverses; the latter also fails all four natural Hill5 orientations. This does not rule out an alternative source-selected use of the **five-by-five square, original decimal-token reversals, 179 binary bytes, or visible p53 red typography**, and it does not validate the two plaintext-F assumptions. Further computational work should require a new original clue that fixes a reversible key rule and produces an exact, held-out plaintext prediction, rather than fitting arbitrary transformations to the five-cycle coincidence.
