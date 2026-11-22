# Original p7/p8 source-cued pre-read cubing: finite GP29 inverse decision

**Agent1, 22 November 2026. Classification: four complete original-input negative decoders with source-native positive replay. No unknown LP2 plaintext, author-selected cipher, or external key recovered.** Director issue [#2256](https://github.com/FlareZ123/liber-primus/issues/2256) asked for a new *pre-read* or global 243-cell operation, rather than another static or after-read lookup.

## Original clue and the competing explanation

The [2014 original p7 image](../resources/liber-primus/24.jpg) displays five complete red words just before five separate black dots. Exact zero-based GP29 word products are `[11,26,8,15,2]`. Modulo 3 these are `[2,2,2,0,2]`, the previously verified period-242 five-trit companion feedback. The dots' left-to-right height ranks `[3,5,1,4,2]` reduce modulo3 to a nonzero seed `[0,2,1,1,2]`. The [original p8 image](../resources/liber-primus/25.jpg) begins with two red words whose index products are **4** and **3**, followed by exactly **243 black GP29 runes**. The generator's two cyclic four-zero runs begin at positions **22** and **143**; either supports an added zero yielding 243 distinct five-trit windows. The final black p8 rune is **ᛇ**, the first rune of a genuine printed six-rune word continued by p9's first five runes, so it is retained both as source text and as the original history rune; it cannot silently be dropped as padding.

A plausible but unproven reading is **4→four-zero splice**, **3→GF29 cubing**. On a table lookup, **cube the addressed original p8 cell *before* reading it**, then use that modified value as a conventional additive GP29 key. That is a genuine different output tape from every earlier after-read-only mutation on the first 243 source runes. There is no first-party imperative stating that the original p8 prose is a table, how to select one of the two zero runs, or whether its second red product instructs cubing.

## Complete finite-machine test

The self-contained [Windows-compatible Node22 SFT](../sims/lp2_p7_p8_preread_cube_original_sft.cjs), [manual CI PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45025278127), derives the source taps/seed and verifies both 243-address bijections. It uses the complete **1,474 unchanged GP29 ciphertext runes of original p9–p14**. For each exact zero splice, assign the 243 p8 black values in printed order to the generated five-trit address table `T`. At site i, let a be the five most recent original *ciphertext* symbols, interpreted either as their indices mod3 or as their GP prime weights mod3, with original p8's final five runes as history. Perform:

`T[a] ← T[a]^3 mod29;` then `P_i=(C_i−T[a]) mod29`.

The forward inverse is `C_i=(P_i+T[a]) mod29` with exactly the same pre-read mutation and ciphertext-fed history; it requires neither a hidden plaintext symbol nor a fitted key. Test the two source-valid splices × two published GP trit readings = **four fully specified machines**. The minus sign is the conventional decryption of a positive additive output, fixed in advance. No phase, orientation, key search, lexical selection, table permutation or page reset was tuned.

| Zero-run insertion after | Address trits | Full original 1,474 IoC | First 300 IoC | Separate p13 first 200 IoC |
| --- | --- | ---: | ---: | ---: |
| 22 | GP index mod3 | 0.034439909 | 0.034760312 | 0.034773869 |
| 22 | GP prime mod3 | 0.034558738 | 0.034136009 | 0.035226131 |
| 143 | GP index mod3 | 0.034216070 | 0.034069119 | 0.034924623 |
| 143 | GP prime mod3 | 0.034668354 | 0.035362319 | 0.034874372 |

Each model exactly forward-reencrypts all **1,474/1,474 original ciphertext runes** and correctly encrypts/decrypts a full-length **1,474-rune plant repeating the authenticated solved p57 native-GP plaintext**. Those are implementation tests, not keys or plaintext claims. Original output prefixes are nonlinguistic (examples `UEFSCTHJNEWUYCS...` and `AJWWLOEFTTAU...`). No output reaches 0.04 IoC on the full original text or either disjoint sampled part; the previously published complete native-GP English controls have substantially greater IoC on all length-243 windows (minimum 0.0479883 across 263,456 windows, [earlier original source gate](lp2-p8-original-mutable-ternary243-state-gate.md)). This is evidence against these four exact machines as direct ordinary native-GP English inverses, not against every language, trit clock or mutable table.

## Research decision

Pre-read cubing has now been directly tested on the original as a reversible, historically hand-executable candidate operation, and its original-language output fails. **The missing independent author-selected instruction is the operative obstacle**: the red operands fix neither an address→GP29 conversion nor the particular first-cycle mutation. Expanding to fitted cube powers, arbitrary output layers, phases or new write laws would be formula hunting without a stronger source clue. The 242-state recurrence, two valid splices, authentic 242+1 page carry, and p8 red 4|3 remain useful *conditional* source facts. No new plaintext, key, or authenticated pre-read opcode follows from them. A future branch should first produce an actual first-party instruction or another original clue that selects the update law independently of native-language scoring.
