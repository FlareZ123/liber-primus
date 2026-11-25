# Word-local double-projective differential inverse: exact all-secret lexical decision

25 November 2026, Agent 7. **No unknown LP2 plaintext or authentic key.** This is a complete finite-lexicon exclusion for a larger nonlinear word-local cipher family, not a statistical comparison of guessed matrices.

## Route and original premise

The original LP1 p05 square includes MOBIUS; LP2 p15 explicitly displays infinity below its solved number square. Historical solved LP2 p56 also motivates transparent plaintext F, which does not consume a key step. These motivate, but do not select, a projective/differential decoder operating on intact printed words. Earlier work tested affine predecessor differences (all 812 maps per word), a projective repeated-phrase fingerprint, and fixed p15 projective states. Here we allow any two independently secret nonsingular fractional-linear maps per word, including all affine special cases. This is an overpermissive gate before any source-key fitting.

For a finite sequence P and ciphertext C of the same word length, the tested families are:

1. Direct: C_j = N(P_j).
2. Difference: C_j - C_(j-1) = N(P_j) mod 29, j >= 1.
3. Double projective: M(C_j) - M(C_(j-1)) = N(P_j) mod 29, j >= 1.

M and N are arbitrary independent elements of PGL(2,29), restricted to finite evaluations at the observed word coordinates. The first plaintext rune in difference models is unrestricted. Also grant independent reversal of each ciphertext word. For the transparent-F alternative, choose any subset of observed ciphertext F positions as literal plaintext F holds; remove those positions before transformation and differencing, retaining the previous consumed state. Non-held ciphertext F remains legal. No other positions may be deleted. Original word/page carries are preserved.

## Exact reduction

A finite sequence with at least three distinct values has the complete projective fingerprint obtained by mapping its first three distinct entries a,b,c to 0,1,infinity:

  T(x) = ((x-a)(b-c))/((x-c)(b-a)) mod 29,

with x=c assigned the distinct infinity token. Sequences with fewer distinct symbols use their equality pattern. Identical fingerprints are necessary and sufficient for a local partial PGL equivalence. A projective map may have a finite pole; it is only required to be finite on actual consumed symbols. This deliberately gives more freedom than a total permutation of the 29 finite rune symbols.

The double-projective search need not enumerate 24,360 outer maps for every word. If M is affine, its translation cancels in the difference and its nonzero scale can be absorbed by N. If M is non-affine, write M(x)=u+v/(x-r), with v nonzero and r its finite pole. The translation again cancels and scale is absorbed by N. Hence **one identity representative plus one reciprocal representative per admissible finite pole** is exhaustive. Skip r only if it appears in the consumed ciphertext sequence (an invalid finite evaluation). No phase search, stochastic optimization, or parameter fitting is required. For F-hold, enumerate every submask of the observed F positions, and use the mask of the candidate plaintext as part of the lookup key.

This is a computationally reusable exact inverse for a double-projective construction, including nonlinear finite-pole maps. It can also provide candidate lexical cribs when a true word lies in the chosen register.

## Executed results

Canonical corpus and transcription were checked for exact rune alignment, 12,956 runes in 2,896 complete printed words from physical p0–55, excluding the runeless grid. Finite lexicon: 33,094 distinct rune sequences of lengths 6–14 from the committed TextBlob word counts and all exact native solved GP words of those lengths. Chart segmentations are enumerated rather than greedily chosen, including ING→NG and IO→IA, with K/V/Q/Z normalized to C/U/C/S. This does not claim all historical spellings, proper names or possible plaintext words.

Each row below gives number of words with at least one compatible lexical sequence, granting both ciphertext orientations independently for each word.

| Length | Original | Direct, ordinary | Difference, ordinary | Difference, F hold | Double-projective, ordinary | Double-projective, F hold |
|---:|---:|---:|---:|---:|---:|---:|
|6|256|83|253|255|256|256|
|7|216|1|70|71|216|216|
|8|156|0|3|3|39|39|
|9|78|0|0|0|0|0|
|10|52|0|0|0|0|0|
|11|32|0|0|0|0|0|
|12|18|0|0|0|0|0|
|13|4|0|0|0|0|0|
|14|3|0|0|0|0|0|

Direct F-hold results are 85/256 at length 6, 1/216 at length 7, and zero at lengths 8–14. The 3 ordinary/held single-difference matches at length 8 are global zero-based word indices 493 (developing), 1126 (expansion), 1566 (concepts). Isolated independently keyed matches do not supply an authentic word or continuation. At least 187 of 187 length-9+ words cannot match even the two-map model; at length 8 another 117/156 cannot match it. Allowing both reversal and F masks does not improve the long-word result.

Positive controls: 176 native solved word instances (length 6–14) replay ordinary direct and differential nonlinear maps; all 176 appear in the inverse lookup in each test. Another 176 instances replay direct/differential with literal F holds, including 18 direct plants with both held F and consumed-to-F present. All 176 ordinary and all 176 F-hold double-projective plants recover their true lexical sequence among candidates and pass both algebraic inverses. These are candidate inclusion controls, not unique blind key recovery: 704 word-case groups, 1,056 individual decoder-variant checks. Exact code executed in connected V8 on fetched repository inputs; standalone Node 22 and CI have not separately run.

## Decision

Retire direct and single/double-projective word-local encoders with these finite-word and literal-F assumptions as routes to native GP English. The all-secret per-word freedom is stronger than any source-selected fixed subset of these maps. No key sweep of p15 quadrants or LP1 corner matrices can repair the incompatible words within this model. Other projective representations (e.g. a 30-symbol alphabet with printed separators moving), variable-length encoding, hidden segmentation, time-varying within-word maps, and words absent from the finite lexicon remain outside the decision.

- Reproducer: [Node 22 CommonJS SFT](../sims/lp2_wordlocal_projective_lexicon_sft.cjs), commit 8b29df5ad2c1334869ec038ef2fab2061c6699a5.
- Prior distinct affine gate: [all-secret affine predecessor differences](lp2-wordlocal-affine-difference-allsecret-lexicon-gate.md).
- Prior distinct projective scan: [local repeat fingerprints](lp2-original-projective-repeat-crib-gate.md).
- Original source motivation: [p15 infinity/projective state test](lp2-p15-infinity-projective30-allsecret-original-gate.md).
