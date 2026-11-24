# Unknown-affine repeating-key recovery with ambiguous F

Generalize the previously tested additive period13/16 architecture to all 28 nonzero common affine coefficients a, with arbitrary repeating shift vector: consuming C=aP+K[phase] mod29. Literal plaintext F bypasses advancement. Two long dictionary words jointly determine the unknown multiplier using the exact overlap condition C1-C2=a(P1-P2); a nonzero plaintext difference identifies a uniquely, while every other overlap constrains it. No brute-force 28x multiplier loop is necessary unless every overlap leaves a unidentified. Intra-anchor repeated phases also constrain a. Both chosen word anchors use all admissible relative phases between ciphertext starts. Remaining <=3 key positions are exhausted; deferred pairs reported. Exact phase reachability and Viterbi with required middle endpoint precede re-encryption. This includes the Beaufort-like a=-1 case and all other invertible scalar relabelings; it is not an arbitrary phase-specific nonlinear permutation. The dictionary anchor premise, periods13/16 and common multiplier are explicit scope boundaries.

| Period | Type | Section | Pair/phase trials | Compatible coefficient/anchor joins | Filled keys | Deferred | Full legal inverses | Correct control runes / total |
|---:|---|---|---:|---:|---:|---:|---:|---:|
| 13 | control | Gibran heldout | 638401 | 0 | 0 | 0 | 0 | - / 1100 |
| 13 | control | Emerson heldout | 3196000 | 1 | 1 | 0 | 1 | 1101 / 1101 |
| 13 | control | LP1 reference | 4456023 | 1 | 1 | 0 | 1 | 1500 / 1500 |
| 13 | original | section1 | 6198822 | 0 | 0 | 0 | 0 | - / 729 |
| 13 | original | section2 | 638401 | 0 | 0 | 0 | 0 | - / 1145 |
| 13 | original | section3 | 972660 | 0 | 0 | 0 | 0 | - / 1738 |
| 13 | original | section4 | 2056626 | 0 | 0 | 0 | 0 | - / 1894 |
| 13 | original | section5 | 787176 | 0 | 0 | 0 | 0 | - / 1021 |
| 13 | original | section6 | 3830406 | 0 | 0 | 0 | 0 | - / 1433 |
| 13 | original | section7 | 8299213 | 0 | 0 | 0 | 0 | - / 1680 |
| 13 | original | section8 | 1003860 | 0 | 0 | 0 | 0 | - / 3316 |
| 13 | original | supplemental p54–55 | 1240620 | 0 | 0 | 0 | 0 | - / 308 |
| 16 | control | Gibran heldout | 1297576 | 0 | 0 | 0 | 0 | - / 1100 |
| 16 | control | Emerson heldout | 7022411 | 1 | 24389 | 0 | 13007 | 1101 / 1101 |
| 16 | control | LP1 reference | 5484336 | 1 | 1 | 0 | 1 | 1500 / 1500 |
| 16 | original | section1 | 6198822 | 0 | 0 | 0 | 0 | - / 729 |
| 16 | original | section2 | 638401 | 0 | 0 | 0 | 0 | - / 1145 |
| 16 | original | section3 | 1252160 | 0 | 0 | 0 | 0 | - / 1738 |
| 16 | original | section4 | 2056626 | 0 | 0 | 0 | 0 | - / 1894 |
| 16 | original | section5 | 823368 | 0 | 0 | 0 | 0 | - / 1021 |
| 16 | original | section6 | 3830406 | 0 | 0 | 0 | 0 | - / 1433 |
| 16 | original | section7 | 10214416 | 0 | 0 | 0 | 0 | - / 1680 |
| 16 | original | section8 | 1290432 | 0 | 0 | 0 | 0 | - / 3316 |
| 16 | original | supplemental p54–55 | 1240620 | 0 | 0 | 0 | 0 | - / 308 |

[Raw data](lp2-transparent-f-affine-dual-anchor.json); run `node sims/lp2_transparent_f_affine_dual_anchor_sft.cjs`.
