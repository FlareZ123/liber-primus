# Three signed-2016 word-index packets: exact outer-H suffix collapse

**Agent43 original 21 November 2026 observation, algebraically resolved by Agent47 on 21 November. Evidence class: source-original structural coincidence with an exact simple suffix/first-rune equivalence. Three signed-word-index packets survive as source observations. There is no first-party rule selecting them, and 72 immediate source-clause additive receivers fail. No unknown plaintext, authentic key or decoder is recovered.**

## Human-visible premise

The independently authenticated January 2016 Cicada clear-signed message instructs the solver that *its words are the map, their meaning is the road, and their numbers are the direction*. Its 43 alphabetic words can be numbered 0 through 42 without reading unknown LP2 plaintext. Independently, the reversible outside-in GP29 H operator has substantial prior, conditional source-state evidence in this repository:

\[
H(a,b)=((a-b)\bmod29,(a+b)\bmod29).
\]

A two-word manuscript object supplies two literal outer rune pairs, its **first and last rune of each original printed word**. Apply H independently to those pairs, sort **each two-number H pair into increasing order**, then concatenate. Reading any four consecutive integer results as indices into the first 29 authenticated source words yields three exact, disjoint word-position passages on three unresolved manuscript pages. Sorting is a retrospective convention. The later exact GF29 proof below shows this packet condition is simply two words ending in either X or S, with first-rune indices two apart. It does not independently evidence the H operator.

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

H is invertible on each *raw* pair using 2⁻¹=15 mod29, but sorting is lossy if the four signed-word indices are retained alone. On these three original ciphertext sites, the existing X/S word-final runes already identify the raw orientation, so no new physical orientation-bit channel is implied. The packet never decrypts the middle runes.

## Exact GF29 simplification: no extra information supplied by H

For a source word with first rune `a` and last rune `b`, the raw H values are `(a-b) mod29` and `(a+b) mod29`. They differ by `2b mod29`. **They sort into two consecutive ordinary integers if and only if `b∈{14,15}`**, corresponding to original GP29 **X** and **S**, and `(a+14) mod29≤27`. This follows directly from `2b≡±1 mod29`, whose only two solutions are 14 and15. In either case the sorted pair is exactly

`[(a+14) mod29, ((a+14) mod29)+1]`

when the interval does not wrap at 28. The two raw H output orientations are reversed for `b=14` (X) and forward for `b=15` (S). The original final symbol itself already provides this bit. An exhaustive **29×29=841** first/last-value census finds exactly **56** consecutive sorted-H pairs, comprising 28 each ending X and S, and **zero** cases outside this simple suffix rule.

The complete *four-consecutive-index* condition on two source-adjacent words of at least two runes therefore reduces to a much simpler reversible predicate on the existing ciphertext:

1. Both original words end with X or S (GP indices 14 or15).
2. Their original first-rune indices satisfy `a₂−a₁≡2 mod29`.
3. `(a₁+14) mod29≤25`, to avoid unsigned interval wrapping.

The three exact original sites follow only these ordinary rune facts, without H:

| Page | Original first-rune indices | Word-final indices | Direct unsigned starts `a+14 mod29` | Signed indices |
| --- | --- | --- | --- | --- |
| p12 | L=20, OE=22 | X=14, X=14 | 5,7 | 5,6,7,8 |
| p14 | C=5, W=7 | S=15, S=15 | 19,21 | 19,20,21,22 |
| p46 | AE=25, IA=27 | X=14, S=15 | 10,12 | 10,11,12,13 |

Thus sorted H contributes **zero additional constraint or independently testable information** to this particular four-index predicate beyond X/S endings and a +2 prefix relation. The previously measured **2,411 of 100,000** page-wise word-inventory shuffle matches remain valid, as the two predicates are algebraically identical; that conditional 2.411% was never discovery-corrected and does not establish authored intent. This finding changes the mechanistic priority: an attractive H packet cannot be used as evidence of H encryption simply because its numbers recover the signed 2016 phrase.

**Independent original-input reproducer:** [the 841-pair algebraic and three-page witness SFT](../sims/lp2_outer_h_suffix_collapse_exact_sft.cjs); [manual original-source Windows execution](https://github.com/FlareZ123/liber-primus/actions/runs/44944278062). The earlier complete 2,896-word scan and within-page word-shuffle control remain available unchanged in the original SFT linked below.

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

**Decision after the exhaustive suffix-collapse proof:** retain the three exact original-site word-index labels, while retiring sorted H as an independently supported cipher operation. Their defining condition is word-final X/S plus a difference of two in first-rune indices, an accidental-looking original-cipher stencil with no visible instruction selecting the letters or signed-word receiver. The three sites have different artwork, ordinary printed word separators, and no common direction mark. They cannot support an inferred reversible manuscript decoder. Reopen only on an independent first-party selector that specifies how the source words should be consumed and produces untouched ciphertext plaintext.

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
