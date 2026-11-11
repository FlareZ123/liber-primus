# Five 10-dot macroepochs: source gate for the five-state hypothesis

**Decision, 11 November 2026 (Agent29):** the original four ten-dot glyphs define five *contiguous rune intervals*, but the fifth contains **no unsolved LP2 rune at all**. The five printed Arabic ordinals occur together inside the **second** interval. Their coincidence in count does not specify a five-epoch cipher, a one-to-one state assignment, or a reversible operation. A source-fixed candidate is absent, so Director Issue [#220](https://github.com/FlareZ123/liber-primus/issues/220) stops before a free-parameter key search. **No unknown plaintext, key, or destination has been recovered.**

## Original-input contract and exact segmentation

The original manuscript scans are numbered LP2 page +17. On physical p36 (`53.jpg`), p38 (`55.jpg`), p49 (`66.jpg`) and p56 (`73.jpg`), the same red, 10-dot, upright `###/.#./###/###` stencil stands after page-local rune offsets **99, 186, 66 and 45**, respectively. The four marks are verified original-image events in [the stencil audit](lp1-lp2-red-stencil-cross-release.md). Rune offsets count GP29 symbols only, excluding punctuation and non-rune numeric/hex material.

The `resources/liber-primus/lp2-corpus.json` physical-page order gives global breakpoints **8,805; 9,358; 12,114; 13,001** in the full 13,136-rune LP2 stream. These are unambiguous arithmetic consequences of those four original source positions, independent of the cipher:

| Proposed epoch | Global interval [start,end) | Total GP runes | Unsolved pp0–55 | Solved pp56–57 |
| --- | --- | ---: | ---: | ---: |
| 1 | [0, 8805) | 8,805 | 8,805 | 0 |
| 2 | [8805, 9358) | 553 | 553 | 0 |
| 3 | [9358, 12114) | 2,756 | 2,756 | 0 |
| 4 | [12114, 13001) | 887 | 842 | 45 |
| 5 | [13001, 13136) | **135** | **0** | **135** |

Thus at most **four** of the five proposed intervals contain unknown LP2 runes. Epoch four already crosses the unknown/solved-page boundary: it includes the first 45 runes of solved p56, which are encoded under that page's independently known consecutive-prime/totient mechanism. The fifth consists of the last 40 runes of p56 plus all 95 runes of solved p57. The p49 mark opens a **256-byte printed table** rather than a new rune section at that exact location. Treating its position as a rune key-clock change is an additional hypothesis.

## The original five numbered paragraphs

The same source corpus and the preserved line-oriented transcription `resources/external/Liber Primus 57.txt` locate all five red paragraph numerals *within epoch two*. The bracketed numerals are not GP ciphertext symbols. Consecutive source starts and lengths are:

| Printed number | Page:local rune start | Global start | GP runes until next number or closing 10-dot |
| --- | --- | ---: | ---: |
| 1 | p36:99 | 8,805 | 139 |
| 2 | p37:0 | 8,944 | 91 |
| 3 | p37:91 | 9,035 | 98 |
| 4 | p37:189 | 9,133 | 96 |
| 5 | p38:57 | 9,229 | 129 |

The five lengths total **553**, precisely the p36–p38 10-dot-bracketed interval. Printed labels 1 through 5 enumerate the five paragraphs of **one delimited block**. No corresponding 1–5 labels appear at the starts of the other proposed macroepochs. The cuneiform 1033/3301 artwork above these passages supplies two historical numeric values, without a printed five-state operation.

## Cipher-clock control and decision

The strongest available authenticated control is solved p56. Its exact original ciphertext and independently known 85-rune plaintext establish that the true consecutive-prime/totient state **passes unchanged** through the internal 10-dot boundary at p56:45. A reset at that mark reproduces only **48/85** runes, with **3/40** correct after the mark; advancing one key step gives **46/85**. See [the complete nine-mode original-cipher control](lp2-punctuation-solved-clock.md) and `sims/lp2_punctuation_solved_clock_sft.cjs`. This falsifies any claim that the repeated 10-dot symbol *universally* commands a key reset or advancement. Unknown pages could use a different cipher, but such a rule would need independent source support.

**Result:** the page layout supports **four structural boundaries**, with one short block containing five separately numbered paragraphs and one wholly solved terminal interval. It currently supports no rule assigning a number, key, byte codec, state update, reset or reversible transformation from those paragraphs to the five global intervals. Generic five-key Caesar/Vigenère fits, paragraph-order permutations, and postselected language scoring would choose the missing operation from the very ciphertext they purport to decode. There is no justified specific original-cipher inverse to test under #220.

**Reproduction:** `node sims/lp2_five_macroepoch_source_gate.cjs` reads the canonical page indices, ink annotations and numbered-rune transcription; asserts all four source offsets, five paragraph starts/lengths, five interval lengths and known/unknown partitions; then prints the exact frozen contract. It does not alter source files or attempt a speculative decipherment. The separate image-derived 10-dot identity proof and authentic p56 cipher-clock SFT are linked above.

**Reopen only upon a new discriminating original clue:** for example, a preserved Cicada instruction explicitly mapping paragraph 1–5 to the global intervals and independently specifying the state values, encoding and update law. The 5/5 count alone is insufficient. Other source-driven cipher mechanisms, including non-page-reset unknown-page algorithms, remain open.
