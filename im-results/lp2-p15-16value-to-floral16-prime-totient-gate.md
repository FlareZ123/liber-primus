# p15 sixteen-value spiral as a page-specific prime-totient key for the sixteen floral pages

**Original-input finite negative.** The one-to-one page assignment below does not produce LP2 plaintext. This exact test is distinct from earlier p15 key-repetition tests on p16–22 and from attempts to convert the printed sixteen numbers into a 32-byte AES key.

## Independent visual alignment and its uncertainty

Original physical p15 (archive scan `32.jpg`) prints a 4×4 number grid with a red `3299` starting cell. Its sixteen cell values, read in the original clockwise outward spiral, are exactly `|3301 − p_(F+1)|` for the first sixteen distinct Fibonacci numbers `F=[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987]`, with prime rank counted from one.

Another independent original-print feature is a **single repeated floral-border design across exactly sixteen physical LP2 pages, p40–p55 inclusive**. Page p50 is the 256-cell numeric table and has no runes. A reader could try assigning each spiral value to one of those sixteen similarly framed pages. The correspondence of the numbers sixteen is **a hypothesis**, because no printed instruction explicitly links the square to the floral border. It is also some distance in the manuscript; do not treat this alignment as proof.

The original solved LP2 p56 supplies an authentic GP29 inverse ingredient: subtraction of Euler's totient of consecutive primes. Thus this is a narrow candidate consumer of the square selected using a *known* Cicada operation, without adding a secret word or fitting any original ciphertext.

## Complete fixed operation

Number the floral pages `p40+j` for `j=0..15`, in published source order. For page `j` let `s_j=F_j+1`, where `F_j` is the spiral's distinct Fibonacci input. For each ciphertext rune `i` within that physical page, decode

`P[j,i] = (C[j,i] − (p_(s_j+i)−1)) mod 29.`

That is the authentic solved-page prime-totient subtraction primitive, but **with each page's starting prime rank given by its assigned spiral cell**. Rank `s_j` is one-based, whereas `i` begins at zero. Source-visible page p50 reserves `s_10=90` and consumes **zero** GP runes, so the next page p51 starts at `s_11=145`, rather than shifting the array to conceal the empty page. There are no literal-F bypasses or page-specific fitted phases. The opposite sign is included only as a direction control. The resulting test covers all **3,316** original runes on p40–55.

The sixteen mapped prime ranks and initial primes are

`[1,2,3,4,6,9,14,22,35,56,90,145,234,378,611,988]`

and

`[2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817]`.

Both lists reconstruct the **original 16 printed cells** exactly, including the two absolute differences when the prime exceeds 3301.

## Result

| Prescribed pagewise operation | GP29 IoC across all 3,316 runes | Recoverable natural-language plaintext? |
| --- | ---: | --- |
| Untransformed p40–55 source | **0.0344628266** | No |
| Subtract page-assigned φ(prime) stream | **0.0345406976** | No |
| Add page-assigned φ(prime) stream | **0.0345439725** | No |

The 29-way uniform baseline is **0.0344827586**, and both transformed streams remain indistinguishable from a flat monogram distribution at the present level. The subtraction candidate begins, transcribed as original GP tokens, `EA-W-S-L-AE-J-N-M-TH-X-P-M-Y-EA-J-N-E-X-P-T-G-M-NG-U-L-G-N-S-Y-IA-A-TH-P-F-O-D-IA-H-AE-O`. It has no recognizable GP prose; per-page scores also remain noise-like.

An independent **3,316-rune planted-control** sequence built from known solved p57 GP runes is encrypted using precisely these sixteen page-specific p15 start ranks and then perfectly recovered by the fixed inverse, with the zero-rune p50 assignment preserved. Real original ciphertext is likewise re-encrypted exactly, confirming all signs and ranks were applied consistently. These controls show reversibility, not any evidence that the guessed page-to-square alignment is intended.

[Single-file CommonJS source-exact reproducer](../sims/lp2_p15_spiral_to_16_floral_pages_sft.cjs) asserts all original lengths, ranks, sixteen literal square cell values, p50's empty-page slot, pooled observed IoCs and exact round trips. Inputs: `resources/liber-primus/lp2-corpus.json` and the previously image-adjudicated source p15 table.

## Decision

The numerical match **16 spiral values ↔ 16 original floral-bordered pages** supplies a plausible, human-visible page-index bridge. The straightforward and source-authentic consecutive-prime totient consumer does **not** decrypt those pages. Retire this particular page-reset, clockwise, rank-indexed prime-totient interpretation. A new operation would require an independent original instruction identifying the consumer, the role of p50 and the clock. Neither a shifted key phase nor an optimized page order is justified by this negative.

References: [p15 solved spiral](../results/lp2-p15-fibonacci-prime-spiral.md), [original visual chapter layout](lp2-global-original-visual-section-map.md), [original image archive](../resources/liber-primus/README.md), [full SFT](../sims/lp2_p15_spiral_to_16_floral_pages_sft.cjs).
