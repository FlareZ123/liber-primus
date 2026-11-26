# p15 Fibonacci modulo 3301 prime-index continuation

**Agent4, 26 November 2026.** No unknown plaintext. A source-motivated but unselected bounded continuation of the actual p15 numerical generator is tested as a consuming prime clock. The 16 original spiral cells are reproduced exactly. The ordinary Fibonacci recurrence is extended modulo the published prime 3301, giving period 1650; the duplicate initial 1 is skipped once for the grid-origin stream, and the first index after the printed grid is 1597. The modulus is an analyst hypothesis, not a printed instruction.

For each consuming rune, use either the exact printed absolute-difference function `abs(3301-prime(F mod3301 +1)) mod29` or the historically solved p56 rule `(prime(F mod3301 +1)-1) mod29`, both signs. Literal F is transparent and does not consume; all latent hold histories are preserved. In addition to two literal source alignments, enumerate every phase of the 1650-state periodic continuation. Targets are the full p15–22 chapter starting at lower red heading (offset9) or black body (offset20). No fitted key or arbitrary reordering.

| Start | Rule | Sign | Maximum legal prefix over 1650 phases | Complete |
|---|---|---:|---:|---:|
| 9 | grid | 1 | 554 | 0 |
| 9 | grid | -1 | 536 | 0 |
| 9 | primeMinusOne | 1 | 587 | 0 |
| 9 | primeMinusOne | -1 | 359 | 0 |
| 20 | grid | 1 | 543 | 0 |
| 20 | grid | -1 | 525 | 0 |
| 20 | primeMinusOne | 1 | 576 | 0 |
| 20 | primeMinusOne | -1 | 348 | 0 |

Fixed alignment F-hold prefixes: 9/grid/1/distinctStart: 5; 9/grid/1/afterGrid: 1; 9/grid/-1/distinctStart: 190; 9/grid/-1/afterGrid: 71; 9/primeMinusOne/1/distinctStart: 29; 9/primeMinusOne/1/afterGrid: 0; 9/primeMinusOne/-1/distinctStart: 7; 9/primeMinusOne/-1/afterGrid: 221; 20/grid/1/distinctStart: 127; 20/grid/1/afterGrid: 1; 20/grid/-1/distinctStart: 2; 20/grid/-1/afterGrid: 68; 20/primeMinusOne/1/distinctStart: 17; 20/primeMinusOne/1/afterGrid: 4; 20/primeMinusOne/-1/distinctStart: 86; 20/primeMinusOne/-1/afterGrid: 11. Every exact inverse path dies before the end. Ordinary consuming direct inverses also yield no coherent opening, with scores and previews in the output. The ordinary rule is not claimed excluded for all arbitrary phase alignments by this study. Positive controls: the true p56 key reproduces all 85 glyphs; all 16 fixed-key native GP29 plants retain a full inverse path. Legal-path retention is not unique recovery. The bigram model is trained only on other solved sections; report scores are descriptive, not calibrated significance.

Retire only this fixed modulo-3301 Fibonacci continuation as a native transparent-F additive clock. It does not exclude other uses of the grid or the original unbounded Fibonacci-index sequence. Source corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; native controls 1b064ef6d85819b7d96adaff31a82d1ec551598f. Reproducer [SFT](../sims/lp2_p15_fibonacci_mod3301_prime_clock_sft.cjs); [raw output](lp2-p15-fibonacci-mod3301-prime-clock-output.json). Core executed in connected V8; standalone CommonJS wrapper not independently run.
