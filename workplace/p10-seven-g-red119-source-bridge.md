# Source-visible p10 “7 G” as a candidate address for the red119 triads and p50 table

**Evidence class:** original-image/transcription facts plus a provisional source-selection hypothesis and one bounded negative consumer test. **No unknown LP2 plaintext, authentic key, complete cipher, endpoint, or final destination is recovered.**

## Human-visible starting clue

Original physical p10 (resources/liber-primus/27.jpg) contains the only isolated decimal numeral in ordinary unknown-page prose: **7**, immediately followed by a complete one-rune word **ᚷ (G)** at rune offset169. The other five decimal digits in the unknown manuscript are numbered-list labels 1–5 on pp36–38. The Gematria Primus table gives G zero-based index6, one-based ordinal7, and prime17. The plausible multiplication (7	imes17=119) is not explicitly printed, but earlier Cicada stages used visible arithmetic products, so it is a reasonable human-solve-path hypothesis.

## What 119 selects

- The two isolated red three-rune spans on original p3 and p39 are both at page-local offset119 and are bracketed by red 13-dot punctuation. The already established solved-LP1 GP29 Atbash outputs are **SCY / UDP**; SCY can be read as SKY under C/K transliteration. See [the red119 report](../im-results/lp2-p3-p39-red119-atbash-sky-udp.md).
- The one-based 119th cell of the original p49–p51 32×8 table is p50 row5 column7, token **0Z**. Its conventional base60 value is35; (35mod29=6) returns GP rune **G**. The same 35 is (5	imes7), the page-local row×column coordinate. This is a useful self-check, but not proof: the table is also a continuous 32-row object (global row15×column7 is105), 0Z occurs twice, and ten cells reduce to G. The cell's 0Z value is unchanged under the specific f-omitting base59 alternative.
- The other printed digits 1–5 and their following words do not produce the same prime-product / table-residue return. This is a small matched control, not a discovery-wide significance test.

The combined p10→119→(p3,p39,p50) alignment is stronger than the original p10-to-red-span observation alone, but the multiplication, one-based lookup, and page-local coordinate check remain candidate interpretations.

## First consumer tested and rejected

The simplest direct use is a period-256 GP29 additive key from the p49–p51 table reduced modulo29, starting at its one-based 119th cell and running continuously over p0–p55. Both signs were tested against the complete 12,956-rune original. They worsen the raw native-GP trigram score (−12.30534 / −12.30229 versus raw −12.27633); all 50 complete candidate windows fall below the worst held-out native-GP window, and the shuffled-key upper-tail p-values are 0.7797 / 0.7836. See the [full bounded test](../im-results/p10-7g-p50-cell119-phase119-gate.md) and [reproducer](../sims/lp2_p10_7g_p50_cell119_phase_sft.cjs).

The 2013 signed “knock on the sky” clue led to ICMP echo, not a demonstrated UDP service. The pre-existing SKY/UDP report documents why neither a direct UDP header nor a live endpoint follows. Do not run network scans or infer a port.

## Current decision

Retain 7G→119→p50 cell119 as a provisional original-artifact address/check hypothesis. Reject only the tested direct phase-119 continuous period-256 additive/subtractive key. A next step is justified only if an independent period-authentic clue selects a consumer of **0Z / row5-column7** or supplies a reproducible response to the red SKY/UDP fragments. Do not expand into arbitrary phases, resets, row permutations, or cipher layers.

Original-source selector reproducer: [p10 7G→red119 SFT](../sims/lp2_p10_literal7g_red119_bridge_sft.cjs). Updated table/consumer reproducer: [phase-119 SFT](../sims/lp2_p10_7g_p50_cell119_phase_sft.cjs).
