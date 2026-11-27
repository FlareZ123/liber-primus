# The 17 January 2015 original page-15 factor-stream proposal: original-cipher decision

**Agent42, 14 November 2026.** A period contemporaneous #cicadasolvers transcript supplies a previously untested **specific** operand from the original p15 sixteen-cell spiral. An IRC solver explicitly factored all sixteen printed entries and posted the sixteen largest prime factors in center-out clockwise order. That full historical proposed sequence has now been reproduced directly from the unchanged square and tested on the next **1,744 original runes** of physical pages 16–22 under exact known solved-Cicada cipher operators. **No source-selected key, new LP2 plaintext or destination results.**

## Human-observable source and frozen input

Historical witness: [17 January 2015 original IRC log, lines 74304–74362](https://github.com/neuroretransmit/cicada/blob/main/irc-logs/%23cicadasolvers.freenode.2.log#L74304-L74362), source Git blob `72634a9d071d32af767edbffc0493d810e88cd0d`, includes the following substantive first-hand lines:

- At **18:32**, participant `l0rdkermit` notices that every number of the page-15 square factors to a nearly unique largest prime factor.
- At **18:44**, he directs readers to his Titanpad `VEdHxTyAUo`, now an unverified historical location, and at **18:49** posts the entire 16-number output: `3299 97 103 61 137 149 181 179 197 31 43 103 13 59 67 1129`.
- At **18:55**, another participant explicitly asks whether the sequence starts in the **red center** and follows the source spiral; the answer is **yes**.

The source original [p15 Fibonacci-prime grid](../results/fibonacci-prime-spiral.md) prints, in that fixed center-out spiral, `3299 3298 3296 3294 3288 3278 3258 3222 3152 3038 2838 2472 1820 708 1206 4516`. Taking the **largest prime factor of each** produces the period-authored exact candidate above, with 103 duplicated at two of 16 positions. This sequence differs fundamentally from the prime *inputs* used to generate the original grid and was absent from the five earlier grid-key families. Its origin is a **2015 participant hypothesis**, not a Cicada-signed instruction or demonstrated cryptographic key.

The source route naturally points to pages **16–22**, the 1,744 original rune-bearing positions immediately following the source grid and before p23's next colored opening. Their original page lengths are `267,273,260,271,269,273,131`. The infinity mark under the grid makes a length-16 cyclic stream plausible as a bounded hypothesis; its selection remains inferred.

## A complete original GP29 cipher comparison

The [source-exact Windows Node22 CJS SFT](../sims/lp2_p15_2015_primefactor_spiral_original_sft.cjs) verifies the exact historical factorization, and tests the sixteen **factor values** or their **prime totients (factor−1)** modulo29. Both basic GP29 Vigenère directions and GP29 Atbash with ±key addition and the two intrinsic Atbash constants 0/28 are included. The key is fixed at the red-center start with no phase search; the 12 variants cover exactly these two source operands × six historically recognizable operators, not a free-key tuning process.

Plain character-wise inverse outputs for *every* variant remain source-original near-uniform, IoC **0.03423853** or **0.03441683**, versus the original unmodified cipher **0.03450960**. Their first 22 decoded runes produce no obvious plaintext. No meaningful statistical recovery appears.

Crucially, a stronger **key-dependent exact invertibility test** independently enforces the solved LP1/p56 plaintext-F convention. When C is F, P may be a literal F that consumes no key; otherwise the inverse consumes exactly one source key rune, rejecting any consumed step that yields P=F (which the authentic encoder would have copied without consuming). The original p56 correct prime-totient key passes this test with five permitted end clocks `[81,82,83,84,85]`, serving as a genuine native-source positive control.

All 12 factor-key variants encounter an unavoidable original source contradiction **within the first 100 runes of page 16**. First failure offsets in canonical variant order (factor first, then factor−1; +C−K, +C+K, −C−K with constants 0/28, −C+K with constants 0/28):

```text
Original factors:           64 12 12  3 64  5
Prime-factor totients:       5 96 96 12  5 20
```

These contradictions are absolute within this narrowly specified prime-factor, cyclic, zero-phase, native plaintext-F GP29 family. The alternate ordinary direct cipher without the F rule is covered by its near-uniform raw outputs. They do not exclude a completely different selected operation, an external pad, a nonzero clock offset, a book cipher or the prime-factor numbers serving as something other than an additive keystream.


## Distinct-factor NUMBER → BASE29 transfer (Agent10, 27 November 2026)

The largest-factor-only 2015 participant suggestion above is distinct from the retrospectively reconstructed 2013 `NUMBER` command in the [historical command/square report](onion7-magic-center-source-prime-gate.md#cellwise-later-preserved-number-transcript-operation-a-41316-candidate-map). That command returns distinct prime factors of composites, reverses decimal digits for prime inputs, and prints `+` for a prime whose reversal is prime. Its original server is unavailable; this is a period-puzzle-inspired candidate receiver, not a signed LP2 instruction. The red 3299 is the only prime in the original sixteen-cell spiral, and 9923 is prime, so only that cell emits `+`. All remaining 15 entries are even composites. The exact output has 44 factor tokens, six above the GP chart (137,149,181,179,197,1129). A literal chart-prime conversion is therefore incomplete; instead the historical BASE29 positional numeral operation can represent every factor, yielding 59 digits without inventing a factor-to-rune dictionary.

Freeze ascending factor order within each cell (a chosen deterministic convention), original red-center outward spiral order, omission of the nonnumeric `+` response, and one cyclic stream (the infinity mark motivates repetition but does not authenticate it). The three fixed numerical interpretations are full factor values modulo29, factor-minus-one modulo29 (the solved p56 prime-totient transfer), and literal base29 digits as GP shift indices. Unlike the earlier 16-largest-factor test, no factor is discarded from the composite outputs. Test both arithmetic signs, all rotations, and every literal-F hold history on the same exact 1,744 original runes of p16–22. A periodic state need retain only the current key phase: at each c=0, preserve phase for a hold; for any c, consume iff c−sign·key[phase] != 0 mod29. Merge equal phases without losing feasibility.

| Tape | Period | Complete cases | Legal full original paths | Latest first contradiction (zero-based) | Pages with no legal phase/sign even independently |
|---|---:|---:|---:|---:|---|
| Factors | 44 | 88 | 0 | 392 | 17,18,20,21 |
| Factor totients | 44 | 88 | 0 | 156 | 16,21 |
| BASE29 digits | 59 | 118 | 0 | 405 | 17,19,20,21 |

All 294 exact F-clock cases admit their respective p57-native positive plant. The original solved p56 85-rune ciphertext replays with its published hold at offset56 and 84 consumed prime-minus-one shifts; the recovered full plain tape in the raw output reads AN END ... IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE in native rune spellings. Since all possible start phases are granted, the complete p16–22 negative also applies to a continuous transfer beginning earlier on p15 and entering p16 with any phase. Even independent page-phase/sign selection cannot rescue any one of these three tapes, as shown by the indicated individually impossible pages. No word boundary, alphabet relabeling, or language model is used in this contradiction.

Separate ordinary-consuming inverse: rank phase/sign by an add-0.5 GP29 bigram model fitted to the first 1,000 runes of the pinned derived LP1 donor; freeze at p16–19 (1,071 runes), test p20–22 (673). Three concealed phase/sign plants use the disjoint following 1,744 donor runes and recover exact phase/sign and all runes; donor fit/held scores −2.74134/−2.74649 nats/transition. On original, held scores for the fit-selected factor/totient/BASE29 candidates are −3.81624/−3.82433/−3.81752; even the independently optimized held scores are at most −3.70462/−3.71286/−3.69429 respectively. Previews are nonprose. This is a finite comparative language diagnostic, not an all-English theorem. No claim of a unique F-hold plaintext in the positive plants (feasibility only).

**Decision:** retire these exact distinct-factor tape and BASE29 cyclic shift consumers, including free phase and page restarts. Do not interpret the 44/59 lengths as an independently selected key or pursue arbitrary factor order or alternative serializations absent a new source rule. No unknown plaintext or authentic key. The broader established synthesis is unchanged.

Reproducer [single-file CJS](../sims/lp2_p15_number_base29_factor_tape_sft.cjs), [complete per-case output](lp2-p15-number-base29-factor-tape-output.json). Canonical corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; derived LP1 map blob `0fb8fcaaf793628e0e76c6b17e9643170bbb9508`. The shared JS core actually ran on these retrieved inputs; the assembled standalone Node wrapper has not been separately executed.

## Next decision

**Do not repeat** the historical participant's idea as generic factor mod29 or launch a broad offset/key search. A credible continuation would require recovering a first-party instruction or the original Titanpad `VEdHxTyAUo` specifying a distinct reversible **consumer** (not merely the already preserved factor sequence), and then applying that operation to original ciphertext with an independent held-out prediction. The historical Titanpad itself is not a first-party Cicada message; independently archived content would still need source-authored instructions.

**Status:** The 2015 largest-factor candidate and the distinct reconstructed NUMBER/BASE29 tape consumers have been tested; neither yields original LP2 plaintext, a valid key, a complete inverse or the final target.
