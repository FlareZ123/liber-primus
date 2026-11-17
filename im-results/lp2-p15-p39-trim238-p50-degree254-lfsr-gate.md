# P15's 16-number spiral and p39's 238 interior runes as the p50 polynomial state

**17 November 2026 · Agent49. Evidence class:** new source-clue-conditioned exact construction and two bounded original-cipher negatives. This test recovered **no unknown LP2 plaintext**, authentic creator key, or new destination.

## Human solve-path selector

Physical p15 contains 16 displayed Fibonacci-prime spiral magnitudes, visibly anchored at the red **3299**. Physical p39 contains **240 GP29 runes** and its independent highlighted three-rune quadratic, whose associated double root divides the p50 polynomial. The clear p57 *PARABLE* instructs the reader to "shed our own circumferences." If that instruction applies to p39 **as a whole page**, stripping **one first and one final rune** leaves exactly **238** original p39 interior runes. This proposed source operand differs from p36's already-known 238 total runes and does not alter the red triad at local offsets 119–121.

Independently, the 256 printed base-60 bytes of physical pp49–51 have a first coefficient divisible by29. In highest-degree-first order, the complete grid reduces to an exactly monic **degree-254 polynomial** over GP's 29-element field, after removing that one leading zero. Its documented factorization is **degree16 × degree238**. The prospective source state length therefore fits *both* the complete recurrence (16+238=254) and its factorized recurrence (16,238 independently). The 238-length match requires applying p57's circumference metaphor to a whole page, and the selection of a polynomial feedback cipher remains a **human-solve hypothesis**. There is no authentic instruction to run an LFSR or to designate these two pages as its state.

## Two completely fixed original-cipher receivers

Use p15's **printed red-3299-anchored Fibonacci-indexed spiral**, with the mathematically inferred signs before reducing its 16 values mod29. Read p39's printed runes at original positions1..238, excluding only its first and last rune. These are the *entire* seeds; no inferred fillers, key guesses, fitted primes, position search, hidden IV or original plaintext fitting.

The p50 byte SHA256 is \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`. Reduce table bytes mod29, remove the leading zero and normalize the next coefficient to 1, obtaining degree254 polynomial **P**. Its established monic degree16 small-factor product **F16** divides P with zero remainder, leaving monic degree238 **R238**. Both operations below use the standard field recurrence generated from exactly the source-fixed full state:

1. **Single degree254 stream:** concatenate p15's 16 residues with p39's 238 trimmed-rune GP indices and generate subsequent keystream using P.
2. **Factor-sum stream:** separately generate subsequent sequences using p15's 16 residues and F16, and p39's 238 residues and R238; add them mod29. The resulting stream obeys the composite degree254 polynomial because the source factors are coprime.

Start each keystream immediately **after** its complete source seed, then decode all original 12,956 ciphertext runes without page reset under both C−K and C+K. The only reported original scopes are the entire ciphertext stream, p0, and the independent physical p40–53 chapter (2,408 runes).

| Fixed stream | Original inverse | Whole LP2 IoC | P0 IoC | Independent p40–53 IoC |
|---|---|---:|---:|---:|
| Full concatenated seed | C−K | **0.03447542** | 0.03334211 | 0.03439846 |
| Full concatenated seed | C+K | **0.03446633** | 0.03483373 | 0.03451410 |
| Independent factor streams, summed | C−K | **0.03448705** | 0.03734901 | 0.03451211 |
| Independent factor streams, summed | C+K | **0.03445110** | 0.03571115 | 0.03436131 |

The untouched whole-ciphertext GP29 IoC is **0.03447840**, while authentic solved p57 has **0.06270997**. None of the four operations produces readable source-native GP29 plaintext, including the untouched p40–53 holdout. The standalone CommonJS source SFT [\`sims/lp2_p15_p39_trim238_p50_degree254_lfsr_sft.cjs\`](../sims/lp2_p15_p39_trim238_p50_degree254_lfsr_sft.cjs) asserts original lengths, p39 red triad, p15 authentic magnitudes, table byte SHA256, exact polynomial factorization, all 12 original output IoCs, reversibility over all original runes, and an independent 12,956-rune repeated solved-p57 synthetic plant.

## Decision and limits

The *literal p57-circumference-trimmed p39 + p15-source-spiral* state is a distinct source-coherent competitor to [the earlier p15 + untrimmed p36 238-rune composite LFSR negative](p50-degree254-composite-lfsr-p15-p36-gate.md). The simpler **single-degree254 and sum-of-factors additive recurrence consumers** are both rejected as ordinary English GP29 plaintext inverses on the original manuscript. This test does **not** disprove the underlying table factorization, the p39 red double root, a different interpretation of p57's metaphor, a stateful/nonlinear or transport-layer consumer, missing historical key material, or plaintext unrelated to the sampled native-GP language profile. Neither more clocks nor more source operands should be added without an independent author-selected operation and a whole withheld original plaintext recovery.
