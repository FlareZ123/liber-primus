# LP2 lag-six affine echo survives word-multiset and doublet-conditioned nulls

**Classification:** independently reproduced ciphertext structural observation and a stronger conditional null. It is not a decipherment, recovered key, or cipher identification.

## Context and essential claim

The external [pnotisdev/cicada3301 study](https://github.com/pnotisdev/cicada3301/blob/main/STATUS.md) already identified an unexpected sparse word-internal relation between the rune at index \`i-6\` and the rune at \`i\` (zero-based positions, within each displayed ciphertext word):

\[
c_i = 24 - 2c_{i-6}\pmod {29}.
\]

The 29 rune indexes follow the canonical Gematria Primus alphabet, starting \`ᚠᚢᚦᚩᚱ\`. Within 2,896 ciphertext words containing 12,956 runes (the 55 rune-bearing pages of unsolved LP2), 559 words have at least seven runes. These give 1,290 eligible lag-six pairs. Exactly **80** match the specified affine relation, in **74 distinct words** (68 words have one matching pair, 6 have two).

The prior study's 80/1290 count is independently reproduced here. The new contribution is a stricter falsification control in which **each word retains its full empirical 29-rune frequency vector**, its length, and its **exact number of adjacent equal-rune pairs**. This explicitly controls both per-word composition and the known ciphertext doublet depletion, rather than comparing against independent uniform symbols.

## Exact test and results

For each of the 559 eligible words, uniformly permute its existing rune indexes by Fisher–Yates (up to negligible 32-bit modulo bias), rejecting permutations until that word's number of adjacent equal symbols equals its original value. Sample the 559 retained permutations independently and count the lag-six affine matches. Perform 3,000 whole-corpus replications using deterministic xorshift32 seed \`0x38a729bb\`.

| Statistic | Original LP2 | Conditional randomizations |
|---|---:|---:|
| Long words / lag-six pairs | 559 / 1,290 | Exactly preserved |
| Adjacent equal pairs inside long words | 26 | Exactly preserved per word |
| Lag-six affine matches | **80** | Mean **45.9337**, SD **6.5326**, min 24, max 75 |
| Standardized difference from null | **+5.215 SD** | No randomized manuscript reached 80 |
| Upper-tail Monte Carlo p | | **(0+1)/(3,000+1) = 0.0003332** |

The affine map \`T(x)=24-2x (mod 29)\` fixes index 8 and forms a 28-cycle on the other indexes. We also counted matches to all its 28 powers \`T^0,...,T^27\` under each same conditional randomized manuscript. Observed highest power was \`T^1\` with **80**; second-highest \`T^4\` with **58** and third-highest \`T^16\` with **57**. The conditional null average of the *largest* among 28 power counts was **58.374**; **0/3,000** maximum counts reached 80. Thus the empirical upper p for the specified **28-power orbit family** is **0.0003332**, too.

**Important multiple-testing limit:** The transform and lag came from prior exploratory work; the 28-power familywise correction here does **not** cover every affine transform, every lag, all other candidate formulas, and the source study's historical search. It confirms the known signal robustly against this particular stronger word-constrained control, without establishing discovery-wide significance.

## Why this matters and what it cannot establish

The excess cannot be attributed solely to the manuscript's collection of rune multisets in long words, nor solely to the count of repeated adjacent runes within them. It is a genuine additional ordering constraint under the specified null. It occurs in 74 different words, which argues against an isolated typographic anomaly.

This is compatible with an occasional deliberate rewrite/echo, correlated cipher state, transposition, constrained plaintext encoding, or another process that couples positions six apart. A complete affine autokey decryption **is not supported**: the external study explicitly tested such a model and did not recover meaningful plaintext. The external study also fitted a word-aware collision-repair simulation to several summary statistics; a good fit to summary counts is not independent key or plaintext evidence. Treat the echo as a measurable constraint that any recovered encryption model should reproduce, preferably as a held-out prediction.

The fixed-point rune index 8 contributes to all 28 powers by definition. All nonfixed values are assigned exactly one exponent per pair. No character mapping or word-boundary conventions are changed to improve the result.

## Reproduction

- Canonical input: \`resources/lp2-transcription.txt\`, selecting the first **55** \`%\`-delimited page records. The transcription omits the rune-free physical LP2 page 50; the final two records are **already-solved** AN END and PARABLE and must be excluded.
- Implementation: [\`sims/lag6_conditioned_echo.cjs\`](../sims/lag6_conditioned_echo.cjs), Node.js CommonJS, only built-in modules, deterministic seed and 3,000 replicates by default. The program prints its input SHA-256, observations and full null summary as JSON.
- Independent first computation: same corpus, sample mechanism and seed executed with GitHub-sourced original text through the research runtime; the program records the procedure for exact rerun. The corpus counts were checked separately before writing the program.
- Historical prior art: [pnotisdev/cicada3301 STATUS](https://github.com/pnotisdev/cicada3301/blob/main/STATUS.md), particularly the lag-six echo and negative affine-feedback sections; [registry experiment summaries](https://github.com/pnotisdev/cicada3301/blob/main/docs/registry.toml), especially \`echo-two-tap\`, \`lag-feedback\`, and \`echo-mechanisms\`.

The most useful follow-up is a testable generative rule that predicts *which* observed 80 sites are special from surrounding ciphertext or independent puzzle material, and then predicts its behavior on held-out LP2 sections. Formula search in the existing residue alone risks reidentifying the same sparse echo without unlocking plaintext.
