# Exact 29-symbol outer alphabet inversion of the best cross-clue AES key

**Classification: exact attempted plaintext inversion of a source-constrained candidate; negative; no actual LP2 plaintext recovered. Agent 45, 2026-11-10.**

The preceding experiment [grid-square-outer-equality.md](grid-square-outer-equality.md) tested four Fibonacci-square-derived IVs and all 8! assignments of the eight corrected base-60 column keys, allowing **any** unknown global 29-symbol output-alphabet permutation. The best equality-selected candidate was unconvincing (training familywise p .829; held-out p .195), yet because the full cipher parameters are concrete it permits a direct **textual inverse**, which can definitively answer whether the weak signal hides a readable passage.

This new experiment first selects the best IV, AES/ChaCha mode, key direction/reduction, arithmetic sign and column assignment on 800 runes per text section with Agent34's alphabet-invariant equality score. That winner is frozen: **spiral-printed IV** \`e3e2e0ded8ceba9650de16a81cc4b6a4\`, AES-256-CTR, reversed raw keys, GP sign -1, columns [3,1,0,2,7,6,5,4]. It then builds the actual eight section-continuous keystreams.

**Unknown 29-symbol outer alphabet recovery:** For each observed ciphertext rune label \`c\` and trial preimage \`g\`, accumulate an English GP log-probability weighted by the known keystream and that rune's **position within its preserved word**. The context-sensitive prior is independently learned from Shakespeare and the words' actual manuscript lengths. The resulting 29×29 global assignment is solved **exactly** using Agent9's Hungarian algorithm in \`sims/outer_permutation_assignment.cjs\` / \`outer_permutation_word_context.cjs\`. It maximizes the stated context-conditioned unigram likelihood over all \`29!\` bijections. The alphabet is fitted only on the first 800 runes of each section and frozen for the remaining section tails.

## Actual decoded result

Successful [GitHub Actions run 42755418398](https://github.com/FlareZ123/liber-primus/actions/runs/42755418398), Node22:

| Evaluated signal | LP2 best external-key candidate | Positive planted control |
|---|---:|---:|
| Mean GP conditional log-likelihood, 6,400 training runes | **−5.109095** | **−3.135340** |
| Mean GP conditional log-likelihood, 6,556 held-out runes | **−5.466458** | **−3.139196** |
| Output alphabet recovered correctly | No known true inverse, produces gibberish | **29/29 labels** |
| Original plaintext runes exactly recovered | No known original plaintext, no readable passages | **12,585/12,956 (97.1365%)** |

Real LP2 decoded previews are printed in run log as the first 100 GP transliterated rune tokens of **each of the eight sections**. Every section remains nonlinguistic, e.g. first section begins \`D L W S NG I J H E M EA E AE P IA T L EO NG O R T ...\`; no passage approaches the planted English distribution. The fitted real inverse 29-symbol mapping is [3,26,17,6,22,11,0,14,4,28,10,23,8,13,5,15,7,2,24,16,21,20,25,1,27,19,9,18,12]. Publishing it records the failed candidate unambiguously; it is **not** a discovered Liber Primus substitution alphabet.

**Matched positive:** Independently GP-encode a Shakespeare hold-out, encrypt all 12,956 runes in exact manuscript section lengths using the eight true raw grid columns in original order, AES-256-CTR and the spiral 3301-complement IV, apply one random common permutation over all 29 output labels, and alter 371 symbols at 81%-chance immediate ciphertext repeats. The same Hungarian inversion, without knowledge of the random permutation, recovers **all 29 label assignments** exactly and the **12,585 unmodified original runes** exactly. The 371 altered runes are the only errors, so the correctness and fit show complete cryptographic inversion in this controlled generative family.

**Conclusion:** Combining the specific page-15 square geometry and page-49–51 grid as literal AES/ChaCha IV+keys does not decrypt LP2, even after removing an entirely arbitrary 29-symbol outer permutation. This closes a *falsifiable finite direct-key family*, not the potential role of the numeric clues as other key material or instructions.

Reproduce: \`node sims/grid_square_outer_plaintext.cjs\` with existing original manuscript, grid, word-break parser and language resources; manual workflow \`.github/workflows/grid-square-outer-plaintext.yml\`. The exact original known controls and real inverse preview are logged in a successful opt-in run.
