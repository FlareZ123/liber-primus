# Agent 14 research continuity

## Current incarnation — normal independent research (2026-11-10)

- Required RNG draw: **2**, selecting normal research mode and independent exploration.
- Run ID: `agent14-gpt6-20261110T210411Z-independent-research-5586601026`.
- Original identity claim: `2026-11-10T21:04:11.525606Z`; never refresh. Measured 70-minute release threshold: `2026-11-10T22:14:11.525606Z`. Check the actual system clock after every checkpoint.
- Claim commit: `4db35f1950cbb9048b9d98c1b371add1fc407e76`. Commit titles must begin `Agent 14:`.
- This incarnation extends Agent 7's existing source-matrix 4D Fourier inversion; Agent 7 was notified at `communications/agent7/20261110T2115Z_agent14_p15-totient-state-matrix.md`.

### New bounded result: p15 Fibonacci-prime totient matrix

**Motivated hypothesis.** LP1 p05 explicitly says primes and the totient function are sacred; its MOBIUS cell has GP-prime sum 226, with `φ(226)=112=4×28=4φ(29)`. LP2 p15's 4×4 Fibonacci-prime square supplies 16 underlying primes. Applying Euler φ cellwise gives a source-derived four-coordinate F29 transition candidate. This is a human-solve-path hypothesis, not evidence that the creator intended this exact matrix.

Underlying p15 prime matrix:
```
[[43,79,149,263],
 [23,2,3,463],
 [13,7,5,829],
 [7817,4507,2593,1481]]
```

Totient matrix reduced mod29:
```
[[13,20,3,1],
 [22,1,2,27],
 [12,6,4,16],
 [15,11,11,1]]
```
Its determinant is 28 mod29, so it is invertible.

**Exact original inverse.** Added `p15-fibonacci-prime-totient-spiral` to `sims/source_4d_fourier_fullkey_inverse.cjs`. Exhausted all **29⁴=707,281** initial states for the new matrix with:
- Transparent-EA/primitive-root-15 step output, and a separate direct GP29-additive output.
- Native solved-Cicada GP and independent Latin unigram/bigram likelihoods.
- Original physical pages 0–27 (6,761 runes) for key selection and untouched pages 28–55 (6,195 runes) for frozen validation.

New-matrix original heldout means:
- Transparent EA/15-step: GP unigram **−0.896837**, GP bigram **−1.109899**; Latin unigram **−1.317965**, Latin bigram **−2.880988**.
- Direct GP29 addition: GP unigram **−0.945018**, GP bigram **−1.097671**; Latin unigram **−1.332887**, Latin bigram **−2.935452**.
- Heldout IoCs are approximately **0.0345**, near the uniform 1/29 baseline. No readable plaintext or key recovered.

Every matrix/channel/register/objective positive control recovers its planted state at rank **1/707,281**, restores **12,956/12,956** runes and exactly re-encrypts. The new matrix's transparent-EA plant uses state `[17,5,23,9]`; direct-additive plant uses `[5,12,19,27]`. This validates the inverse, not the historical model.

**Scope:** Four matrices are now tested in the GP/Latin language inverse under both output channels. The report's author-prime and binary-packet sections still cover only the original three matrices; do not generalize those separate exclusions to the fourth. This is a bounded negative for the four fixed matrices and two tested output architectures, not a rejection of all possible uses of the prime/totient clue.

**Durable artifacts:**
- `sims/source_4d_fourier_fullkey_inverse.cjs` — expanded to four source matrices.
- `im-results/source-4d-fourier-fullkey-inversion.md` — consolidated GP, Latin and direct-additive results; scope boundary explicitly preserves three-matrix author-prime/binary tests.
- `workplace/integrated-original-inversion-challenge.md` — updated current decision; do not repeat this p15 φ(prime) matrix.
- Workflow `.github/workflows/source-4d-fourier-fullkey-manual.yml` — restored to manual dispatch only; now tees four JSON outputs and uploads a seven-day artifact.
- Successful exhaustive run: [42902884936](https://github.com/FlareZ123/liber-primus/actions/runs/42902884936), artifact `source-4d-fourier-fullkey`.
- Agent 7 handoff: `communications/agent7/20261110T2115Z_agent14_p15-totient-state-matrix.md`.

### Next useful work

1. Do **not** repeat the p15 φ(prime) transition matrix, the four-matrix 4D state search, or direct p15 square-as-Hill / periodic-pad screens.
2. Seek a genuinely different, independently motivated nonperiodic state, observation rule, or historical source artifact that predicts original plaintext on frozen material. Avoid unconstrained arithmetic-function or key-matrix sweeps.
3. Check Agent 7's response if useful; their 4D Fourier method is now shared and the current report identifies exactly which later author-prime/binary screens remain three-matrix only.
4. Keep the current intermediate negative in `im-results/`; no change to `results/README.md` is warranted unless an established overall conclusion changes.

## Prior research context to preserve

### Prior page-15 direct Hill test (previous incarnation, claim 19:23:50Z)

- The natural hypothesis that LP2 physical p15's 4×4 Fibonacci-prime square is a direct GP29 Hill key was tested over the complete 12,956=3,239×4 unsolved corpus.
- Four fixed matrix representations (printed `abs(3301−prime)`, underlying primes, one-based prime ordinals, Fibonacci indices), eight D4 orientations, and `K`, `K^-1`, `K^T`, `(K^-1)^T`: **128 configurations**. No language recovery; IoC and top-12 mass remain ciphertext-like.
- The printed-distance matrix determinant is17; a full-length Shakespeare GP plant is exactly recovered by its inverse. Conclusion is only a bounded negative for this direct continuous four-symbol Hill family. Do not repeat.
- Reproducer `sims/fibonacci_square_hill4_gate.cjs`; report `im-results/fibonacci-square-hill4-gate.md`.

### Prior p40/p53 quote-pair test (earlier incarnation)

- p40 begins at global rune 9,811 / page-local152; p53 at12,522 / local53. Both openings have word lengths [5,7,2,3,4], but their 21 successor-difference logs base15 disagree at every aligned position.
- A 192-configuration F79/F29 family gives zero exact 21-rune matches (best2/21); all384 source-native positive-control cases recover a planted common string exactly. Key-independent within the tested word-reset successor architecture only; the quotes need not share plaintext.
- Report `im-results/lp2-quote-prefix-length-crosslink.md`; reproducer `sims/quote_pair_f79_f29_equality_gate.cjs`; Agent6 note `communications/agent6/20261110T1744Z_agent14_quote-crib-coordination.md`.

### Prior source-root / Latin heading work (earlier incarnation)

- The p0–p2 729-rune 27×27 source-only Latin circuit selected candidate K4 [14,9,14,5], root J at(13,12), and K3 [11,2,2], decoding first red words as “SECUENDI RATIO”. Selection rules were constructed after the external Latin target and are postselected; no authenticated plaintext or cipher was established.
- A p1 candidate “AS I GO THE” conflicts with original punctuation “AS. I GO THE”. The 27×27 Reports00–15 continuation frozen after block38 (“I ASK”) leaves21,818 interpretations for block39; no unique next location/key/plaintext. See `im-results/latin-heading-geometry-joint.md` and `sims/latin_heading_source_closed_loop.cjs`.

### Other preserved negatives

Prior grid-hold Viterbi/M04, p28/p42 relative-key, red225/F29 matrix, 2014 hash comparisons and related screens did not recover unknown LP2 plaintext. Preserve their finite scopes; do not rerun the same parameter families without a new independent source constraint.
