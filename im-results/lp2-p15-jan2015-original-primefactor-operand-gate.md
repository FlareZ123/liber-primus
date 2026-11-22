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

## Next decision

**Do not repeat** the historical participant's idea as generic factor mod29 or launch a broad offset/key search. A credible continuation would require recovering a first-party instruction or the original Titanpad `VEdHxTyAUo` specifying a distinct reversible **consumer** (not merely the already preserved factor sequence), and then applying that operation to original ciphertext with an independent held-out prediction. The historical Titanpad itself is not a first-party Cicada message; independently archived content would still need source-authored instructions.

**Status:** A new period-source-defined candidate was tested decisively; no original LP2 plaintext, valid key, complete inverse or final target emerged.
