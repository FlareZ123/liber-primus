# Repeat-constrained author register: joint original gate (#3125)

**Decision:** the explicit constrained-writing rival fails the joint LP2 gate under the frozen historical encipherments. Suppressing adjacent plaintext repetition alone does not select a new inverse. No unknown plaintext/key.

## Frozen grammar and original comparison

Original: 12,956 p0–55 runes, 2,896 printed groups, 2,731 distinct groups, maximum multiplicity 5. The parser matches the canonical tape exactly; 86 adjacent equalities (63 internal, 23 seams), minimum marginal count 399, IC .0344784.

Source passages: nine solved-native records split at ⁘/⁜, plus pinned Gibran and Emerson Gutenberg texts split at .!? inside their START/END markers. Native rune groups preserved; English normalized QU→CW, ING→NG, IO→IA, V→U, K/Q→C, Z→S and greedy GP digraphs. Mechanical segmentation includes some front matter and nonprose fragments. Eligible passages have ≥10 runes. Ordinary: unrestricted. Strict: no equal adjacent runes within any passage. Near: at most one equality per passage. Both constrained grammars also forbid equal passage seams. Sample whole eligible passages with replacement, truncate only at final target length, LCG seed3125; 50 draws per source/grammar, 450 generated texts, each encrypted under 3 frozen modes. Concatenation order is synthetic; the within-passage language is authentic source text. No target-dependent word selection.

Receivers: direct GP29 Atbash, continuous q8 DIUINITY additive clock with plaintext-F bypass, continuous prime-minus-one additive clock with F bypass. No key fitting. Diagnostics include minimum/absent marginal counts, IC, phase collision rates for q2,3,5,7,8,13,14,29,60, word multiplicities, within/seam repeats and lags2,3,5,7,13. All raw ranges in JSON.

| Quantity | Original | All strict control ranges |
|---|---:|---:|
| Adjacent equality, Atbash | .006638 | 0 |
| Adjacent equality, q8 | .006638 | .033501–.044693 |
| Adjacent equality, prime−1 | .006638 | .029564–.037900 |
| IC, Atbash | .034478 | .058264–.063826 |
| IC, q8 | .034478 | .040594–.042137 |
| IC, prime−1 | .034478 | .034514–.035425 |
| Minimum marginal proportion, Atbash | .030797 | 0–.000617 |
| Minimum marginal proportion, q8 | .030797 | .004014–.007409 |
| Distinct group fraction, Atbash | .943025 | .035886–.298489 |
| Distinct group fraction, q8 | .943025 | .232512–.557276 |
| Distinct group fraction, prime−1 | .943025 | .807214–.916832 |

Near grammar permits nonzero repeats but likewise fails: Atbash near-repeat .009263–.018294, IC ≥.058698; q8 near-repeat ≥.035276; prime−1 near-repeat ≥.029332. The original is outside every tested joint family. Nonconstant shifts reintroduce equal ciphertext neighbors even when plaintext contains none. Native strict pool has 41 passages/26 symbols, Gibran 133/28, Emerson 651/29. Native solved material itself contains adjacent equalities; no LP2-specific author restriction is selected. Samples are descriptive finite controls, not a universal English probability model.

## Exact rare-symbol capacity: arbitrary reweighting

Assume a single stationary GP29 bijection and intact printed word groups, allowing arbitrary word reordering. Let W be all distinct words in the eligible vocabulary; m=5 the original maximum word multiplicity. For rune x, even granting arbitrary word mixing and one trailing partial word, its total plaintext count is bounded by

    U_x = m * sum_{w in W} n_x(w) + max_{w in W} n_x(w).

Every plaintext symbol needs ≥399 occurrences, because any stationary bijection preserves the marginal multiset. If U_x <399 for any x, the entire relaxed vocabulary is impossible without any reliance on sampled order, sentence grammar or seams.

| Source | Ordinary min U | Strict min U | Near min U |
|---|---:|---:|---:|
| Native | 0 | 0 | 0 |
| Gibran | 0 | 0 | 0 |
| Emerson | 71 | 26 | 31 |

In Emerson strict, AE≤26, OE≤31, EO≤46, J≤81, X≤201. Ordinary AE≤71, OE≤151, EO≤176. Strict Gibran can have at most 495 distinct words incl partial and at most 12,322 runes under the five-use cap; strict native at most 113 distinct/2,774 runes. This exact obstruction needs intact groups and stationary mapping and does not exclude new vocabulary/orthography, decoy segmentation, or changing maps. Native/Gibran missing symbols also obstruct a stationary bijection without requiring intact groups.

## Disposition

Do not attempt blind original key recovery when no constrained grammar clears the joint test. A new independently sourced unusual register with sufficient rare capacity and a compatible encipherment would reopen this hypothesis. Stateful/collision-control encryption remains the stronger explanatory rival conditional on ordinary native prose, but is not thereby proven.

Reproduce from root: `node sims/lp2_constrained_author_sentence_gate.cjs`; `node sims/lp2_constrained_author_rare_capacity_sft.cjs`. [Simulation output](lp2-constrained-author-sentence-output.json), [exact capacities](lp2-constrained-author-rare-capacity.json). Both cores executed in connected JS against actual source. Standalone Node wrappers not separately executed. Initial parser mistakenly treated page markers as word boundaries; corrected before the full run. Source blobs: corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, transcription 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7, native 1b064ef6d85819b7d96adaff31a82d1ec551598f, Gibran df260a07d56bf5998d40a6360b6132c35c252d10, Emerson a92be8ba5b3511a003a22ba31523c14397aaa83a. Code/raw commits 4754e55410a229c433bb0a8f456e5a52da7b3e14 and eb37572f6b744d202b615a1fc84e80a3d4fb2117.
