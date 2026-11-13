# P40 eight-column layer order and attached-word-boundary constraints

**Agent19, 12–13 November 2026. Original-input structure, conditional layer-order inference and a word-boundary transport exclusion.** This records an exact adjacency migration through the source-keyed transposition and identifies **two distinct reversible layer orders consistent with the observed low repeat rate**. It does **not** recover unknown Liber Primus plaintext, authenticate an eight-column transposition, or establish a repeat-avoidance encoder.

## Source-visible premise and competing orders

Physical LP2 p40 (original `57.jpg`) begins with eight red GP runes, indices `[0,9,19,26,6,23,25,8]`, which uniquely sort to **[0,4,7,1,2,5,6,3]**. The rest of the original p40–53 section is exactly **3,000 runes**, divisible into **375 rows × 8 columns** without padding. That same section prints the source 32×8 numerical table. Thus a historically familiar keyed columnar step is worth examining, though no Cicada source says it was actually used for LP2. See [literal combined inverse](lp2-p40-red8-grid32-columnar-inverse.md) and [all-secret static key exclusion](lp2-p40-grid256-allsecret-phase-equality.md).

**Historical operator limitation (Agent 3, issue #700, 13 November 2026).** The documented 2014 Stage05 solved signed cipher used **14 columns**, followed by a manually reconstructed output-column order [2,8,9,1,12,13,11,4,5,7,3,0,6,10], with five rows; the contemporary [2014 walkthrough](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_3) explicitly strips its transmitted five-letter spacing. This establishes *column transposition* as historically used. It does **not** establish sorted GP29 rune headings as historical column keys, **eight** columns, eight independent state machines, or word punctuation transport. Physical LP2 p40 red8 and the 32×8 table remain a chapter-local possible clue, with no author-specified state initialization or escape semantics.

Under the most literal eight-column IV hypothesis, the red8 rune values [0,9,19,26,6,23,25,8] are assigned as previous output states to the eight 375-rune columns in visible red-key sorted order [0,4,7,1,2,5,6,3]. Original block starts are respectively A, EA, AE, D, IA, M, H, S; **none equals its corresponding heading rune**. But eight independently arbitrary GP29 starts avoid eight fixed IV symbols with probability (28/29)^8 = **0.7552318**, so this complete eight-of-eight compatibility is expected by chance. Original repeat counts by these blocks are [1,2,5,3,2,3,1,1], summing to the already known 18 and requiring exceptions inside **every** block under strict GP28 exclusion. Neither observation chooses the per-column state/escape rule. Do not use these eight start comparisons as a hidden key validation.

The complete unknown LP2 corpus exhibits a pronounced shortage of adjacent equal printed runes. This allows an exact order discriminator:

- **Book-continuous constrained coding then final columnar:** if a prior row-major stream is forced to avoid repeating the previous rune, the ordinary seven/eight-column operation mixes nonneighboring symbols in the final printed order; in general the repeat avoidance disappears at lag one.
- **Columnar then final constrained coding:** if a position-dependent predecessor-exclusion/whitening step is last, the printed order retains its adjacent-repeat suppression, while reversing the earlier transposition directly on still-whitened text need not preserve that property.
- **Eight column-local constrained coders then final columnar:** if each *column* is separately encoded under its own predecessor-avoiding state (a natural reading of an eight-column table), the final columnar output concatenates eight individually repeat-suppressed runs. Thus the same low printed lag-one count is expected even though columnar is applied last.

All three are hypotheses. The actual original contains 18 repeated pairs, so a literal no-repeat codec in either source-clock interpretation needs a source-selected exception or escape channel; treating those events as arbitrary discarded positions is not justified.

## Exact original-cipher results, no scoring or key search

Retain the first eight red runes as heading. The following unmodified 3,000 original ciphertext indices have:

| Source/register | Equal pairs at lag 1 | Equal pairs at key width | Other observable lag |
| --- | ---: | ---: | ---: |
| Original printed 3,000 runes | **18 / 2,999** | lag 8: **88 / 2,992** | lag 7: **99 / 2,993** |
| Eight-column classical inverse keyed by all red8 | **101 / 2,999** | lag 8: **18 / 2,992** | Entire source exactly re-encodes |
| Seven-column inverse keyed by the seven non-enlarged red runes | **109 / 2,999** | lag 7: **18 / 2,993** | Entire source exactly re-encodes |

The seven-column control takes the physically enlarged initial F as a separate dropcap; that rule is *not* authenticated. Its independent complete-word grammar test also fails in [the seven-word test](lp2-p40-dropcap-seven-word-columnar-gate.md).

Under the matched approximately uniform GP29 symbol assumption, ordinary lag-one equality would be about **2,999/29 = 103.414**, with binomial standard deviation around **9.99**. The two decoded source counts, 101 and 109, lie in that ordinary range. The printed 18 is greatly suppressed. This comparison is descriptive: it is not a calibrated probability for a cipher discovered through searching over key sizes, and the source counts are the decisive exact measurements.

The movement of the **18** from printed lag one to recovered lag eight or lag seven is a combinatorial *identity of the columnar permutation*, not independent evidence of a cipher layer. In the eight-column case, adjacent values within one ciphertext column become eight positions apart in the row-major intermediate. For the original **3,000=8×375** layout, **all 18** printed equal adjacencies occur inside these original column blocks; their equality is exactly retained at lag eight after inversion. Under the alternative seven-column partition, all 18 likewise remain inside the seven column blocks and appear at lag seven. None of the original 18 matches crosses a source-sized column-block boundary; given only seven such boundaries, this is an expected rather than discriminatory observation.

## Exhaustive red8 column-order equality null (13 November 2026)

The visible red8 heading can select the classical eight-column sort, but the recovered **101** adjacent matches do **not** distinguish that order from other permutations of the exact same original column blocks. Holding the eight 375-rune source blocks fixed, and comparing every permutation of the restored eight column identities with the same row-major reading rule, the complete original-input **8! = 40,320** order census gives:

| Adjacent-equality statistic on reconstructed 3,000 runes | Count |
| --- | ---: |
| Visible-heading order [0,1,2,3,4,5,6,7] after restoration | **101** |
| All-permutation minimum / 5th percentile / median / 95th percentile / maximum | 71 / 91 / 107 / 125 / 145 |
| All-permutation arithmetic mean / population SD | 107.678571 / 10.243652 |
| Permutations with count ≤101 | **11,424 / 40,320 = 28.33%** |
| Permutations with count ≥101 | **30,194 / 40,320 = 74.89%** |
| Permutations tied at 101 | 1,298 |

This is an **exact enumeration**, not sampled keys or tuned output statistics. Each candidate order merely changes which complete column follows which; it retains the same 3,000 original values. The seven within-row column transitions use the exact 8×8 equality matrix for corresponding row entries; the last-to-first transition uses the exact 8×8 matrix comparing successive rows. That yields 40,320 complete equality counts and requires no language model. The SFT asserts the source-red8 case, range and full count.

**Decision:** the restored 101 is unexceptional under this stringent same-block null. Both the observed increase toward the GP29 random baseline and the migration of printed short-lag equalities are expected after generic column rearrangement. The red title and the precise 375×8 body still supply a possible human-visible key; this null specifically removes the apparent *adjacent-repeat-count evidence* in favor of its particular sort or of a real columnar layer. Source-keyed columnar remains hypothetical, and the independent source-selected operation needed for plaintext is unchanged.

## Whole-body word-boundary transport: exhaustive all-key test (13 November 2026)

The original pp40–53 body contains **3,000 printed GP runes in 667 words**, of which only **13 are one-rune words**. The preceding eight red title runes constitute two words and are excluded. Original transcription punctuation is mapped to a word-final bit attached to the rune that precedes it, retaining printed line and page wraps as soft boundaries. These 3,008 rune positions align exactly against the canonical source, with **669** full-chapter word-final flags and **667** on the body.

**Specific testable architecture:** each printed word-final bit travels with its preceding rune through the same classical eight-column permutation as the glyph. Under the source-visible red8 key, decolumnar yields **668 words, 153 one-rune words, 121 words of length at least nine, and maximum word length23**. The original body has **667/13/42/14** respectively. The inverse perfectly re-encodes its complete original flags.

An **exhaustive 8! = 40,320-key census** of this punctuation transport has no ambiguity about cipher letters or key values. Each candidate rearranges the same eight blocks of 375 source word-ending flags. Every one-rune word is created by adjacent end-of-word bits (or an end bit at the very first rune). Complete 8×8 within-row and cross-row bit-pair matrices count these exactly.

| Original boundary transport | One-rune words |
| --- | ---: |
| Source printed word boundaries before inverse | **13** |
| Visible red-heading inverse | **153** |
| Lowest under any of the 40,320 column orders | **122** |
| 5th percentile / median / 95th percentile | 138 / 153 / 167 |
| Maximum across all orders | 180 |
| Orders with counts at most visible-key 153 | 21,799 / 40,320 |

**External GP-native calibration:** all **147,071** overlapping windows of 668 complete words from previously pinned Shakespeare (54,740 windows), Gibran (15,066), and Emerson (77,265) controls, encoded in the same GP digraph conventions, have respective maximum one-rune-word counts **72, 43, and 50**. The same maxima hold for all 667-word windows. Therefore even the most favourable eight-column key demands at least **122 / 668 (18.26%)** one-rune words, far beyond every finite source-native control. A separate genuine Gibran 3,000-rune word-boundary plant round-trips through the same exact source-keyed bit transport, preventing a false negative due to incorrect permutation geometry.

**Scope and consequence:** This is a key-independent obstruction to **the specific whole-body eight-column architecture that transports word-final flags along with their preceding runes** while yielding ordinary GP-English plaintext words. It does not exclude textbook columnar transposition that strips and later reinserts unrelated spaces, a changed punctuation alphabet, a per-word rearrangement, or a different plaintext-language register. The original ink does not instruct the solver to carry punctuation bits, so no real cipher identity, unknown plaintext or key has been recovered. Any new claim of whole-body columnar must specify its punctuation/word-boundary contract independently rather than silently assume that printed words remain natural after the inverse.

## A reversible native-source order control

The [source-only CommonJS SFT](../sims/lp2_p40_columnar_antirepeat_order_sft.cjs) uses 3,000 GP28-valued symbols derived from actual Gibran GP-transliterated prose as a positive input register. It constructs an exact predecessor-exclusion coder: each GP28 digit is emitted as a GP29 rune **other than the preceding output rune**, with the initial GP29 state fixed at 0. Given that state, the map is invertible. The same red-eight-rune keyed columnar operation is separately invertible.

With **book-continuous predecessor exclusion before final columnar**, the source-native positive produces **160** lag-one equal pairs in its printed ciphertext. With **final predecessor exclusion after the same columnar**, lag-one equal pairs are **0**. Crucially, a third complete plant first splits the same source runes into **eight columns**, uses the actual eight red heading rune values as independent fixed predecessor IVs, applies identical predecessor exclusion separately to each column and only then performs the original classical column readout. That produces **0** printed lag-one equal pairs too, including all seven block joins, and exactly recovers all **3,000 source digits** under the corresponding inverse. All three planted coders reconstruct their source under the correct reverse steps. The source-original output has **18**, compatible with either the terminal or column-local suppressor once real exception semantics exist; this original observation does not determine the order. The numerical Gibran plants are architecture counterexamples, not evidence that Cicada chose either.

## Cryptanalytic implication and next needed clue

If the p40 red-eight-runic transposition is truly part of the cipher, **a book-continuous row-major anti-repeat layer applied before final columnar is structurally disfavored**. However, a *column-local* repeat suppression before concatenation is just as compatible with the printed pattern as a final source-order suppressor. Thus these original equality counts do **not** determine whether to reverse columnar first or the symbol-changing layer first. The earlier direct table-addition-then-columnar experiment's failure does not address either new stateful case.

The crucial missing inputs are **the actual rule producing rare identical adjacent runes, its escape semantics, and the original-source selector for its clock/key**. The available eight-column title and 32×8 grid do not fix whether its eight numerical columns are independent state channels or one continuous key schedule; native GP28 rank decoding on the complete original has already been tested in the repository as nonlinguistic. Avoid further free key/escape tuning on the strength of repeat counts alone. A useful next test would require an original instruction fixing a per-column reset versus a book-continuous state update, then a complete forward/reverse reconstruction with an original held-out interval.

**Reproducer:** [`sims/lp2_p40_columnar_antirepeat_order_sft.cjs`](../sims/lp2_p40_columnar_antirepeat_order_sft.cjs), Node 22, reading the original canonical GP indices and independent Gibran text, with exact equality assertions and two reversible source-native positive controls.
