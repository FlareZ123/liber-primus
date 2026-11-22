# LP2 bookend 81²/80²: source-known p15 spiral does not yield original GP prose

**Agent47, 22 November 2026. Status: bounded original-cipher negative and operation-selector decision, no unknown LP2 plaintext.** Single-file original-input reproducer: [p15 spiral SFT](../sims/lp2_bookend_p15_spiral_position_only_original_sft.cjs). This complements [the full arbitrary-global-alphabet A→B histogram obstruction](lp2-bookend-all-global-palette-transposition-no-go.md); it asks the distinct question whether either bookend is a *transposed plaintext*.

## Human-accessible original clue and independent alternatives

The unique two-word source ending `ᛞᛄᚢ ᛒᛖᛁ` occurs at global ciphertext rune offsets 6555–6560 and 12950–12955. Thus the prefix ends at 6561=81² and the 6395-rune suffix is five cells short of 80². The prefix cut is an **ordinary printed word boundary in physical p27**, not a visible square, red separator or chapter boundary. Two materially different completions of the suffix use actual source objects:

1. Five *nonrunic*, red Arabic paragraph ordinals 1–5 on physical pp36–38, represented as unknown cells at hypothesized 80×80 row-major offsets `[2244,2384,2476,2575,2672]`. The 6395 existing GP29 runes remain intact.
2. Five *actual printed runes* in the following solved physical p56 red heading, GP29 ciphertext `[25,11,22,15,4]`, appended to p55. These lie **after** a strong red page transition, and solved p56 uses a different, independently established prime-totient encryption rule.

Both exactly complete 6400 square cells; neither is selected by the shared six-rune bookend, and they require incompatible interpretations of the missing five cells. The 2014 authenticated Stage10 source demands **5×5, 7×7, 5×5 numerical magic-square submissions**; it gives no movement over an 81×81 or 80×80 rune array, no rule for an L-shaped removal of 161 cells, and no registration rule for either completion ([preserved form and instructions](2014-stage10-squares-cgi-source-boundary.md)).

**One genuine source-visible candidate movement does exist:** physical p15 prints a 4×4 numerical spiral whose red 3299 is at row2,column2 and whose subsequent numbers go right, down, left, etc. [The solved p15 numerical spiral](../results/lp2-p15-fibonacci-prime-spiral.md) fixes the 16-cell coordinate sequence. Hypothetically extending that same central-origin clockwise-out movement to size 81 (unique center) and size 80 (the top-left of four centers, as on p15's 4×4) is a concrete, 2014-executable *position-only* candidate. This transfer is **not historically instructed**; it serves to test the only original LP2 page explicitly teaching a spiral.

## Original-input direct decoding

With the p15 spiral orientation frozen, read the complete 6561-source-rune A grid and each B completion by central-origin clockwise-out traversal, skipping the five nonrune ordinal holes in alternative 1. The table reports entire original transposed outputs. No glyph value is changed or chosen after inspection.

| Source register | Runes read | Top 12 GP29 classes | GP29 IoC | Adjacent identical rune pairs | Max IoC among disjoint initial 200-rune blocks |
|---|---:|---:|---:|---:|---:|
| A, source-original prefix81² | 6561 | 2908 (44.32%) | .03452278 | 129 | .037538 |
| B, ordinals as five holes | 6395 | 2797 (43.74%) | .03445157 | 128 | .037488 |
| B, p56 heading as last five runes | 6400 | 2800 (43.75%) | .03445377 | 121 | .036684 |

The original (unpermuted) halves contain 41 and45 adjacent identical pairs respectively; spiral traversal changes adjacency but cannot change global symbol frequencies. The p15-spiral outputs' first 200 runes contain no recognizable native GP English passage. The script also verifies all 16 printed p15 traversal coordinates.

**Independent source-native comparison:** a frozen Gibran GP29 literary control encoded with the corpus transliteration convention has 315 nonoverlapping length-200 segments; their minimum IoC is **.05246231**. Two native 6561/6395-rune literary windows have top-12 counts **5072/6561 (77.31%)** and **4991/6395 (78.05%)**, respectively. Every nonoverlapping 200-rune window of the three original spiral readouts is below .038, far below every sampled native control. Synthetic source-native plants placed by exactly the proposed spiral encoder recover their complete original text byte-for-byte after the decoder, including the five preserved holes. This tests code correctness, not author key identity.

## General gate and next causal decision

**Any position-only permutation, including any unknown path through either square, preserves the exact 29-class counts and IoC**: A has (2908, .03452278) and 6395-rune B has (2797, .03445157) regardless of direction, starting cell, reflection, global square traversal or deletion-free reordering. Accordingly no such movement alone can produce ordinary GP29 prose with the native controls' strong monogram concentration. This is a *source-native language obstruction*, not a mathematical impossibility for intentionally uniform-frequency plaintext, a second value-changing cipher, an unknown encoding language, or a locally selected 200-rune segment. The p15 spiral is only one tested orientation, and the two squares may encode independent unknown texts; the separate all-global-alphabet A→B count theorem is about a different hypothesis.

No original instruction chooses square completion, movement, starting cell or correspondence between A and B. The precise missing selector is a **first-party page/stage directive telling solvers to lay out these particular 81²/80² registers and to use a specific path or value-changing cipher afterward**. The five historical red numerals alone do not do so. Without that input, another search over rotations, spirals, 81-to-80 deletions or English-optimized paths would be fitted geometry rather than a causal approach to plaintext. Reopen only upon new first-party source constraint that fixes both the geometry and an independently testable output operation.
