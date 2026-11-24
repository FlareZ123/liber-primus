# LP2 Fibonacci full-tap feedback: exact singleton meet-in-the-middle recovery

Agent 7, 2026-11-24. New full-coefficient key-recovery model, not an authenticated cipher. Builds on earlier single/two-tap Fibonacci tests and five-tap Fourier inversion without repeating them.

## Model and motivation

The exact p15 Fibonacci-prime square reconstruction supplies distinct Fibonacci ordinals 0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987. Use all 15 positive values as ciphertext-feedback delays simultaneously, not one selected lag. Also allow a constant and the solved p56 prime-minus-one stream with an independent multiplier:
```
C[i] = P[i] + sum(a[l]*C[i-l]) + b + d*(prime[i-origin]-1) mod 29.
```
For predecessors before the given origin use zero. All 17 coefficients are unrestricted GF29 values; a single key vector is shared throughout each tested clock, with origins continuous book, nine illustrated chapters, or physical pages. This is a source-motivated extrapolation, not a printed direction. No F skip, altered word boundaries, secret alphabet or independent local keys are assumed.

## Exact attack

For each of the 83 true complete singleton words, the ciphertext and actual preceding ciphertext values provide one linear equation in the key coefficients with allowed plaintext A/I/O. Reduce the row system over GF29; every dependent row becomes an exact linear combination of independent observation outputs. Split those independent outputs into two lists and hash the contribution to five dependent constraints. Match against all 3^5 allowed targets, then check all remaining constraints and solve the surviving independent systems by back substitution. Rank-deficient systems preserve every free-variable choice implicitly. No heuristic beam, dictionary fit or score-based cutoff is used.

| Clock | Rank | Free coefficients | Left/right half assignments | Compatible joins after five constraints | Final original observable assignments |
|---|---:|---:|---|---:|---:|
| Book |17|0|6,561 / 19,683|1,473|0|
| Chapter reset |17|0|6,561 / 19,683|1,537|0|
| Page reset |14|3|2,187 / 2,187|55|0|

Thus the full stated family fails on unchanged original LP2 under native A/I/O singleton assumptions, including the entire multi-delay combination and optional prime component. No new unknown plaintext is recovered.

## Blind full-book controls

A source-shaped 12,956-rune plant uses repeated solved p57 native rune text, adjusted only at its original singleton positions to cycle A/I/O. Hidden coefficients are [11,21,16,25,19,27,20,27,19,25,16,21,11,15,4,7,24]. Each of the three clocks is independently encrypted. The identical meet-in-the-middle attack yields exactly one observable assignment per control; it returns the true full key for book/chapter clocks and the same operative coefficients for page reset (the delays 377/610/987 are inactive within physical pages and set to zero). In every case, the recovered key decodes all 12,956 runes exactly, including 12,873 positions that were not used for key recovery. This is a planted model recovery, not a solved unknown passage.

## Reproduction

`node sims/lp2_fibonacci_fulltap_singleton_mitm_sft.cjs` reads canonical source and complete-word parser. The source and all three control/original tests were actually run in the connected V8 runtime with repository file contents supplied to the read-only script (about 10s total). No CI claim. The source alignment assertion explicitly checks all rune indices in the shared transcript against canonical corpus. 
