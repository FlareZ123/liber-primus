# P7's original red colophon encodes a five-word GF(29) inverse packet

**Classification (21 November 2026): exact source-defined arithmetic structure and bounded failed direct consumer; no recovered ciphertext inverse or plaintext.** This packet is a follow-up to the p6→p7 mirrored-red-word result, relevant to Director [#2056](https://github.com/FlareZ123/liber-primus/issues/2056). It was recognized after the DH23 tuple and page7 red word forms were known. The GP29 prime field is mathematically natural for the 29-symbol alphabet; the original artifacts do **not** explicitly instruct multiplication of printed word digits, so this remains a **candidate** source operand.

## Original red text and exact field operation

LP2 physical page 7 is source JPEG `resources/liber-primus/24.jpg`. The last 14 ciphertext runes, local indices194–207, are printed in five red words separated by original word dividers. Each runic GP29 index is in `0..28`. Multiplication is over the nonzero elements of the prime field **GF(29)**; every symbol in the five red words is nonzero.

| Red word | Original GP29 rune indices | Length | Index sum | Product mod 29 |
|---|---|---:|---:|---:|
| 1 | `[23,3]` | 2 | 26 | **11** |
| 2 | `[22,16,2,25]` | 4 | 65 | **26** |
| 3 | `[5,7,11]` | 3 | 23 | **8** |
| 4 | `[14,28]` | 2 | 42 | **15** |
| 5 | `[6,28,19]` | 3 | 53 | **2** |

The fixed printed-word product vector is **[11,26,8,15,2]**, and it obeys these exact congruences:

- **Words 1 and 3:** `11·8≡1 (mod29)`.
- **Words 4 and 5:** `15·2≡1 (mod29)`.
- **Word 2 and the p6 red singleton:** `26·19≡1 (mod29)`. The p6 singleton is the single printed 19-valued red rune at offset75.

The independently established signed 2013 DH worked example is `p=23,g=5,a=6,b=15,A=8,B=19,K=2`, with `A=g^a mod23`, `B=g^b mod23`, `K=B^a mod23`. In the **different** field GF29, the p7 word-products may therefore be read, retrospectively, as **[A^-1, B^-1, A, K^-1, K]**. The other exact original observation is that the third p7 word `[5,7,11]` comprises three strictly increasing primes, **sums to DH modulus23** and **multiplies to DH public share A8 mod29**. The p7 first word `[23,3]` itself is exactly the GP29 index pair `[p,e]` under the separately derived `e=3`. These roles are conditional interpretations; GF29 and GF23 must not be silently equated.

This is substantially more algebraically organized than the previously observed p6/p7 **equal sums across reversed word lengths**: the five p7 words admit two internal multiplicative inverse pairs and a third inverse linked to the p6 singleton.

## Recovering the complete historical DH23 tuple from the red words

The first runes of **odd red words 1, 3 and 5** give **p=23, g=5, a=6**. The five word products **[11,26,8,15,2]** give **b=15** (word4), **A=8** (word3), **B=26^-1=19** (word2) and **K=2** (word5). Therefore a fixed, retrospectively identified extraction from the original p7 red inscription reconstructs **(p,g,a,b,A,B,K)=(23,5,6,15,8,19,2)**, the known signed DH23 worked exchange. It satisfies **5^6 mod23=8**, **5^15 mod23=19**, and **19^6 mod23=2**, plus p7 product11=A^-1, product15=K^-1 and p6 singleton19=B. No candidate plaintext is used.

The p7 full-red GP0 sum **209** also equals **11×19**, using its first red word product11 and p6's independently printed singleton19; `φ(181)=φ(209)=180` and `308=11×28` link to the original red totals and intervening rune count. Multiplicative order of11 mod29 is exactly28, and p7 word3 product8 is its inverse. These original-source numerical closures strengthen the operand hypothesis, but the **extraction rule itself was selected after viewing the data**, and direct original-cipher consumers fail. The source still does not specify a reversible receiver or key schedule.

## First-party DH-state family without choosing inverse pairing positions

The independently authenticated `(A,B,K)=(8,19,2)` also fixes the six-member modular state/inverse set **S = {A,B,K,A^-1,B^-1,K^-1} = {8,19,2,11,26,15}** in GF29. This is a more conservative finite selector than choosing the exact observed p7 pair positions: count **every five-consecutive-word window** whose **all five printed-word GP29 products** lie anywhere in S, allowing repeats, any order and either member of each inverse pair. Among the **2,729** original complete-page windows, **exactly one** qualifies: the p7 red five-word run with products [11,26,8,15,2]. Its values are five different members of S (missing only B=19), and its inverse partners come from p7 itself and p6's independent singleton19.

This is a **source-typed membership match conditional on first using GF29 word multiplication**. The DH23 values were known before this test, but multiplication of printed words modulo29 was selected after seeing the p6/p7 boundary. The all-window count confirms that the observed p7 window alone has five products in the six-value DH/inverse set. Its being the only such window is **not by itself statistically unusual** under a page-preserving rearrangement of the observed DH-set membership labels; see the exact calibration below. The specific p7 order, red-word placement and cross-page singleton inverse are additional observed features, outside that membership-only null, and no result here establishes an authored decoding operation.

### Critic calibration: what the unique five-word DH-set hit actually excludes (21 November 2026)

For each original physical page p0–p55, let `n` be the number of **within-page printed-word fragments** and `k` the number whose GP29 word-product lies in the fixed DH state/inverse set `S={2,8,11,15,19,26}`. The canonical `resources/lp2-transcription.txt` segmentation and GP rune indices yield **2,953** fragments, **542** S-members and **2,729** consecutive five-fragment windows. These are the SFT's within-page fragments, not the repository's separately counted 2,896 manuscript-wide authentic printed words; the two parsers' segmentation conventions must not be conflated. Page7 has `n=50,k=13` and the observed hit.

**Conditional null:** independently and uniformly permute the binary S-membership labels within each physical page, preserving each page's exact `n` and `k`, then ask whether **any** page has a run of at least five S-members. This null keeps the original page-specific product-membership frequencies and the 56 page boundaries; it deliberately does not preserve original word lengths, colors, exact non-S products or correlations. The exact expected number of five-word hit windows is

`sum_pages (n-4) * (k)_5/(n)_5 = 0.5241155300485981`

where `(x)_5=x(x-1)(x-2)(x-3)(x-4)`. An exact without-replacement dynamic program gives

`Pr(at least one hit anywhere) = 0.3574523399444921`.

The DP starts at position0 with zero selected members and zero trailing run. At each position, with `u` selected members already used and trailing run `r`, place an S-member with probability `(k-u)/(n-i)` if `r<4`, otherwise discard that path; place a nonmember with probability `(n-i-k+u)/(n-i)` and reset the trailing run to zero. Sum surviving final states to obtain each page's no-hit probability; multiply those 56 probabilities and subtract from one. All inputs are regenerated by the existing [word-products SFT](../sims/lp2_p7_red_multiplicative_inverse_dh_sft.cjs), which already enforces the exact 2,729-window count.

Thus **the observed one-of-2,729 membership result is common under this explicit conditional null** (about 35.75% of page-preserving rearrangements have at least one hit). The exact reciprocal pairing, p6 singleton relation, and concentration in an original red inscription remain separate source observations; their combined discovery-adjusted chance is **not quantified** by this null. In particular, neither this correction nor the original census can establish that a human puzzle author chose the GP29 product operation or the p7 body receiver.

## Source-population and multiple-comparison control

All **2,729** five-consecutive-printed-word windows within physical pages p0–p55 were parsed from the canonical rune transcription, preserving original separators. Under the **observed fixed** pairing positions `(word1,word3)` and `(word4,word5)`, exactly **one** window satisfies both GF29 reciprocal equations, p7's red colophon.

Crucially, pairing positions were recognized **after inspecting** the products. Allowing **all 15** ways to choose two disjoint reciprocal pairs from five words (choose one singleton among five and pair the other four in three ways) raises the count to **21 five-word windows**, with 23 matching pairing assignments (two windows have two valid pairings). Only **one** of these 21 has a free singleton product **26**, which is the GP29 inverse of the independently observed p6 red singleton19: p7 red word2. Of the **16 original red spans** on p0–p55, only p7 and the p53 long red passage contain at least five complete printed red words; only p7 satisfies the fixed or any-pair inverses over its first five printed red words. These counts are direct finite censuses, **not** calibrated universal discovery probabilities: the choice of GP29 product, pairing grammar, cross-page B operand and inspected sections all arose during exploratory research.

The source also fixes a **308-rune black-body interval** between the p6 red11 and p7 red14: p6 ciphertext offsets82–195 (114 runes) plus p7 offsets0–193 (194 runes). Thus `308 = 11·28`, the p6 red key length multiplied by `29−1` and by `GP0(p7 red)−GP0(p6 red)=209−181=28`. This interval/row equation predated the inverse-packet discovery and was already tested with fixed additive/columnar candidates; it does not authenticate a key schedule by itself. Among p7 products, 11 is a primitive root modulo29 (order28), and its partner 8 is its inverse, so one **concrete** full-cycle row hypothesis follows without arbitrary generator search.

## Original-only p15 → p7 circulant and chapter-length cross-holdout (Agent7, 28 November)

The p7 red-product circulant identity predates this p15 derivation by a week. Its printed-order GF29 right-circulant, built from p7's five original red-word products `[11,26,8,15,2]`, was already known to have determinant `19` and inverse first row `[23,2,5,2,19]`; those numbers were previously interpreted through the external signed DH23 example.

The new p15 causal route removes that external dependency. From p15 lower red11 plus the color-blind number grid alone, before consulting p7, it derives `p=23, K=2, g=5, B=19`. Those independently original-LP2 values predict the entire p7 inverse-row packet

`[p,K,g,K,B] = [23,2,5,2,19]`

and independently predict the p7 circulant determinant `B=19`. The p7 matrix reproduces both exactly. Charging the obvious cyclic presentation freedom—five rotations times forward/reversed product order—only the **original printed forward order at rotation0** has that p15-predicted inverse row.

There is a second, typed original-artifact consequence. Every inverse-row value is one of the nine chapter-IN values from the red-rubric SUM→PRODUCT graph, so the printed p7 row addresses chapters

`[23,2,5,2,19] -> [p8,p27,p33,p27,p54]`.

Their source-defined physical chapter spans, measured to the next red chapter start and with p54 ending at solved p56, are

`[7,6,7,6,2]`.

Apply the same canonical outside-in H5 once: `H5([7,6,7,6,2]) = [5,0,7,12,9]`. P15 lower red11 had already fixed that entire target independently as

`[g,F,K+g,aK,q+g] = [5,0,7,12,9]`.

On the actual chapter map, among the 10 p7 cyclic/reversal orientations, only original printed order reproduces that H5 target. A fixed-marginal control preserves the nine observed chapter-IN labels and nine observed chapter-span records, uniformly permutes their assignments, and holds the p7 inverse row plus p15 target fixed: **240/362,880 = 1/1,512** assignments pass. This is a post-discovery conditional specificity diagnostic, not an authorship probability.

**Evidence boundary:** this is a genuine original-LP2 cross-holdout connecting three independently built structures—p15 state, p7 red products, and chapter rubrics—and it supplies a concrete typed `p7 inverse row -> chapter address -> chapter length -> H5 state packet` handoff. It still does **not** authenticate 'circulant' as an authorial cipher opcode, and p7's direct p8 Hill consumer remains negative. No unknown plaintext is claimed.

Cross-reproducer: `sims/lp2_p15_to_p7_circulant_crossholdout_sft.cjs`.
## Source-bounded direct original-cipher consumer gates

Both below use source-visible original locations and exact invertible mappings on GP29 indices. Neither recovers prose. Exact forward reencryption verifies implementation only; it does not by itself evidence plaintext.

1. **P8 contiguous receiver, five-word periodic multiplier.** The p7 red colophon is immediately before p8. Use the five p7 field products in printed order as the repeating phase-zero encryption key `k=[11,26,8,15,2]`, and fixed `P_i=C_i·k_{i mod 5}^{-1} (mod29)`. Apply to **all 255 original p8 runes** without changing page start, direction, sign, source key or clock. The output is nonlinguistic, with GP29 IoC **0.0322989038134939** versus original **0.03427512737378416**; exact forward replay succeeds. The operation preserves ciphertext F0 positions, so its negative does not depend on adding a special F bypass.

2. **P6→p7 original black 308-rune gap, 28×11 full-multiplicative-cycle affine map.** Under the one naturally complete cycle selected by p7 word1 product11 (order28), let `K_j` be the 11 original GP29 indices of p6 red text, `a_r=11^r mod29` for `r=0..27`, and freeze `C_{r,j}=a_r·P_{r,j}+K_j mod29`. The exact decoder `P_{r,j}=a_r^{-1}(C_{r,j}−K_j) mod29` yields nonlinguistic output, GP29 IoC **0.03375777317145395** versus original **0.034350014806040864**, with exact reencryption. This gate is a single source-motivated affine operation, not an origin/sign/phase/exponent sweep.

**Cumulative five-phase multiplication (Agent41, 25 November):** a distinct stateful consumer uses K=2 as initial GF29 nonzero state, the five p7 products in order, and literal F as an exclusive hold. Original p8→p9–14 is nonprose with the fixed source key and with the globally best fit across all 28^5 multiplier keys. Two independent native controls recover both exact keys and all 2,948 withheld runes; the whole-book and p40–53 exclusive-F count gates also fail the finite native-window comparison. Retire this exact feedback consumer without generalizing to nonexclusive F-hold. [Report and exact SFT](lp2-cumulative-gf29-product-q5.md).

The inverse products constitute a **recoverable original-runic arithmetic register**, possibly a source clue to reversibility, yet no first-party LP2 instruction specifies the multiplication rule, cipher architecture, receiver, key placement or plaintext test. The exact standard direct consumers above fail. Do not widen them with arbitrary shifts, phases, lookup masks or page targets absent a further independent instruction.


## Five-word circulant inverse and adjoining p8 (Agent37, 21 November)

The five source-red-word products are also the first row of a natural GF29 **right-circulant** 5×5 matrix. Its computed inverse first row is **`[23,2,5,2,19]=[p,K,g,K,B]`** from the authenticated 2013 DH example, with source determinant **19=B**. This is an exact, independently programmed field identity and a newly recognized historical-state readout. Conditional on a fixed `p=23,g=5`, the authenticated `(a,b)=(6,15)` is the **sole** exponent pair among 484 with this exact inverse-row relation; that finite census does not adjust for choosing circulants and the register ordering after source inspection.

The black **five dots immediately under the p7 red five-word inscription** might have prompted a human to try a cyclic 5×5 map, but no Cicada text authenticates that operation or specifies a consumer. The immediately following **p8 has 255 complete original runes = 51 five-rune blocks**, so a single zero-phase whole-page Hill inverse is source-plausible and testable. Its standard and transposed directions yield ciphertext-like p8 IoC **0.03637486** and **0.03415161**, respectively, against clear solved p57 **0.06270997**. Exact forward p8 replay and a planted native p57 clear-text control pass. Thus the **p8 direct Hill consumer fails**; other receiver/key-use choices cannot be assumed without a new first-party instruction.

**p7-only cross-page numeric donor:** the same original red words also give `p=23,e=3` as the first word's literal indices, `A=8` as word3's product and `q=4` as the sum of all five products modulo29. The existing **direct** p7 red-word readout already supplies `g=5` (first index of word3), `a=6` (first index of word5), `b=15` (word4 product), `K=2` (word5 product), and `B=19` (GF29 inverse of word2 product); the new five-word checksum `q=4` and literal second rune `e=3` complete the 9-variable state **without the circulant matrix or discrete-log computation**. Independently, the red-product circulant inverse row `[23,2,5,2,19]` reproduces `[p,K,g,K,B]` as a second exact structural readout. These nine numerical inputs, taken **only from original p7**, exactly regenerate the already published p0 three-column 13-atom RISE/H title key with original p0 `4|5|4`/13-dot geometry and recover the **previously known 13-rune plaintext `EPIPHANYSEECS` (EPIPHANY SEEKS)**. This replaces the former *need for externally supplied numerical constants* in that specific original-page-local replay, while the circulant and RISE/H choices are still retrospectively inferred and cannot yet decode unknown body pages. [Source-only donor and exact key replay](lp2-p7-red-circulant-dh-original-inverse.md) · [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44932016786).

This strengthens the possible **DH register serialization** interpretation, and leaves the cipher-consumer question unresolved. Full exact matrices, source offsets, 484-exponent control and p8 results: [circulant source identity](lp2-p7-red-circulant-dh-original-inverse.md) · [read-only Node22 SFT](../sims/lp2_p7_red_circulant_dh_inverse_sft.cjs) · [passing updated Windows CI](https://github.com/FlareZ123/liber-primus/actions/runs/44930877683).

## Original red25 Hill5 matrix and adjoining p8 (Agent24, 21 November)

A direct alternative to using five derived red-word *products* as a circulant is to take the **literal** 11 red GP29 indices on p6 and 14 on p7, preserving their source order. They provide **exactly 25 symbols**, a full **5×5 matrix** in GF(29). The p7 red colophon is followed by a physical **five-dot black mark**, and the next p8 has **255 original GP29 runes**, exactly **51 blocks of five**. Thus a source-read Hill receiver can be frozen with no guessed page, key length, ciphertext offset or padding. This test was not covered by the five-product circulant test above.

```text
M = [ [24,16,14,17,19],
      [ 6,27,15,17,14],
      [12,23, 3,22,16],
      [ 2,25, 5, 7,11],
      [14,28, 6,28,19] ]
det(M) = 12 mod29 (invertible)
```

Use all 255 original p8 rune indices in canonical order and preserve all 51 authentic printed word boundaries. No position-wise model fitting, phase, word reset, background text or second key. The four standard canonical input/output conventions correspond to direct and inverse matrix multiplication on column or row vectors.

| Frozen 5-symbol inverse on original p8 | p8 GP29 IoC | Native-GP lexicon matches among 34 printed words of at least four GP runes |
| --- | ---: | ---: |
| Unchanged original | 0.03427513 | 0/34 |
| `P=M*C` | 0.03501621 | **0/34** |
| `P=M⁻¹*C` | 0.03436776 | **0/34** |
| `P=C*M` | 0.03424425 | **0/34** |
| `P=C*M⁻¹` | 0.03347229 | **0/34** |

None is a readable GP-native passage or approaches the original clear-p57 distribution (IoC 0.06270997). The [source-locked CJS SFT](../sims/lp2_p6_p7_red25_hill5_p8_original_sft.cjs) asserts both original ink spans and unchanged transcript, matrix and determinant, all four original full-page inverses and exact forward re-encryption, and **95/95** independently clear p57 runes recovered from each of four matching synthetic encryptions. Its native GP English-control lexicon detects 8 of 12 clear p57 long words at frequency ≥5. [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44931648470).

**Cipher decision:** the perhaps most literal *red25 → 5×5 Hill → adjoining p8* mechanism is a decisive bounded negative. The arithmetic packet and five-dot motif remain original; the manuscript does not label the 25 characters a matrix or specify a different receiver/operation. This negative does not exclude another independently selected use of DH-state numbers, but gives no rationale for unmotivated matrix order, row/column phase or distant-page fitting.

## Reproduction

`sims/lp2_p7_red_multiplicative_inverse_dh_sft.cjs` (Node.js22 CommonJS) regenerates the p6/p7 printed words from original scans' canonical transcriptions, checks the 2,729 five-word windows and all 15 pairings, verifies the exact DH23 values, and runs both original-cipher gates with full replay and IoC. It makes no file writes.
