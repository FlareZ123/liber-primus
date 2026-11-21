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

This is a **source-typed uniqueness result conditional on first using GF29 word multiplication**. The DH23 values were known before this test, but the choice to multiply printed words modulo29 arose after observing the p6/p7 boundary. Therefore the all-window count does not establish the original authors intended multiplication. It does, however, show that the full five-product DH-state alignment is absent from every other original five-word window even without fixing its order or selecting the inverse-pair arrangement.

## Source-population and multiple-comparison control

All **2,729** five-consecutive-printed-word windows within physical pages p0–p55 were parsed from the canonical rune transcription, preserving original separators. Under the **observed fixed** pairing positions `(word1,word3)` and `(word4,word5)`, exactly **one** window satisfies both GF29 reciprocal equations, p7's red colophon.

Crucially, pairing positions were recognized **after inspecting** the products. Allowing **all 15** ways to choose two disjoint reciprocal pairs from five words (choose one singleton among five and pair the other four in three ways) raises the count to **21 five-word windows**, with 23 matching pairing assignments (two windows have two valid pairings). Only **one** of these 21 has a free singleton product **26**, which is the GP29 inverse of the independently observed p6 red singleton19: p7 red word2. Of the **16 original red spans** on p0–p55, only p7 and the p53 long red passage contain at least five complete printed red words; only p7 satisfies the fixed or any-pair inverses over its first five printed red words. These counts are direct finite censuses, **not** calibrated universal discovery probabilities: the choice of GP29 product, pairing grammar, cross-page B operand and inspected sections all arose during exploratory research.

The source also fixes a **308-rune black-body interval** between the p6 red11 and p7 red14: p6 ciphertext offsets82–195 (114 runes) plus p7 offsets0–193 (194 runes). Thus `308 = 11·28`, the p6 red key length multiplied by `29−1` and by `GP0(p7 red)−GP0(p6 red)=209−181=28`. This interval/row equation predated the inverse-packet discovery and was already tested with fixed additive/columnar candidates; it does not authenticate a key schedule by itself. Among p7 products, 11 is a primitive root modulo29 (order28), and its partner 8 is its inverse, so one **concrete** full-cycle row hypothesis follows without arbitrary generator search.

## Two frozen, direct original-cipher consumer gates

Both below use source-visible original locations and exact invertible mappings on GP29 indices. Neither recovers prose. Exact forward reencryption verifies implementation only; it does not by itself evidence plaintext.

1. **P8 contiguous receiver, five-word periodic multiplier.** The p7 red colophon is immediately before p8. Use the five p7 field products in printed order as the repeating phase-zero encryption key `k=[11,26,8,15,2]`, and fixed `P_i=C_i·k_{i mod 5}^{-1} (mod29)`. Apply to **all 255 original p8 runes** without changing page start, direction, sign, source key or clock. The output is nonlinguistic, with GP29 IoC **0.0322989038134939** versus original **0.03427512737378416**; exact forward replay succeeds. The operation preserves ciphertext F0 positions, so its negative does not depend on adding a special F bypass.

2. **P6→p7 original black 308-rune gap, 28×11 full-multiplicative-cycle affine map.** Under the one naturally complete cycle selected by p7 word1 product11 (order28), let `K_j` be the 11 original GP29 indices of p6 red text, `a_r=11^r mod29` for `r=0..27`, and freeze `C_{r,j}=a_r·P_{r,j}+K_j mod29`. The exact decoder `P_{r,j}=a_r^{-1}(C_{r,j}−K_j) mod29` yields nonlinguistic output, GP29 IoC **0.03375777317145395** versus original **0.034350014806040864**, with exact reencryption. This gate is a single source-motivated affine operation, not an origin/sign/phase/exponent sweep.

The inverse products constitute a **recoverable original-runic arithmetic register**, possibly a source clue to reversibility, yet no first-party LP2 instruction specifies the multiplication rule, cipher architecture, receiver, key placement or plaintext test. The exact standard direct consumers above fail. Do not widen them with arbitrary shifts, phases, lookup masks or page targets absent a further independent instruction.

## Reproduction

`sims/lp2_p7_red_multiplicative_inverse_dh_sft.cjs` (Node.js22 CommonJS) regenerates the p6/p7 printed words from original scans' canonical transcriptions, checks the 2,729 five-word windows and all 15 pairings, verifies the exact DH23 values, and runs both original-cipher gates with full replay and IoC. It makes no file writes.
