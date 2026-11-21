# P6→p7: 308-rune black gap forms 28 complete cycles of the red 11-rune seed

**Classification (21 November 2026, Agent3): new source-aligned numerical relation; original-cipher inverse attempts negative. No unknown LP2 plaintext, authentic key or final destination.** This report extends the independently observed p6/p7 red-word checksum reversal in [the existing original-page boundary report](lp2-p6-p7-reversed-red-boundary-gate.md). The numerical alignment is a testable hint rather than an instruction that the manuscript's authors intended this cipher.

## The new, exact physical packet

Original physical p6 and p7 are the original scans `23.jpg` and `24.jpg`. They are consecutive pages in the same illustrated chapter. Each has an original red passage bounded by large dot punctuation.

| Original ink field | Physical location | Runes | GP0 sum |
| --- | --- | ---: | ---: |
| p6 opening red span | p6 offsets [71,82) | **11** | **181** |
| Intervening black ciphertext | p6 [82,196) + p7 [0,194) | **114+194=308** | not a key |
| p7 closing red span | p7 offsets [194,208) | **14** | **209** |

The red-sum difference is **209−181=28**. The intervening black glyph count is **308=11×28**. Hence the **same value 28** is the number of whole 11-rune periods and the change between the two red sums:

[
rac{308}{11}=209-181=28.
]

Separately, as previously recorded, `φ(181)=φ(209)=180`. The final two p6 printed red words have GP0 sums **65,26**, and p7 begins **26,65** with corresponding reversed printed word lengths. Those comparisons make the p6/p7 boundary a more motivated receiver than a random 11-period region elsewhere in LP2. However the **11-column reshape is not printed in the manuscript**; it is a mathematical interpretation of original runic positions. The red numbers also require a GP0 summation rule that has yet to be authenticated for this particular chapter.

**Page seam is physically continuous inside a printed word.** The original p6 final source rune is `ᛋ`; original p7 starts `ᚻᛝ` followed by a word delimiter. In the canonical source transcription, the p6/p7 join therefore carries the same printed word `ᛋᚻᛝ` across the page boundary; there is **no printed word stop or reset marker at the seam**. This independently supports treating p6 black tail114 plus p7 black prefix194 as one uninterrupted ciphertext receiver, while leaving the proposed eleven-rune block size and field operator conjectural.

As a compact source-family check, there are four consecutive-physical-page red-span pairs among unsolved p0–55: p6/p7, p7/p8, p39/p40 and p53/p54. Only p6/p7 satisfies `gap = first_red_length × (second_red_sum − first_red_sum)`. This is a within-family observation, **not** a calibrated probability under all ways of choosing red gaps, sums, totients or arithmetic relations.

## Three fixed, historically plausible inverses

Rather than tuning phases, radicals or cipher signs to an English score, the [read-only original-input SFT](../sims/lp2_p6_p7_redgap28_counter_key_sft.cjs) freezes the p6 red source key in original rune order:

`K = [24,16,14,17,19,6,27,15,17,14,12]` (GP indices).

It takes **exactly the 308 contiguous original black GP runes** between the red spans. Its three finite consumer families, each evaluated without phase rotation, resets at the page boundary or free keys, are:

1. **Repeating red11 additive key:** `P[i] = C[i] ± K[i mod 11] (mod 29)`. This uses only the red-key width as the clock.
2. **One step per printed 11-rune block:** `P[i] = C[i] ± (K[i mod 11] + floor(i/11)) (mod 29)`. The +1 advance per block is the most economical explanation of the red sum difference 28 over 28 complete blocks.
3. **Consecutive-integer totient row state:** `P[i] = C[i] ± φ(181+floor(i/11)) (mod 29)`. This uses exactly the red sum endpoints and the established historical p56 precedent of Euler-totient arithmetic; it does *not* assume the integers 181–208 are all prime. The `φ(181)=φ(209)` equality is an observed endpoint relation and does not independently command this operation.

A separate **standard keyed 11-column transposition** uses the original GP rune order to rank the 11 red key symbols, breaking duplicate-symbol ties in source order. The 308 ciphertext symbols form 28 full rows. The SFT tests the two natural serializations (28-token column chunks or row-wise 11-token groups) under ascending and descending GP rank. This is a standard historically available operation and is a simpler rival to adding speculative arithmetic layers.

## Exact negative readouts and controls

The original 308 ciphertext runes have **index of coincidence 0.03435001**. The independent halves of each candidate are both 154 runes; no candidate recovers contiguous English in either half:

| Fixed additive receiver | GP IoC, subtract | GP IoC, add |
| --- | ---: | ---: |
| Repeating red11 | **0.03458268** | **0.03572486** |
| Red11 with +1 per eleven-rune block | **0.03451923** | **0.03464614** |
| `φ(181+block)` row shifts | **0.03407505** | **0.03405389** |

The first 100-rune subtractive counter readout starts `JOEXHTSAEEAUTHLIIGMAEIAJIOEUNGMB...`; the first 100-rune subtractive totient readout starts `FOOEMFSBHEOIYNGPWDTHLAEEOY...`. Neither extends to a source-credible plaintext instruction. The standard columnar inverses likewise yield nonlinguistic starts, for example ascending column chunks `LEASWLGCAIAUIAUNGWHOENOSLSOL...` and descending column chunks `IAEAIAUSCGWALLONGLSWONHSOE...`. A transposition preserves the ciphertext's rune histogram and IoC exactly, so its negative is based on the resulting order rather than a frequency score.

As a separate transfer of the *authentic p56 F-transparent arithmetic clock*, exhaustive ciphertext-F branching of the frozen period11 additive key loses all legal plaintext/key phases by original **gap offset28** under subtraction and by **gap offset7** under addition. Those are exact impossibility results for that specific F-transparent key schedule, not exclusions of other ciphers. None of the 308-rune candidate readouts is coherent plaintext. All deterministic additive and transposition consumers exactly forward-reproduce their complete original input, which confirms the implementation while providing **no independent key evidence**.

The 28 columns/rows also fail an elementary alternative: if each 28-symbol column were intended as a permutation through all 28 non-F GP states, every one of the eleven observed 28-glyph columns would have 28 distinct values. Instead their unique-rune counts are **19,20,19,19,20,17,18,16,16,18,18**, typical collision-rich ciphertext. This rules out the literal source-order state-permutation table interpretation without searching new row orders.

## Singleton counter and source-derived DH shared-2 full-cycle (21 November 2026)

The original p6 11-rune red passage is *printed* as **4|1|4|2**; its uniquely isolated second word is key coordinate4, value19. A finite, source-constrained alternative to increasing all 11 key coordinates per 11-rune row increases only the singleton by one in either GP29 direction. The frozen \`C[r,j]=P[r,j]±(K[j]+δ(j,4)·s·r)\`, \`s∈{−1,+1}\`, produces four nonprose outputs on the **unchanged full 308-rune p6→p7 black receiver** (GP IoCs **0.03441347–0.03506917**, both halves nonlinguistic). These cases are in the existing redgap SFT. Their complete round trips verify implementation, not a source-authenticated key.

The subsequently documented [p7 five-word GF29 inverse/DH packet](lp2-p7-red-multiplicative-inverse-dh-packet.md) supplies a *different* original operand. The last red p7 word \`[6,28,19]\` multiplies to **K=2 modulo29**, exactly the signed 2013 DH23 example's shared state, and **2 has multiplicative order28 in GF29**. The intervening source ciphertext is **308=28×11**, so a complete 28-step field cycle \`2^r\` for 11-rune rows is a particularly economical candidate key clock. This is different from Agent18's already-negative \`11^r\` affine route (11 is another primitive root). The [dedicated original-input DH2 SFT](../sims/lp2_p6_p7_dh2_fullcycle_receiver_sft.cjs) freezes the red11 seed, original source order, row0 state1, and tests exactly three reversible zero-phase consumers:

1. \`C[r,j] = 2^r·P[r,j] + K[j] mod29\`: output GP IoC **0.03439232**.
2. \`C[r,j] = P[r,j] + 2^r·K[j] mod29\`: output GP IoC **0.03454038**.
3. \`C[r,j] = 2^r·K[j]·P[r,j] mod29\`: output GP IoC **0.03629595**.

All three fail to yield coherent language over the intact **308 original unknown runes**, including each independent 154-rune half. Exact original forward reencryption succeeds in all three; clear solved-p57 GP29 runes independently reencode and decode correctly under each branch. The Windows Node22 run [44930966720](https://github.com/FlareZ123/liber-primus/actions/runs/44930966720) passed. This is a finite negative for the specific shared-2 models, and does not authenticate the multiplication-to-cipher mapping, which the manuscript never explicitly states.

**Scope:** preserve the authentic red-span count/sum and DH23 inverse packet as potential authored operands. None of the tested additive, columnar or field-cycle consumers recovers a cipher, key or unknown plaintext. Do not tune exponent origins, signs, mixed affine maps or additional generators from language scores; a first-party opcode or selected receiver under a genuinely new clue is required.

## All-secret 11-column DH2 necessary-condition test

The three source-shaped 2^row models above all failed with the original p6 red seed. To test whether that failure merely reflects a *wrong seed*, the [complete-secret 11-column DH2 gate](../sims/lp2_p6_p7_dh2_allsecret_11column_native_gp_gate.cjs) now **grants every possible 11-symbol key** without assuming that the red text contains the secret. For each of the 11 columns, its key is independently chosen from all29 GP29 values (or all28 nonzero multiplicative values). Under the source-fixed 2^r state, the native GP unigram log-likelihood is *additively separable by column*, so enumerating just 29 (or28) candidates per column gives the **mathematically exact likelihood maximum over all 29^11 or 28^11 key vectors**, without guessing key words, phases or English.

The unigram reference is the existing manuscript-calibrated GP29 encoder applied to **62,492** GP runes from Gibran's *The Prophet*. It preserves source-attested ING/IOR spelling. For each model, fit 11 unknown key symbols on the first **154 untouched original ciphertext runes**, then score the *disjoint last154* without tuning on them; separately compute the **oracle bound** allowing optimization against all308 original runes. This is compared with **72 source-native English positive controls**: 24 nonidentical 308-rune windows each from Gibran, **Shakespeare** and **Emerson**, encrypted under the identical 2^r model and original red11 seed. All 72×3 native GP plant decoders round-trip exactly; the other two corpora are *not* used to learn GP marginal frequencies.

| Model with **all secret 11-rune keys** | Original holdout log-likelihood / rune | Lowest of 72 native-control holdouts | Original optimistic all308 optimum | Lowest of72 native-control all308 optima |
| --- | ---: | ---: | ---: | ---: |
| 2^r affine | **−4.32018** | **−3.32625** | **−3.54320** | **−3.03705** |
| 2^r additive pad | **−4.37517** | **−3.33962** | **−3.55772** | **−3.03705** |
| 2^r multiplicative pad | **−4.05495** | **−3.37075** | **−3.58666** | **−3.03705** |

All original scores are *lower* (worse) than **every** independently sourced native English plant under the identical exact fitting procedure. Even an optimistic full308-rune oracle under any possible 11-symbol key is at least **0.506 natural-log units per rune** worse than the least well-scoring native plant. Because the oracle maximum is an exact separable optimization, *no alternative 11-rune key vector rescues these three fixed 2^r generators under the calibrated native-English unigram model*. This is a **source-native necessary-condition exclusion** for these specific models, conditional on the GP orthography and language reference, not a proof no imaginable text can be encoded and not an exclusion of other operation orders, key clocks or multiple encryption layers.

The [successful Windows Node22 run 44931627509](https://github.com/FlareZ123/liber-primus/actions/runs/44931627509) prints every source-key optimum, both untouched halves and all independent-corpus controls. The primary result is a narrow but strong decision: **retire the single-stage 2^r 11-column DH packet, even with all key symbols hidden**. Further tuning the red seed or repeating 28-state cycles cannot repair the observed native-GP mismatch within those frozen architectures.

## Exact original two-long-word cryptanalytic gate (Agent35, 21 November 2026)

The two longest original printed black words inside the uninterrupted 308-rune p6/p7 packet each contain **12 GP runes**, starting at original packet offsets **165** and **293**. The authentic punctuation leaves **70 complete printed words** between the red headings, including the p6→p7 seam carried as one word. These two 12-rune words are a stringent test of the previously rejected `2^r` eleven-column additive architecture, even when **all eleven key residues are secret**. Each row-major 12-rune plaintext candidate covers every one of the eleven key columns and revisits its first column one row later. Requiring both occurrences to imply the same secret residue is an exact algebraic filter. An independent second source word must imply the identical full eleven-symbol secret.

The [source-native original-input two-word SFT](../sims/lp2_p6p7_28cycle_secret11_two12word_sft.cjs) uses **1,327 independently registered GP12 words**: 872 source-native English words from TextBlob, Gibran, Shakespeare and Emerson; 453 Vulgate Latin tokens; and two Old English tokens from the corrected Beowulf corpus. Under each of the four literal source-compatible `2^{±row}` interpretations, the complete-secret constraint yields:

| Literal 308-rune packing | Field state | First 12-rune word individually feasible | Second 12-rune word individually feasible | Joint source-registered complete keys |
| --- | --- | ---: | ---: | ---: |
| 28 rows × 11 symbols, row-major | `2^row` | 30 | 98 | **0** |
| 28 rows × 11 symbols, row-major | `2^{-row}` | 34 | 50 | **0** |
| 11 contiguous columns × 28 symbols | `2^row` | **0** | **0** | **0** |
| 11 contiguous columns × 28 symbols | `2^{-row}` | **0** | **0** | **0** |

For row-major `2^row`, the original first word's 30 registered possibilities collapse to **23 distinct complete eleven-rune key vectors**, and the second word's 98 possibilities yield **72 key vectors**; the intersection is empty. The opposite field-cycle direction is likewise empty. Under both column-chunk variants, neither original 12-rune word has even a *single* registered GP plaintext candidate satisfying repeated-column equations. These are exact constraints for each finite source dictionary and the stated cipher, without recovering a guessed or tuned key from frequency. The SFT separately creates an original-size GP-native positive ciphertext with independent 12-rune words `COMPANIONSHIP` and `ACQUAINTANCE`, recovers the same implanted secret from both, and verifies the complete forward/inverse for all four layouts.

[Windows Node22 PASS 44940995442](https://github.com/FlareZ123/liber-primus/actions/runs/44940995442). **Decision:** the natural two directions and two physical serializations of a stationary source-root2 additive 11-column key cannot represent the original word-preserving text from the registered English, Latin or Old English lexica. This sharply narrows the already negative `2^r` cipher branch. A rare unattested word, another plaintext register, changed word boundaries, an extra encryption layer or an author-directed alternative operation remains possible; this test recovers no authentic original plaintext. The exact source-position approach is reusable if a new original clue specifies a different reversible column operation.

## A second architecture: ciphertext-predecessor chain with unrestricted 11-rune key

The uniform-like original GP29 ciphertext and its strongly suppressed adjacent equalities motivate a **ciphertext-chain**, distinct from all earlier direct one-stage DH2 tests. On the original 308-rune p6→p7 interval, the first ciphertext predecessor is no unknown IV: the **last original p6 red rune**, GP index **12**. Let \`D[i] = C[i]−C[i−1] mod29\`; \`C[−1]=12\`. The source has **exactly one zero delta** in the 308 runes, mirroring the book's wider anti-doublet effect. Using only the already source-motivated \`2^floor(i/11)\` state and a completely arbitrary **11-rune secret key** provides three distinct reversible chain models:

1. \`D[r,j] = 2^r·P[r,j] + K[j] mod29\`.
2. \`D[r,j] = P[r,j] + 2^r·K[j] mod29\`.
3. \`D[r,j] = 2^r·K[j]·P[r,j] mod29\`, with nonzero unknown \`K[j]\`.

The [chained-source all-secret SFT](../sims/lp2_p6_p7_dh2_chained_allsecret_native_gp_gate.cjs) tests all three. Each key is globally optimized over **all 29^11 or 28^11 possibilities** by exact per-column enumeration under native-GP unigram likelihood, training on original first14 rows and evaluating the untouched final14 rows (154 runes each). It also independently permits a key oracle to score all308 runes, and compares identically trained original-output statistics with **72 separate source-native encrypted English controls**, 24 each from Gibran, Shakespeare and Emerson; the latter two are independent of Gibran's estimated rune frequencies.

| Chained DH2 form | Original untouched holdout, natural-log/rune | Lowest of 72 native controls | Original full308 oracle | Lowest native full308 oracle |
| --- | ---: | ---: | ---: | ---: |
| Affine chained state | **−3.97153** | **−3.31655** | **−3.45689** | **−3.03705** |
| Additive chained state | **−4.26933** | **−3.33962** | **−3.59549** | **−3.03705** |
| Multiplicative chained state | **−4.00405** | **−3.37075** | **−3.49950** | **−3.03705** |

All three original holdouts and all three *optimistic exact global-key oracles* are worse than every one of the 72 source-native controls. All three models, with the actual p6 red11 seed, also exactly encode/decode their respective solved-language GP29 plants and reencode the **entire unmodified 308-rune original ciphertext** after decryption. This provides a **key-independent native-language model rejection conditional on the frozen 2^r chained architecture**, despite its ability to explain why a multiplicative increment could avoid zero steps. The multiplicative chained model fixes plaintext F sites to exactly the one ciphertext-doublet site by algebra, for **every** permissible secret key; it cannot freely increase F frequency to native English. This does not exclude a more complicated nonstationary chain or a different source instruction.

[Windows Node22 PASS run 44932532562](https://github.com/FlareZ123/liber-primus/actions/runs/44932532562). The source-derived DH2 state is a plausible cipher ingredient, and the actual p6/p7 numeric packet is a reproducible artifact; neither selects the chaining opcode or a plaintext-producing decoder. Do not rescue it by optimizing unsigned phase changes, alternate predecessor symbols, other generators or post-processing layers after reading the result.

## Signed BASE29/DH23 as a short instruction-channel operation (21 November 2026)

A separate finite, **non-invertible** readout asks whether the typed historical commands themselves provide an *instruction* instead of 308-rune prose: the actual 2013 signed TCP challenge prints `BASE29 3301 → 3QO` and a `DH` exchange over modulus23. Treat each of the 28 successive source black **11-rune groups** as a conventional big-endian base29 integer, reduce that number modulo authenticated historic 23, and apply only source-attested DH exponents **3, 6, 15**, as well as identity exponent1. The [original-packet BASE29/DH23 SFT](../sims/lp2_p6_p7_308_base29_dh23_row_channel_sft.cjs) asserts the original key/gap lengths, big-endian base29 round trips, and the signed 3301→3QO positive control before reading the original 308 ciphertext runes. Its complete 28-symbol GP transliterations (variable rune-token lengths) are:

| Exponent on each 11-rune row modulo23 | Complete 28-GP-symbol output |
| --- | --- |
| 1 | `NTHHNGRHBJEPLOEOHJPNTEFTHEOSPNGGLL` |
| 3 | `THGSEGXLPEOMROGLEOTTHPFHOBEOSNMM` |
| 6 | `OEPETHPEONHGTTNPNGORHFENPGEEOTT` |
| 15 | `GTTHWOTHSIREJEOPTHIEGNRFTPNGEWHJJ` |

None is an intelligible original-language instruction, and none defines a reversible mapping of the **308 original runes** to a plaintext 150-rune holdout. [Windows Node22 PASS 44933304878](https://github.com/FlareZ123/liber-primus/actions/runs/44933304878). The historical commands fix base29 notation and modulus23, but the original manuscript does **not** state that p6/p7 should be grouped as big-endian integers, transformed by a DH exponent, or translated with those numerical residues as GP rune indices. Thus even a lucky 28-symbol phrase would require prospective source validation; no phrase or decryption is recovered here. Do not sweep alternate digit orders, modulus offsets, exponent combinations or new output alphabets.

## P6 red11 circulant source matrix and the next-page p8 determinant/trace pair (21 November 2026, Agent36)

The original p6 **11 red runes** already used as an additive key also define a conventional **right-rotating 11×11 circulant matrix** over GP29. Fix the printed rune vector as `k=[24,16,14,17,19,6,27,15,17,14,12]` and the ordinary zero-based matrix convention `M[r,c]=k[(c-r+11)%11]`. No symbol, position, seed, phase or key is fitted against unknown plaintext. Exact GF29 elimination gives

`det(M)=4 (mod29)`, `trace(M)=3 (mod29)`, and `M^(-1)[0]=[27,0,20,21,0,27,1,22,27,24,1]`.

The **next physical page p8** (original scan `25.jpg`) begins with exactly two complete red printed words. In original order their GP indices are `[14,10,14,19]` and `[1,14,19,5,2,13,3,17]`. Their complete GP29 **word products** are independently `[4,3]`, exactly the just-derived ordered **matrix determinant and trace**. The reversed/left-circulant convention `L[r,c]=k[(c+r)%11]` has `det(L)=25`, so the `[4,3]` pair distinguishes at least these two natural matrix orientations. This is a **new cross-page algebraic relation**, not an author-authenticated instruction. The same p8 products were previously observed to match the separate p7 DH register `[q,e]=[4,3]`; all of these are related numeric features in an actively searched corpus, so they must **not** be counted as statistically independent discoveries or as proof that either matrix was intended.

The unchanged **308-rune black gap** between the p6 and p7 red passages forms **28 complete 11-rune rows**, providing a motivated, original-visible candidate receiver for this 11-dimensional matrix. A [single-file original-input CJS reproduction](../sims/lp2_p6_red11_circulant_gap_sft.cjs) tests **20 exact, source-frozen, reversible decoders**: eight standard Hill-11 direct/inverse/transpose operations with two natural within-row orientations; four forward or inverse **successive matrix powers** over the 28 rows, starting with exponent zero or one; and eight red-seed running-key operations in which `k` evolves by `M` or `M^(-1)` once per row, with two signs and start ticks zero/one. The full original ciphertext round-trips **308/308** in all 20 cases. Independently planted solved-p57 native GP runs round-trip exactly for all 20 cases.

The original, unaltered 308-rune receiver has GP29 index of coincidence **0.034350015**, versus **0.062709966** for the separately solved p57 GP29 passage. The complete 20 non-fitted candidate outputs lie between **0.03314 and 0.03605**, with no source-native readable opening; both 154-rune halves remain nonlinguistic. Thus none of these direct **matrix-body, row-evolving-matrix or linear red-seed key-schedule interpretations** deciphers the selected passage. The reproducible calculation and positive plants passed on **Windows Node22** in [manual CI run 44940895986](https://github.com/FlareZ123/liber-primus/actions/runs/44940895986).

**Decision:** preserve the exact `p6 red11 → 11×11 determinant/trace → p8 red4|8 products` cross-page relation as a **candidate operation-selection clue**. Its strongest unsupported premise is **that Cicada intended a circulant construction**, rather than an opportunistic matrix packaging of already-known q/e values. The source still does not specify a receiver, key-state evolution, or a plaintext-decoding inverse. A genuinely independent operator instruction or correctly predicted unknown plaintext is needed before extending this family. Do not widen the matrix sweep by language-fitted offsets or invented post-processing layers.

## Remaining missing input and next decision

The exact red→black→red length/sum relationship deserves preservation as an **original-source packet hypothesis**. The tested direct key, monotone block counter, totient row clock, standard key-sorted transpositions and source-derived circulant operators do not solve the 308-symbol receiver. A new source clue would need to specify which of the red heading's 11 runes acts as a **key schedule versus width marker**, how the 28 intervening rows transform it, and how the p7 red checksum should be validated *prospectively*. Without that clue, changing start phases, GP reductions, routes, 11×28 orientations, key permutations or word clocks would simply fit an unbounded family.

## Reproduction

`node sims/lp2_p6_p7_redgap28_counter_key_sft.cjs` reads the exact canonical GP corpus and ink annotations; asserts red starts, sums, original black length, adjacent-page control family and positive round trips; prints all direct readouts and the two authentic-F impossibility positions. The original source images are `resources/liber-primus/23.jpg` and `24.jpg`. The separately established red-word reversal appears in [Agent18's report](lp2-p6-p7-reversed-red-boundary-gate.md).
