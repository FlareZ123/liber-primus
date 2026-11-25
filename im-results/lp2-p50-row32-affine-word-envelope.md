# p50 split-row affine whole-word BASE29 envelope

Agent 3, 2026-11-25. Independent fallback (draw 8, executable Director tasks already claimed). Negative result, not a decryption.

## Mechanism and discrimination

Read each physical eight-byte table row as two unsigned big-endian 32-bit integers A,B. For an original length-L rune word, encode the GP indices as a positional BASE29 integer P and set C=(A*P+B) mod 29^L. When A is coprime to 29, inversion is exact: P=A^(-1)*(C-B) mod 29^L, with leading zero digits retained. Test both table radices (59 and 60), both half assignments, and every physical row. Radix59/swapped row12 and radix60/unswapped row30 (zero-based) are singular; omit them because they cannot be permutations of fixed-width words. This gives 126 coefficient pairs counting multiplicities. In the union, grant independent model and row selection for every word: any fixed, keyed, adaptive, or plaintext-dependent schedule of these same single-row transformations must satisfy the resulting lexical envelope. No schedule can repair a word with an empty domain.

This is a distinct, bounded hypothesis motivated by the signed 2013 BASE29 precedent and the actual 8-column table geometry, not an authored instruction. Earlier [whole-word additive row coupling](lp2-p50-adjacent-word-rowcoupled-base29-original-gate.md) allowed an eight-byte additive row; [stationary affine endpoint analysis](lp2-word-base29-unit-invariant.md) constrained a shared multiplier, rather than independent row-derived coefficients. Neither is repeated here.

## Executed original-cipher results

The source parser checks all 2,896 words and all 12,956 runes against the canonical corpus; the native spelling procedure exactly matches the 95 clear p57 runes. Exact BigInt inversion and forward re-encryption are applied to each candidate. The base register has 30,934 distinct GP words (length 1–14) from TextBlob word frequencies, Gibran and Emerson. The expanded register has 32,043, also including Shakespeare and solved LP plaintext. Lexical coverage is an optimistic upper bound, not a recovered word assignment.

| Model | Valid rows | Base words | Base runes | Expanded words | Expanded runes |
|---|---:|---:|---:|---:|---:|
| 59, A first | 32 | 1055 | 2607 | 1071 | 2657 |
| 59, A second | 31 | 1030 | 2534 | 1046 | 2584 |
| 60, A first | 31 | 1043 | 2562 | 1053 | 2596 |
| 60, A second | 32 | 1051 | 2592 | 1059 | 2619 |
| Union, independent selection | 126 | 1421 | 3837 | 1429 | 3867 |

Expanded union has 1,467 forced out-of-register words. Of the 815 original words with length >=6, zero have any compatible candidate; only 6/317 length-five words do. Longest consecutive covered span is 22 runes. Chapter totals (compatible words/total, compatible runes/total): p0–2 74/158,189/729; p3–7 126/255,350/1145; p8–14 186/383,505/1729; p15–22 224/437,591/1903; p23–26 104/224,282/1021; p27–32 167/326,450/1433; p33–39 189/378,512/1680; p40–53 329/669,910/3008; p54–55 30/66,78/308.

## Synthetic recovery controls

Four width-matched plants sample Shakespeare words independently at each original word length, encrypting under the four row models with hidden cyclic row offsets. The decoder scores all offsets using only p0–7 and the base register, then freezes the winner. Hidden offsets 3,11,17,23 were uniquely recovered with score margins 1576,1521,1561,1588 matching runes respectively. Each plant recovers 12,956/12,956 runes, including 9,194/9,194 from p16 onward; expanded register retains every planted word. These are shape-matched synthetic controls, not connected prose or a historical positive cipher control. Base register may overlap Shakespeare through shared English vocabulary/training texts; expanded register deliberately includes the donor.

## Reproduction and disposition

Run `node sims/lp2_p50_row32_affine_word_envelope_sft.cjs` from repository root. Exact computation was executed in the connected JS runtime using actual repository source inputs; the standalone Node wrapper was not independently executed in CI. Windows CRLF normalization is included. Input blob hashes, in script order: 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, 2550eae357442912220e05dc51147523a61dd75a, 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7, 140e1d22b5f8c45deddd2e8b25549d9d6307d938, df260a07d56bf5998d40a6360b6132c35c252d10, a92be8ba5b3511a003a22ba31523c14397aaa83a, 94c677ad9dd50771c6670e0c4e4dad9052b46d85, 8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d.

Retire this exact single-row affine architecture for ordinary GP English in the tested register; no further row scheduler optimization warranted. This is not a universal exclusion of affine ciphers, variable word boundaries, alternate table serialization, or other unknown transformations. No authentic plaintext, key or new source selector was recovered.
