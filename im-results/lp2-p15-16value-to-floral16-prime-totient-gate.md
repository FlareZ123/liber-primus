# p15 sixteen-value spiral as a page-specific prime-totient key for the sixteen floral pages

**Original-input exact negative, strengthened by the correct historical plaintext-F bypass.** The original clockwise page-to-prime-start assignment did not produce plaintext under the earlier every-rune-consumes-key model. A newer [exact all-F-mask test](lp2-p15-ftransparent-allphase-feasibility.md) shows that the stronger authentic rule cannot reproduce seven original floral pages **under any of all 16 p15 start ranks and either encryption sign**, even after independently rephasing/reassigning the starts on each page. This source-key interpretation is algebraically excluded; no key, plaintext or intended continuation is recovered.

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

## Subsequent authentic plaintext-F exact source-key gate

The original solved LP1 WELCOME and solved LP2 p56 encryption algorithms include a historical rule missing from the initial fixed-position experiment: **literal plaintext F emits ciphertext F while consuming no key**; a ciphertext F may also encode an ordinary non-F through the current key. Therefore simply subtracting phi(prime) at every printed ciphertext position cannot be regarded as the most generous test of the actual Cicada primitive.

The later [complete-state inverse SFT](../sims/lp2_p15_ftransparent_allphase_feasibility_sft.cjs) treats every ciphertext F as both possible branches and propagates **all** consumed-key counts, merging only identical states. It tests all **16 source-derived starting prime ordinals [1,2,3,4,6,9,14,22,35,56,90,145,234,378,611,988]** and both cipher directions on **each of the sixteen original floral pages independently**, 512 page/start/sign original-input checks. This grants any spiral permutation, changed page order or independent sign and clock reset without changing the candidate prime-totient operation. No original English plaintext hypothesis is used to reject impossible keys.

**Seven originally printed floral pages p40, p42, p44, p45, p47, p48 and p54 admit zero legal F-mask paths under every one of the 32 page-specific start/sign combinations.** No perfect assignment or reordering of 16 starts can repair a page with no legal edge. The exact clockwise plus-sign mapping in this report passes only p43, p49 and runeless p50; thirteen others are impossible. The zero-rune p50 is preserved as always compatible, with 32/32 choices, rather than removed to make the alignment look stronger.

A genuine **85-rune original p56 cipher** passes this very same inverse with its actual totient key. All **512** source-native GP-English positive plants (one per original page/start/sign combination with original page lengths and true plaintext-F bypass) also pass. The [single completed manual Actions test](https://github.com/FlareZ123/liber-primus/actions/runs/43440839029) validates the exact script and historical solved-cipher controls on Node.js 22.

This settles the most natural historical correction to the original 16-floral-source-key route. It does not constrain an independent hidden key, a different transform of the p15 numbers or a cipher not using source p56's recurrence and plaintext-F convention.

## Independent sixteen-page order-discrimination check

An independent original-input implementation (Agent33, 12 November 2026) reproduced **all 3,316** original symbols and the specific subtraction IoC **0.034540697600372615**. A fixed-seed **10,000-shuffle reassignment** then held the complete set of sixteen Fibonacci-prime start indices and every original physical page unchanged, but randomly permuted which of the sixteen source starts belonged to each page. In **2,332/10,000** reassignments, the same full decoded-stream IoC was **at least as high** as the original clockwise page mapping; add-one upper-tail **2,333/10,001 = 0.23327667**. Exactly **7,672/10,000** had equal or lower IoC. This does not make a uniform distribution a good decryptor, but it shows the aesthetically appealing source order does **not** stand out under this natural fixed-key-set diagnostic.

The [canonical SFT](../sims/lp2_p15_spiral_to_16_floral_pages_sft.cjs) now includes this seeded permutation test and assertions. The independent [Agent33 original-input implementation](../sims/p15_fibonacci_16floral_page_phi_sft.cjs) remains as a reproducible cross-check; it introduces no additional key model. Both agree on the source reconstruction, 16-page scope, and negative original-language outcome.

## Decision

The numerical match **16 spiral values ↔ 16 original floral-bordered pages** supplies a plausible, human-visible page-index bridge. The straightforward and source-authentic consecutive-prime totient consumer does **not** decrypt those pages. Retire this page-reset, p15-rank-indexed prime-totient interpretation under both the original naive clock and the complete, historically authenticated plaintext-F bypass. The exact all-mask obstruction already excludes every assignment of the printed sixteen starts and either sign to the seven fully incompatible pages. A new operation requires an independent original instruction identifying a different consumer, page key source or state rule; adjusting the number-to-page order or F-mask cannot help. Neither a shifted key phase nor an optimized page order is justified by this negative.

References: [p15 solved spiral](../results/lp2-p15-fibonacci-prime-spiral.md), [original visual chapter layout](lp2-global-original-visual-section-map.md), [original image archive](../resources/liber-primus/README.md), [full SFT](../sims/lp2_p15_spiral_to_16_floral_pages_sft.cjs).
