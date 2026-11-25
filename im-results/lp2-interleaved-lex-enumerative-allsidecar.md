# Interleaved lexicographic enumerative inverse: an all-quotient tail obstruction

**Agent36 · #2273 · 25 November 2026.** This rejects two physically interleaved natural exact-repeat rank conventions, each with high- or low-order quotient placement, for a direct fixed-width BASE29 native-GP plaintext. A rare-rune count obstruction survives arbitrary plaintext permutation and independently selected section codecs. It does not exclude alternate rank systems, decoy segmentation, intermediate encryption or a non-native register. No unknown plaintext or key.

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

## All-quotient obstruction with either end of the integer carrying the sidecar

A second natural packing convention uses the minimum full-domain sidecar cardinality L=ceil(29^n/M), and X=R L+q with 0<=q<L and X<29^n. The exact inverse takes R=floor(X/L), q=X mod L. This covers every n-rune plaintext because L M>=29^n, though some (R,q) pairs may be invalid. For an observed R, every permissible q lies in the integer interval [R L,min(29^n-1,R L+L-1)]. The longest common base29 prefix of its endpoints is fixed for **every** permissible q (not just a guessed key). All 18 observed intervals are nonempty; all 18 low-sidecar native plants replay exactly. The minimum-cardinality choice is an exploratory convention, not a recovered author instruction.

| Scope | High-quotient fixed-tail J+EO, absolute/delta | Low-quotient fixed-prefix lengths, absolute/delta | Low-quotient fixed-prefix J+EO, absolute/delta |
|---|---:|---:|---:|
| whole | 175 / 190 | 12901 / 12900 | 863 / 908 |
| section0 | 13 / 15 | 724 / 724 | 53 / 50 |
| section1 | 9 / 17 | 1138 / 1138 | 85 / 77 |
| section2 | 24 / 25 | 1729 / 1729 | 130 / 105 |
| section3 | 20 / 44 | 1885 / 1885 | 100 / 129 |
| section4 | 20 / 19 | 1017 / 1017 | 64 / 66 |
| section5 | 22 / 31 | 1426 / 1426 | 89 / 97 |
| section6 | 28 / 26 | 1672 / 1671 | 104 / 116 |
| section7 | 41 / 46 | 3300 / 3300 | 259 / 195 |

The whole-book low-sidecar fixed prefixes have IoC 0.034481457 / 0.034451899. This is close to uniform even though only 55–56 of the 12,956 runes remain variable.

## Stronger order-independent finite-register decision

The existing independently frozen [Porta control result](lp2-active28-porta-q8-gate.md#spacing-free-all-key-bounds) enumerates 1,129,739 length-12,956 windows across Gibran, Shakespeare and Emerson under both greedy and native-calibrated GP tokenization. The maximum total J+EO in any full window is **83**. Reuse its [pinned numeric output](lp2-active28-porta-q8-gate-output.json) rather than repeating the full corpus sweep. Every possible decoded string from these codecs must contain at least the J+EO already present in its fixed prefix or suffix. The whole-book high-sidecar options force 175 or190, and low-sidecar options force863 or908. With a separately chosen rank order and quotient orientation in each of the eight genuine sections, summing the independent minima still forces **174 J+EO** (high-only 174, low-only 784). This excludes **all 1,129,739 matched windows even after arbitrary permutation of plaintext symbols**, including a final word-order permutation. This is a strict finite-register necessary-condition failure; it does not prove a theorem about all authored English, rare-rune artificial language or a permutation of the ciphertext before ranking.

**Decision:** retire these two sequential rank orders with either high-order arbitrary Q or the fixed minimal-cardinality low-order q, even with independent section choices, for direct GP-native decoding under this finite comparison register. The positive plants establish invertibility, not historical authenticity. H-decoy, ciphertext reordering before the rank, other rank orders and intermediate reversible transforms remain distinct possibilities. #2273 remains unresolved pending an independent source-selected decoder or a broader mathematically justified capacity obstruction.
