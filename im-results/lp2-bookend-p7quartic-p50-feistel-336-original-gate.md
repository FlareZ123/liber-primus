# A p7 quartic / p50 digit Feistel candidate on the original 81²/80² bookend

**22 November 2026, Agent50. Outcome: 336 complete source-fixed two-rune Feistel readings fail to recover native GP29 prose.** This is a bounded negative experiment, not a solution or a theorem about arbitrary nonlinear ciphers.

## One reversible candidate route

The source p7 terminal five wholly red words have zero-based GP29 products **11,26,8,15,2**, selecting the ascending polynomial
`F(x) = 11 + 26x + 8x² + 15x³ + 2x⁴ (mod 29)`.
The identical six-GP-rune bookend pair permits the previously documented source-conditioned **81×81 A** / **80×80 B with five actual missing positions** pairing. The original printed **256 two-character p50 entries** provide byte and radix60 digit operands. These three independently visible objects make a full two-rune Feistel transform a bounded way to ask whether the p50 digits encode rounds rather than a direct additive pad.

For each original B-rune position, pair its unchanged ciphertext rune `C` with an A-rune source `K` from either the p7-GF81 full-period field coordinate map or the literal A interior crop. For each Feistel round, take
`(a,b) -> (b, a ± F(b+k) mod 29)`.
This is **exactly reversible** for any quartic F and offset k by `(a',b') -> (b' ∓ F(a'+k), a')`. No interpolation, adjusted cipher key, or plaintext-dependent exception is allowed.

The complete frozen small grammar allows: both K/C input orders; both round signs; the first p50 base60 digit d as `d+1`, `5`, or `5−d` Feistel rounds; seven per-round offsets `0`, low digit, high digit, their sum, round number, low-digit-plus-round, or the entire printed radix60 byte; and either final output lane. Across two source pairing maps, this is **336 distinct full original ciphertext applications**. It preserves the five source-defined missing positions rather than inventing source ciphertext.

## Original result

All 336 candidates were run on the **original 6,395 B runes**, using the actual original A source and all 256 published p50 cells. Each round was undone by its explicit inverse at **every original paired position**. A separate GP-native English plant verified the full two-output Feistel algebra.

- Original B GP29 IoC: **0.034451571217445597**.
- Highest decoded GP29 IoC across 336 models: **0.03461978012518088**, from field pairing, reversed input order, positive sign, `d+1` rounds, `low+round` offset, second output lane. Its Shannon entropy is **4.851983587929272 bits/rune**.
- Lowest decoded IoC: **0.034372724820449584**.
- **All** decoded IoCs are below **0.037** with all entropies above **4.80 bits/rune**, while the independently pinned native GP29 Gibran 6,395-rune control has IoC above **0.05**.
- The actual original ciphertext source is recovered exactly by reversing the full pair map; success at replay is therefore no evidence that a particular variant is the author's decipherment.

**Reproducer:** [single Windows Node22/CommonJS original-source SFT](../sims/lp2_bookend_p7quartic_p50_feistel_336_original_sft.cjs); [GitHub Actions PASS on Windows](https://github.com/FlareZ123/liber-primus/actions/runs/45065364700).

## A separate visual clue caution

On original scan **67.jpg** (physical p50), the botanical frame has two clusters of five small circles: **five filled dark** circles on the right, **three filled dark plus two very pale outlined circles** on the left. An eight-visible / ten-total count is tempting beside the current frequency-majorization observation that eight p50 digit/parity states are enough to pass a necessary English capacity test.

However, the exact same crop from original scans **57.jpg–72.jpg inclusive**, corresponding to the entire **16-page physical p40–p55 botanical chapter**, is **pixel-identical after grayscale conversion**. The eight-dark/two-faint pattern is a **static reused ornament across all 16 pages**, including pages lacking the numerical table. Moreover, the five spots form a pentagon rather than an inherently numbered zero-through-four axis. The motif alone does not authorize selecting exactly three high-digit classes for a parity split or provide a Feistel direction, input pairing, or recovered rune.

The source observation may help identify chapter structure or thematic 5/8/13 counts, but using it as independent evidence for a **specific eight-state p50 decoder** would be retrospective selection. Any such interpretation needs a genuinely discriminating, previously unfitted plaintext/readout prediction.

## Decision

Simple source-fixed 1–5-round **GP29 Feistel quartic** mixing of the original bookend pair and all directly readable p50 digit offsets is retired. Since the pair input distribution is already almost uniformly spread across the 841 source categories, generic low-parameter invertible maps have little reason to create an English frequency imbalance. The stronger all-secret pair-mixer capacity result remains only a necessary condition, allowing arbitrarily fitted per-state nonlinear tables. It offers no independently selected key or decryptor.

The next plausible causal route is **an authentic first-party rule specifying a non-stationary operation, external key, or material source**, rather than extending this small Feistel family with more ad hoc offsets. All 56 unknown LP2 pages remain unsolved.
