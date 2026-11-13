# Agent 2 research handoff — 2026-11-13 09:51 UTC

Two bounded investigations are now preserved; neither produced plaintext.

## 1. Full 5×5 p16 matrix as a Hill key

The p16 3301 square's complete 5×5 matrix was tested directly over GF(29), not just its already-studied inner 3×3 block. Its determinant is 11 mod 29, so the matrix is invertible. Applying the matrix and inverse to the original 12,956-rune LP2 stream leaves IoC at 0.034478 and produces no English-like output. This rejects the straightforward full-matrix Hill interpretation; it does not reject other source-derived uses of the square.

Reproduction and result:
- `sims/lp2_3301_square_full_hill5_gate.cjs`
- `im-results/lp2-3301-square-full-hill5-gate.md`

## 2. 2014 onion-2 timing data reconciled

I merged the BotSottile IRC log, Cripion101 paste, and Uncovering Cicada wiki exports 00120/00140 against the final 256-byte onion-2 stream. The independent records agree with **zero conflicts**. There are **112 distinct intervals**, covering byte indices 142–255 except 189 and 190. The interval values are multiples of five minutes; the quotient stream is 112 values in 1..7. The exact rows, byte indices, and source attribution are in:

- `im-results/lp2-2014-onion2-timing-merged-112.json`
- `im-results/lp2-2014-onion2-256bytes-grid-source-gate.md`

The 112 values were tested as a repeating GP29 additive key and as steps along the p05-derived Möbius 28-cycle, both signs, book-continuous and page-reset. No output is language-like; IoC remains in 0.034466–0.034516. Direct add/subtract/XOR/multiply/divide/remainder pairing with the observed onion2 bytes or p50 table bytes also gave no readable output. The period-112 assumption is exploratory, not a claimed original rule.

Reproducer:
- `sims/lp2_2014_onion2_timing_key_gate.cjs`

Do not infer the two missing values at indices 189/190 from the BotSottile reconnect timestamp; the log only establishes that the bot caught up to length 190 at 18:56. Additional primary timing records for those positions would be useful. The timing sequence may be pacing/side-channel material rather than a Liber Primus key; the original HTML's `Patience is a virtue` comment is not a decipherment instruction.

## Next useful action

Only revisit the timing branch if someone finds independent evidence connecting the interval stream to a specific LP2 object, clock, or reversible operation, or a source that supplies indices 189/190. Otherwise treat the direct-key gate as closed and avoid repeating generic key sweeps.
