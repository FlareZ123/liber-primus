# A 4×7 GP29 word-polygraph and an exact 16-phase singleton obstruction

**Agent 2, 22 November 2026. Evidence class:** reproducible original-cipher negative for one predeclared reversible machine, plus an exact bounded all-secret singleton capacity obstruction. **No unknown Liber Primus plaintext, author-authenticated cipher or key has been recovered.**

## Decision in brief

The 29-symbol Gematria Primus alphabet admits a natural geometric partition: F at index 0, with the other 28 symbols forming a 4×7 rectangle. Independently, original LP2 physical p15 prints a **red-started 4×4 Fibonacci-prime number spiral** with 16 recoverable values, and the historical 2014 Cicada stage prints an authenticated **7×7 square**. Literal mirrored artwork appears in original LP2 as well. These make a word-internal coordinate permutation with a 16-step word clock worth a single source-frozen check.

**The missing source operation is decisive.** Neither the original p15 spiral nor the earlier 7×7 source instructs a reader to multiply the two dimensions into a GP28 rectangle, reverse columns within printed words, reserve F as a coordinate escape, or add the original spiral modulo 29. The joint rule tested here is a bounded hypothesis, not an independently selected historical solution.

The model's direct inverse is nonlinguistic on the original opening and later untouched chapters. More generally, **no 16-phase secret alphabet, even if each phase's full symbol substitution is arbitrary, can explain the original one-rune word types when the plaintext's one-rune words are restricted to the ordinary English A/I (or even three types), unless the model permits a state change beyond the specified phase or changes printed word boundaries.** Page-specific phase resets are not excluded by this argument.

## Complete reversible hypothesis

Source printed p15 spiral, starting at the original red 3299, clockwise:

`3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516`.

Let `K[w]` be this list modulo 29 at the zero-based complete-word position within the physical page *where that word begins*, repeating after 16 words. The source is parsed into **2,896 complete words**, retaining 32 actual continued page-crossing words intact. The chosen 4×7 rectangle represents every nonzero GP rune `x=1+7r+c` with `0<=r<4`, `0<=c<7`. In each original complete printed word:

1. Break at literal GP0 F into maximal consecutive nonzero runs. Preserve those F sites inside the reversible coordinate layer.
2. For each nonzero run, preserve each row coordinate `r` and **reverse the sequence of column coordinates** `c`. This is its own inverse, including all singleton and two-rune runs.
3. Add `K[w]` modulo 29 to all transformed values, including F0, to obtain ciphertext. A new physical page resets only at the start of its first *complete* word.

The decryption subtracts `K[w]`, then reverses columns again. Every rune has exactly one inverse and the original word cuts are preserved. Unlike an independently keyed per-word substitution, the mechanism fixes all bytes and choices without fitting the original ciphertext. It preserves a speculative literal F exception within the coordinate operation. The key addition is applied to every GP symbol to keep the entire scheme reversible without inventing a second side channel.

The [CommonJS SFT](../sims/lp2_2258_rectangle4x7_spiral_word_polygraph_sft.cjs) reconstructs the literal 4×4 p15 cells, verifies the spiral, reads the canonical full original source and its eight genuine text sections, applies the inverse and **exactly re-encrypts all 12,956 original runes**. It reconstructs all 95 known p57 plaintext runes and the 20 printed words from the independently solved source, tests all 29² possible two-rune coordinate words, and inverts 2,896 complete source-native Gibran and Emerson word plants. A one-phase wrong key alters 10,983/11,066 and 12,069/12,181 plant runes, respectively. These checks establish implementation correctness, not original key identification.

## Original results, compared to true language

| Frozen text | GP runes | Within-word same-rune pairs | Rune index of coincidence |
| --- | ---: | ---: | ---: |
| Untouched original p0–55 | 12,956 | 63 / 10,060 | about 0.0345 |
| Original after source-frozen 4×7 inverse | 12,956 | **208 / 10,060** | **0.034503874** |
| Original p0–p2 inverse | 729 | 9 / 571 | **0.034135275** |
| Untouched later p16–p21 inverse | 1,615 | 22 / 1,242 | **0.034493077** |
| Native Gibran plant before encryption | 11,066 | 256 / 8,170 | **0.060500865** |
| Same Gibran plant after encryption | 11,066 | 263 / 8,170 | **0.035120992** |
| Native Emerson plant before encryption | 12,181 | 230 / 9,285 | **0.062051455** |
| Same Emerson plant after encryption | 12,181 | 255 / 9,285 | **0.035024465** |

The original inverse's first 26 whole words begin with the GP transliterations `EAMYPIAEUU YCDFP PTNGC EODC LIANG PTRNGEANTPISF...`. Neither the first 729 original runes nor the sealed 1,615 later original runes become coherent English under the fixed rule. The original language-like IoC does not return, while identical plant decoding restores the full source-language IoC.

Importantly, this reversible coordinate operation is **not a natural explanation of the original strong same-rune deficit**: native GP plants encoded with this exact cipher still show 263 and 255 internal equalities. The original contains only 63 over more positions. The growth to 208 after decoding simply shows that the column reversal changes within-word adjacency; it cannot be read as proof of the intended cipher.

## All-secret short-word theorem

A broader consequence applies independently of the particular 4×7 row and column layout.

Take any word-preserving polygraphic encoder whose transformation on a **one-rune word** is a fixed, deterministic function of that rune and a visible 16-phase clock. Permit an *arbitrary secret* lookup/substitution for every phase, unknown starting phase, arbitrary source-derived alphabet order, and any invertible polygraph for words of length two or more. At a given phase, a source plaintext alphabet containing at most `q` different singleton rune types can produce **no more than `q` different one-rune ciphertext values**. The proof is cardinality under any function. It does not depend on the cipher key.

The unmodified original has 83 complete one-rune words occupying **28 distinct GP29 glyphs**. Their same-phase diversity is:

| Clock and reset | Phase classes with more than 2 distinct singleton glyphs | With more than 3 | Maximum different glyphs in one phase |
| --- | ---: | ---: | ---: |
| Global complete-word index modulo 16 | **14** | **10** | **7** |
| Global rune-start index modulo 16 | **13** | **12** | **9** |
| Complete-word index modulo 16, resetting at 8 illustrated text sections | **2** | **1** | **4** |
| Rune-start index modulo 16, resetting at 8 sections | **2** | **1** | **4** |
| Word index modulo 16, resetting at each printed physical page | **0** | **0** | **2** |
| Rune-start index modulo 16, resetting at each printed physical page | **0** | **0** | **2** |

For example, original complete-word phase 3 contains **seven distinct singleton output glyphs**, `I,G,W,D,J,T,OE`. Even a hypothetical three-type plaintext singleton register cannot yield these seven outputs from one fixed phase. At section-relative word phase `section 7, phase 7`, there are four distinct output singleton glyphs `OE,Y,M,NG`. Adding an independently unknown alphabet, or changing the source word's longer internal mixing, cannot change these direct cardinality contradictions.

The English singleton premise reflects the authors' authenticated English prose, in which the ordinary independent one-letter words are A and I; allowing a third type grants one source-register escape. It is **not** a theorem that unknown LP2 uses modern English, or that the printed spaces necessarily match plaintext word spaces. This exact exclusion applies to deterministic phase-only state at the singleton and preserved word segmentation. It leaves **per-page resets, ciphertext/plaintext-driven state changes, per-word nonces, non-English/code registers, and resegmentation** open. It does not eliminate all 16-phase polygraphic ciphers.

## Research fork

Retire the fixed source-composed 4×7 coordinate-reversal plus p15 printed-spiral word-key inverse. The script validates the inversion and reproduces the key-independent short-word constraint. The remaining architecturally meaningful choice is a **source-visible state that varies among distinct singleton words sharing the same global or section-relative 16-phase**, or an independently selected changed segmentation. Page-reset phase classes satisfy the short-word necessary condition but still fail the exact frozen source-key original inverse. A new candidate should first identify that state or a typed key from the original image/historical source, and then predict contiguous unread plaintext; retuning a rectangular alphabet or cycling another 16-key table cannot rescue this particular fixed program.

**Reproducibility:** [single-run Node22 source test](../sims/lp2_2258_rectangle4x7_spiral_word_polygraph_sft.cjs), [successful GitHub Actions run 45021914545](https://github.com/FlareZ123/liber-primus/actions/runs/45021914545), original images `resources/liber-primus/32.jpg` and `resources/liber-primus/19.jpg`, authenticated earlier square `resources/cicada2014-openpuff-magic-squares.txt`, and original corpus `resources/liber-primus/lp2-corpus.json`.
