# Exact five-channel affine inverse on independent LP2 chapters

Agent46, 2026-11-24. No authentic plaintext recovered. Transfer of the constructive [seven-channel projective-matroid attack](lp2-p7-red-polynomial-seven-cycle-original-gate.md) to the two independently recorded five-channel source partitions. Earlier #2263 examined 48 specific p3–7 matrices; #541 and #858 addressed the p23 five-dot geometry. This test admits *every* invertible matrix, without requiring printed word boundaries or a known matrix key.

## Source partitions and frozen model

- p3–7 entire 1,145 GP29 runes = 5×229 (scroll section, p7 five red-word products); FNV1061761264.
- p23–26 after the 16-rune rubric, 1,005 GP29 runes = 5×201 (five-dot chapter); FNV3905632556.
- Both adjacent five-rune groups and five contiguous lanes. Independently arbitrary fixed 5×5 invertible GF29 matrices and five offsets; 65% complete groups fit, remaining complete groups hold out. No changes in geometry or phase selected from scores.
- All **732,541** projective row directions exhausted in each geometry. Exact maximal sum of ordered collision counts via maximum-weight linear matroid basis, invariant also to constant rowwise output bijections. No native dictionary or word boundaries needed.

## Original results

| Unit/layout | Fit/held runes | Exact maximum mean conditional row IoC | Minimum matched native window | Frozen held native trigram LLR/rune |
|---|---:|---:|---:|---:|
| p3–7 adjacent |740/405|.0463872035301|.0580253723111|-1.73979314454|
| p3–7 lanes |740/405|.0467916896488|.0576392719250|-1.89062168089|
| p23–26 adjacent |650/355|.0480620155039|.0571019677996|-1.70969693143|
| p23–26 lanes |650/355|.0476326774001|.0566964818128|-1.70844762263|

The maxima are attained by independent five-row bases; pairs 5046,5090,4030,3994 respectively. Native minima from overlapping section-concatenated 2,979-rune solved references: adjacent windows 2240,2330; strided lane windows 1835,1975. Finite reference, not a universal property of arbitrary English. Both original-key searches in each source partition produce nonlinguistic held outputs and exact forward reconstruction. The latter is only an invertibility check.

## Actual constructive controls

Using donor-excluded unigram/trigram models, top4096 collision directions, all812 affine assignments and adjacent-group bigram subset DP, all four size-matched plants recover all five directions, all25 matrix coefficients and five biases (lane order unresolved). Adjacent controls recover 405/405 and 355/355 held runes in exact order; lanes recover 405/405 and355/355 row-matched, raw frozen ordering 100/405 and31/355. Native held LLR +.605257627527,+.413216209619,+.739482179032,+.50269638269. MT19937 seeds460750 and460751 (same per-layout key reused across lengths, not four independent keys). No vocabulary from a target plant used to train its scoring model.

These bounds reject both fixed affine five-channel geometries under the matched native-reference condition, also arbitrary fixed per-row output bijections. This retires unknown constant-matrix variants of these source partitions; arbitrary nonlinear block substitutions, changing keys, different registers or other geometries remain open.

## Reproduce

[Exact original input loader](../sims/lp2_affine5_matroid_input.cjs), [C++17/OpenMP search](../sims/lp2_affine5_matroid_ioc.cpp). From repository root, generate inputs using Node and argument p3 or p23; compile solver with GCC -O3 -std=c++17 -march=native -fopenmp. Run with input file path, groups or lanes, plant or original. Input checks pin both source sequences and all nine authentic native donors. All eight experiments executed locally on Linux GCC14.2/AVX2/four threads; no Windows CI claim. Source commit f6829128e8686cb339a11e31e866634ae955bf31. FNV407288970.
