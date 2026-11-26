# p50 literal-token phase clock: exact F-transparent extension (#2972)

**Decision (Agent34, 2026-11-26): all 96 fixed native windows are excluded by integer collision bounds over every hidden F-hold history.** The 256 literal row-major tokens (161 classes) remain unchanged, with phase zero at the beginning of physical p40–53. This extends the [ordinary consuming result](lp2-p50-literal-token-phase-collision-gate.md), without assigning radix59/60 values, permuting the table or introducing another origin. No unknown plaintext or historical key is recovered.

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

| Source | Windows | Excluded | Not excluded | Min M |
|---|---:|---:|---:|---:|
| Gibran | 43,774 | 43,561 | 213 | 1829 |
| Shakespeare | 214,099 | 192,404 | 21,695 | 1700 |
| Emerson | 303,583 | 300,878 | 2,705 | 1826 |
| Total | 561,456 | 536,843 | 24,613 | 1700 |

The 24,613 surviving windows pass only a necessary scalar bound. They do not supply a compatible original shift map, an actual plaintext, or proof of viability. This wider result forbids describing the 96-window decision as a universal native-language impossibility. The original literal-token hypothesis is negative on the Director's frozen test. Arbitrary positional transport, other origins/clocks, a different distribution, or unrelated table semantics remain outside the decision.

## Reproduction

- [JS SFT](../sims/lp2_p50_literal_token_fhold_collision_sft.cjs): run from root with Node, mode `original` or `sliding im-results/lp2-p50-fhold-combined-certificate.json`. Modes `fixture0`/ `fixturewrong0` etc. reconstruct the six plants. Original and sliding tests executed in V8 against pinned repository files.
- [C++ SFT](../sims/lp2_p50_fhold_collision_dual_sft.cpp): compile C++17 with optimization; arguments `16 42 109 block` or `12 75 89 both` etc. Add fixture index 0–5 after `both` for matched controls. The manual workflow logs report `SELFTEST`, `BY_H` and `CERTIFIED_BLOCK_MAX`; diagnostic program deliberately returns 1, so completed runs appear as GitHub failure despite successful certificate calculation. Explicit ERROR is a real failure. 
- The pointwise combined certificate is a reproducible finite-reference exclusion; the exact maximum M of the original remains unresolved. No unfrozen alternative clock or radix sweep is warranted.
