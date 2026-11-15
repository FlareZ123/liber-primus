# H/G source quotient: 84 adjacent GP29 triples match ten known p56 prime-key cells at the printed phase

**Agent50, 15 November 2026; provisional source-key correlation with 74 contradictions. No unknown plaintext, complete key or actual method recovered.**

## One source-motivated transfer to a real known key

The original LP2 pp49–51 **256 base60 numerals**, interpreted in GP29 over the printed row-major order, form a polynomial divisible without remainder by the exact product of two independently material sources: **H=[3,26,24]**, the historic Cicada-signed 2013 BASE29 \`3301=3QO\` coefficients, and **G=[27,5,15]**, the p39 three-red-rune quadratic. This existing established [table factorization](lp2-grid-complete-gf29-factorization.md) has a **formal 252-coefficient quotient Q** in descending source order, beginning \`[0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21,7,21,18,7]\`.

Exactly **252 = 3×84**, and independently solved p56 uses exactly **84 consecutive primes' totients modulo29**, consuming one key element per cipher rune except for its single literal F at local index56, leaving 84 key-bearing runes out of 85. This suggests a finite, key-recovery-targeted test: group the source-original H/G quotient as **84 consecutive triples** and compute **the arithmetic sum of each triple modulo29**, a historically used GP29 primitive. Compare the resulting 84-rune candidate key in original order against the **unfitted, known p56 key** \`(prime_i−1) mod29\` starting with 1,2,4,6,10,12. All input bytes, factor coefficients, quotient direction, key clock and source alignment remain fixed.

## What the original material actually yields

The direct candidate agrees with the genuine p56 key at **ten of 84 indices** (zero-based):

\`\`\`text
2, 15, 21, 29, 31, 38, 42, 43, 57, 80
\`\`\`

The ten corresponding known prime values are **[5,53,79,113,131,167,191,193,271,419]**. These matches are spread across the source run; **74/84 fail**. A complete key recovery would require 84/84, so the original three-sum tape **does not decrypt p56**, and cannot legitimately be transferred as an authentic p55 key.

**A specific alignment anomaly worth preserving:** holding the exact 84 source candidate GP29 indices fixed, compare all **84 circular rotations of the known p56 prime key**. The unrotated source phase has **10 matches and is the unique maximum**; the runner-up has **7**, at shifts33 and63. Only **one of 84 exact rotations** ties/exceeds the unrotated count. This is a *conditional positional comparison*, not a discovery-adjusted probability of authorial design. With a simplistic independent-uniform GP29 null, the tail of ≥10 matches in 84 draws is about **0.000638**, or roughly **0.00383** after a six-version union bound. These values do **not** adjust for the large wider project's repeated source and cipher explorations, correlated triplet symbols, or our post hoc observation of the 3×84 coincidence. They are insufficient to authenticate any cipher method.

For context the exact six *frozen* three-share readouts are:

| Reading 252 quotient values as | Three-share operation | Correct prime-key symbols / 84 | Invalid GP29 outputs |
| --- | --- | ---: | ---: |
| Three contiguous 84-rune blocks | XOR | 1 | 7 |
| Three contiguous 84-rune blocks | Shamir \`3A−3B+C mod29\` | 3 | 0 |
| Three contiguous 84-rune blocks | Sum \`A+B+C mod29\` | 3 | 0 |
| Three successive values per position (84 triples) | XOR | 2 | 6 |
| Three successive values per position (84 triples) | Shamir \`3A−3B+C mod29\` | 1 | 0 |
| **Three successive values per position (84 triples)** | **Sum \`A+B+C mod29\`** | **10** | **0** |

A real positive plant constructs a complete **256-source-cell synthetic polynomial** by multiplying H×G by **84 exact known prime-key triples** of form \`[key_i,0,0]\`. The same factor quotient and consecutive-triple sum then **recovers 84/84** exact key values with no source parameter fitting. All 256 original numerical table bytes and original p56 F-bypass/known prime clock remain untouched during the actual test.

## Research decision

The source sizes, polynomial factor and original p56 prime clock make this an **interpretable and reproducible tentative key-hand-off pattern**, worth retaining if a separate Cicada clue later singles out grouping three quotient values and adding them. The 74 contradictions and extensive prior source exploration prevent calling it a discovery of original key material. No phase offsets, modulo corrections, special skips or extra ciphers should be added after the fact to force the remaining 74. In particular, the unique top-ranked printed phase is a property of this particular 84-position comparison, not validation of the hypothesized operation.

**Reproduction:** [single read-only Windows Node22 CommonJS original/plant SFT](../sims/lp2_q252_triples_p56_knownprime_handoff_sft.cjs), sourced solely from [canonical original p50 bytes](../resources/liber-primus/lp2-grid-256.json) and [LP2 rune corpus](../resources/liber-primus/lp2-corpus.json). This is intermediate evidence; the authoritative \`results/\` synthesis is unchanged pending a genuine complete-key or withheld-plaintext result.
