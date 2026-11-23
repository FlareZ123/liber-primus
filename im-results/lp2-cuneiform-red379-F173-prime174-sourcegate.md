# Original red379 / F / red173: a provisional 174-rune prime-clock receiver

**23 November 2026, Agent36, Director #2243.** New observed arithmetic alignment on the original LP2 source, followed by a finite, source-selected cipher inversion that fails. **No plaintext, selected cipher, or next destination is recovered.** The alignment was recognized after other investigations, and its retrospective selection risk is significant.

## Exact original coordinates

Use original pp33–39, the canonical GP29 corpus, the source color annotations, and the original punctuation transcription. The p33 opening ten red runes ᛞᛇᛉᚳᚠᛁᚪᚹᚻᚷ have GP-prime-weight sum **379**. The p39 terminal red triplet ᛡᚳᛋ has sum **173**. The separate p33 eight-red-rune heading sums **295** and is not used in this proposed boundary.

The five original red-numbered passages have lengths **[139, 91, 98, 96, 129]** = **553** GP29 runes. Exactly **379 + 173 + 1 = 553**.

- Counting from the first numbered rune, the 379th rune is literal ᚠ (**F**, GP index zero), at numbered zero-based offset **378**, physically p38 rune offset **11**. The printed word ᛡᚫᛏᛖᚳᚠ ends there, with a literal hyphen separating it from the next word ᛋᚻ.
- The remainder following that F has **174** actual runes, numbered offsets **379–552**. Its single literal F is at suffix offset **58**; hence the remainder contains **173 non-F runes**, exactly the terminal red triplet's prime-weight sum.
- The original cuneiform numeral **1033** is the **174th prime**. The other printed numeral, **3301**, is the 464th prime.

The untouched original GP29 ordinal SHA256 for the entire 553-rune source is **f432558b32ef4120d80f330d068d4f211005f4a6dac7780e3eec2d1e7a0f191a**. All coordinates and arithmetic are reproduced from original repository sources without modifying runes.

**Interpretation caution:** The correspondence may suggest an author-intended F delimiter and 173-step prime key clock. Nothing on the page explicitly instructs adding these red prime-weight sums, starting at that F, or treating the last 174 runes as one independently encrypted message. Numerous possible numerical combinations exist; this remains a provisional source-derived operand hypothesis.

## Complete fixed-cipher decision

The most relevant previously reproduced author cipher is the solved LP2 p56 prime-totient inverse: plaintext rune = ciphertext rune minus Euler totient of the next prime, modulo 29. A *designated* literal F can remain transparent without advancing the key. Authentic solved p56 has five literal ciphertext Fs but **only one** transparent F; a blanket all-F skip would misrepresent the known method.

Freeze the original 174-rune suffix after the F at numbered offset378. Use the p56 subtract-totient operator with its **sole** F at suffix offset58 designated transparent, consuming exactly **173** prime shifts. Test exactly three first-party motivated initial clocks: p1=2 (p56 start), p174=1033 and p464=3301 (the two visible cuneiform primes). All three clocks were selected before considering plaintext.

| First consumed prime | Last consumed prime | Original 174-rune GP29 index of coincidence |
| --- | ---: | ---: |
| p1 = 2 | p173 = 1031 | 0.03521360706929772 |
| p174 = 1033 | p346 = 2339 | 0.03833632316789582 |
| p464 = 3301 | p636 = 4721 | 0.03494784399707661 |

All are nonprose; none approaches normal native-GP English concentration. For the first-prime clock, the rival **no transparent F** case consumes through p174=1033 and scores **0.03587801474985051**, also nonprose. An independent last174-vs-immediately-preceding174 direct mod29 additive-pad test in chronological and 1033↔3301 mirror key orientations was likewise nonprose: four output IoCs between **0.03249 and 0.03541**.

A 174-rune solved LP1 p6 GP-native positive plant with a declared F at position58 recovers **174/174**, forward and backward, under the exact frozen prime-totient operator. Correct semantics for the single transparent F are separately supported by the established [authentic p56 regression](../sims/authentic_lp2_p56_totient_regression.cjs).

## Decision and reproducibility

The red-prime sums offer a novel **candidate original F boundary and 173-key-advance recipient**, contingent on retrospective coincidence being meaningful. The exact historical prime-totient operation fails to recover unknown LP2 plaintext for every source-selected clock tested. Its failure must not be rescued by fitting offsets, new F masks, or additional arbitrary cipher layers. The first authored opcode remains missing.

- [Read-only, source-locked CommonJS SFT](../sims/lp2_cuneiform_red379_F173_prime174_original_sft.cjs)
- [Windows Node22 PASS on actual GitHub original checkout, run 45123725738](https://github.com/FlareZ123/liber-primus/actions/runs/45123725738)
- [Parent Director Issue #2243](https://github.com/FlareZ123/liber-primus/issues/2243)

Keep this alignment exploratory until independent source evidence selects the F split and subsequent cipher operation.
