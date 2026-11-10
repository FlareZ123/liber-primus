# Long-period crib and exclusion-rank inversion on the 56 unsolved LP2 pages

**Classification:** independently executable negative tests of two precise cipher families; no recovered LP2 plaintext, key, or destination. Agent 33, 2026-11-10. The existing verified repeated ciphertext phrase remains a structural observation, not a plaintext crib.

## Inversion 1: 28 symbols selected by excluding the previous rune

The original 12,956 LP2 ciphertext runes have only **86 adjacent equal-rune transitions** in their eight logical text sections. A direct mechanism that would explain such a deficit encodes a 28-symbol masked plaintext letter \`Y\` by selecting it from the ordered 29-symbol Gematria Primus alphabet *with the previous ciphertext rune omitted*. If previous output is \`a\`, output is \`C = Y + 1[Y >= a]\`; for every nonrepeated output, the exact inverse is \`Y = C - 1[C > a]\`. Eight section-first runes and 86 doublets are erasures. This is a genuine reversible candidate mechanism, requiring no fitted substitution alphabet.

A specific cryptanalytic hypothesis is \`Y=(P+K[t mod p]) mod28\`, with a key of period \`2..256\` restarting in each of the eight sections. An independent GP-English unigram prior was estimated from 30,000 GP-encoded runes of bundled Shakespeare. For every \`p\`, fit each key residue on original sections 0–3 **only**, then evaluate log likelihood relative to uniform plaintext on disjoint sections 4–7. Rank every period by locked holdout score. Calibrate the family maximum by 100 independent rotations of each heldout section, preserving its symbols, erasures and local order.

[Successful one-time run 42757470025](https://github.com/FlareZ123/liber-primus/actions/runs/42757470025) obtained **12,862 exactly invertible nonrepeat runes**, plus 94 erasures. The winning original period was **174**, heldout score **−0.8901964 log-likelihood units per rune relative to uniform** across 7,389 scored holdout runes. The matched null's mean best score was **−0.9025796**, maximum **−0.8636907**; familywise upper-tail **p=0.08911**. Every selected real decode scored strongly below the uniform language-reference benchmark and yielded no readable plaintext.

A separate positive used genuine GP-encoded Shakespeare from an independent segment, an actual random 31-residue mod28 key, and 92 seeded forced doublet overwrites. The *same unrestricted search* ranked the correct **period 31 first**, recovered the exact **31/31 key symbols**, and achieved **+0.4175724 per rune** on heldout plaintext. This establishes power for the stated simple repeated-key model despite deliberate repeat exceptions. It does not establish power against non-English plaintext, nonlinear key schedules, unknown alphabet permutations, or arbitrary key-pointer skips.

Reproducer: [\`sims/exclusion_rank_key_recovery.cjs\`](../sims/exclusion_rank_key_recovery.cjs). CI: manual-only [\`exclusion-rank-key-recovery.yml\`](../.github/workflows/exclusion-rank-key-recovery.yml).

## Inversion 2: periods forced by the duplicated six-rune phrase

The exact two-word ciphertext \`ᛞᛄᚢ-ᛒᛖᛁ\` occurs on LP2 pages **27** and **54**, at page rune offsets **28** and **70**, section offsets **28** and **3,310** in sections 5 and 7, and absolute rune offsets **6,555** and **12,950** (zero-based). If both ciphertext passages encode the *same* plaintext and share a single deterministic periodic key, their alignment suggests:

| Key reset model | Displacement | Relevant periods |
|---|---:|---|
| At each physical page | 42 | 42 or any divisor |
| At each of eight logical sections | 3,282 = 6×547 | 547, 1,094, 1,641, 3,282 (smaller divisors previously screened) |
| Continuous manuscript key | 6,395 = 5×1,279 | 5, 1,279, 6,395 |

These are **conditional hypotheses**: the two ciphertext occurrences could share no plaintext, be an explicitly repeated marker, or reflect a cipher unrelated to repeating-key additive models.

For each proposed period, compare only symbol pairs taken from **different pages or sections** but at the same putative key phase. This tests global key reuse even if a proposed period exceeds a particular page length. Run the comparison on the original mod29 runes and on the exact 28-symbol inverse defined above. **Exclude all twelve runes of the repeated phrase from every comparison** so the original clue cannot increase its own matching statistic. For the section model key phases begin at section zero; for the global model phases advance continuously. The complete 16-way search is calibrated with 300 seeded independent cyclic rotations of each original page or section, recomputing the maximum selected score on every null.

[Successful one-time run 42758275188](https://github.com/FlareZ123/liber-primus/actions/runs/42758275188) obtained search-corrected **upper-tail p=0.56478**, with observed maximum descriptive standardized deviation **+1.39385** from the raw 1/alphabet null. Illustrative original matched rates:

| Model | Period | Raw equal-rate | Inverse-rank equal-rate |
|---|---:|---:|---:|
| Physical page reset | 42 | 0.034396 | 0.035590 |
| Section reset | 547 | 0.034885 | 0.036268 |
| Section reset | 1,094 | 0.034852 | 0.036720 |
| Section reset | 3,282 | 0.033865 | 0.035251 |
| Continuous | 1,279 | 0.035195 | 0.036252 |
| Continuous | 6,395 | 0.029065 | 0.031775 |

Uniform benchmarks: **1/29 = 0.034483** for original GP runes, **1/28 = 0.035714** for invertible rank symbols. The descriptive standardized statistic is **not** treated as an independent-pairs normal p-value; phase pairs are dependent. The empirical 300 full-search null rotations supply the actual significance calibration.

**Eight independent planted controls** use the held-out portion of genuine Shakespeare GP text, a seeded repeating key, anti-repeat repair or 28-rank encoding, and the exact source page/section lengths. For period 42 page reset, period 547 section reset, and continuous periods 1,279 and 6,395 in both alphabet families, controlled same-phase match scores were **+10.81 to +202.09** on the same descriptive scale. All eight controls passed. The original manuscript has no corresponding signal.

Reproducer: [\`sims/repeated_phrase_key_periods.cjs\`](../sims/repeated_phrase_key_periods.cjs). CI: manual-only [\`repeated-phrase-key-periods.yml\`](../.github/workflows/repeated-phrase-key-periods.yml).

## Consequence and next inversion priority

The explicit repetition-derived periods do not explain the surrounding manuscript as a **single shared** page-, section-, or manuscript-reset additive key in either tested alphabet architecture. The anti-repeat statistic is compatible with a far larger range of mechanisms, including multiplicatively masked nonzero field increments modulo 29, independent pads, unknown language mappings, and state-dependent key consumption. In particular, the **field-unit multiplicative model** \`ΔC = (P+1)·K mod29\` with nonzero \`K\` would yield uniformly distributed nonzero differences, while the 29th rune maps to zero increments. It is a distinct, mathematically motivated inversion family worth testing against independently sourced key material; the present experiments do not cover it.

No result on this page changes the manuscript's unresolved status in [\`results/README.md\`](../results/README.md).
