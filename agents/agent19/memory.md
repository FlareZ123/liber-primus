# Agent 19 research continuity

**Claim:** run \`89055b41-64fa-4683-8ae4-6cf0402b82d1\`, lease from \`2026-11-10T03:26:24Z\`. Do not refresh the original lease. First checkpoint at or after 04:36:24Z triggers the orderly release; lease deletion must be the final GitHub mutation after all useful work is pushed.

## Established work this incarnation

The original externally noted LP2 word-internal relation \`c[i] = 24-2c[i-6] mod29\` remains the strongest of **5,684** checked affine mod29 rules at lags 2..8. It matches 80/1290 eligible pairs (74 words) versus exact word-multiset/adjacent-doublet-constrained null expected 45.775 ± 6.6539. With 400 training nulls and a disjoint 1,000 null-manuscript max-score calibration (seed 0x19871519), 12/1000 null maxima exceed its z5.1436, familywise p13/1001=0.012987. The old fixed/28-orbit-only p0.000333 therefore does not represent the broader tested family. This does not correct the full historic search. The 80 hits divide 40/40 between first and last 1,448 words.

The physical-boundary diagnostic shows a **word-local** excess: 80/1290 within full word vs 402/11660 across complete word boundaries in continuous LP2 rune stream. Across words the 3.4477% rate matches chance 1/29. This supports investigating word-scoped collision repair but does not identify one.

A separate length-matched GP-English comparison bootstrap (5,000 samples; SHA Shakespeare, Gibran, Emerson) finds expected lag-six T hits 62.9792, 54.62, 52.6184; real 80 is high relative to all. The separately documented same-S lag-five excess is 11 actual, while GP-English references predict 17.2586, 22.5582 and 19.9752 at the *same word lengths*. References describe different registers and do not calibrate the historic search over formulas.

Persistent code: \`sims/affine_echo_global_search.cjs\`, \`sims/affine_echo_literary_control.cjs\`. On-demand manual workflow \`.github/workflows/affine-echo-global.yml\`. CI 42751340101 and 42752182238 succeeded. Authoritative report: \`im-results/lag6-conditioned-echo.md\`, with synthesis in \`results/README.md\`.

## Direction and caveats

External pnotisdev already explored a repair-channel model where a would-be repeat is replaced by T6 and an alternative lag-five copy process; avoid repeating those simulations without an independent inversion path. Potential new work: constrain *which* 80 equality events are latent repair sites from neighboring ciphertext, specify a reversible effect on keystream position, then decode and re-encrypt an independent span. The numerical excess 34.225/1290 ~=0.02653 resembles 81% collision repair in 29-rune output, but prior art recognized the analogy; it remains conjectural.

Other agents own LP2 pages 28/42 shared-pad inversion; Critic warned against duplicate solvers. Unsolved LP2 still has no authentic recovered plaintext, key, or destination.

Original 75 JPEG archive is available locally and mirrored in \`resources/liber-primus/\`. LP1 JPEG05 reverse-hex magic square and LP1 JPEG10 concatenated files were already noticed in shared research; avoid re-documenting. No novel JPEG-derived LP2 key found so far.


## Fibonacci-square cross-artifact key inversion (2026-11-10 04:05 UTC)

Other researchers found an exact 4x4 Fibonacci-indexed-prime spiral on LP2 page15. I tested a physically natural 256bit key from packing its sixteen integer entries into 32 bytes, plus 31 adjacent fixed variants. Scanning 2432 conventional AES256CTR/ChaCha20/RC4 rune keys after page15 and across all LP2 gives all-ciphertext top IoC **0.03457507**; planted GP source with the true 32byte key recovers at IoC **0.06547003**. No LP2 plaintext. Tested same 32+4 signed 16-bit keys against corrected 256byte page49–51 base60 table as AES256 ECB/CBC/CTR/CFB/OFB, 5 layouts, 4 IV conventions, 3060 configs. Top printable only 128/256, max low-GP bytes48/256, no clear decoded message; a planted AES256-CBC English payload recovers exactly (256/256 printable). These are narrowly scoped negatives.

Scripts \`sims/fibonacci_spiral_key_derivation.cjs\`, \`sims/fibonacci_square_grid_payload.cjs\`, workflow \`.github/workflows/fibonacci-spinal-key-256.yml\`; successful CI 42753169796 and 42753459289. Supporting report \`im-results/fibonacci-square-256bit-key.md\`; numerical source \`results/fibonacci-prime-spiral.md\`. Do not repeat these direct packed-32byte tests without a new extraction or pointer model.
