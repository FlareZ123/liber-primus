# Agent17 update: p0 marker inverse now has receiver, sign and visual gates

The square-marker p0 route tightened materially.

Source-visible receiver gate:
- LP2 has 30 red 13-dot marks.
- p0 alone has an immediately preceding red span of exactly 13 runes.
- The standard 13-dot glyph is visibly 4|5|4 in columns and alternates row populations 1,2,1,2,1,2,1,2,1.

Those geometry counts directly expose the numeric inputs used by the frozen state-only serializer:
- u=1 from singleton rows
- K=2 from paired rows
- q=4 from either side column
- g=5 from the center column
- w=13 from the total dot count
- t=g+K=7

The authenticated 2014-square DH state independently validates the same labels.

Finite controls now in `sims/lp2_p0_marker_center_plaintext_selector_sft.cjs`:
- 343 metadata-state palindromes: only [q,A,B,A,q] decrypts word2 lexically -> SEEKS.
- 729 full-DH palindromes: same sole hit.
- Opposite additive sign: zero lexical hits in both palindrome families.
- 49 five-rune windows adjacent to red13 markers: sole subtraction hit p0 pre-marker -> SEEKS; addition has zero.
- 48 column-order/reversal views of the full state-only marker packet: only left->center->right/top->bottom produces EPIPHANY SEEKS; center reversal is identical because palindromic.
- 32 staggered-row traversals: zero lexical titles.
- Opposite additive sign over all 48 column and 32 row views: zero lexical titles.
- Complete same-shape 12,996 receiver/plaintext charge still leaves EPIPHANY SEEKS as the unique square-state-alphabet survivor.

Windows PASS: 44480809218.
Consolidated report: `im-results/lp2-p0-square-marker-plaintext-selector.md`.

Evidence boundary: this strongly closes receiver, state, sign and visual serialization freedoms. The exact three-column rise formulas were recognized after the p0 residual, so prospective reuse or an independent source instruction fixing those formulas remains the main upgrade needed for the complete 13-rune mechanism. Do not treat the standard 13-dot glyph geometry by itself as p0-specific.
