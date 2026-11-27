# Period-authentic state splitting: ACH binary code and LP2 framing obstruction

**Decision (#3146, 27 November 2026):** the published 1983 Adler–Coppersmith–Hassner [2,7] finite-state example is a genuine rate-1:2 binary code, successfully reproduced. It does not supply an independently selected GP29 representation. Exact original-cipher constraints reject fixed five-bit output labels, arbitrary static binary projections of either original rune labels or ordinal differences (even with a separate partition for every chapter), and every strict no-repeat-within-block GP29 code whose repeated pairs occur only at a fixed block join phase. Whole-block, chapter-reset output with fixed common overhead is also incompatible with the chapter lengths. These are bounded architecture obstructions, not a universal rejection of state splitting.

## Period-authentic receiver and independent control

Roy L. Adler, Don Coppersmith and Martin Hassner, “Algorithms for Sliding Block Codes — An Application of Symbolic Dynamics to Information Theory,” *IEEE Transactions on Information Theory* 29(1), 5–22 (January 1983), [DOI](https://doi.org/10.1109/TIT.1983.1056597), [paper](https://www-igm.univ-mlv.fr/~perrin/Recherche/HandbookCodes/Courant/01056597.pdf). Sections VII–IX specify a binary run-length constraint: between successive 1 bits, 2–7 zeros. The actual Section VIII example uses 1 input bit per 2 output bits. Final Table XVI supplies seven states and output pairs; Eq. 9.3 provides an eight-output-bit sliding decoder. The paper p20–21 identifies initial state 0² (binary label 001), and the four-bit input 0100 resetting it. Our wrapper appends those four input bits to provide the required final lookahead; this is an explicitly chosen finite-record convention, not a Cicada instruction.

Executed the Table XVI sender and Eq. 9.3 decoder on all 256 eight-bit inputs and a separate native solved LP2 p57 PARABLE plant (95 GP29 runes → 475 ordinal bits → 958 channel bits with reset suffix). Every input recovered exactly; all streams obey the [2,7] constraint and return to the initial state. Malformed 101, 11 and eight-zero strings fail the channel validator. The binary projection solver also accepts the genuine generated bit stream and rejects an eight-symbol constant tape.

Source caveat: web PDF screenshots returned cache misses. The available extracted Eq. 9.5 Boolean encoder transcription did not reproduce the table/control behavior; it was discarded, not silently repaired or attributed to the original authors as a mathematical error. The explicit Table XVI transitions and Eq. 9.3 pass the controls above. The selected example is period-authentic technical literature, not a first-party Cicada clue.

## Exact LP2 alphabet and synchronization gates

The historical example cannot directly use 29 output labels. A natural fixed minimal-width five-bit representation of GP29 is an injective map into the 32 bit blocks. Only nine five-bit blocks obey the necessary forbidden-substring constraints (no 11 or 101). Every one of the nine original LP2 chapters contains all 29 labels. Thus **every** such five-bit label bijection fails before any mapping, clock or language fitting. Variable-length packing and larger alphabets would require another source-selected grammar.

We also test a much more permissive necessary condition for a hypothetical binary side channel: can *any* fixed mapping of the 29 rune labels to bits produce the published [2,7] constrained tape? Test independently for each chapter, both on original ordinal labels and on adjacent ordinal differences mod29. This projection is many-to-one and not a complete original decoder, even if feasible; it is a valid necessary gate for these specific static binary-projection interpretations.

If a label occurs twice at distance one or two, its bit must be zero (otherwise 11 or 101/111 results). Construct a graph on the remaining candidate-one labels, joining two labels that appear at such distances. The selected one labels must be an independent set. Every consecutive eight-symbol window must contain a selected label; otherwise the result contains eight zeros. This graph and window condition exactly characterize the finite [2,7] constraint on the projection, including partial leading/trailing runs. When a window contains no candidate labels, no partition works. For the two cases where every window contains candidates, exhaust all subsets of the small candidate set.

| Physical pages | Runes | Direct candidate-one labels | Direct infeasible windows | Differential candidate-one labels | Differential infeasible windows |
|---|---:|---:|---:|---:|---:|
| 0–2 | 729 | 14 | 0 (subset test) | 8 | 86 |
| 3–7 | 1,145 | 5 | 316 | 3 | 640 |
| 8–14 | 1,729 | 2 | 1,033 | 3 | 989 |
| 15–22 | 1,903 | 3 | 820 | 1 | 1,815 |
| 23–26 | 1,021 | 3 | 443 | 9 | 75 |
| 27–32 | 1,433 | 3 | 561 | 5 | 334 |
| 33–39 | 1,680 | 3 | 700 | 1 | 1,577 |
| 40–53 | 3,008 | 1 | 2,365 | 1 | 2,856 |
| 54–55 | 308 | 18 | 4 | 16 | 0 (subset test) |

Opening direct: 21 independent sets (including empty), maximum two labels; even the best leaves 382 eight-symbol windows unhit. Terminal differential: 145 independent sets, maximum four labels; best leaves 94 unhit. **Zero valid partitions in all eighteen chapter/representation cases.** No shared or chapter-private static GP29→bit relabeling of these two source streams can realize the historical [2,7] channel. This does not constrain arbitrary stateful bit extraction, variable-width packing or a different RLL constraint.

## Direct GP29 fixed-rate obstruction independent of ACH's binary alphabet

Let q≥2 be the output rune-block length in a fixed-rate GP29 architecture. If a state-splitting encoder strictly forbids equal adjacent symbols inside each output block, but permits equality across joins, every original repeat offset in a continuous chapter must be congruent modulo q. Allow an independent arbitrary phase for every chapter, and allow any q, not a selected range of periods. Thus q divides the gcd of differences between repeat offsets. On the corrected original corpus each of the nine chapters has repeat-gap gcd **1**. Counts per chapter are 4, 6, 9, 10, 11, 13, 12, 18, 3 (sum86). For example, the terminal chapter p54–55 has repeat endpoints at offsets 20,156,291 (zero-based index of the second equal rune); the consecutive gaps136 and135 are coprime. Therefore no q≥2 can put even that chapter's three repeats solely at block joins, regardless of alignment. All nine are independently impossible. A globally strict no-repeat output is already contradicted by the 86 repeats themselves.

Separately, the chapter lengths are [729,1145,1729,1903,1021,1433,1680,3008,308]. Both gcd(lengths) and gcd(length differences) are 1. Therefore there is no q≥2 for independently complete chapter frames N_c=q·m_c, even after adding/subtracting the *same fixed* overhead for every chapter. A full arbitrary GP29 input cannot be mapped injectively at unit rate to a strictly predecessor-excluding GP29 output for arbitrarily long strings (capacity log₂28 vs log₂29, already established by the prior capacity work). State splitting does not resolve either the observed repeat exceptions or fixed-block framing automatically.

The two integer obstructions do **not** reject a continuous cross-chapter stream, chapter-specific termination length, multiple within-block exception positions, stateful exception signals, or a restricted nonuniform source alphabet. Such a model would need a separately motivated framing/exception rule; fitting different tail lengths or phases to observed repeats is not source selection.

## Research decision

[#624](https://github.com/FlareZ123/liber-primus/issues/624) already retired the direct COBS exception receiver; [#2864](https://github.com/FlareZ123/liber-primus/issues/2864) retired the SLIP differential stuffing receiver. Neither was repeated. ACH supplies a period-valid mathematical construction method, not a unique historical encoder for the manuscript. No original instruction fixes the source alphabet, a GP29 constraint graph, a coding rate, and the terminating/exception symbols. The actual historical example and direct block-join adaptation fail independent alphabet and framing prerequisites. Do not optimize a new state-splitting graph/rate on LP2 absent an authentic selector. A source-defined stateful exception and finite-frame termination rule would reopen the route. No unknown plaintext, key or continuation recovered.

Reproducer: [sims/lp2_ach_state_splitting_framing_sft.cjs](../sims/lp2_ach_state_splitting_framing_sft.cjs), corrected canonical transcription blob `f7b534a33edeb212d427329798438325307463d7`. Exact core executed in connected V8; standalone Node wrapper not independently run. No original language scoring or invented GP29 encoder.
