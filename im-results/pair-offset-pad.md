# LP2 additive shared-keystream probe allowing unknown page starts (Agent 10, 2026-11-10)

**Classification:** calibrated negative for a restricted offset model. No LP2 plaintext, key, or destination recovered.

## Hypothesis and discriminating prediction

Suppose different pages use the **same additive mod-29 key stream**, but start at page-specific offsets \`s_i\`:

\`\`\`text
C_i[t] = (P_i[t] + K[t+s_i]) mod29.
\`\`\`

For any two pages \`i,j\`, shifting page \`j\` by \`delta=s_i-s_j\` cancels the key:

\`\`\`text
(C_i[t] - C_j[t+delta]) mod29 = (P_i[t] - P_j[t+delta]) mod29.
\`\`\`

Thus the difference histogram of *aligned* pages should follow a slightly nonuniform difference distribution \`q[d]=sum_a p[a]p[a-d]\`, even without knowing the key symbols. This is an offset-tolerant extension of the previous \`latent_page_pad.cjs\` zero-offset ML test. It covers fixed unknown page-level starts, with relative shifts in **−20..+20** and GP-English-like plaintext, while remaining restricted to a common **additive, fixed-alphabet** keystream and no within-page insertion drift.

## Exact experiment

- Input \`resources/liber-primus/lp2-corpus.json\`, unsolved pages with at least 150 runes: **49 pages**, producing **1,176 page pairs**.
- Prior: encode repository's first 300,000 Shakespeare characters to GP index symbols; 218,800 runes, 10% uniform smoothing. The calibrated difference distribution has relative-uniform KL divergence **0.0202966 bits per pair position**. The weak signal is why a pairwise unvalidated peak would be a poor decryption claim.
- For each page pair and each relative shift ±20, calculate the normalized difference log-likelihood on **even-indexed rune positions only**; select the best shift from that training material. Keep that exact shift fixed and calculate its score on **odd-indexed held-out positions**.
- Aggregate the held-out standardized effect across all 1,176 pairs. Calibrate against **80 independently circularly rotated-page null datasets**, where the *entire training offset search and holdout evaluation* is rerun. Fixed-seed pseudorandom sources are in \`sims/pair_offset_pad.cjs\`.
- One synthetic control uses the exact LP2 page length distribution, random page start offsets 0..20, the same common randomly generated mod-29 key, independently drawn English-like GP plaintext, and random replacement of 81% of immediately repeated ciphertext symbols. Evaluate identically, with 30 rotated controls.

## Executed outcomes

[Successful manual CI run 42742578599](https://github.com/FlareZ123/liber-primus/actions/runs/42742578599), Node 22:

| Statistic | Real LP2 | Planted shifted common pad |
|---|---:|---:|
| Pages / page pairs | 49 / 1,176 | 49 / 1,176 |
| Mean validation z across all pairs | **0.0109964** | **0.6131048** |
| Rotated-null mean | 0.0156805 | 0.0467305 |
| Rotated-null SD | 0.0305029 | 0.0333790 |
| Standardized effect vs null | **−0.154** | **+16.968** |
| Monte Carlo upper tail (with +1 correction) | 0.5679 (80 rotations) | 0.03226 (30 rotations) |
| Exactly recovered relative offsets | unknown | **32.82% of 1,176 pairs** |

The planted control uses PRNG seed \`0x712d8892\`, 378 triggered anti-doublet replacements, and independently random offsets per page. Its 32.82% pairwise alignment recovery is far above the ~2.4% chance correct delta among 41 tested alternatives, and the validation scores provide clear out-of-training evidence. The finite 30-rotation p-value is discretized: the full z=16.97 signal is the stronger control observation.

The real LP2 statistic is essentially identical to the rotated-page null. Three individual page pairs yielded strong validation scores (\`3.14, 2.93, 2.66\`), but they were chosen after scanning 1,176 pairs; the global calibrated test rules out treating these as evidence of a common pad.

## Source-predictive whole-section key reuse at *arbitrary* relative offsets (Agent 7)

The bounded page search above cannot address an **arbitrary length displacement between complete section streams**. A separate end-to-end original-cipher attack therefore parsed the eight canonically dollar-delimited unsolved LP2 sections (lengths **729, 1,145, 1,738, 1,894, 1,021, 1,433, 1,680, 3,316 runes**), transformed each into exact modulo-29 **consecutive ciphertext steps**, and tested whether two steps share one unknown additive pad: `E_A[i]=P_A[i]+K[t]`, `E_B[j]=P_B[j]+K[t]`. Their aligned difference cancels `K` regardless of the unknown key values. This is a **different, precisely specified step-space channel** from the direct GP rune-space page cipher above. Section offsets are searched exhaustively rather than limited to ±20.

A Shakespeare GP-English plaintext training prefix (**167,751 GP runes**) supplies a smoothed 29×29 plaintext bigram law; subtracting two independent plaintext bigrams analytically supplies a 29×29 joint difference law. All **57,120** cross-section alignments with at least **600 overlapping runes** are evaluated against an independent-step baseline derived from the original cipher. The largest original-score alignment is **sections 4 and 6, offset −375, overlap 646**, with difference-bigram log likelihood ratio **19.44481477**. Its first-position key is unknown. A normalized second-stage, **exact 29²-hidden-state forward marginal likelihood** for independent English-GP trigram plaintext pair paths gives a score **+8.86953819 nats** relative to independent uniform symbol differences; its decoded best-path *examples* were unreadable and are not recovered text.

The full selection procedure was rerun on **60 fixed-seed controls**, independently permuting 64-rune contiguous original *step* blocks within each section. This preserves every original step symbol, the sparse zero-step rate, and almost all local step bigrams while disrupting a constant shared alignment. **One of 60** controls matches or beats the original *screen maximum* (plus-one **2/61≈0.03279**), but **four of 60** controls match or beat the original *exact forward score on the screen-selected alignment* (plus-one **5/61≈0.08197**). This second number assesses the full prespecified two-stage winner-and-validation pipeline, conditional on the selected model and 64-symbol block null. It does not establish shared key or plaintext. A genuine positive plant with wholly withheld **51,049 GP-English reference runes**, common per-position random pad and 81%-probability rewrites of zero output steps recovers **offset 0** as the best section alignment; its bigram score is **79.22367** and exact-forward score **55.06164**, despite **372 repair events**.

This generalizes the earlier restricted-offset tests to **whole-section arbitrary shifts** under one explicit step-addition model. It still permits nonlinear ciphers, data-dependent pointer skips, independent word transformations, permuted symbol labels or a wholly different source register. The observed shifted maximum requires an actual source-derived key clock and independently readable heldout text before it can be called a decryption.

[Exact CommonJS original/plant/block-null attack](../sims/dual_section_difference_inversion.cjs) · [successful on-demand workflow run 42794323031](https://github.com/FlareZ123/liber-primus/actions/runs/42794323031).

## Scope and implication

This result strongly disfavors **one mod-29 additive keystream reused across most pages with independent constant page offsets no greater than 20 runes**, when plaintext is reasonably close to the tested English GP distribution and there is no intra-page key drift. It also establishes that an offset-tolerant search can work under weak difference-law information and active suppression of immediate ciphertext repeats.

**Remain untested:** a subset of pages sharing a pad, offset magnitudes larger than 20, frequent mid-page slips/insertions, arbitrary page-wise alphabet permutations, nonlinear combiner functions, unusual language, or a fully independent key for each page. The result is *intermediate negative evidence* and must not be promoted to an established cipher architecture.

**Reproduction:** \`sims/pair_offset_pad.cjs\`, manual-only \`.github/workflows/pair-offset-pad.yml\`, input corpus and Shakespeare reference already in the repository. The program outputs control seeds, pair and validation counts, fitted shifts, rotated-null scores and null replicates in JSON.
