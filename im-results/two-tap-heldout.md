# LP2 two-tap affine recurrence: held-out model search (2026-11-10)

**Classification: experimental negative result with positive controls.** No new LP2 plaintext, cryptographic key, cipher mechanism, or intended destination has been recovered. This document describes a concrete, bounded class of additive two-tap hypotheses and the predictive experiment that failed to support them.

## Cryptanalytic question

An independently reported feature of the unresolved LP2 text is the sparse **word-internal lag-6 echo**, approximately \`C[j] = 24 - 2*C[j-6] (mod 29)\`. Could that echo be the visible residue of a stronger linear dependency involving another earlier rune?

Examine a fixed model over the 29-index Gematria Primus alphabet:

\`\`\`text
C[j] = a*C[j-d1] + b*C[j-d2] + k  (mod 29)
\`\`\`

Only rune pairs **within the same whole word** contribute. Both coefficients must be nonzero, and 1 <= d1 < d2 <= 8. This family contains **636,608** slope/offset/lag combinations. The targeted lane fixes d2=6 and b=27 (-2 mod29), retains d1=1..5 and arbitrary nonzero a plus k; it contains **4,060** combinations. The targeted model deliberately excludes a=0, which would simply restate the known single-tap echo.

This tests an explicit mathematical structure, independent of a language model. It is not a test of all two-tap nonlinear repair rules, time-varying coefficients, unknown alphabet permutations, or interactions triggered only at unpredictable sparse collision sites.

## Inputs and guarding against false word breaks

Use \`resources/transcriptions/liber_primus_master.txt\`, starting at the LP2 page-0 incipit \`ᛋᚻᛖᚩᚷᛗᛡᚠ\`, ending after LP2 page 55. The numeric grid page 50 contributes no rune words. Convert the 29 Unicode runes in canonical index order, discard line (\`/\`) and page (\`%\`) markers, and split **only** at \`-\`, \`.\`, \`&\`, \`$\`, or \`§\`.

This yields precisely **2,896 complete rune-words** containing **12,956 runes**, including words spanning physical page boundaries. The eligible lag-6 sites total 1,290, split across the training and validation sets as 658 and 632. This avoids the previously identified regression of making 2,928 page-local fragments.

Train on even-numbered complete words (zero-based index), then evaluate the selected coefficients and offset on odd-numbered words; reverse the split as an independent check. The descriptive z-statistic is

\`\`\`text
z = (hits - n/29) / sqrt(n*(1/29)*(28/29))
\`\`\`

Its binomial reference is a screening convention, **not** a calibrated p-value: symbols within words are dependent, and both anti-repeat suppression and the existing sparse echo can alter individual residual probabilities. The diagnostic requirement is cross-split replication, supported by a test with planted recoverable rules.

## Executed result

Manual GitHub Actions run [42740735521](https://github.com/FlareZ123/liber-primus/actions/runs/42740735521) succeeded on 2026-11-10, executing \`sims/two_tap_heldout.cjs\` with Node.js. Each candidate is selected by its **training-set maximum**, so that maximum is subject to a large look-elsewhere effect.

| Model family and split | Selected (d1,d2,a,b,k) | Training hits / sites (z) | Independent test hits / sites (z) |
|---|---|---:|---:|
| Full, even→odd | (4,6,25,2,24) | 50 / 658 (+5.835) | 19 / 632 (−0.609) |
| Full, odd→even | (6,7,13,21,0) | 33 / 364 (+5.874) | 10 / 367 (−0.760) |
| Six-focused, even→odd | (1,6,22,27,23) | 39 / 658 (+3.485) | 17 / 632 (−1.045) |
| Six-focused, odd→even | (5,6,17,27,24) | 41 / 632 (+4.187) | 22 / 658 (−0.147) |

The two full-family training champions have different lag geometry and coefficients, and both immediately lose their apparent excess on the other half. The narrower six-focused lane behaves similarly. There is no validated two-tap recurrence in either family.

### Planted controls

The script inserts the exact rule into individual eligible positions at a fixed pseudorandom probability, retaining the other real LP2 ciphertext runes and their word lengths. Fixed seed \`0x289fab71\`:

| Control | Injected sites / eligible | Selected rule | Validation z |
|---|---:|---|---:|
| Six-focused, 4% injection probability | 55 / 1,290 | **Exact planted** (2,6,7,27,5) | +7.893 |
| Full, 8% injection probability | 108 / 1,290 | **Exact planted** (2,6,11,7,5) | +10.727 |

Both controls correctly recover the deliberately inserted coefficients, offsets and lag distances in the training set and carry substantial excess into the held-out set. These **single-seed demonstrations** establish functionality for the chosen scenarios; they are not a general power estimate at 3%, across randomized keys, or for sparse repair-triggered dependencies.

## Research implication and remaining opening

A fixed, word-internal, two-tap modular affine rule responsible for a substantial fraction of eligible rune positions has no support in the tested LP2 corpus. Training-set scores above five sigma can be model-selection artifacts when hundreds of thousands of settings are searched. Independent validation is mandatory before claiming a decipherment.

The sparse lag-6 echo remains unexplained. A rule acting on only around 2–3% of eligible sites, or selected by hidden key state or collisions, can fall below this wide search's sensitivity. This experiment does **not** exclude that possibility, nor does it exclude a two-layer encryption or an external keystream. A stronger next attack would model collision events directly and compare predictions on untouched positions, rather than expand this same unstructured parameter scan.

**Reproduction:** \`sims/two_tap_heldout.cjs\`; optional workflow \`.github/workflows/two-tap-heldout.yml\`, dispatch-only. No per-commit CI is enabled. Source data is already retained in the repository. The script prints the selected candidates, validation counts, synthetic seeds and exact planted parameters. The results remain in \`im-results/\` rather than being promoted to the authoritative \`results/README.md\`.
