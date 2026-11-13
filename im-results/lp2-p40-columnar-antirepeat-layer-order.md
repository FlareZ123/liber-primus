# P40 columnar-layer order constraint from exact adjacent-repeat counts

**Agent19, 12 November 2026. Exact original-input structure, conditional cipher-layer inference.** This records an exact adjacency migration through the source-keyed transposition and identifies **two distinct reversible layer orders consistent with the observed low repeat rate**. It does **not** recover unknown Liber Primus plaintext, authenticate an eight-column transposition, or establish a repeat-avoidance encoder.

## Source-visible premise and competing orders

Physical LP2 p40 (original `57.jpg`) begins with eight red GP runes, indices `[0,9,19,26,6,23,25,8]`, which uniquely sort to **[0,4,7,1,2,5,6,3]**. The rest of the original p40–53 section is exactly **3,000 runes**, divisible into **375 rows × 8 columns** without padding. That same section prints the source 32×8 numerical table. Thus a historically familiar keyed columnar step is worth examining, though no Cicada source says it was actually used for LP2. See [literal combined inverse](lp2-p40-red8-grid32-columnar-inverse.md) and [all-secret static key exclusion](lp2-p40-grid256-allsecret-phase-equality.md).

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

## A reversible native-source order control

The [source-only CommonJS SFT](../sims/lp2_p40_columnar_antirepeat_order_sft.cjs) uses 3,000 GP28-valued symbols derived from actual Gibran GP-transliterated prose as a positive input register. It constructs an exact predecessor-exclusion coder: each GP28 digit is emitted as a GP29 rune **other than the preceding output rune**, with the initial GP29 state fixed at 0. Given that state, the map is invertible. The same red-eight-rune keyed columnar operation is separately invertible.

With **book-continuous predecessor exclusion before final columnar**, the source-native positive produces **160** lag-one equal pairs in its printed ciphertext. With **final predecessor exclusion after the same columnar**, lag-one equal pairs are **0**. Crucially, a third complete plant first splits the same source runes into **eight columns**, uses the actual eight red heading rune values as independent fixed predecessor IVs, applies identical predecessor exclusion separately to each column and only then performs the original classical column readout. That produces **0** printed lag-one equal pairs too, including all seven block joins, and exactly recovers all **3,000 source digits** under the corresponding inverse. All three planted coders reconstruct their source under the correct reverse steps. The source-original output has **18**, compatible with either the terminal or column-local suppressor once real exception semantics exist; this original observation does not determine the order. The numerical Gibran plants are architecture counterexamples, not evidence that Cicada chose either.

## Cryptanalytic implication and next needed clue

If the p40 red-eight-runic transposition is truly part of the cipher, **a book-continuous row-major anti-repeat layer applied before final columnar is structurally disfavored**. However, a *column-local* repeat suppression before concatenation is just as compatible with the printed pattern as a final source-order suppressor. Thus these original equality counts do **not** determine whether to reverse columnar first or the symbol-changing layer first. The earlier direct table-addition-then-columnar experiment's failure does not address either new stateful case.

The crucial missing inputs are **the actual rule producing rare identical adjacent runes, its escape semantics, and the original-source selector for its clock/key**. The available eight-column title and 32×8 grid do not fix whether its eight numerical columns are independent state channels or one continuous key schedule; native GP28 rank decoding on the complete original has already been tested in the repository as nonlinguistic. Avoid further free key/escape tuning on the strength of repeat counts alone. A useful next test would require an original instruction fixing a per-column reset versus a book-continuous state update, then a complete forward/reverse reconstruction with an original held-out interval.

**Reproducer:** [`sims/lp2_p40_columnar_antirepeat_order_sft.cjs`](../sims/lp2_p40_columnar_antirepeat_order_sft.cjs), Node 22, reading the original canonical GP indices and independent Gibran text, with exact equality assertions and two reversible source-native positive controls.
