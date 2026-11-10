# Permutation-invariant spectral common-key test (Agent 49)

**Status:** intermediate experiment; tests a previously weakly powered key-reuse scenario. No LP2 plaintext or key has been recovered.

## Attack model

Suppose that every rune-bearing LP2 page at the same page-relative position uses one shared mod-29 pad but independently relabels its 29 ciphertext symbols by an arbitrary permutation. For page p and rune index t:

C[p,t] = sigma_p((P[p,t] + K[t]) mod 29).

For each page, form a 29-dimensional one-hot rune matrix X with one row per rune position, then center its 29 columns by that page's own rune frequencies. The page-local Gram matrix X*X^T is invariant under any permutation sigma_p of the glyph labels. Aggregate the page-local Gram matrices into a single 277x277 matrix G, padding absent page positions by zero. Its largest eigenvalue measures latent shared position structure. Under a nonuniform and shared plaintext rune distribution, an unknown common pad can raise this eigenvalue even when separate page alphabets make literal rune matching meaningless.

An implicit operator evaluates G*v in linear time in the number of ciphertext runes per iteration, without allocating the full matrix. Deterministic power iteration obtains the largest Rayleigh quotient.

## Calibration and model limitations

The input is resources/liber-primus/lp2-corpus.json: LP2 pages 0–55, omitting runeless page 50; 55 pages, 12,956 runes, longest page 277 runes.

- Null: independently circularly rotate **entire original page sequences**, preserving page lengths, rune counts, and internal adjacency/repeat suppression while disrupting page-start synchrony.
- Planted positive control: at each page position choose one common uniformly random mod-29 keystream; sample independent plaintext runes from the **1,096 directly readable GP runes of LP1** at scans 4, 9–12, 15 and 73 in resources/transcriptions/liber_primus_master.txt; give every page its own arbitrary independently shuffled 29-symbol alphabet. After encryption, repair an immediate repeated rune with probability 0.81 by replacing it with one of the other 28 symbols. This models a concrete stronger-signal English runic plaintext register, unlike sampling the still-enciphered glyphs of solved LP2 pages.
- Score each synthetic, disrupted synthetic, and real-data null by the **same** 115-step top-eigenvalue power iteration and fixed initial eigenvector.

A strong positive-control separation is essential: arbitrary glyph relabeling should be exactly invariant, but finite English plaintext structure can be too weak for an unpowered equality test.

## Executed evidence

The [successful manual Actions run 42743049465](https://github.com/FlareZ123/liber-primus/actions/runs/42743049465) executed all 160 exact page-rotation nulls and 40 planted arbitrary-alphabet common-pad controls with the fixed corpus and program.

| Test | Largest centered Gram eigenvalue |
| --- | ---: |
| Observed unsolved LP2 pages | **97.6144** |
| Circularly rotated real-page null mean (SD; 160 replicates) | **96.0568 (1.2110)** |
| Null min–max | **91.8644–99.2644** |
| Observed standardized excess | **+1.2862** |
| Empirical one-sided upper-tail p, add-one | **0.09938** |
| Common-key synthetic mean (SD; 40 replicates) | **109.1920 (2.7437)** |
| Planted common-key min–max | **103.8471–114.9393** |
| Rotated synthetic mean (SD) | **96.2802 (0.9898)** |
| Planted shared-pad scores exceeding *all* real-page nulls | **40/40** |

The real manuscript's statistic is moderately above the mean null but not statistically convincing by this predeclared single statistic (p≈0.099). **All 40 synthetic English-like common-pad instances are dramatically distinguishable from the real observation**, even after independent arbitrary glyph relabeling and anti-repeat repair. The test is therefore powered against this explicit model, while the actual ciphertext does not display the expected effect. It is useful negative evidence, not recovered plaintext or a universal exclusion.

The pilot used only 110 nulls and 30 plants (empirical p≈0.108). Its parameters and results are superseded by the complete seeded CI run above.

**Scope:** the negative evidence concerns only a detectable English-like common pad aligned at page starts with arbitrary fixed per-page alphabet permutations. We do not test pages sharing a key at unknown offsets, evolving substitutions, different statistical language, short shared segments, or multilayer masking.

## Reproduction

Execute `node sims/spectral_pad_synchrony.cjs` using Node.js 22 or manually dispatch .github/workflows/spectral-pad-synchrony.yml. No packages or network use during analysis; the source control and seeds are in the program. Related weaker label-free equality statistic: im-results/label-free-shared-pad.md (Agent 3).
