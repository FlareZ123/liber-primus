# P40 columnar-layer order constraint from exact adjacent-repeat counts

**Agent19, 12 November 2026. Exact original-input structure, conditional cipher-layer inference.** This identifies a useful order constraint for future source-selected cipher architectures; it does **not** recover unknown Liber Primus plaintext, authenticate an eight-column transposition, or establish a repeat-avoidance encoder.

## Source-visible premise and competing orders

Physical LP2 p40 (original `57.jpg`) begins with eight red GP runes, indices `[0,9,19,26,6,23,25,8]`, which uniquely sort to **[0,4,7,1,2,5,6,3]**. The rest of the original p40–53 section is exactly **3,000 runes**, divisible into **375 rows × 8 columns** without padding. That same section prints the source 32×8 numerical table. Thus a historically familiar keyed columnar step is worth examining, though no Cicada source says it was actually used for LP2. See [literal combined inverse](lp2-p40-red8-grid32-columnar-inverse.md) and [all-secret static key exclusion](lp2-p40-grid256-allsecret-phase-equality.md).

The complete unknown LP2 corpus exhibits a pronounced shortage of adjacent equal printed runes. This allows an exact order discriminator:

- **Constrained coding then final columnar:** if a prior stream is forced to avoid repeating the previous rune, the ordinary seven/eight-column operation mixes nonneighboring symbols in the final printed order; in general the repeat avoidance disappears at lag one.
- **Columnar then final constrained coding:** if a position-dependent predecessor-exclusion/whitening step is last, the printed order retains its adjacent-repeat suppression, while reversing the earlier transposition directly on still-whitened text need not preserve that property.

Both are hypotheses. The actual original contains 18 nonzero repeated pairs, so a literal no-repeat codec needs a source-selected exception or escape channel; treating those events as arbitrary discarded positions is not justified.

## Exact original-cipher results, no scoring or key search

Retain the first eight red runes as heading. The following unmodified 3,000 original ciphertext indices have:

| Source/register | Equal pairs at lag 1 | Equal pairs at key width | Other observable lag |
| --- | ---: | ---: | ---: |
| Original printed 3,000 runes | **18 / 2,999** | lag 8: **88 / 2,992** | lag 7: **99 / 2,993** |
| Eight-column classical inverse keyed by all red8 | **101 / 2,999** | lag 8: **18 / 2,992** | Entire source exactly re-encodes |
| Seven-column inverse keyed by the seven non-enlarged red runes | **109 / 2,999** | lag 7: **18 / 2,993** | Entire source exactly re-encodes |

The seven-column control takes the physically enlarged initial F as a separate dropcap; that rule is *not* authenticated. Its independent complete-word grammar test also fails in [the seven-word test](lp2-p40-dropcap-seven-word-columnar-gate.md).

Under the matched approximately uniform GP29 symbol assumption, ordinary lag-one equality would be about **2,999/29 = 103.414**, with binomial standard deviation around **9.99**. The two decoded source counts, 101 and 109, lie in that ordinary range. The printed 18 is greatly suppressed. This comparison is descriptive: it is not a calibrated probability for a cipher discovered through searching over key sizes, and the source counts are the decisive exact measurements.

The movement of the **18** from printed lag one to recovered lag eight or lag seven is partly a combinatorial *identity of the columnar permutation*. In the eight-column case, adjacent values within one ciphertext column become eight positions apart in the row-major intermediate. For the original **3,000=8×375** layout, **all 18** printed equal adjacencies occur inside these original column blocks; their equality is exactly retained at lag eight after inversion. Under the alternative seven-column partition, all 18 likewise remain inside the seven column blocks and appear at lag seven.

## A reversible native-source order control

The [source-only CommonJS SFT](../sims/lp2_p40_columnar_antirepeat_order_sft.cjs) uses 3,000 GP28-valued symbols derived from actual Gibran GP-transliterated prose as a positive input register. It constructs an exact predecessor-exclusion coder: each GP28 digit is emitted as a GP29 rune **other than the preceding output rune**, with the initial GP29 state fixed at 0. Given that state, the map is invertible. The same red-eight-rune keyed columnar operation is separately invertible.

With **predecessor exclusion before final columnar**, the source-native positive produces **160** lag-one equal pairs in its printed ciphertext. With **final predecessor exclusion after the same columnar**, lag-one equal pairs are **0**. Both source-native paths recover all **3,000/3,000** input digits exactly under their correct inverse sequence. The source-original output has **18**, compatible in *direction* with a terminal constrained coder plus exceptions. The numerical Gibran plant is a power/control test for layer order, not evidence that Cicada chose either layer.

## Cryptanalytic implication and next needed clue

If the p40 red-eight-runic transposition is truly part of the cipher, **a typical final columnar permutation applied after an adjacency-suppressing layer is structurally disfavored**. A model with a terminal predecessor-dependent layer is consistent with the original order signature. This changes how one should compose a future independently selected eight-column transform: undo the terminal symbol-changing layer *before* undoing columnar. The earlier direct table-addition-then-columnar experiment's failure does not exclude this opposite order with a genuinely source-selected terminal rule.

The crucial missing inputs are **the actual rule producing rare identical adjacent runes, its escape semantics, and the original-source selector for its clock/key**. The available eight-column title and 32×8 grid do not fix those details, and native GP28 rank decoding on the complete original has already been tested in the repository as nonlinguistic. Avoid further free key/escape tuning on the strength of repeat counts alone. A useful next test would require an original instruction fixing the terminal state update, then complete forward/reverse reconstruction with an original held-out interval.

**Reproducer:** [`sims/lp2_p40_columnar_antirepeat_order_sft.cjs`](../sims/lp2_p40_columnar_antirepeat_order_sft.cjs), Node 22, reading the original canonical GP indices and independent Gibran text, with exact equality assertions and two reversible source-native positive controls.
