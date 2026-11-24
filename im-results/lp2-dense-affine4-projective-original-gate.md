# Shared dense affine four-rune block inverse — actual key recovery and original result

**Decision:** no native-GP plaintext under the tested shared affine four-rune block architecture with a continuous clock on physical pp16–55. The attack recovers both planted dense secret matrices and offsets exactly, including all untouched runes. The original has a rigorous all-matrix pooled-IoC ceiling close to uniform. This is a conditional model exclusion, not an unknown plaintext recovery.

## Motivation and distinct scope

Original p15 carries the 4×4 Fibonacci-prime numeric grid. Its direct source-derived matrix readings were already tested in [p15 Hill](p15-hill-block-test.md), as were a fixed CBC receiver and arbitrary page-private four-block bijections. The grid does not actually prescribe a Hill cipher. This experiment addresses a different practical possibility: a shared dense affine block inverse whose matrix was not printed literally, recovered from original text rather than chosen from a list of source numerals. It neither repeats the printed-square sweep nor assumes its entries are correct.

Frozen model: for complete consecutive ciphertext blocks (c_i\in GF(29)^4), (p_i=M c_i+b), with unknown shared (M\in GL(4,29)), (b\in GF(29)^4). Page seams do not reset the clock. All four initial phases on p16 are covered. Split at the p39/p40 boundary, assigning the one potentially crossing block to the held-out side; incomplete fringes are excluded from this block model. No transparent F, additional transposition, changing state, or page-private matrices. The rationale for native GP prose is the solved manuscript; other registers remain possible.

## Recovery and all-key bound

Every nonzero matrix row lies in one of ((29^4-1)/28=25,260) projective directions. Normalize the first nonzero coefficient to 1 and exhaust all directions, histogramming their values on the original block tape. All nonzero row scalings and offsets merely relabel a row's histogram. The four independent directions maximizing the sum of row collision counts are found exactly by greedy selection in the vector matroid. This is not a claim that the language-optimal inverse necessarily uses these four rows.

For (n) blocks and four decoded lane histograms (f_j(x)), pooled collision count is bounded by Cauchy–Schwarz:
[
\sum_x(\sum_j f_j(x))^2-4n\le 4\sum_j\sum_x f_j(x)^2-4n.
]
Taking the maximum-weight independent basis gives an **all-key** upper bound on pooled decoded IoC after division by (4n(4n-1)). It covers every shared invertible matrix, all offsets, scales, and row order, not only the fitted candidate. No language model is involved in this bound.

For actual recovery, on the training blocks choose the maximum collision basis, rank all 812 affine labels per direction using an independently trained GP unigram model, retain the best four labels each, then maximize full contiguous bigram likelihood over (4^4\times24=6,144) label/order combinations. The language model uses the first half of Gibran converted with the repository's GP spelling rules. No held-out ciphertext is used for choosing phase-specific matrices. For each frozen candidate the program decodes the withheld tail and re-encrypts both tapes exactly. A separate all-key ceiling on the held-out ciphertext is diagnostic only. No original decoder has credible language.

## Actual execution

The [standalone CJS reproducer](../sims/lp2_dense_affine4_projective_inverse_sft.cjs) ran its identical pure computation in V8 directly on the three fetched repository texts. [Full raw output and source blob SHAs](lp2-dense-affine4-projective-output.json) includes matrices, directions, sample sizes, previews and both controls.

| Physical p16 initial phase | All-key training pooled IoC ceiling | All-key withheld pooled IoC ceiling | Fitted withheld IoC | Fitted withheld mean log bigram |
|---:|---:|---:|---:|---:|
| 0 | .03602381 | .03705386 | .03449849 | -4.50950 |
| 1 | .03581478 | .03684353 | .03446410 | -4.52935 |
| 2 | .03595035 | .03692868 | .03459965 | -4.56473 |
| 3 | .03600480 | .03702766 | .03463876 | -4.50673 |

Uniform baseline .03448276. Train 5,872–5,876 runes; withheld 3,316 runes each. Even independent maximization over the entire key family on the held-out tape cannot produce pooled IoC above .037054.

Two independent dense affine plants, using the same recovery code without supplying it the planted key:

| Plaintext control | Exact recovered | Train / withheld decoded IoC | Withheld log bigram |
|---|---:|---:|---:|
| Native solved Cicada (external published GP transcription; truncated complete block) | 2,976/2,976 | .06100209 / .06235696 | -2.64410 |
| Gibran untouched second-half GP conversion | 9,192/9,192 | .06076950 / .06060560 | -2.53508 |

Both matrix and bias recovered exactly, including 1,044 and 3,220 withheld runes respectively. The test validates a concrete dense-matrix key recovery route when that model is true; the original is quantitatively incompatible with the observed native-control concentration under every possible shared affine-four inverse in this framing. This is a finite-control conclusion, not an algebraic proof that all English must have that IoC. Exact replay alone is automatic and not evidence that a fitted original key is genuine.

## Next decision

Retire the shared continuous affine-four native-GP receiver on pp16–55, rather than try additional hand-derived 4×4 square matrices, offsets or random dense matrices for the same clock. The result does not cover separate matrices per short region, CBC feedback, other block widths, transposition combined with mixing, or alternate plaintext registers. None of these is selected by the grid alone. Preserve the projective key-recovery method for an independently specified block framing and use its positive controls before expanding the architecture.
