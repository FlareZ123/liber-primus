# Original LP2 bidirectional BASE29 carry law — shared-key recovery gate

**Agent35, 24 November 2026, Director #2456.** No unknown plaintext or authentic key recovered. A compact two-direction cross-rune law with a fixed observable per-chapter initializer is rejected in the tested finite scope, conditional on ordinary native GP29 lexical distributions.

## Source evidence and fixed hypothesis

The signed [2013 TCP challenge](../resources/external/2013-tcp-server-signed-source.md) explicitly demonstrates BASE29(3301)=3QO. LP2's original red headings separate visible chapter rubrics from black body text; p13 and p14 print opposite-facing tree art. These are independent source facts. They motivate an exploratory positional arithmetic architecture that works across both digit directions, but do **not** explicitly select multiplication, seed reuse, or a block-cipher operation. The rival remains an independent external keystream or an entirely different changing-state law. No claim of authorship is made.

A fixed single-direction compatible BASE29 integer transform, even with arbitrary secret digit order, has a protected residue modulo29 (see [prior whole-word study](lp2-word-base29-additive-allsecret-carry.md)). The new construction composes two opposite-direction carry traversals of the *entire original black chapter-opening block*. It is not the previously tested adjacent-word two-shear or fixed five-stream carried matrix. Its hypothesis and train/holdout division were [frozen on issue #2456](https://github.com/FlareZ123/liber-primus/issues/2456#issuecomment-7118088605) before the model outputs were generated.

For shared nonzero multiplier a and initial integer carry s, traverse a fixed-width rune block in one direction. At each rune x, output y=(a*x+s) mod29 and update s=floor((a*x+s)/29). Discard the final overflow. Invert by computing x=(y-s)*a^{-1} mod29 and recomputing the carry. Each pass is equivalent to modular integer multiplication plus the starting carry in that traversal's significance order. Compose a left-to-right pass with a right-to-left pass, using separate shared multipliers a,b in 1..28 and restarting both passes at the same observed rubric prime sum. Reverse the pass order for decryption. This yields exactly 784 parameter pairs (less than 10 bits), includes genuinely cross-rune mixing, and admits exact length-preserving inversion without unknown overflow.

| Original physical receiver | Black runes | Complete words | Red title runes | Initial carry |
|---|---:|---:|---:|---:|
| p0–2, training | 716 | 156 | 13 | 662 |
| p3 first black paragraph, held out | 103 | 19 | 16 | 742 |
| p8–14 opening body, held out | 1,717 | 381 | 12 | 446 |

Each body is parsed at original complete-word boundaries, including page carries, and verified rune-for-rune against canonical corpus pages. Red title and punctuation offsets come from the repository's original-image-adjudicated annotations. The p8 title boundary is the physical ink transition. These observable inputs are not secret fitted parameters.

## Recovery experiment

Freeze a lexical scorer before inspecting candidates: convert the separate Shakespeare reference to GP29 using the repository's standard QU→CW, V→U, K/Q→C, Z→S and ING/IO convention. Score each original-layout candidate by its smoothed within-word bigram/unigram log probability plus four natural-log units per rune in a dictionary-matching word, normalized per rune. Exhaustively choose the best key using **only p0–2**. Apply that single key without adjustment to both withheld receivers. The score is a heuristic selection objective, not a probability of authorship.

Four layout-matched positive controls use Gibran words sampled by exact original rune length (the reference includes some Gutenberg boilerplate). These are native-format lexical plants, not coherent continuous Gibran passages. In each trial the recovery routine receives only the training ciphertext, lengths, and public seed, not the chosen multipliers or plant plaintext. The true shared pairs were (19,7), (26,24), (15,18), (25,14), all independently recovered. All **10,144** planted runes across four trials and three blocks recover exactly. Thirty-two independent-pad controls encrypt independently sampled layout-matched words with independently generated uniform-mod29 pseudorandom shifts; apply the identical 784-law training search and freeze the winner for holdouts. PRNG xorshift32 seed 0x24563301. Modulo reduction of 32-bit draws introduces negligible bias; this finite comparison is not a formal calibrated tail probability.

## Original result

The training winner is (14,14). Its exact original forward replay passes on all three blocks, but this holds for any valid key and supplies no key identification.

| Receiver | Original candidate score | Exact dictionary rune coverage | GP29 IoC | Max null score | Plant coverage range |
|---|---:|---:|---:|---:|---:|
| p0–2 | -4.783864 | 1.676% | .03426183 | -4.687831 | 60.75–69.97% |
| p3 | -5.060144 | .971% | .03331430 | -4.656671 | 45.63–61.17% |
| p8–14 | -5.025219 | .582% | .03433103 | -4.944560 | 66.45–68.14% |

10 of 32 null training maxima equal or exceed the original best score. Both untouched original blocks remain near uniform GP29 collision rates and nonprose. The original p0 output begins `HTHOEX AUE RWTH MAXCIOLRFING IAAWDY LJEP SNGS FAEO`; the independent p3 output begins `TSFA LEADIUYA SGDOEPEOE OENGGHRJ OEADAE TDMYDA`; p8 begins `ATHU EW YNGY PTDROEEOWEAY LSAEF LDAE YOEAEE WH`. No sustained English or source-selected key is recovered.

## Research decision

The low-description-length shared two-pass architecture is a calibrated negative under this exact clock, seed rule, multiplier range, and lexical model. The train/holdout split and planted recoveries distinguish this from a demonstration of arbitrary reversible replay. Do not enlarge the range, insert passes, tune seeds or search chapter-specific keys merely to rescue the theory. A genuinely new source instruction or a different independently justified block operation is required. This does not exclude arbitrary opposite-direction integer ciphers, hidden initialization, or plaintexts unlike the finite native controls.

Reproduce with Node.js 22 CommonJS: [standalone SFT](../sims/lp2_bidirectional_base29_rubric_carry_sharedlaw_sft.cjs). The experiment function was executed successfully against all five exact GitHub source files in the connected JavaScript runtime; standalone CI execution is not claimed.

Source blob SHAs: corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; ink 0614aca67969a14ae006e0c1ae6aee6dcd8136e6; transcript 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7; Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85; Gibran df260a07d56bf5998d40a6360b6132c35c252d10.
