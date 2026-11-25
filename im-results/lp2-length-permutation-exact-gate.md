# Exact chapter-total obstruction to a shared 1–14 length substitution (#2725)

**Decision:** the identity is the only length permutation consistent with the first eight original illustrated chapters. The ninth chapter was withheld from the enumeration; its total is also preserved by identity. Consequently this exact model cannot alter a single printed boundary. No native-language fit or rune-key search is justified for the proposed nonidentity transformation. This is a structural exclusion, not recovered plaintext or proof that the printed boundaries are true words.

## Source and model

Use the carry-aware corrected transcription `resources/transcriptions/lp2-image-corrected.txt` (Git blob `f7b534a33edeb212d427329798438325307463d7`). It omits physical p50, a runeless numeric page. Split on percent page markers; remove slash line breaks and whitespace before identifying contiguous rune groups, so unfinished words carry across line/page seams. The nine physical chapter ranges are p0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53, 54–55. The last two use compressed page ranges 40–52 and 53–54. Counts are 2,896 groups and 12,956 runes. The two solved LP2 pages are excluded. Rubrics are included as stipulated by the fixed chapter group tape.

Let h[j,L] count the printed length L in chapter j and let x[L] be its reconstructed plaintext length. A bijection on 1..14 requires x to be a permutation and each chapter independently requires sum_L h[j,L] x[L] = sum_L h[j,L] L. The sorted group-frequency multiset is preserved under relabeling; the total equations are stronger here and independent of any native reference or language score.

## Complete enumeration, not a sampled search

Use the eight development equations plus sum x = 105. Reduce over GF(65521). Rank is 9, pivot lengths 1..9, free lengths 10..14. Enumerate every ordered assignment of five distinct values from 1..14 (14P5 = 240,240); derive the nine pivots uniquely modulo 65521. A legal length is in 1..14, and each such integer has a unique residue. Reject out-of-range or repeated values, then check all eight original integer equations exactly. This is a complete necessary-condition filter plus exact sufficient verification for the defined model; modular rank deficiency could increase work but cannot omit an integer solution. Products fit exactly in JavaScript Number.

The only surviving inverse is x = [1,2,3,4,5,6,7,8,9,10,11,12,13,14]. Thus all 87,178,291,200 permutations except identity are impossible even before the p54–55 total. The held-out ninth chapter residual is 0, trivially for identity. This is not predictive evidence for native boundaries.

32 independently generated small n=6 constraint sets compared the solver against direct exhaustive enumeration; all exact solution sets agree, including 16 deliberately admissible nonidentity (1 2) swap controls. These are algebraic controls, not native-plaintext controls. The original gate is exact and stops before any language stage; no claim about lexical receiver calibration is made.

## Reproduction and next decision

Run `node sims/lp2_length_permutation_exact_gate_sft.cjs` from the repository root. The connected JS runtime executed the same functions on the pinned source; raw output is [here](lp2-length-permutation-exact-gate-output.json). No CI run was needed or claimed.

Retire only this shared fixed 1..14 bijective length substitution with exact per-chapter rune totals and unchanged group count. Decoy segmentation, length insertion/deletion, chapter-dependent substitutions, or independently selected boundary operations are different hypotheses and require their own source evidence. No alternative was fitted here.
