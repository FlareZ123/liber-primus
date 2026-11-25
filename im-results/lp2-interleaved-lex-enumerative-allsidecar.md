# Interleaved lexicographic enumerative inverse: an all-quotient tail obstruction

**Agent36 · #2273 · 25 November 2026.** This closes two physically interleaved natural exact-repeat rank conventions for a direct, fixed-width BASE29 plaintext and unrestricted high-order quotient. It does not exclude alternate rank systems, decoy segmentation, intermediate encryption or a non-native register. No unknown plaintext or key.

The preceding [six register-order study](lp2-word63-enumerative-allsidecar-tail-gate.md) separates head symbols, repeat mask, and nonrepeat successors into complete registers. This experiment instead ranks the actual source glyph stream sequentially, interleaving each group's head and every following transition at the exact printed positions, preserving the corrected original grouping and all page carries. Two standard orders are fixed before calculation: ascending absolute GP glyph, and ascending modular successor delta (repeat=0). The historical signed BASE29 operation motivates integer serialization, but no author clue selects either rank or the observed quotas; those are retrospective. No additional key or sidecar tuning.

For h printed groups, t internal transitions, and exact quota k, the size is M=29^h C(t,k) 28^(t-k). At a head each possible symbol has equal suffix width M/29 (with M updated as the walk proceeds). At an internal transition, each ordinary successor has width M(t-k)/(28t), and the repeat has width Mk/t. These counts partition M exactly; summing the widths of preceding symbols gives rank R. Unranking by the same widths reconstructs every glyph and repeat, without extracting a separate mask register.

If plaintext is the fixed-length base29 expansion of X=Q M+R, then X mod 29^h=R mod 29^h **for every integer Q**. This is independent of how Q is derived, so the final h plaintext symbols cannot be rescued by finding the missing sidecar. Unlike the prior six-register permutations, this tests natural physical sequential/interleaved rank. Compare the fixed suffix against every contiguous equal-length window of the independent 2,979-rune solved GP donor. These are histogram diagnostics, not a proof against all possible languages.

| Scope | Runes | Groups | Internal repeats | Absolute tail IoC | Delta tail IoC | Native window range |
|---|---:|---:|---:|---:|---:|---:|
| whole | 12956 | 2896 | 63 | 0.034439498 | 0.034506293 | 0.061279449–0.061545196 |
| section0 | 729 | 158 | 2 | 0.034669032 | 0.032411513 | 0.052084173–0.074094977 |
| section1 | 1145 | 255 | 4 | 0.037795276 | 0.034800062 | 0.053697700–0.075714065 |
| section2 | 1738 | 385 | 7 | 0.034442641 | 0.034280303 | 0.055695346–0.070373377 |
| section3 | 1894 | 435 | 10 | 0.034450977 | 0.034525134 | 0.056549605–0.069315112 |
| section4 | 1021 | 224 | 9 | 0.035233824 | 0.033311980 | 0.053251121–0.075752723 |
| section5 | 1433 | 326 | 8 | 0.033902784 | 0.034110429 | 0.054497404–0.072487022 |
| section6 | 1680 | 378 | 8 | 0.034258207 | 0.034552931 | 0.055604676–0.070144415 |
| section7 | 3316 | 735 | 15 | 0.033950583 | 0.034261988 | 0.057799032–0.067404400 |

All 18 source inverses and equally sized native plants round-trip exactly. The original full book has 12,956 runes, 2,896 complete groups and 63 internal repeats. The eight local scopes are the eight actual $-terminated sections, not physical chapter guesses. The run was executed on the repository data through a JavaScript runtime; independent Windows CI has not been run. The code reads corrected transcription and checks every rune against the canonical source; native data is the external solved GP register. Reproducer: [SFT](../sims/lp2_interleaved_lex_enumerative_allsidecar_sft.cjs); [numeric result](lp2-interleaved-lex-enumerative-allsidecar.json).

**Decision:** All fixed tails are below every matched solved-source native window; retire these two sequential rank orders for direct native-GP plaintext regardless of quotient. The positive plants establish invertibility, not historical authenticity. Under H-decoy the source group resets are merely a hypothesis; H-shuffle with an additional plaintext rearrangement is also beyond a direct BASE29 interpretation. #2273 remains unresolved pending an independent source-selected decoder or broader mathematically justified capacity obstruction.
