# Original-source PI/Fibonacci direct-rune inverse: finite negative

**Agent 1, 11 November 2026. Evidence class:** an original-cipher, explicitly scoped negative. No unknown page plaintext, authentic key, cryptographic mechanism or hidden destination recovered.

## Human-observable motivation and source commitments

The solved LP2 p57 *PARABLE* instructs the reader to shed *circumferences*. The p55 13/31 ornaments have prompted a PI mnemonic (provisional). Independently, the source-original p15 square is an exact spiral of sixteen Fibonacci-indexed prime constructions. Its first sixteen **distinct** Fibonacci numbers, in their spiral order, are

`0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987`.

One simple, inexpensive reading is to treat the mathematical constant PI as a running-key source and the observed p15 Fibonacci numbers as sixteen allowed starting offsets. Neither the p57 wording nor p15 square actually says to use PI digits as a key; this is a falsifiable source-motivated interpretation, rather than an independently selected solution.

Freeze four direct source/register combinations: (1) PI fractional digits in base29, direct GP29 addition; (2) PI **decimal** fractional digits, direct GP29 addition; (3) PI fractional digits in base28, the 28 nonzero ciphertext-predecessor-step register with a zero step emitted as EA; and (4) PI decimal fractional digits in that step register. For each, test only original p15's sixteen Fibonacci phases, both signs and a book-continuous clock versus physical-page reset, giving **4×16×2×2 = 256** exact original-input candidates.

Direct register: `P_i=(C_i ± K_j) mod29`. The step register treats the first rune on each physical page as an unchanged IV, `C_i=C_(i-1)` as plaintext EA/index28 without clock consumption, and otherwise sets `P_i=((C_i−C_(i−1) mod29)−1 ± K_j) mod28`. In the book-continuous version the key clock survives page transitions; only each page's IV output is exempt. For direct GP29 every ciphertext rune consumes one key value. No key-byte changes, reference-plaintext cribs, word alignment or arbitrary numerical offsets are fitted.

Reproduce PI exactly through 25,000 decimal places with Chudnovsky binary splitting and an integer square root. Its first digits are `314159265358979323846264338327950288419716939937510582097494`; base29 fractional digits begin `4,3,2,8,23,0,12,19,26,22,19,26,12,11,9,18,4`, and base28 begin `3,27,0,6,21,18,24,19,25,21,27,10,7,7,4,7`. Generate 15,000 digits per nondecimal base; this is enough for all 12,956 original ciphertext runes plus the maximum 987-symbol Fibonacci phase **without wrapping or repeating the digits**. The initial exploratory precision bug is discarded; every result below is from verified PI.

## Frozen original-input result

Fit each of the 256 models **only** by average GP29 native-language unigram log-likelihood on the first 28 rune-bearing physical pages, p0–27, using the already-pinned Gibran GP spelling control. Evaluate the other 27 rune-bearing physical pages p28–55 without refitting. A direct single-rune GP-English reference register has log score about **−2.9620 per rune**. The raw original ciphertext's score is **−4.31489**.

| Candidate selected by frozen training | First 28 pages | Remaining pages |
| --- | ---: | ---: |
| Best: PI base28, predecessor-step GP28, continuous clock, minus, **Fibonacci phase8** | **−4.23085124** | **−4.28604895** |
| PI base28 step, page reset, minus, phase0 | −4.23908341 | −4.29546222 |
| PI base28 step, page reset, minus, phase233 | −4.23981514 | −4.25274827 |

The selected model's holdout symbol IoC is **0.03523653**, close to GP28 uniform **1/28≈0.03571429**. The strongest original **retrospective holdout** fit across all 256 models, which would be invalid for claiming a discovery, is only **−4.22116208** (PI decimal, direct GP29, continuous clock, minus, phase2). All output passages remain nonlinguistic. The standalone SFT also constructs independent native-GP plaintext plants in both exact reversible output channels, forward encrypts and decodes the plants, and checks 1,000/1,000 runes per channel.

## Decision

**Retire these 256 straight PI/Fibonacci offset schemes** as direct native-GP plaintext decoders. The role of circumference and the exact p15 prime spiral remain open; PI was an inferred and unconfirmed source. A source-visible reason to use a different word/state update, numeric stream or intermediate representation would be required before further investigation. No broad enumeration of arbitrary PI digit bases, per-page clocks, offsets or non-source-specified transforms is justified by this result.

**Standalone reproduction:** [`sims/lp2_pi_fibonacci_source_inverse_sft.cjs`](../sims/lp2_pi_fibonacci_source_inverse_sft.cjs), using `resources/liber-primus/lp2-corpus.json` and `resources/control/gibran_prophet_58585.txt`. Node.js 22, no external packages.