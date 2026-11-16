# LP2 original 225 red runes and 31 thirteen-dot marks: 16×16 mixed-difference receiver

**Agent 1, 16 November 2026. Status: an exact original-source, all-stationary-bijection exclusion for one new 2D value-changing interpretation; no authentic plaintext, key, or destination.**

## Clue-to-operation hypothesis

The original images contain **225 red GP29 runes**, exactly 15²; **31 physically printed thirteen-dot marks** (30 red, one black), exactly 16²−15²; and **256** printed two-character number cells on pp49–51, exactly 16². These are separately physically checked source counts ([red and dot census](lp2-original-dot-punctuation-physical-census.md)). The red event set spans all 58 original physical LP2 pages including solved p56–57. The number field is printed **32×8**, so the proposed **16×16 reflow** is an extra conjectural step, not an original layout fact.

A natural invertible 16×16 finite-difference architecture needs 31 known first-row/first-column values to reconstruct 225 interior values. Freeze a concrete interpretation *before* comparing symbols:

- Read the 225 original red runes in page/offset source order, omit the 31 thirteen-dot marks as non-value boundaries, and represent runes by their canonical GP29 indices.
- Read all 256 source table cells in printed order. Test the two already published full byte decoders separately: conventional base60 and f-omitting base59. Reflow each resulting 256-byte list into **16 rows × 16 columns**, with no fitted permutation or rotation.
- Reduce the table values modulo29 and obtain the 225 interior mixed differences as `D[r,c] = T[r,c] - T[r-1,c] - T[r,c-1] + T[r-1,c-1] (mod 29)`, for each row/column 1–15.
- Ask whether these 225 values are the original red-runic sequence, possibly under **one unknown stationary bijective GP29 relabeling**. The latter includes Caesar shifts, Atbash and all global 29-rune symbol permutations. Such bijections must preserve every pairwise equality and inequality.

This is an exploratory source-count-motivated receiver. Original Cicada material does **not** direct readers to reshape the table, interpret dots as boundary-value positions, or compute mixed differences.

## Exact original-input decision

| Comparison | Conventional base60 | f-omitting base59 |
|---|---:|---:|
| Direct original-red/mixed-difference equalities | 10/225 | 6/225 |
| Pairs of equal source-red symbols | 837 | 837 |
| Pairs of equal mixed-difference symbols | 834 | 866 |
| Pairs equal in **both** arrays | 28 | 34 |
| Red equal but difference unequal | **809** | **803** |
| Difference equal but red unequal | **806** | **832** |
| Total equality-pattern contradictions | **1,615** | **1,635** |

The first original red rune is GP index15. At red-event index8 the rune is also15. The corresponding table mixed differences at indices0 and8 are **24 and19** in base60, **24 and21** in base59. Thus **no single-valued substitution**, let alone a bijection, can map *this fixed ordered difference stream* onto the complete original red runes. Conversely, for base60, differences at indices0 and22 are both24 while their red runes are15 and11, excluding the opposite stationary one-to-one mapping; base59 has the analogous contradiction at indices0 and1.

The invariant proves an **entire secret-alphabet family** impossible under this specific row-major mixed-difference read. No secret shift, arbitrary fixed 29-rune alphabet, sign, or affine coefficient can repair pairwise equality contradictions.

The alternative source-visible way to reshape the **32×8** table is to put its first sixteen rows beside the last sixteen, rather than pair consecutive rows. To bound the still-unspecified rotation/reflection, [the independent extension SFT](../sims/lp2_red225_square_delta_sft.cjs) tests **both complete table reflows**, all **eight** 16×16 square symmetries, and **two** reversible cell-integral families: the above GF29 mixed difference and a bytewise XOR mixed difference. For every combination, it computes the *exact minimum mismatches over all arbitrary deterministic 29-rune-to-output lookup maps*, a family broader than the stationary bijections above. The measured minimum across 16 spatial interpretations is **172/225 GF29 cells** and **192/225 XOR cells**. For the original paired-row unrotated base60 reading, the direct GP29 match is **10/225** and even the best unrestricted stationary lookup disagrees at **174/225**. The XOR mixed differences contain **144 or 147 distinct byte values** by reflow, already exceeding the maximum 29 images of a fixed GP29 symbol map. A synthetic 225-rune integration plant for **each** field recovers 225/225 symbols with all 31 source-border values preserved. This exact extension passed [Windows Node22 CI run 43947024644](https://github.com/FlareZ123/liber-primus/actions/runs/43947024644).

The combined tests retire ordinary stationary rune-to-delta coding across the two complete natural grid reflows and square orientations, including nonbijective fixed codebooks. They do not exclude other source-selected reflows, time-varying substitutions, key material rather than output, a different underlying numeral radix, or an intermediate non-GP register.

## Implementation positive

The [single-file read-only CommonJS SFT](../sims/lp2_red225_grid256_mixed_difference_sft.cjs) asserts original 225/31/256 source counts, both exact radix parses and the complete equality counts. A planted affine bijection `P(x)=7x+11 mod29` is fully inverted over 225 symbols by multiplying with 25, the inverse of 7 modulo29. Using the untouched table's 31 boundary residues then integrates all **256/256** table residues exactly. This verifies the forward/inverse 2D arithmetic while keeping the original negative independent of a language score.

**Decision:** the attractive squares-and-boundary-count coincidence does not supply a direct stationary 2D decoder in the tested natural table reflows and square orientations. The next useful advance requires an authored nonstationary operation, independent key source, or a complete original-cipher plaintext prediction. This result is supporting evidence, not a solved page.