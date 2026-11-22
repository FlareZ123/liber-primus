# P50 low-degree 16-factor → complete p54–p55 17-word additive inverse

**Original-input result (12 November 2026, Agent33):** The original 256-token numerical grid polynomial admits a precisely reproducible monic degree-16 factor with **17 GP29 coefficients**. The original p55 source contains exactly **17 page-local rune segments**: the final rune of one cross-page p54→p55 word followed by 16 new complete words. A frozen source-order hypothesis assigns the 17 factor coefficients to these 17 units and decrypts the *entire* inherited 11-rune word and all 75 new p55 runes using the historically known GP29 subtractive operation. It gives only nonlinguistic word strings, with a 75-rune native GP index of coincidence **0.034234234234** and fully exact original reencryption. **No previously unknown LP2 plaintext, authentic key, or author-selected operation is recovered.** This retires this complete, directly testable transfer only.

## Human solve-path hypothesis and strongest objection

The 32×8 grid on physical p49–51 has 256 printed base60 tokens. The [established exact GF29 factorization](lp2-grid-complete-gf29-factorization.md) includes the two conspicuous source-linked low-degree components provided by the signed 2013 `BASE29 3301=3QO` example and the original red p39 triplet. Grouping **all** the table polynomial's monic factors of degree 1, 2, 3 or 9 produces a single degree-16 polynomial; retaining its leading monic coefficient yields **17** coefficients. Independently, the source-corrected [p54–p55 printed word audit](lp2-original-page-boundary-audit-p32-p54-p55.md) yields 17 page-local segments comprising a 1-rune p54 carry and 16 new complete words. The 2016 signed words/map message suggests trying source-visible words as units, while solved LP1 Vigenère and LP2 prime-totient examples establish additive GP29 as a historically used primitive.

**Most severe unsupported step:** neither source says to discard the irreducible degree238 grid factor, group *all other* factors into one degree16 polynomial, interpret coefficients as GP29 shifts, or assign the high-order coefficient to the inherited word. The count correspondence is an *independently exact but retrospective* hypothesis; it does not establish authorial design or warrant a 17! alignment search. The older p15 4×4→16 p55 word mapping was a separate, previously rejected **different** source selection. Do not promote this 17/17 equality to a verified instruction without a second source-side selector.

## One fully specified original-cipher map

Read the unmodified 256 source table bytes in printed row-major order as descending GF29 polynomial coefficients. Its full low-degree monic divisor (in ascending power order) is exactly

```text
R16 = [13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1]
```

All 256 original coefficient residues reconstruct **exactly** after division by R16 and multiplication of the computed 240-slot quotient. The printed leading source byte 203 is 0 modulo29, so its highest quotient slot is zero; all 256 source positions remain retained.

Freeze the **17 high-to-low GP29 key coefficients** at

```text
K = [1,25,17,11,15,7,11,26,6,26,13,2,6,12,26,20,13]
```

For complete word `w=0..16`, decrypt each original GP rune `P_(w,j)=(C_(w,j)-K_w) mod29`. The complete carried word at index0 comprises p54's final ten runes plus p55 offset0, and uses key1 **through all 11 runes, including both physical pages**. The next 16 keys apply in original printed order to all 16 complete p55 words at original offsets1..75. There are no deleted runes, individual word-specific unknown shifts, changed directions, or language-fitting decisions. The inverse `C=P+K_w mod29` reconstructs **all 86/86 original runes** from the joint target (10 p54 +76 p55).

| Original source scope | Original GP runes | Full decoded GP transliteration |
| --- | ---: | --- |
| p54 final10→p55 first1, complete inherited word | 11 | `CTHSUPBIAOCAEL` |
| p55 word 1 | 4 | `FMIJ` |
| 2 | 2 | `IAF` |
| 3 | 2 | `OH` |
| 4 | 6 | `FYLHTI` |
| 5 | 6 | `OELBIIAD` |
| 6 | 2 | `AEOE` |
| 7 | 13 | `LTHOBPOERHTJADS` |
| 8 | 6 | `PNBNGWD` |
| 9 | 4 | `LJSH` |
| 10 | 2 | `EAC` |
| 11 | 7 | `YTHREORP` |
| 12 | 7 | `EONGAEAEEON` |
| 13 | 2 | `MI` |
| 14 | 6 | `HTHPOEHB` |
| 15 | 3 | `OLI` |
| 16 | 3 | `RCY` |

The full 75-rune p55 body IoC before decoding is **0.038558558559**, and after this frozen exact transfer is **0.034234234234**. Solved original LP2 p57 provides 21 length-75 native-GP reference windows with minimum **0.059459459459**; the candidate is below every reference and is visibly ungrammatical. A source-native 86-rune solved p57 plaintext plant, cut into *exactly* the original 17 full word sizes, encrypts under these 17 fixed coefficients, decodes and restores all **86/86** native rune symbols. This tests the entire source-shaped encoder under real GP spellings without using the unknown original plaintext.

## Decision

The source mathematical correspondence is exact but supplies no plaintext: **reject this particular full-text fixed coefficient-per-word additive consumer on the original p54–p55 material**. The original p50 16-degree factor and source-corrected 17 word segments survive as separate observations. Any reassignment of factor coefficients to words, reversing one register, nonlinear pad, changed factor subgroup or hidden keystream must first be selected by a new independent original clue. Avoid post hoc permutation or word-index key sweeps.

**Windows-compatible CommonJS SFT:** [`sims/lp2_p50_factor16_p55_17word_sft.cjs`](../sims/lp2_p50_factor16_p55_17word_sft.cjs). The program validates original source page runes and word widths, exact full-grid factor divisibility, all 86 original-source symbols, authentic 86-rune GP-native plant, reconstructed inverse and printed complete output.
