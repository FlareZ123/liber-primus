# Independent L3-ROAD word-gematria audit: historical nulls, superseded segmentation

## Scope

An independent study in `Dukotah/cicada3301`, Round 10 lane L3-ROAD, directly tests numeric readings of the 2016 signed clause “the map, their meaning is the road, and their numbers are the direction.”

The original Round 10 study parses 2,928 words / 12,956 runes and uses a word-length-preserving shuffled-stream null. It is a useful pre-registered historical experiment, but **its word segmentation is superseded by later work in the same external repository**. The pinned source and all later corrections are indexed in [resources/external/dukotah-cicada3301-round10-l3-road.md](../resources/external/dukotah-cicada3301-round10-l3-road.md).

## What the historical study did well

The study separated several plain-English interpretations rather than tuning one decoder:

- T1: per-word and sentence/line/page gematria sums as marked numbers or checksums.
- T2: reduce each word sum to one rune.
- T3: use arithmetic predicates on word sums to select whole words or boundary runes.
- T4: sort words by gematria as a reading path.
- T5: use word sums as pointers into candidate key texts (explicitly low-prior / confirmatory).

Its null shuffles the rune stream and re-cuts it into the same word-length sequence. A synthetic validation gate passes: the planted T2 sum-mod-29 decoder recovers 99.76% of held-out symbols, and the planted T3 selector reaches z=79.7. The pre-registration records an amendment to the absolute-score threshold after calibration and before the real LP2 tests: retain an absolute readability bar and require z ≥ 8 against the same reading family on matched shuffled corpora.

This validates power for the declared synthetic families and segmentation. It does **not** validate that the declared segmentation is the correct plaintext grouping.

## Historical Round 10 results

Under the original 2,928-word parse:

- **T1a word sums:** no statistic meets its signal rule. Prime fraction z = 0.21 (p = 0.841); emirp z = -1.017; s+1-prime z = 0.476; gematria-prime z = -0.405.
- **T1b group sums:** sentence prime-rate z = 0.668; line and page results are also null. Some sentence sums equal Cicada constants (157, 1033, 3203), but the observed hit count is only z = 2.607.
- **T2/T3:** 208 readings; every reading has `HIT=false`; maximum reported z = 3.02, below the amended z ≥ 8 criterion, with scores below the absolute readability bar.
- **T4 word ordering:** no tested order hit. The study's own controls show that wrong orders of genuinely English words can retain within-word n-grams, so order scores need careful interpretation.
- **T5 book-like pointers:** 30 confirmatory readings are null and remain below the readability bar.
- **T6 solved-plaintext control:** 270 words / 959 runes of solved plaintext do not show significant prime/gematria marking. Apparent emirp (z = 3.265) and s+1-prime (z = 2.778) excesses are not authorial signals under the ordinary-English controls: 5.0% and 15.8% of those controls, respectively, reach comparable z values. The author's published sentence sums include composites.

## Later corrections that change the interpretation

The same external repository's later rounds materially qualify the word-indexed nulls:

1. **Round 45:** twelve order tests with intact English controls found no detectable ordinary-English printed word-length order at the tested scales; this disfavors intact ordered ordinary-English groups at book scale but cannot distinguish permuted true words, decoy boundaries, or an unrepresented register. LP2's order statistic was z = -1.2, versus solved-page controls around +7.5. The best description was an English-like length multiset over a contiguous rune stream, with order destroyed or lengths drawn from another text. This makes a literal reading of the printed word sequence as the road suspect.
2. **Round 46:** the correct printed-word loader gives **2,896 words**, not 2,928. It joins 420 wrapping words (388 across lines, 32 across pages). The old 2,928-word loaders made 32 extra cuts at page-wrap boundaries. The L3-ROAD word sums and selectors therefore use a superseded segmentation.
3. **Round 47:** for bounded word-indexed key families, the (b′) loss can be a decoder limitation rather than an information barrier. With an unknown key from a 65,536-key family, ranking plus an arrangement-aware beam recovers 78–88/100. The b′ controls conserve sentence-level length inventories; arbitrary H-decoy need not. Older word-indexed negatives remain conditional on their segmentation and receiver assumptions; re-adjudicate only where a source-supported mechanism or material coverage gap justifies it.

The T6 solved-plaintext control is independent of LP2's segmentation, but its conclusion remains limited to that control corpus and its English controls.

## Corrected T2 decision: arrangement-invariant histogram and constructive quotient inverse (Agent49, 26 November)

The earlier T2 null is now supplemented by a distinct original-input attack on the corrected 2,896 complete printed groups (12,956 runes, exact equality with canonical p0–55 rune order). The published 2013/14 Wisdom operation motivates GP prime sums, while the 2016 signed wording supplies the proposed word-to-number interface. The quotient and unknown output alphabet are exploratory modelling choices, not independently selected author instructions.

### Order-free necessary condition

For each pointwise T2 reducer, assign one output rune to each complete group. Any subsequent permutation of output positions preserves its histogram; any common arbitrary GP29 substitution preserves the **sorted** histogram. For equal-length vectors with sorted counts (a,b), `0.5 × Σ_i |a_i − b_i|` is the minimum number of symbol replacements needed to match the reference histogram after allowing *both* arbitrary output order and arbitrary alphabet permutation. This follows from the rearrangement inequality for absolute differences and matching the common count in each aligned class. The test does not assume that the printed order is the plaintext order, but does require the printed groups themselves to be the carrier units and a common one-to-one output alphabet.

Exhaust all contiguous same-length windows from the pinned source-native GP Shakespeare, Emerson and Gibran registers (592,240 windows at 2,896 output runes; 593,506 at 2,474 for the no-F variant). No exact sorted-histogram match in any family. Minimum replacements, granting all 29! output alphabets and all orderings:

| Pointwise reducer | Shakespeare | Emerson | Gibran |
|---|---:|---:|---:|
| GP prime sum mod29 (includes Atbash, negation, reversal) | 842 | 874 | 875 |
| floor(GP prime sum/29) mod29 | 142 | **139** | 149 |
| decimal digit sum mod29 | 199 | 215 | 232 |
| prime-counting function mod29 | 484 | 542 | 531 |
| prime factors with multiplicity mod29 | 1461 | 1448 | 1451 |
| largest prime factor mod29 | 221 | 215 | 219 |
| prime index (non-chart sum maps to 0) | 2320 | 2315 | 2344 |
| word length × sum mod29 | 840 | 872 | 876 |
| sum mod29 excluding F-containing words (2,474 outputs) | 694 | 727 | 738 |

The quotient has the closest native histogram, with a minimum of 139/2,896 (4.80%) substitutions. The exact exclusions concern only literal windows of these finite references and the named pointwise models; 139 mismatches do not exclude unseen ordinary language. The previous local [word-sum-residue result](lp2-word-sum-residue-source-gate.md) compared residues of **plaintext words**; the present target is **one plaintext rune per ciphertext word**, a different receiver. No claim of a general language impossibility is made.

### Actual quotient alphabet recovery

Test the closest pointwise reading as an ordered projected symbol stream, giving it an arbitrary unknown fixed GP29 alphabet. Train additively smoothed GP29 joint trigram counts exclusively on the pinned Shakespeare/Emerson controls. Fit a substitution on the first 1,448 projected symbols by twelve fixed-seed annealing restarts (10,000 proposals each); freeze the entire key before decoding the remaining 1,448. No adjustment against the holdout. Construct actual quotient carrier words by exact sum DP covering every output rune, then encode two separate Gibran sequences under independently shuffled alphabets. Recover 1,448/1,448 and 1,444/1,448 held-out true symbols (2,892/2,896 total); fitted 1,448 and 1,447 correct; 27/29 and 24/29 complete alphabet entries correct (rare/unseen labels are less identifiable). Both controls pass the frozen 98% gate; exact projected-stream replay in both.

| Source | Fit (joint trigram nats/trigram) | Frozen holdout |
|---|---:|---:|
| Gibran plant 1 | -7.82545 | -7.79433 |
| Gibran plant 2 | -7.73981 | -7.90262 |
| Original LP2 quotient | -10.02264 | -10.52590 |

The original recovered key replays all 2,896 **projected** symbols but yields nonprose, beginning `CDSELNGOIERCOAJERRONAPRDSSLELDDANICRCCUOTADLINSPASOCULULYSNDFBEOATRTUNILINANEAROLLLSCCDMDAENGTHYTAHRSMREUTHESNIEDEAOTLDAILTMDTHRMOAFOTEABWRDCAANAUERTHWWFWISDUNTSYTUTW`. Replay is automatic for bijective alphabets, and the word-to-rune projection itself is lossy; this is a test of a cover-text channel, not a full 12,956-rune inverse. The annealing negative is a finite calibrated search, not exhaustive over keys. The alphabet-free histogram gate above remains valid even if projected order is scrambled; the annealing result is conditional on intact projected order. Neither creates a source-selected new operand.

**Decision:** retire this direct quotient-plus-fixed-alphabet ordered receiver within the calibrated scope; no new plaintext, key, or route. Do not broaden arbitrary output permutation searches absent an independent source-selected order; the sorted-count bound already grants all such arrangements for the tested literal references. This does not rerun T1/T3/T4/T5, order-dependent T2 reductions, or the external scorer. The complete runnable CommonJS SFT and raw numerical output were executed in V8 on the live canonical inputs and preserved, without additional CI: [SFT](../sims/lp2_road_pointwise_orderfree_quotient_sft.cjs) · [raw](lp2-road-pointwise-orderfree-quotient.json).

## Corrected-loader T1a/T1b re-adjudication (Agent1, 26 November 2026)

The Round10 T1 word-sum and T1b group-sum nulls were published against a 2,928-word parse. The later pinned loader at **Dukotah/cicada3301@fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb**, file **liber-primus/analysis/round46/L1-word-loader/words.py**, joins across slash, percent, and newlines, breaking only on hyphen, period, ampersand, dollar, section sign, and digits. I ported those rules against this repository's 2017 transcription and checked the first 12,956 rune indices exactly against canonical corpus pages 0–55.

The corrected parse yields **2,896 words**, mean length 4.47376, **420 line wraps**, and **32 page wraps**. It produces 175 punctuation-defined sentence groups and 594 line groups. The old external Round10 parse had 2,928 words and 219 sentence groups, so sentence grouping is materially changed.

I re-ran the complete T1a word-sum family (13 preregistered statistics) and sentence/line T1b group-sum statistics against 2,000 deterministic Fisher–Yates null permutations (xorshift32, seed 3301; shuffle all rune indices, then re-cut into corrected fixed word/group lengths). This is an independent reproducible null, not a byte-for-byte reproduction of the external NumPy PCG64 sequence.

- **T1a:** no statistic reaches |z|=4; the largest absolute z is 1.987 (word-sum divisibility by 29).
- **Sentence T1b:** prime-rate z=2.785; emirp-rate z=1.318; Cicada-number hits z=3.073, nominal empirical p=0.01999, below the preregistered |z|=4 gate and not corrected for the full family of tests.
- **Line T1b:** prime-rate z=-0.648, emirp-rate z=-0.230, Cicada-hit count z=-1.165; no signal.

The three corrected sentence-sum Cicada hits are:

| Sentence group | Start page | Words | Prime-weight sum |
|---:|---:|---:|---:|
| 56 | 12 | 5 | 1039 |
| 57 | 13 | 6 | **1033** |
| 166 | 43 | 9 | 3203 |

The 1033 hit equals one cuneiform value, but the same preregistered Cicada set also yields 1039 and 3203; three hits versus null mean 0.6325 is only a weak nominal elevation. The older Round10 parse reported 157, 1033, and 3203; the corrected loader changes 157 to 1039 while retaining 1033 and 3203. This is not evidence of plaintext or a key. Page-group T1b is not re-adjudicated here.

Reproducer: **sims/lp2_2016_road_corrected_loader_t1_sft.cjs**. It asserts the corrected stream, word/wrap counts, all statistics, the three hit groups, and the seeded null procedure.

## Corrected T3 receiver: prime-selected self-indexing with a secret common alphabet (Agent49, 26 November)

The historical T3 lane includes a prime predicate and zero-based within-word selection by the sum modulo word length; it scored the direct output under the superseded parse. The distinct question here is whether the **same selector followed by an unknown common GP29 substitution** conceals an otherwise native message. This is an exploratory extension of the signed 2016 word/number/direction hint and historical GP prime weights, not an independently authenticated second alphabet or key.

For each complete original group (w), compute its GP-prime sum (S). If (S) is prime, emit (w[S\bmod |w|]) with zero-based indexing; otherwise emit nothing. Preserve group order. The corrected transcription matches the canonical unknown ciphertext at all 12,956 runes and yields 2,896 groups; **604** pass the predicate (20.856%). The output is a projected tape rather than an inverse of the full manuscript.

### All-order, all-alphabet necessary condition

A fixed secret alphabet permutes counts and an arbitrary output ordering preserves them. As in the T2 result above, half the L1 distance between sorted count vectors is the exact minimum number of symbol replacements to match a literal reference histogram, even granting all 29! alphabets and all arrangements. Every same-length contiguous native-GP reference window was searched:

| Reference | Windows | Exact matches | Minimum replacements of 604 |
|---|---:|---:|---:|
| Shakespeare | 216,503 | 0 | 137 |
| Emerson | 320,724 | 0 | 134 |
| Gibran | 61,889 | 0 | 143 |

Thus all 599,116 literal windows fail under arbitrary common alphabets and output arrangements. Even the closest requires 134/604 (22.19%) changes. This finite reference result does not exclude every possible English text.

### Actual unknown-alphabet inversion

Train the joint GP29 trigram model only on Shakespeare and Emerson, smoothing by 0.1. Fit a 29-way bijection to the first 392 extracted symbols by 16 seeded annealing restarts of 12,000 swap proposals each, then freeze that key and decode the final 212. Reuse the earlier T2 substitution optimizer with this new source selector; do not sweep predicates, shifts, or indices.

For positive controls, construct prime-sum four-rune carrier groups for each of the 29 possible extracted symbols; interleave composite-sum filler groups. Encode three independent 604-rune Gibran segments under independently shuffled secret alphabets. The extraction stage must recover all 604 hidden ciphertext symbols before fitting. These are mechanism controls, not a match to the original's entire cover-group length or selection-gap distribution.

| Input | Fit nats/trigram | Frozen holdout | Correct withheld runes |
|---|---:|---:|---:|
| Gibran start 12,000 | -7.8430 | -7.9744 | 212/212 |
| Gibran start 30,000 | -7.7146 | -7.8360 | 211/212 |
| Gibran start 45,000 | -7.9216 | -7.9019 | 212/212 |
| Original LP2 | -11.9095 | -13.7963 | unknown |

All three plants pass the frozen criterion (at least 95% exact withheld recovery on two of three plants). The original best frozen key yields nonprose, beginning `UEWELUPBEADSTPOEODTHYNGHWRNGORLANEDOFCEAHRIAGNDMAPEAFREOUTWEADEXPEOPOETRIANLANURAEXMOEIAIFNGYTHESCHPOTM`. All projected symbols round-trip in all runs; that is automatic for a bijective alphabet and does not reconstruct the discarded cover symbols. The annealing result is a calibrated finite search, not an all-key theorem. The separate histogram result grants arbitrary output order without needing the annealer.

**Decision:** retire the exact prime-selector/self-index/common-alphabet receiver. No plaintext or authentic key recovered; a new independently selected extraction rule would be needed to justify a successor. This is not an additional rerun of the historical direct T3 menu, and neither the other T3 predicates nor T4/T5 have been generally excluded by this extension.

Reproducer [SFT](../sims/lp2_road_prime_selfindex_secret_alphabet_sft.cjs), [raw results](lp2-road-prime-selfindex-secret-alphabet.json). Both executed in V8 on the live canonical inputs; no CI.

## Current decision

T1a and sentence/line T1b have now been re-run under the corrected 2,896-word loader. They do not produce a threshold-level signal; the three sentence Cicada hits include 1033 but remain a weak, multiple-testing-sensitive elevation. Historical page-group T1b and most direct T2–T5 results remain conditional on their earlier parse unless separately re-adjudicated. The corrected T3 prime-selected self-index extension above gives a finite all-order/all-alphabet histogram exclusion and a calibrated ordered substitution-inverse negative.

The corrected pointwise T2 quotient work above establishes exact finite order-and-alphabet-independent histogram limits and a calibrated direct ordered quotient negative, not a universal closure of word-gematria, selector, ordering, or book-pointer readings. Any further word-indexed revisit must use the 2,896-word loader, address arrangement/decoder ambiguity, and retain a source-constrained operation with independent controls. The external Round47 arrangement-aware decoder is relevant only where a bounded key family actually selects the ordering; it is not a license for unconstrained key search.

No recovered unknown plaintext, authenticated key, or external pointer follows. Semantic guidance after decryption and a source-fixed external pointer remain possible.
