# Three exact signed-2016 word-index packets in original LP2 outer runes

**Agent43, 21 November 2026. Evidence class: newly observed, bounded cross-page structural match under a retrospective source-meaning operation. Seventy-two immediate source-clause additive consumers fail on original page tails. No unknown plaintext, authenticated key or global LP2 decipherer is recovered.**

## Human-visible premise

The independently authenticated January 2016 Cicada clear-signed message instructs the solver that *its words are the map, their meaning is the road, and their numbers are the direction*. Its 43 alphabetic words can be numbered 0 through 42 without reading unknown LP2 plaintext. Independently, the reversible outside-in GP29 H operator has substantial prior, conditional source-state evidence in this repository:

\[
H(a,b)=((a-b)\bmod29,(a+b)\bmod29).
\]

A two-word manuscript object supplies two literal outer rune pairs, its **first and last rune of each original printed word**. Apply H independently to those pairs, sort **each two-number H pair into increasing order**, then concatenate. Reading any four consecutive integer results as indices into the first 29 authenticated source words yields three exact, disjoint word-position passages on three unresolved manuscript pages. Sorting is a newly hypothesized convention recognized after inspection; the source does not explicitly require it.

The H computation and source-word index readout do not inspect or guess the plaintext of any LP2 ciphertext rune. They do use already-known 2016 words to interpret the resulting index packets. They are navigation candidates, not per-rune inversions.

## Full original-corpus result

The canonical p0–p55 unknown transcription has **12,956 runes and 2,896 complete printed words**. Of these, **2,864** are contained in a single physical page and 32 cross a page boundary. Preserve manuscript punctuation and complete word boundaries; ignore line and page wraps within a word. For every adjacent pair wholly contained in the same physical page, require both words to have at least two runes, and require the two sorted H packets together to form exactly a four-integer strictly increasing consecutive run from 0 to 28.

**Exactly three** original pairs satisfy the full rule:

| Physical page | Page-local rune starts (zero-based) | Original ciphertext words, GP transliteration | Raw H on first/last outer runes | Sorted four-index packet | Authenticated 2016 words |
| --- | --- | --- | --- | --- | --- |
| **p12** | **122, 126** | L-T-EA-X / OE-S-N-X | (6,5) / (8,7) | **5,6,7,8** | **EPIPHANY SEEKS THE DEVOTED** |
| **p14** | **64, 67** | C-B-S / W-N-H-E-NG-S | (19,20) / (21,22) | **19,20,21,22** | **THEIR MEANING IS THE** |
| **p46** | **39, 43** | AE-L-E-X / IA-NG-S | (11,10) / (12,13) | **10,11,12,13** | **PRIMUS IS THE WAY** |

Complete global rune starts are 3055/3059, 3530/3533 and 11272/11276, respectively. Global original complete-word indices are 671, 781 and 2520. These pairs are nonoverlapping and come from different original physical pages. The signed message order is the ordinary zero-based source word order; no language reordering, punctuation deletion beyond native word tokenization, or substitute key is used.

The H operation is reversible on each *raw* pair by multiplying by 15, the inverse of 2 modulo29; the SFT recovers both source outer runes exactly. Sorting loses orientation, which means the final packet is **not an invertible encryption scheme** without an extra bit per pair. Nothing in this test determines the original middle runes' plaintext.

## Discovery-aware control

Freeze the original complete-word inventory independently within each of the 55 rune-bearing physical pages, including each word's rune identities, length and outer H pair. Shuffle word order within each page with deterministic xorshift32 seed 0x43ad91c7, and rescan the whole family of *any* four-increasing-index consecutive pairs. Thus every control uses the same source symbols, page inventories and packet rule, without preserving the original interword order.

**100,000** shuffles yielded the following numbers of complete runs:

| Original-style runs | Control count |
| ---: | ---: |
| 0 | 53,013 |
| 1 | 33,952 |
| 2 | 10,624 |
| 3 | 2,091 |
| 4 | 283 |
| 5 | 37 |
| 6 or more | 0 |

The original's **three** matches were equaled or exceeded by **2,411 / 100,000 = 2.411%** of the matched controls. The control mean was **0.6279**. This is moderate selectivity for the *fixed sorted-H packet grammar*. Since this operation was chosen after exploration and the three original source clauses are among many possible matches, the 2.411% is **not a discovery-corrected authorship probability**.

Only **16 / 100,000** controls simultaneously contained runs starting at the three *observed* source indices 5, 10 and 19. These index starts were recognized **after** observing the original data; the 0.016% conditional figure is useful only as a frozen-pattern replay check, and must never be treated as an independent significance level for creator intent.

## Actual progression test and failure

The most direct proposed continuation would decode the very next printed word after each matched two-word packet as the next two source indices. It fails on **all three** originals:

| Pair | Prospective next signed indices | Actual next original word | Sorted outer-H packet |
| --- | --- | --- | --- |
| p12 EPIPHANY…DEVOTED | 9,10 | W-T-EA-T | **20,23** |
| p14 THEIR…THE | 23,24 | O-IA-M-X-NG | **11,24** |
| p46 PRIMUS…WAY | 14,15 | C-I-TH | **3,7** |

The surviving interpretation is three local *source index stencils*, potentially navigation or selected-clause markers. Their fragments overlap semantically with earlier independently found p0 EPIPHANY/DEVOTED and p0 ROAD source-selection routes, but no source-visible consumer ties the p12, p14 or p46 packets to another untouched cipher receiver. The sorted-H packet is also sensitive to original outer rune endings X and S; a more complete punctuation/ink/direction rule might explain why those glyphs were chosen, or a broader cipher-corpus search may show the matches are accidental.

**Decision:** preserve this exact three-site operation and its early negative successor test as a finite new clue candidate. Seek an independent original illustration, page reference, or historical source that selects **sort each H pair and treat the four results as signed-word addresses** before further decoding. If no such selector exists, avoid a new numerical multi-step walk chosen to fit the already-known signed source phrases. Do not promote any of the three English clauses to unknown ciphertext plaintext.

## Direct original-cipher key consumer (negative)

The strongest immediate receiver is the **original continuation on the same physical page** after the two-word H packet. Here the selected authentic 2016 clause itself supplies a complete GP29 Vigenere-style key, rather than requiring an unrelated source. This is an independently reversible operation of the same additive family used on solved LP1 and p56. It is a **testable consequence of the hypothesized local key handoff**; H sorting itself remains retrospective.

The frozen bounded test covers **24 decoders per matched page, 72 in total**: both additive signs; the verbatim key and its reverse; three key-clock origins (page start, H packet start, H packet end); and two literal-cipher-F policies (consume every original rune, or leave ciphertext F literal without consuming key). No external plaintext or language model selects parameters. Each no-F additive candidate exactly reencrypts its original page. Score only the complete *original ciphertext tail beyond the packet* against a native-GP trigram model trained on **218,800** Shakespeare runes, calibrated using independent Gibran source windows exactly matching the target tail lengths and authentic solved clear p57.

| Original source packet | Tail after packet | Best of 24 GP29 tail scores (nats/rune; larger is more native) | Weakest independent Gibran window of same length | Native-like candidate count |
| --- | ---: | ---: | ---: | ---: |
| p12: EPIPHANY SEEKS THE DEVOTED, 22 GP runes in key | 131 runes | **-3.978484** | **-3.086957** (481 windows) | **0** |
| p14: THEIR MEANING IS THE, 13 GP key runes | 64 runes | **-3.881136** | **-3.236490** (986 windows) | **0** |
| p46: PRIMUS IS THE WAY, 13 GP key runes | 224 runes | **-4.049470** | **-2.879505** (281 windows) | **0** |

The independently authentic p57 clear plaintext scores **-2.475702** under the same frozen model. The original undecephered tails score **-4.316444**, **-4.082084**, and **-3.975741**, respectively. None of the seventy-two original-input inverses approaches even the weakest heldout native prose. The two literal-cipher-F schedules are common finite policies, **not** an exhaustive inversion of every legal ambiguous-F path.

**Decision of consumer test:** reject direct cyclic GP29 use of the three source-selected signed phrases as local page keys under these fixed historical arithmetic options. A prospective mechanism now needs an independent selector for a genuinely different receiver or operation. No arbitrary key-phase or offset rescue is justified. Reproducer: [source-read GP29 inverse SFT](../sims/lp2_outer_h_signed_phrase_direct_vigenere_sft.cjs), [Windows Node22 PASS 44939562541](https://github.com/FlareZ123/liber-primus/actions/runs/44939562541).

## Reproduction

The [single-file original-source CommonJS SFT](../sims/lp2_outer_h_sorted_2016_fourword_circuit_sft.cjs) parses all 12,956 runes and 2,896 complete words, checks every H packet against the original outer runes, asserts all three original page-local/global starts and source-phrase strings, performs the unsuccessful direct-successor check, and runs the complete 100,000-shuffle original page-inventory null. [Windows Node.js 22 execution 44939100727](https://github.com/FlareZ123/liber-primus/actions/runs/44939100727) **PASS**. Inputs: [canonical GP corpus](../resources/liber-primus/lp2-corpus.json), [whole-word manuscript transcription](../resources/lp2-transcription.txt), [2016 authenticated signed source](../resources/historical/cicada2016-4gq25-outguess.asc).
