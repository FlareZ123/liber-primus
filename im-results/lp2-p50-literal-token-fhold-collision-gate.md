# p50 literal-token phase clock: exact F-transparent collision and bijection gates (#2972, #3063)

**Decision (Agent34, 2026-11-26; exact follow-up Agent18, 2026-11-26): all 96 fixed native windows are excluded by integer collision bounds over every hidden F-hold history, and all 24,613 wider scalar survivors from the frozen Gibran/Shakespeare/Emerson corpus fail exact held-F alignment or per-class partial-bijection consistency.** The 256 literal row-major tokens (161 classes) remain unchanged, with phase zero at the beginning of physical p40–53. This extends the [ordinary consuming result](lp2-p50-literal-token-phase-collision-gate.md), without assigning radix59/60 values, permuting the table or introducing another origin. No unknown plaintext or historical key is recovered.

## Exact invariant and certificate

Let C have length 3,008 and 125 visible F symbols (GP index zero). Each zero either consumes or holds; only a plaintext F can hold. At consumed index i, the class is the literal token at (i − number of prior holds) mod256. A deterministic class permutation preserves the number M of equal-symbol pairs within each class among **consumed** symbols; in particular, this applies to additive class shifts. Held F symbols contribute neither to the consuming clock nor to M.

Partition C into 126 nonzero runs, each except the last with one trailing optional zero. Run state (h,d) encodes cumulative holds on entry and whether the trailing zero holds. A chain edge advances h by d. The state supplies an exact histogram of (class,cipher rune). The collision score of a full chain is the sum of within-state collisions and every pairwise histogram dot product.

For a fixed target block of B consecutive run states, enumerate all internal hold decisions and start h. Its internal collisions are exact. The maximum sum of cross terms with earlier runs is computed by DP over a **single consistent prefix** ending at the target start h. Similarly, the bidirectional version computes a single consistent suffix starting at the block end and ending at any allowed final H. These independent prefix and suffix maxima can overestimate but cannot underestimate the actual cross contribution of any full chain. For a partition into blocks, each cross-block pair occurs twice in the sum of left and right terms; each internal pair occurs once in the internal sum. Thus an outer DP over coherent block boundary states maximizes either (internal + left), or (2×internal + left + right), with floor division by 2 in the latter case. Conditioning on a range of H further restricts prefix/suffix feasibility. Taking pointwise minima of valid bounds remains sound.

We relax the additional rule that a consumed symbol cannot decrypt to F: the bound covers a **superset** of legal histories and every class permutation. No key guesses, dictionary scores or inferred plaintext enter the original certificate. 48 JS toy cases exhaust 1,154 masks and independently compare exact marginals and ceilings; 64 C++ toy cases exhaust all masks and check block bounds, including exact equality when the whole tape is one block. All self-tests passed.

## Original decision

| Method | H range | Certified max | Run |
|---|---|---:|---|
| Single-run prefix DP | 42–109 | 3268 | local JS |
| Independent pair dual, 40 sweeps | 42–109 | 6275 | [45834414854](https://github.com/FlareZ123/liber-primus/actions/runs/45834414854) |
| Star-conditioned integer dual, 500 sweeps | 42–109 | 2944 | [45834651716](https://github.com/FlareZ123/liber-primus/actions/runs/45834651716) |
| B6 prefix | 42–109 | 2242 | [45835103413](https://github.com/FlareZ123/liber-primus/actions/runs/45835103413) |
| B8 prefix | 42–109 | 2131 | [45835111643](https://github.com/FlareZ123/liber-primus/actions/runs/45835111643) |
| B12 prefix | 42–109 | 2010 | [45835237401](https://github.com/FlareZ123/liber-primus/actions/runs/45835237401) |
| B12 both | 42–109 | 1961 | [45835338765](https://github.com/FlareZ123/liber-primus/actions/runs/45835338765) |
| B16 prefix | 42–109 | 1903 | [45835245120](https://github.com/FlareZ123/liber-primus/actions/runs/45835245120) |
| B12 both | 42–59 | 1952 | [45835967766](https://github.com/FlareZ123/liber-primus/actions/runs/45835967766) |
| B12 both | 60–74 | 1954 | [45835976289](https://github.com/FlareZ123/liber-primus/actions/runs/45835976289) |
| B12 both | 75–89 | 1892 | [45835985941](https://github.com/FlareZ123/liber-primus/actions/runs/45835985941) |
| B12 both | 90–109 | 1811 | [45835995780](https://github.com/FlareZ123/liber-primus/actions/runs/45835995780) |

The native reference H range is 42–109. The exact per-H outputs of the four B12 subranges, combined with the B16 prefix ceiling, exclude every frozen window by M alone (strict M > upper). No class-marginal rejection needed in the final decision.

| Native source | Reference M range | Rejected | Minimum positive gap |
|---|---:|---:|---:|
| Gibran | 1927–2194 | 32/32 | 35 |
| Shakespeare | 1917–2205 | 32/32 | 14 |
| Emerson | 1882–2208 | 32/32 | 33 |

All reference windows have the same lengths, source truncation, GP encoding, and deterministic starting positions as #2934. Full integer certificates, H values and window start indices: [combined output](lp2-p50-fhold-combined-certificate.json). Initial independent cell-count bounds alone excluded 3/96, scalar initial relaxation 0/96. A heuristic mask at H75 provides an actual legal additive key and exact replay at M1430, recorded in [original output](lp2-p50-literal-token-fhold-collision-original-output.json); this is a nonprose statistic witness, not an authentic key.

## Fresh geometry-matched calibration

All six ciphertext plants have exactly 3,008 runes and 125 visible F, using the same 161 class shifts and row-major alignment. The key generator chooses shifts by exact subset-sum to meet the visible-F count, randomized tie order, not uniform random keys. Positives encrypt with historical literal-F holds. Wrong-clock negatives encrypt the same donor window with ordinary consuming positions. Each is evaluated at its known native H under the F-hold receiver. The resulting bound is a necessary test, not blind key recovery. Three correct-clock plants retain the true statistic and reencrypt exactly; three ordinary-clock plants fail the corresponding native statistic.

| Donor/start | Native H | Native M | Correct-clock B12 both | Wrong-clock B12 both |
|---|---:|---:|---:|---:|
| Gibran/1234 | 66 | 2006 | 2162 ([run](https://github.com/FlareZ123/liber-primus/actions/runs/45835796451)) | 1869 ([run](https://github.com/FlareZ123/liber-primus/actions/runs/45835806215)) |
| Shakespeare/4567 | 60 | 1997 | 2176 ([run](https://github.com/FlareZ123/liber-primus/actions/runs/45835814772)) | 1914 ([run](https://github.com/FlareZ123/liber-primus/actions/runs/45835830313)) |
| Emerson/7890 | 91 | 2000 | 2144 ([run](https://github.com/FlareZ123/liber-primus/actions/runs/45835839089)) | 1815 ([run](https://github.com/FlareZ123/liber-primus/actions/runs/45835848404)) |

Exact plants, plaintext, keys, held positions and replay: [fixtures](lp2-p50-fhold-matched-control-fixtures.json). The weak single-run receiver passed both positive and negative controls; a separate exploratory unigram posterior beam (width1024) failed a matched Gibran positive (truth prefix pruned at 242, only 14/161 shifts, heldout dies2477). No original map was fitted with that failed receiver.

## Wider reference scope

A rolling 256-phase histogram computes M for every contiguous length-3,008 donor window, with O(256) update per entering/leaving non-F rune and exact checks at all 96 fixed starts. Use the same combined certificate, falling back to the initial single-run ceiling for H outside 42–109.

| Source | Windows | Scalar-bound excluded | Scalar survivors | Exact bijections |
|---|---:|---:|---:|---:|
| Gibran | 43,774 | 43,561 | 213 | 0 |
| Shakespeare | 214,099 | 192,404 | 21,695 | 0 |
| Emerson | 303,583 | 300,878 | 2,705 | 0 |
| Total | 561,456 | 536,843 | 24,613 | 0 |

The 24,613 scalar survivors are the exact candidate set passed to the shared-bijection gate below; passing the collision bound alone is not evidence of viability. The fixed three-donor receiver is now excluded, but this is not a universal native-language impossibility. Arbitrary positional transport, other donors, other origins/clocks, a different distribution, or unrelated table semantics remain outside the decision.

## Exact shared-bijection follow-up (#3063)

The exact follow-up re-enumerates the same 24,613 scalar survivors using the pinned donor texts, GP29 normalization, p40–53 ciphertext, 256-cell row-major token clock, and combined H-conditioned collision certificate. It adds no donor, radix, framing, phase, or chapter-reset variant. For every candidate window, each plaintext F (index 0) must be a literal hold and align with ciphertext F; for each non-F position, the class is `tokenIds[(i − priorHeldF) mod 256]`. The observed `(class, plaintext) → ciphertext` edges and reverse edges must each be consistent, i.e. one partial bijection per literal token class. The checker rejects at the first hold mismatch, forward conflict, or reverse conflict.

**Result: zero exact witnesses among all 24,613 scalar survivors.** First rejection counts are mutually exclusive and exhaustive: 18,087 hold mismatches, 5,946 forward conflicts, and 580 reverse conflicts. By donor: Gibran 213/213 rejected, Shakespeare 21,695/21,695 rejected, Emerson 2,705/2,705 rejected. No witness map or unobserved-entry completion remains to preserve. Pinned Git blob SHA-1 inputs and exact counts are in [the machine-readable output](lp2-p50-literal-token-fhold-bijection-output.json).

The checker is calibrated on three independently seeded **arbitrary full per-class permutations**, not only additive shifts. Each native-F-hold plant has 3,008 runes and exactly 125 visible ciphertext Fs, including consuming zeros. Training on four fifths of positions predicts every observed repeated edge in the held-out fifth:

| Plant | Held F (H) | Consuming zeros | Held-out repeat edges predicted correctly | Coverage of held-out consuming positions |
|---|---:|---:|---:|---:|
| Gibran / 1234 | 66 | 59 | 214/214 | 36.2% |
| Shakespeare / 4567 | 60 | 65 | 218/218 | 37.0% |
| Emerson / 7890 | 91 | 34 | 203/203 | 34.9% |

The remaining held-out positions have previously unseen class/plaintext pairs and are correctly reported as unknown, not counted as predictions. Three matched ordinary-consuming wrong-clock plants, also with exactly 125 visible ciphertext Fs, are rejected: Gibran hold mismatch at rune 0, Shakespeare forward conflict at rune 52, Emerson hold mismatch at rune 29. These controls show that the exact checker accepts genuine arbitrary per-class bijections with real consuming zeros and predicts withheld repeated edges, while rejecting the wrong clock. They do not turn a synthetic control into evidence for an original key.

This closes the fixed p50 literal-token F-hold per-class-bijection receiver on the frozen Gibran/Shakespeare/Emerson donor corpus. It does not exclude other donor sources, other clock/state laws, or unrelated interpretations of the p50 panel.

## Reproduction
- [Exact shared-bijection SFT](../sims/lp2_p50_literal_token_fhold_bijection_sft.cjs): run with Node 22 from repository root. It pins all seven input Git blob SHA-1 values, reproduces the 24,613 scalar survivors, applies exact held-F and per-class forward/reverse constraints, and validates arbitrary-permutation controls. [Output](lp2-p50-literal-token-fhold-bijection-output.json); the existing [manual Node 22/CommonJS runner](../.github/workflows/manual-readonly-commonjs-sft.yml) can execute it.


- [JS SFT](../sims/lp2_p50_literal_token_fhold_collision_sft.cjs): run from root with Node, mode `original` or `sliding im-results/lp2-p50-fhold-combined-certificate.json`. Modes `fixture0`/ `fixturewrong0` etc. reconstruct the six plants. Original and sliding tests executed in V8 against pinned repository files.
- [C++ SFT](../sims/lp2_p50_fhold_collision_dual_sft.cpp): compile C++17 with optimization; arguments `16 42 109 block` or `12 75 89 both` etc. Add fixture index 0–5 after `both` for matched controls. The manual workflow logs report `SELFTEST`, `BY_H` and `CERTIFIED_BLOCK_MAX`; diagnostic program deliberately returns 1, so completed runs appear as GitHub failure despite successful certificate calculation. Explicit ERROR is a real failure. 
- The pointwise combined certificate is a reproducible finite-reference exclusion; the exact maximum M of the original remains unresolved. No unfrozen alternative clock or radix sweep is warranted.
