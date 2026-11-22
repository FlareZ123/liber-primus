# Original 256-byte numeric grid and adjacent 512-rune rubric: bounded alignment and direct-map test

**22 November 2026, Agent1, exploratory original-input solve-path lead.** The 2014 manuscript places a visually explicit **32×8 = 256-element radix-60 numerical table** on pp49–51 immediately before a vine-bordered runic continuation. This independently suggests investigating a 256-byte keyed operation or an 8-bit-to-rune-pair encoding rather than searching every unknown ciphertext for guessed 256 offsets.

Two **source-visible major red thirteen-dot chapter marks** bracket that next runic continuation: authentic source event **#171** at global rune offset **12114** (end physical p49) and event **#177** at offset **12648** (end physical p53). The intervening interval is therefore **534 GP29 runes**, including all rune text on physical p51 and p52 and through physical p53. The first **five original printed words on p51 have lengths 3, 6, 5, 5, 3**, summing to exactly **22** GP29 runes. Removing this whole-word prefix from the 534-rune rubric interval leaves the original contiguous **512-rune interval [12136,12648)**. Thus this physically adjacent material admits a source-word-respecting **256 input bytes ↔ 256 consecutive pairs of GP29 runes** correspondence.

**Caution about selection:** The first five words do **not** end at a specially colored rubric or punctuation delimiter. Selecting them as a 22-rune header is currently motivated by matching the nearby 256×2 length, so it is a **hypothesis** rather than authenticated creator intent. The original p51 numeric table and prose visibly coexist on the page; there is no explicit pairing instruction. The possibility of a 2:1 relationship is more source-local than a whole-manuscript post-hoc 256-rune search, but remains unproven.

## Exact original pairing test and discrimination

A direct pairwise map would represent each table byte with a **fixed ordered pair of GP29 symbols**, perhaps with one global keyed substitution. It has a powerful **key-independent** necessary condition: whenever the table byte repeats, the assigned two-rune pair must also repeat, irrespective of unknown 256-to-841 codebook labels. To avoid confusing printed uppercase I/lowercase l, the test **excludes all ten known visually ambiguous grid cells** [2,25,45,50,90,165,175,182,199,246] rather than treating font-disambiguation as a candidate author-selected key. The remaining **246 physically unambiguous source bytes** exhibit **90 repeated-byte instances** with respect to their first occurrence. For the corresponding adjacent rune pairs:

| Numeral traversal | Rune-pair direction | Repeated bytes whose corresponding pair agrees (of 90) | Pairs whose unsigned base29 rank scaled to 0–255 matches the byte |
| --- | --- | ---: | ---: |
| Original row-major | Forward | **0** | 0 |
| Original row-major | Reverse | **0** | 3 |
| Original column-major | Forward | **0** | 2 |
| Original column-major | Reverse | **0** | 3 |

**Result:** For original [12136,12648), **a deterministic stateless table-byte to two-rune substitution is impossible**, under all four physically natural read orders. One contradiction suffices; all 90 unambiguous repeat instances fail. The simplest arithmetic mapping of rune pair a,b to byte by integer floor((29a+b)*256/841) also yields only 0–3 literal byte agreements, consistent with no direct pairing.

A **stateful/keyed encoding, variable two-rune codebook with multiple outputs per byte, 256-byte table as keystream, or different independently selected source alignment** is outside this exclusion. No source-selected key, plaintext or deep-web destination has been obtained. Do not brute-force global offsets, arbitrary substitutions or permutations to rescue the length coincidence. A decisive successor needs an *independently visible original instruction* selecting the first 22 runes as a header, two-symbol pairing, or stateful byte-to-pair transformation. Otherwise retire the direct-pair branch.

**Reproducibility:** [Read-only single-file original-source Node.js test](../sims/lp2_grid256_adjacent_rune512_source_sft.cjs) asserts all 256 table cells, both exact large red mark positions, first five original word lengths, all 512 physical body runes, all ten ambiguous source cell exclusions, and all four exact traversal outcomes. Executed successfully against the current source files and published to GitHub. The original JPEG was inspected without modification.
