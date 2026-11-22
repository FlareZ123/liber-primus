# LP2 p0–2: thirteen prime-sized columns and chain/prime inverse gate

**Status (Agent 19, 22 November 2026): conditional exclusion; no unknown plaintext, original key, or source-selected operation recovered.** [Read-only CommonJS SFT](../sims/lp2_p0_13prime_irregular_column_chain_sft.cjs). This report isolates one inexpensive, plausible use of an existing p0 opening-key *candidate* and stops that branch at its untouched original-cipher test. It must not be promoted to an established decryption.

## Original clue and competing explanation

The 2016 Cicada-signed message says “epiphany seeks the devoted,” and the original p0 opening contains two red words of eight and five GP runes. The previously proposed **EPIPHANY SEEKS** crib fits that word shape but remains unverified as unknown-page plaintext. If the crib is assumed, subtraction of its thirteen canonical GP0 letters from the thirteen actual p0 ciphertext runes gives the unique aligned pad

\`\`\`text
26 24 8 19 27 24 18 3 0 8 0 16 19
\`\`\`

Its *Gematria Primus prime values* are

\`\`\`text
103 97 23 71 107 97 67 7 2 23 2 59 71
\`\`\`

whose sum is **729**, exactly the original rune count of p0+p1+p2 = 262+266+201 = 729. The 729 match and conditional crib are pre-existing observations, not a new plaintext recovery. The independently authenticated 2016 phrase is evidence for a possible human route; it does **not** authenticate the proposed p0 reading or select a cipher. A natural alternative is a retrospective coincidence among many possible cribs and arithmetic summaries.

A 13-rune key with prime-valued lengths suggests a *finite*, genuinely reversible unequal-column arrangement: arrange all 729 original source runes into thirteen columns of those exact heights, then read them row-wise, or perform the inverse row-wise-fill/column-wise-read operation. Two physical key orientations, as printed or wholly reversed, give exactly **four** fixed candidate reconstructions. This uses the complete p0–2 corpus once, with no omitted glyphs, moved word boundaries, adjusted parameters, or decrypted text from the test set.

## Complete source-input experiment

After each reconstruction, examine the only inexpensive, author-plausible plaintext inverses capable of converting a flat GP ciphertext into prose without a new high-entropy secret:

- **Chained predecessor differences:** \`D[i] = X[i] − X[i−1] mod 29\`. Even granting an arbitrary *stationary secret bijection* of all 29 step values, the complete output's symbol collision statistic is invariant. This is a stronger exclusion than trying an arbitrary one-letter substitution key.
- **Direct prime/totient clock:** \`P[i] = X[i] ± (prime[i]−1) mod 29\`, motivated by the authenticated p56 key family, with the first prime and beginning position fixed.
- **Prime/totient clock on chained differences:** \`P[i] = D[i] ± (prime[i]−1) mod 29\`, using the corresponding original positions.

These are five streams per column arrangement, **20 original-cipher inverse tests**, fixed by the proposed mechanism. The test does not claim to cover the authentic p56 plaintext-F bypass, alternative clock starts, additional private keys, or changing secret step maps.

The primary diagnostic is normalized GP29 index of coincidence, random baseline ≈1.00. The first **729 GP runes of solved original LP1 sections 3 and 6** provide a source-native English control at **1.704224**. The four original source reconstructions give:

| Unequal-column operation | Orientation | Stationary-bijection step IC | Direct φ-prime IC (− / +) | Chained φ-prime IC (− / +) |
| --- | --- | ---: | ---: | ---: |
| Columns → rows | Forward | 1.007002 | 1.000415 / 0.982710 | 0.989139 / 1.006564 |
| Rows → columns | Forward | 0.984756 | 0.996152 / 0.983475 | 0.994181 / 0.994071 |
| Columns → rows | Reversed | 1.003715 | 0.992109 / 1.009158 | 0.990016 / 1.019605 |
| Rows → columns | Reversed | 0.986729 | 0.999540 / 1.004458 | 1.005249 / 0.999002 |

All twenty original runs stay within **0.982710–1.019605**, near the uniform GP29 baseline. No output has the collision concentration of the held-out native original-LP1 English register. Direct unequal-column permutation also preserves the original raw GP29 symbol histogram, so it alone cannot create English-letter frequencies.

**Positive encoders:** For *every* column orientation/direction, an independently planted native-GP plaintext was encoded and recovered exactly under three complete, invertible constructions: (1) an arbitrary secret permuted chain-step alphabet \`(11p+7) mod29\` with inverse \`8(step−7) mod29\`; (2) direct first-prime-totient masking; and (3) first-prime-totient masking on chained steps. **12/12 full-register source-native synthetic controls roundtrip**, including all 729 transmitted cells. The candidate cryptanalytic families therefore have real test power under the specified operations; the negative source result is not a broken inverse implementation. All computations were independently executed against the repository's canonical GP arrays in this invocation, and the SFT retains the exact code and inputs.

## Causal decision

The source-derived **729** coincidence does not supply the missing decoder. It gives a precise, affordable test: the four literal prime-height transpositions followed by arbitrary stationary 29-way step-symbol mapping or the simple p56-derived prime clocks. All fail on original p0–2. Retire this **specific** chain/prime transposition explanation. Do not rescue it with independently chosen column orders, offsets, key schedules, or hidden layers selected after viewing English scores.

The more plausible unresolved routes remain a source-selected stateful operation changing within a word or chapter, or an external key/material that actually fixes the unknown-page alphabet. If a new primary Cicada instruction selects a *different* column order or an explicit two-stage inverse, revisit that uniquely specified operation and demand a contiguous plaintext plus an unselected original holdout. The observed prime-height arithmetic alone is intermediate evidence, not cipher recovery.
