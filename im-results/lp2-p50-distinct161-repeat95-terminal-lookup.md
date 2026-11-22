# Exact 161/95 table-occupancy match to the terminal text, direct lookup rejected

**Agent37, 17 November 2026. Classification: source-original count concordance with an independently decisive failed plaintext-recovery model. No authenticated unknown-page key or plaintext.**

## Original independent objects

The printed p49–51 32×8 table contains **256 two-character base60 tokens**, normalizing to 256 byte values; exactly **161 distinct bytes** occur. In natural printed row-major order, there are **161 first occurrences** and **95 later occurrences** of previously seen values. The final source pages contain **p55=76 unknown GP29 runes, p56=85 independently solved GP29 runes, and p57=95 clear GP29 runes**. Consequently, there is a second exact 256-object division besides the already explored table perimeter/interior: first-occurrences 161 = p55+p56 (76+85) and later duplicate occurrences 95 = clear p57.

This is an appealing source-visible potential dictionary framing, with one direct plaintext-capable hypothesis: read table cells in original printed order, assign each *first occurrence* to the corresponding p55/p56 terminal message rune and each *subsequent occurrence* to the corresponding clear p57 rune. A secret stationary mapping of byte value to GP29 rune could then be learned on duplicate positions and used to recover any unknown p55 first occurrence whose byte appears again.

## Original clear-text consistency gate

The hypothesis makes an exact and immediate necessary prediction, even without knowing p55 or decrypting p56: **whenever a table value occurs more than once among the 95 repeated-value events, the corresponding p57 plaintext rune must be identical**. The unmodified table has **69 distinct values in its 95 duplicate events**, imposing **26 duplicate-event equalities** on the clear p57 page under the proposed original row-major alignment. **23 of those equalities fail** against p57's actual 95 unencrypted GP symbols. The first discrepancy is at zero-based duplicate-event position 5, where byte80 previously mapped to GP index4 and now maps to20. No secret dictionary, key, phase, language model, or unknown p55 glyph can repair those contradictions. A planted byte→GP29 mapping constructed over the same exact 95 duplicate positions passes all 26 equalities.

**The source-count correspondence is statistically ordinary:** 256 independent uniform draws from 256 possibilities have expected distinct count about 162, so observing 161 is unsurprising. There is no authored direction to split the table by repeat versus first occurrence. The source-correct terminal split and direct reusable dictionary decoder are therefore *not established*, and the simplest deterministic implementation is rejected. A time-varying mapping or rearrangement could evade the test but requires a new first-party instruction before investment.

**Execution:** both original-input experiments and their planted controls passed [Windows Node22 on-demand run 44111031094](https://github.com/FlareZ123/liber-primus/actions/runs/44111031094), 17 November 2026.

**Reproducer:** [single-file read-only CommonJS SFT](../sims/lp2_p50_distinct161_terminal95_duplicate_sft.cjs). It reads only the unchanged original grid and corpus and asserts the 161/95 counts, 23/26 original contradictions and a 0/26 planted control. This result leaves all LP2 unknown pages encrypted.
