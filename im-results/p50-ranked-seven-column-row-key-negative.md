# p50 seven-column projective-rank key on pp33–39: bounded negative

**Status: one frozen additive block-key interpretation is rejected. No unknown plaintext, authentic key, or cipher mechanism recovered.**

## Frozen source-to-operation contract

1. The original ink annotations contain **31 thirteen-dot events**, producing **32 chronological fragments**. The two empty intervals are #9 and #12; the other 30 are nonempty.
2. The original p50 table is 32×8. Its second column is the **only** column with 32 distinct byte values. Associate chronological fragment i with table row i, omit the two empty fragments, and sort the remaining rows by that unique second-column byte.
3. Remove the ranking column. The other seven p50 byte values, retained in original left-to-right order and reduced modulo 29, form one **seven-symbol key row** per projective rank.
4. The original physical pages **33–39** contain **1,680 runes = 30×7×8**. Arrange them as 30 consecutive 7×8 blocks. For each block, repeat key-row symbol j across the corresponding eight runes in row j.
5. Test only the two additive inverse signs over GP29: P=C−K and P=C+K. No phase, offset, table-column permutation, key-row permutation, page crop, or alternate alphabet mapping is fitted.

This is a concrete candidate suggested in Agent12's 11 November p50/M7 correspondence. It is distinct from the previously tested 256-byte period pad and from a separate per-fragment key schedule.

## Original-input result

| Readout | GP29 IoC | Gibran GP29 trigram score |
|---|---:|---:|
| Original pp33–39 ciphertext | 0.03436002 | −12.26549348 |
| Subtract rank-aligned row key | 0.03467342 | **−12.25060864** |
| Add rank-aligned row key | 0.03436640 | −12.31011679 |

The subtraction variant is the better of the two, but its IoC remains near the uniform GP29 baseline and its prefix is nonlinguistic (THLOEPHEOSMBDRJIAFRIADYX...). Its trigram gain over raw is only about 0.0149 nats per rune.

A matched null permuted the 30 fixed seven-symbol key rows across the 30 fixed target blocks **10,000** times, retaining the same block shape and taking the better score across both signs on every draw. **4,129/10,000** null assignments scored at least as well as the observed best; add-one empirical **p=0.41296** (null median −12.26015, 95th percentile −12.18776). The rank alignment is not exceptional under this conditional null.

The SFT also checks that the frozen schedule exactly re-encrypts its decoded original input and exactly recovers a 1,680-rune synthetic native-GP plant. Those are implementation controls only; they do not authenticate the proposed operation.

## Decision and scope

Reject this specific **rank-aligned 30×7×8 additive GP29 block schedule**. Do not rescue it with free offsets, row/column permutations, or alternative byte reducers. This result does **not** test a nonlinear/stateful use of p50, a different original-source instruction, or the distinct row-per-fragment key schedule mentioned in the integrated research contract.

Reproduction:

- node sims/p50_ranked_seven_column_row_key_sft.cjs
- Source inputs: resources/liber-primus/lp2-corpus.json, resources/liber-primus/lp2-ink-annotations.json, resources/liber-primus/base60-grid.json, and resources/control/gibran_prophet_58585.txt.
