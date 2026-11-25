# LP2 plaintext-addressed prime clock — exact rejection (#2775)

## Frozen hypothesis and outcome

Agent 8, 2026-11-25. On physical page 54, omit its nine-rune title, then concatenate the 223-rune body with the 76 runes of page 55. GP chart indices are zero-based, with F=0. The candidate cipher emits literal F without advancing when P=0. Otherwise C=(P+prime[j]-1) mod 29, and j advances by P+1. The prime array starts at 2. Test every j=0..3301 without page resets.

**All origins are impossible.** The language-independent union of reachable cursors becomes empty after body rune 180 (page rune 189, one-based), before the final 43 fitting runes or any page-55 holdout. No plaintext was recovered. This rejects exactly the frozen law, not all nonlinear clocks.

## Exact inverse

For ciphertext symbol y at cursor j, include (P=0,j unchanged) iff y=0. Compute x=(y-(prime[j]-1)) mod 29; include (P=x,j+x+1) iff x is nonzero. These are all legal branches. The maximum cursor after 299 runes is 3301+29*299=11972; the prime table contains 11973 entries ending at 127819. No cursor cap, beam or sampling discards valid paths.

The union reaches 2187 distinct cursors after rune 1, 125 after rune 32, 240 after rune 33 (F), 82 after rune 56, 159 after rune 57 (F), one after rune 162, and zero after rune 180. The third F at rune 187 is unreachable. Counts are distinct cursor states, not counts of origins. The full per-origin DP independently finds zero viable origins across the fitting body.

For calibration, score paths with a smoothed GP trigram fitted to native sections excluding the test section, merging identical (cursor, previous two symbols) states while summing exact BigInt path counts and retaining the highest-scoring path. Select the origin and path on the 223-rune prefix alone, then continue from that state over 76 held-out runes. For any emitted candidate assert exact forward replay. The authentic fixed-step page-56 cipher replays 85/85 as a chart/convention control, not as evidence for the nonlinear rule.

## Calibration

| Native plant | True origin rank | Prefix correct | Holdout correct | Prefix NLL | Holdout NLL |
|---|---:|---:|---:|---:|---:|
| Welcome | 2 | 217/223 | 76/76 | 2.77910 | 2.50491 |
| Koan | 1 | 223/223 | 74/76 | 2.39419 | 2.20828 |
| Loss of divinity | 1 | 223/223 | 76/76 | 2.72713 | 2.68025 |
| jpg107-167 | 1 | 223/223 | 76/76 | 2.49915 | 2.51951 |

The first plant selects origin 162 instead of 137 but reaches the same prefix-end cursor 3199. This is not unique key recovery; a deterministic plaintext-dependent cursor can merge trajectories. Exact held recovery is 302/304. All four true origins rank in the first two, three rank first. In four histogram- and F-position-matched shuffled negatives, prefix NLL is 4.92946–5.40358; three frozen prefix states cannot extend and the remaining held score is 5.09134. None of these scores is needed for the original impossibility result.

## Scope and disposition

Distinct from fixed affine prime clocks (#2547), fixed prime-gap clocks (#2555), and Fibonacci lag autokey (#2698). Retire the specific plaintext-addressed clock from #2775 rather than adding increments, resets, or a wider origin range post hoc. Cursor coalescence is a potential identifiability concern for independently motivated future clock designs.

Reproducer: [sims/lp2_plaintext_addressed_prime_cursor_sft.cjs](../sims/lp2_plaintext_addressed_prime_cursor_sft.cjs). Run from a checkout using Node.js; the core JavaScript and projected trace were executed in the connected JS runtime, not as a separate local Node process. [Exact machine-readable output](lp2-plaintext-addressed-prime-cursor.json). Source blobs: corpus `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, native `1b064ef6d85819b7d96adaff31a82d1ec551598f`.
