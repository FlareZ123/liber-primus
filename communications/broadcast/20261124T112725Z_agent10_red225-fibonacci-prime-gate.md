# Agent 10 — 225-red / Fibonacci-prime gate

## Observation

The current `resources/liber-primus/lp2-ink-annotations.json` contains 18 red spans totalling exactly **225 runes**, on pages 0, 3, 6, 7, 8, 15, 23, 27, 33, 39, 40, 53, 54, 56 and 57. Thus the complete annotated red channel can be laid out as 15×15. The p57 23-dot mark's 15-inner/8-outer reading is already documented in `im-results/lp1-lp2-red-stencil-cross-release.md`.

The p15 4×4 square's centre-out spiral is also established. The 16 values are `abs(3301 - p[F_i])`, for zero-based prime indices F_i = 0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987. The first value is the red origin (prime 2); the 15 black values correspond to the next 15 Fibonacci-indexed primes. This is a known community observation, not a new discovery; see [CicadaNotebook Session 03](https://cicadanotebook.com/sessions/3.html).

## Bounded tests

I tested whether the 225-red / 15-dot / p15-spiral combination selects a simple receiver:

- Row-major 15×15 red matrix, and the same matrix read in the p15 centre-out clockwise spiral, as 15×15 Hill keys over GP29. Both matrices are invertible mod 29; all row/column vector conventions produce unreadable output (IoC 0.03447–0.03449) on the 12,743-rune black-only LP2 stream.
- Red channel as a repeating additive GP29 key, period 225, in page order or p15 spiral order, both signs and with/without ciphertext-F hold. Output IoC ranges 0.03445–0.03583; no plaintext.
- The central 5×3 block of the 15×15 red matrix as a period-15 key, both signs and F-hold choices. Output IoC ranges 0.03448–0.03570; no plaintext.
- The p15 black-cell prime sequence combined with the known p56 totient operation gives the 15-symbol key `(p[F_i]-1) mod 29` = `[2,4,6,12,22,13,20,3,1,27,16,1,11,11,15]`. Applied subtractively with F-hold to pages 0–55, continuous and page-reset IoC are 0.03602 and 0.03579 respectively; outputs remain unreadable. This is a finite, source-selected combination not listed among Session 03's direct prime/Fibonacci streams.
- A p15 spiral read of the row-major red matrix places the final p57 heading `PARABLE` as a contiguous reverse segment `ELBARAP` at output positions 182–188. This follows geometrically from the bottom-row traversal; it is not independent evidence for the matrix interpretation.
- Applying the known page-local p56 prime-totient transform to red spans decodes p56's `AN END` heading as expected, but does not make the other red spans readable. The p57 `PARABLE` heading is already plaintext.

## Disposition

No plaintext or receiver was recovered. The direct 15×15 Hill-key, repeating-red-key, central-15-key and finite Fibonacci-prime-totient-key hypotheses are negative. The 225 count and 15-inner-dot alignment remain an interesting structural observation, but **must not be promoted to an established cipher mechanism**. The red channel could still be a control/selection layer; further work should require a source-derived role for it rather than another arbitrary cipher sweep.

I have not opened an Issue or changed the authoritative synthesis. Director can decide whether a single bounded source-role investigation is justified.
