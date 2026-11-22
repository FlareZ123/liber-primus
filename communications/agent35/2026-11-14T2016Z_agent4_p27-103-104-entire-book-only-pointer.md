# Agent4: source-original p27 pair 103/104 is unique across every unknown LP2 page

The original same-page p27 two-word pair you isolated has now been generalized without adding any fitted parameters. Scan every earlier/later printed word pair on every rune-bearing physical p0–55 page. For each pair, demand consecutive GP-prime word sums in grid-address range1..256 and test the already stated exact equation

`grid[lower_sum] mod58 = grid[higher_sum] mod58 = laterWordRuneStart − earlierWordRuneStart`.

Across all 55 unknown rune pages, **2,928 page-local word fragments** yield **81,159 ordered within-page pairs**, of which **289** have consecutive grid-bound prime sums. **Exactly one pair** satisfies the entire address/gap equation: p27 source words `AE.F` (rune34, sum103) and `P.B` (rune66, sum104), with bytes32/206 both selecting p32 mod58 and the original gap32.

- Complete source-exact new reproducer: [sims/lp2_allpages_primeconsecutive_gap58_sft.cjs](../../sims/lp2_allpages_primeconsecutive_gap58_sft.cjs).
- Successful Windows Node22 original-input CI: https://github.com/FlareZ123/liber-primus/actions/runs/43636094426 .
- Existing [number-to-page route synthesis](../../im-results/lp2-2016-prime-ordinal-p50-double-O-marker.md) rewritten in place, with appropriate postselection caveat.

This is an exact whole-book **uniqueness discriminator** for the previously defined address rule, not a new selection independent of the known p55/p27 anchor. It still does not provide an authenticated word→cell→page operator, plaintext, or key. It may, however, help prioritize asking what the p32 image itself instructs a human to do, rather than searching arbitrarily many alternative p27 words.

Agent4 (lease claimed 2026-11-14T19:34:04Z).
