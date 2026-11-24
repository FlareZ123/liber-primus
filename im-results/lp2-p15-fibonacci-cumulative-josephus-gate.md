# p15 Fibonacci spiral: cumulative prime clock and cyclic elimination traversal

## Source-led operation candidates

The [solved p15 graphic](../results/lp2-p15-fibonacci-prime-spiral.md) gives sixteen consecutive distinct Fibonacci indices f=[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987]. Its red center fixes the first prime (2), and the printed infinity sign between the graphic and lower rubric plausibly suggests cycling. Separately p57 explicitly says to shed our own circumferences. These motivate two reversible operations distinct from using the sixteen numbers as a periodic shift key or as independent starting ranks (already failed). Neither verbal/visual clue unambiguously specifies these consumers.

The exact original receiver possibilities are the lower rubric (p15 offset9; 1894 runes through p22), black body (offset20; 1883), and following physical page p16 (1744). No arbitrary extra position or phase sweeps.

### A. Cumulative prime-index advancement

Starting at ordinal j=0, use K=prime[j]−1 mod29 and advance j by f[i mod16] or f[i mod16]+1 for each non-F consuming rune. Admit pre- or post-shift advancement, both shift signs; F copies through and advances neither clock. All eight finite source schedules are tested on all three fixed receivers. The source graphic's sixteen printed cells are reconstructed exactly. An independent authentic p56 encryption control replays85/85, and each of eight corresponding p57 plants has a complete legal 95-rune inverse (feasibility control, not proof of unique path).

| Receiver | Longest legal prefix among 8 schedules | Full legal inverse |
|---|---:|---:|
| lower rubric | 119/1894 | 0 |
| black body | 146/1883 | 0 |
| next page | 26/1744 | 0 |

All original cases die by offset146, without a dictionary or language model.

### B. Fibonacci-count Josephus traversal of ciphertext

Put the original continuous runes in a circle, start at the first receiver rune, count f[i mod16]+1 positions inclusively and remove the reached symbol, continuing with its successor. The resulting permutation is deterministic and reversible. This operation interprets the Fibonacci indices as counts of removed circumference positions, not shift values. Test both traversal directions (read elimination order / restore order), each of the sixteen source-derived initial prime ordinals f, and both signs of the historical prime-minus-one transparent-F inverse. Exactly64 configurations per receiver. This is the composition of ciphertext-side transposition and historical cipher; plaintext-side transposition is outside this gate.

A blind control encrypts the native 780-rune LP1 first KOAN with hidden origin89 and positive historical shift, then permutes the resulting ciphertext. The exact inverse recovers the correct restoration direction, origin and sign from 240 decoded prefix runes (240/240). The entire independent 540-rune continuation is predicted correctly (540/540), exact end-to-end forward replay; only one of64 configurations admits a full path. The language model excludes the target native section and p56/p57.

| Receiver | Longest legal prefix among 64 configs | Full legal inverse |
|---|---:|---:|
| lower rubric | 250/1894 | 0 |
| black body | 236/1883 | 0 |
| next page | 409/1744 | 0 |

The entire fixed candidate set is impossible under the historical F-hold mechanism even before the half-prefix cut. This rejects this specific circular traversal and typed receiver, not all transpositions or p57 interpretations. No unknown text or source-authenticated key recovered.

## Reproduction

[Node SFT](../sims/lp2_p15_fibonacci_cumulative_josephus_sft.cjs) runs the exact graph and original-cipher experiments on the canonical corpus and native solved reference. Computation executed in connected V8; no independent CI run claimed. Do not broaden phase/offset or traversal variants absent an independent selector.
