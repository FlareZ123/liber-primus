# LP2 opening 156-word map: 23-cycle-derived F-transparent key gate

**Decision, 17 November 2026:** Twelve finite, source-derived **direct GP29 additive key** interpretations of the p0–p2 23-cycle have no complete legal inverse on the original 716-rune black opening. They also have no legal complete inverse on the independently held-back 3,008 original runes in pp40–53. All twelve 95-rune p57-derived English plaintext plants admit legal complete inverses. **No new LP2 plaintext, key, mechanism, or destination was recovered.** The underlying 156-word pointer graph remains a provisional clue; this excludes only the exact direct-key consumers defined here.

## First-party operand and causal proposal

The original p0–p2 729-rune opening has **158 complete printed words**, the first two being the 13 red heading runes (8+5). Removing these gives 156 body words, a possible 13×12 word map. The 2016 signed Cicada instruction says that words are the map and numbers are the direction. Assign each body word its Gematria Primus **prime sum** `S`, with address `S mod 156`. The red heading sums 347 and 315 select zero-based addresses **35 and 3**. As in [Agent47's source graph](lp2-13x12-wordmap-23cycle-source-gate.md), the first seed runs through cells 36→56→113 into a unique 23-cycle; the second red seed is already on that cycle, beginning at cell 4. The 23-cycle contains the original words with sums 563/569, but its link to the p32 source and the 2016 563×569 signed graphic remains unselected.

This offers a small candidate key alphabet without searching arbitrary numbers: for each selected word, use either `K=S mod 29` (GP29 directly) or the Euclidean quotient `K=floor(S/156)`, interpreting the remainder as the address and the quotient as the key/direction value. Exactly three source-visible key clocks were frozen:

- **FirstFull:** start from the first red seed, emit its three transient words, then repeat its 23-cycle.
- **FirstCycle:** start at the first red seed's 23-cycle entry, omitting its transient.
- **SecondCycle:** start on the second red seed's cell 4, following the same cycle in that rotation.

For each clock and key representation, test both usual GP29 addition signs. These 3×2×2 = **12 specified candidates** do not include arbitrary key rotations, keyword additions, unknown tables, changes of reading order, or language-optimized parameters.

## Exact original-cipher condition

The known authentic p56 cipher permits **plaintext F (GP index 0) to pass through without advancing the key**. For a given source ciphertext rune `C`, key symbol `K`, and sign ±1, a consumed symbol must decode to `P=(C±K) mod 29` with `P != 0`, advancing the key cursor. If `C=0`, an alternative branch may instead decode to literal plaintext F and leave the cursor unchanged. Exhaustive dynamic programming retains **every legal cursor path** at every rune, so it neither assumes skip locations nor fits a plaintext language score.

The p0 opening receiver starts exactly after the source-correct red 13-rune title and its 13-dot marker, then consumes the **716 unchanged black/body ciphertext runes across physical pages 0–2**. A separate original test starts at physical p40 and follows pp40–53 through all **3,008** runes. Both use a reset key cursor at their start. The independent positive encrypts the source's 95 genuinely clear p57 runes under each candidate with the authentic F bypass, and asks the same DP to recover at least one legal complete path.

| Clock | Key | p0 first impossible rune, sign − / + | p40 first impossible rune, sign − / + |
| --- | --- | ---: | ---: |
| FirstFull | Sum mod29 | 21 / 25 | 16 / 94 |
| FirstFull | Quotient | 0 / 113 | 39 / 95 |
| FirstCycle | Sum mod29 | 27 / 162 | 102 / 88 |
| FirstCycle | Quotient | 7 / 59 | 64 / 83 |
| SecondCycle | Sum mod29 | 100 / 126 | 130 / 71 |
| SecondCycle | Quotient | 108 / 113 | 64 / 83 |

Offsets are **zero-based within each tested original stream**, and indicate the first rune after which no legal key-clock state remains. Every p57-derived positive is legally invertible under its corresponding key and sign (12/12). Thus the direct historically documented F-skip receiver fails mathematically on authentic inputs before subjective language scoring.

## Whole-cycle prime checksum: the 50:119:23 identity

The 23 word-prime sums in the original graph's first-heading cycle add exactly to **5,973**. Those 23 printed words contain **119** original runes, and Euclidean division gives:

`5,973 = 50 × 119 + 23`

The **quotient is 50**, the zero-based physical index of the numeric table's central page (p50 of pp49–51); it is also the literal **`50.jpg`** entry in the original 2014 Stage11 delivery index (`resources/cicada2014-onion7-index.html`), which displayed the 58 LP2 pages `0.jpg`–`57.jpg`. This makes the proposed page selector visible in the period source. **The independent source-counterargument is substantial**: the entire original 729-rune opening has average GP-prime rune weight **50.45404664**, so floor(mean)=50 even without selecting the 23-cycle. This quotient therefore has low discriminatory power by itself. The **remainder is 23**, exactly the cycle's **word count**, which is the more discriminating part of the proposed self-description. The two operands of this calculation are determined by the already specified original source graph and literal GP rune count, without optimizing the ciphertext plaintext. This is a possible explanation for why this particular cycle could lead a human to p50 independently of the previously hypothesized modulo256 table lookup. It is **an exploratory numerical crosslink, not a proved authorial page/address instruction**: neither the signed 2016 message nor an original image says to divide summed word-prime values by cycle rune length or interpret the quotient as a physical-page index. The quotient 50 is near the original rune prime-weight average, so it is not intrinsically surprising.

The 156-word functional graph also has a separate two-word cycle (original body cells26/49), with nine runes and GP-prime sum385, giving **385 = 42×9+7**: its remainder **7 differs from its cycle word count2**, and its quotient42 leads to ordinary unmarked physical p42, with no red rune or large-punctuation entry in the source ink inventory. Thus the self-descriptive remainder is not an algebraic identity, and the quotient-as-page heuristic by itself maps even this unrelated cycle to a real page without yielding a distinctive target. In the preexisting fixed-seed **1,000,000 page-stratified original-word permutations**, exactly 93 retain the red-seed shared23/563/569 feature gate; **4** of those have total 119 rune glyphs, **12** have GP-mean integer quotient50, and **none** has the additional cycle self-descriptive remainder `sumPrime mod runeCount = 23` (or the complete 50:119:23 triple). Those zero counts provide a **small, retrospective conditional diagnostic**, since the division and q/r wording were discovered after seeing the cycle. The 93 candidates are too few to estimate an extreme tail; these are not discovery-adjusted probabilities. For a broader same-seed baseline, the same 1,000,000 original-word shuffles yielded **56,536** first-seed cycles of any length with `sumPrime mod totalRunes = wordCount` (**5.6536%**); among **5,378** first-seed **23-word** cycles, **67** satisfied it (**1.2458%**), and among **651** first-seed cycles containing exactly **119 rune glyphs**, **4** satisfied it (**0.6144%**). The original 23/119 conjunction is rarer under this pre-fixed model, but graph-property search and post-hoc rule selection prevent assigning its nominal probability to creator intent.

The remaining causal decision is precise: **find a first-party source rule mapping a cycle's numerical quotient/remainder to p50 and an actual 256-cell table operation**, before trying arbitrary byte lookups, cipher phases, or readers. If that rule cannot be sourced, this congruence remains a compact original-number observation and adds no plaintext.

## Red-title numerals as an independent 32×8 table-shape cue

The original source's **two red heading words** have **8+5 runes** and GP-prime sums **347 and 315**, respectively, so their signed ordered difference is exactly **32**. Independently, the original pp49–51 numeric table has **32 rows × 8 columns**. Read **8** (first heading's glyph length) as the table's **eight columns**, and **32 = 2^5** (heading sum difference and second heading's glyph length) as its **32 rows**. This creates a compact, internally consistent *candidate* source path from the visible p0 title dimensions to the original p50 256-cell table. It also suggests why the already proposed 5+3-bit byte split is tempting, while **providing no authored compass orientation, bit ordering or navigation opcode**.

The numbers in the red heading are unchanged original GP prime sums; the 32×8 table dimensions are printed and historically visible. For a limited corpus baseline, **all 49,452 ordered length-eight/length-five word pairs** in the original 2,896 unknown words (156 eight-rune words ×317 five-rune words) contain **64** with prime-sum difference exactly **+32** (**0.129418%**). This is a source-vocabulary comparison, **not** a probability of the entire hypothesized puzzle construction: the title and table were examined jointly, multiple numerical relations can be tried, and length-eight words naturally match the table's column count after it is known.

**Causal limit:** The conjunction of p0 8+5 red word lengths, their sum-difference32, and the 32×8 visible numeric table supplies a more specific route hypothesis than a generic page number coincidence. It has yet to provide a unique reversible readout of a single original table cell, a key, or a plaintext passage. Keep this clue available for an independently selected **source action**, while retiring already-failed 119-rune direct pads and unsourced compass conventions.

## Second source-selected receiver: 119-rune loop versus red119 prefixes

The **23 original words** selected by this same unique cycle contain **exactly 119 rune glyphs** when concatenated in graph traversal order. This is a newly exposed cross-feature candidate: physical p3 and p39 each print an isolated red three-rune span beginning at original local **rune offset 119** (see [previous original red119 inventory](lp2-red119-p49-3340-crosslink-source-gate.md)). These are independently present source boundaries. The matching length is suggestive, but a red triad at 119 does not itself say that the preceding ciphertext is enciphered under the cycle words, or that the word-map route is author-intended.

A bounded *complete key* interpretation treats the 119 selected runes as a direct running key for the full 119-rune **pre-red-prefix** of both physical pages. The two red title seeds choose the two cycle rotations, with the 119 corresponding rune values interpreted either as GP29 ordinals or GP prime weights modulo29; both arithmetic signs are tested. The direct 119-rune key has **no repetition** within either targeted prefix. The authentic plaintext-F bypass dynamic program explores all F histories. This defines **eight source-fixed decoders** (two seeds × two values × two signs), without a fitted keyword, clock phase or cipher-language optimization.

| Cycle start / rune key value | p3 first impossible rune, − / + | p39 first impossible rune, − / + |
| --- | ---: | ---: |
| First / GP29 ordinal | 54 / 51 | 6 / 25 |
| First / GP prime mod29 | **legal (3 paths)** / 10 | 31 / 3 |
| Second / GP29 ordinal | 41 / 0 | 82 / 7 |
| Second / GP prime mod29 | 109 / 5 | 22 / 7 |

All first-impossible offsets are zero-based within the original 119-rune target. **All eight original p39 prefixes are impossible** under the tested exact F-transparent decoder. One p3 variant alone admits three complete mechanical paths, but its matched p39 original holdout is impossible. All eight independently encrypted **95-rune authentic p57 clear-GP controls** pass the same exact state machine. Under the alternative skip-free direct additive consumer, the decoded p3/p39 original 119-rune concentration lies in **IoC 0.03076–0.03960**, against authentic clear p57 **0.06271**, without coherent prose.

**Decision:** the newly noted 119-rune loop length and two original red119 boundaries preserve a possible source-to-source motif; the eight complete literal GP29 key consumers fail on their independent p39 holdout. The match neither recovers plaintext nor authenticates a broader map-transposition or state-dependent decoder. Preserve the simple bounded result; do not enlarge the key catalog or postselect an address/skip law. The additional F-transparent 119-rune assertions and synthetic positives are now in the **same source SFT**.

## Collision-retry receiver from the 119-rune key

A different original-cipher family was then tested so that the direct plaintext-F failure did not become a premature verdict about the **119-rune key** itself. The existing [source-native collision-skip decoder](../sims/lp2_liber_al_antirepeat_runningkey_sft.cjs) implements an explicit *hypothetical* anti-repeat emitter: `C=(P±K[j]) mod29`; if that ciphertext would equal the previous output, retry the same plaintext symbol with the next key symbol with stipulated conditional skip probability `q=0.81`. Its inverse admits 0–2 such skips per emitted rune and scores recovered GP29 words using an independently trained, smoothed native-English trigram model.

Use **only** the two 119-rune original cycle-word tapes (first-heading and second-heading rotations), GP ordinal or GP-prime-mod29 symbol values, and both arithmetic signs. This defines eight candidate key/sign cases against the complete, unchanged p3 and p39 pre-red119 prefixes, with key phase zero and no source-driven key search. The 119 key symbols are repeated to accommodate possible key-only collision retries; the original receiver never fits the starting offset. Both conventional/2014 documented transliteration options are implemented as separate language-model controls.

In a direct V8 execution using the **authored-alphabet** model and disjoint 119-rune heldout passages from Gibran's *The Prophet*, **all eight planted English texts were recovered exactly**, including their original key-collision skips. The eight planted scores were **+175.36 to +177.44** in the decoder's log-evidence units. Across the same eight source keys/signs, the original p3 score range was **−466.81 to −383.56** and p39 **−479.58 to −349.37**, with incoherent direct plaintext prefixes and at most seven inferred skips. The original outputs never approached a matched 119-rune genuine-English plant in this calibrated finite test. These comparisons are specific to the chosen model/training register; printed original and planted word lengths are not identical.

[Original-input single-file SFT](../sims/lp2_wordmap23_red119_collision_skip_original_sft.cjs) repeats all eight cases under **both** predefined native-GP spelling models, asserting each positive and reporting complete original outputs and scores. Its [Windows Node22 CI job](https://github.com/FlareZ123/liber-primus/actions/workflows/manual-node22-sft-runner.yml) was dispatched on 17 November; inspect the specific run before asserting all 16 original/native control cells passed.

**Decision:** this additional fixed 119-rune running-key hypothesis also fails to recover original plaintext under the explicitly modelled collision-retry transport. It does not reject the physical red119 coincidence, authorial 23-cycle hypothesis, unknown nonadditive cipher, or a collision mechanism materially different from the one tested. No secret key was fitted to source ciphertext.

## Independent check on the four-direction interpretation

All 156 opening body-word prime sums are below **624=4×156**, with maximum **618**. The quotients therefore happen to lie in `{0,1,2,3}`, which might tempt a four-way compass or base-four key interpretation. That bounded range alone is weak evidence: **326 of 2,741** possible 156-word windows through the untouched 2,896-word original unknown manuscript have all their prime sums below 624. In a separate length-conditioned comparison, the remaining manuscript words of the same lengths would predict **1.968** values ≥624 in a 156-word draw, with approximate independent zero-event probability **0.1063**. Neither comparison authenticates four-way directions; they are diagnostic baselines, and the unselected coordinate readout has not been found.

## Evidence and next decision

- **Executable original-input SFT:** [`sims/lp2_156word_cycle_twoheading_ftransparent_gate_sft.cjs`](../sims/lp2_156word_cycle_twoheading_ftransparent_gate_sft.cjs). It constructs the graph from the canonical `resources/lp2-transcription.txt` and `resources/liber-primus/lp2-corpus.json`, pins the two red seeds, enumerates every legal F-skip path, tests both original sources, independently generates all 12 native-GP plants, and asserts the complete failure-offset vector.
- **Native Windows Node22 run:** [manual workflow #44088313209](https://github.com/FlareZ123/liber-primus/actions/runs/44088313209) completed **SUCCESS** at 2026-11-17 13:42 UTC (Windows latest, Node22, source-test job #134056559056), executing the original **12-key/12-positive** source SFT at commit `84572e0`. The expanded 119-rune original p3/p39 gate with independent native GP29 plants also completed **SUCCESS** in separate [Windows Node22 run #44090424277](https://github.com/FlareZ123/liber-primus/actions/runs/44090424277) on commit `ac147bd3`. Both complete source gates are now natively verified; the distinct collision-retry model remains a separately dispatched verification.
- **Related p55 gate:** Agent6's [source-23-cycle p55 replay](../communications/broadcast/20261117T1257Z_agent6_wordmap23_parser_fix_and_original_replay.md) already showed that one separate p55 direct-key variant admits a nonprose inverse. **Do not repeat that p55 experiment.**

The failing premise is **turn the 23-cycle's original word sums or quotients into a direct historically familiar GP29 F-transparent additive key for other text**. The graph's existence, its two red-seed entry points, and the intriguing p32/2016 numerical links remain open to a genuinely sourced **different receiver**. No new key catalog, permutation hunt, or period/offset sweep is justified by this negative.
