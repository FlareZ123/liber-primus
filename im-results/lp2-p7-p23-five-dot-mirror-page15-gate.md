# Mirrored p7/p23 five-dot figures and the p15-centered 16-page gate

**Standing:** a source-image construction and bounded negatives for both an entire sixteen-page mirrored-text reading and literal transfers to original LP2 runes. **No unknown plaintext, authentic key, or complete deciphering rule recovered.** Original reproducer: [single-file source test](../sims/lp2_p7_p23_fivedot_mirror_p15_sft.py).

## Native-resolution source clue

Physical p7 (original **resources/liber-primus/24.jpg**) prints five black circular dots below its last red sentence. Physical p23 (**40.jpg**) prints a five-dot figure above its red heading. Segmenting isolated dark circles at native 2400×3600 resolution and pairing by x gives:

| Pair | p7 (x,y) | p23 (x,y) | y₇ + y₂₃ |
|---:|---|---|---:|
| 1 | (796.94,3105.77) | (796.94,568.23) | 3674.00 |
| 2 | (992.50,3166.64) | (992.50,507.36) | 3674.00 |
| 3 | (1296.93,2866.79) | (1296.93,807.21) | 3674.00 |
| 4 | (1479.26,3127.50) | (1479.26,546.50) | 3674.00 |
| 5 | (1527.15,2936.15) | (1527.15,737.94) | 3674.09 |

The transformation is **(x,y) to (x,3674−y)**. For a frozen 850×460 crop around the five circles, threshold-180 ink masks disagree at just **17 of 391,000 pixels**, with IoU **0.999093865**. A simple vertical translation has IoU **0.024586805**, and simultaneous vertical/horizontal reflection **0.028971988**. This establishes that the source figures are near-exact vertical reflections.

Original physical pages 7 and 23 are equidistant from p15, the page with the **independently deciphered Fibonacci-prime 4×4 number spiral** (7+23=2×15). Excluding page15 leaves **16** pages, p7–14 and p16–23, matching the 16 grid values. The image symmetry is real; its use as an encryption instruction is unproven.

## Does the five-dot reflection generalize to all sixteen surrounding pages?

The visual relation p7↔p23 is exact at the motif. A stronger candidate interpretation is that p15 is a center fold and the sixteen surrounding pages should pair in mirrored page order: p7↔p23, p8↔p22, …, p14↔p16. This would supply a physically indicated page permutation before any cipher hypothesis.

To test the original images without adjusting each page separately, hold the p7/p23-derived vertical transform **(x,y)→(x,3674−y)** fixed on all 16 source JPEGs. Select the same central text crop x∈[510,1900), y∈[500,2350) and pixels grayscale <90. Compute ink-mask intersection-over-union (IoU) for every one of the **8×8** possible left/right page pairs. Exhaust all **8! = 40,320** one-to-one assignments as an exact relabelling comparison.

| Proposed matched pages | p7/23 | p8/22 | p9/21 | p10/20 | p11/19 | p12/18 | p13/17 | p14/16 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Text-region mirrored IoU | 0.185720 | 0.070829 | 0.056779 | 0.115096 | 0.131900 | 0.123629 | 0.121299 | 0.096661 |

The source-pair total is **0.901912440**, against exact assignment mean **0.815591634**; **3,408/40,320 = 0.08452381** assignments equal or exceed it. The original p7/p23 text-region pair is particularly strong (0.185720, highest in its eight-partner row), but the other seven proposed pairs do not collectively identify a unique fold. With fixed crops and a fixed mapping, this is a bounded negative **for mirrored text-ink alignment as a source-selected entire-book page pairing**. An arbitrary cryptographic use of the duplicated five-dot figures is outside this test. Font/line geometry can inflate image overlap; the assignment test does not recover plaintext.

**Independent complete SFT:** [the eight-page-pair image gate](../sims/lp2_p15_multisheet_mirror_gate_sft.py) reads sixteen original JPEGs, computes all 64 scores, verifies the frozen pair values and exhausts 40,320 assignments. This uses neither ciphertext key fitting nor a language score. A 16-page fold should be revisited only if another original clue fixes an extraction/combination operation and predicts an untouched page result.

## Source-constrained original-cipher tests

The exact p15 spiral values are **[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]**. Their established prime indices are one plus the distinct Fibonacci values **[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987]**.

Two simple interpretations were frozen before their results were examined.

1. **One original printed cell = one GP29 Caesar shift per physical page.** The chronological assignment sends the 16 spiral cells to p7–14, p16–23, which contain 3,894 original runes. Every single-page coincidence index is preserved exactly by a Caesar shift. Consequently, the low source within-page IoCs cannot become ordinary English GP frequencies under that model, whatever the 16-cell assignment.
2. **Solved p56 running prime-totient analogue with Fibonacci start addresses.** On page n, start at prime index Fibonacci(n)+1, subtract successive Euler-φ(prime)=prime−1 values modulo 29, advancing once per rune with no invented F interrupters. Two natural fixed orders were tested: chronological p7–14 then p16–23, and center-out/right-first p16,p14,p17,p13,...,p23,p7. Both outputs remain cipherlike.

| Statistic on original 3,894 runes | IoC |
|---|---:|
| Original concatenation | 0.034497539537 |
| Chronological printed-cell Caesar | 0.034343575071 |
| Chronological running φ(prime) | 0.034437642478 |
| Center-out running φ(prime) | 0.034574455804 |

The chronological 16-page mean per-page φ(prime) IoC is **0.034290543443** (range 0.032739373122–0.036381030477). The center-out mean is **0.034901552680** (range 0.032953211471–0.037225960495). These are much closer to random GP29 coincidence (1/29) than to the repository's calibrated native-GP English controls. The resulting pages do not display a coherent recovered plaintext passage.

Both implementations reencrypt all original input runes exactly. A native-GP positive plant of the 95 solved p57 runes round-trips under the same prime-totient code; a wrong-start plant does not. Reencryption validates the implementation, **not** an historical key.

**Decision:** retire the direct 16-page printed-cell Caesar model, the eight-pair mirrored-text registration as a complete page-key selector, and these two Fibonacci-seeded prime-totient models. No source currently specifies that the five-dot reflection selects Caesar, prime-totient, a key clock, or a particular page permutation. The exact image relation may still specify a different reading direction or may be decorative repetition. New keyed tests require an independently constrained reversible rule and a withheld original-cipher prediction.

## Reproduction

The linked [single-file script](../sims/lp2_p7_p23_fivedot_mirror_p15_sft.py) reads original 24.jpg and 40.jpg and the canonical lp2-corpus.json, verifies all five native-resolution circle pairings, proves the vertical-reflection mask result against wrong orientations, regenerates the p15 prime-index generator, executes the two frozen original-cipher tests, runs solved-text positive and wrong-key plants, and asserts exact roundtrips. It writes no files. Python requires NumPy and OpenCV, both used by existing repository source-image tooling.
