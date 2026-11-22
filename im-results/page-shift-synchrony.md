# Page-aligned key reuse after unknown page-wise Caesar shifts (Agent 49)

**Classification:** intermediate discriminating experiment. No LP2 plaintext or keystream recovered.

## Hypothesis and method

A common position-aligned 29-symbol pad might be hidden by independent per-page Caesar shifts:

C[p,t] = (P[p,t] + K[t] + shift[p]) mod 29.

The program fits relative page shifts by maximizing same-rune pairs in aligned columns, using four randomized coordinate-ascent restarts per trial. A global shift is inherently unidentifiable.

Input: resources/liber-primus/lp2-corpus.json, LP2 pages 0–55, excluding runeless 50: exactly 55 ciphertext arrays, 12,956 runes.

## Calibration and scope

The null circularly rotates each entire page at a random offset, retaining rune composition, anti-doublet profile and within-page structure while removing alignment. All 150 null datasets receive the **same four-start search** as the actual ciphertext; this prevents optimizer selection bias.

Thirty positive-control manuscripts contain a uniformly random common keystream, independent per-page Caesar offsets, plaintext runes sampled according to the two solved LP2 pages' symbol frequencies, and an 81% probability of rerouting an immediate repeated ciphertext rune. Plants reuse the lengths of the 55 original pages. Recovered offsets are compared to planted offsets modulo an arbitrary common additive constant. Both real and positive controls are compared against rotated decoys.

Deterministic implementation: sims/page_shift_synchrony.cjs. Invoke manually or run the workflow .github/workflows/page-shift-synchrony.yml. No per-commit CI and no external dependencies.

## Executed result

The [successful manual CI run 42741260849](https://github.com/FlareZ123/liber-primus/actions/runs/42741260849) evaluated four independently initialized searches for every real, null, and positive-control dataset. Fixed-seed results:

| Condition | Optimized column collision score |
| --- | ---: |
| Observed LP2 ciphertext | **12,614** |
| 150 independently circularly rotated nulls, mean | **12,625.10** |
| Null standard deviation | **47.9135** |
| Null minimum / maximum | **12,493 / 12,757** |
| Observed z score | **-0.2317** |
| Empirical one-sided upper-tail p (with +1 correction) | **0.56954** |
| 30 planted shared-pad datasets, mean (SD) | **14,646.83 (178.59)** |
| Rotated counterparts of the 30 plants, mean (SD) | **12,632.03 (40.20)** |
| Relative page offsets recovered, out of 55 (mean; min–max) | **52.9; 48–55** |

All 30 planted datasets have stronger scores than the maximum of 150 rotated real-data nulls, whereas the real corpus is slightly below the null mean. This strongly discriminates a **particular model** (shared page-start-aligned uniform keystream, independent page Caesar offsets, LP2-solved-page plaintext rune profile and stated anti-doublet repair) and gives **no evidence for that model in LP2**. The scored offsets in the real text are optimizer parameters, not meaningful key material.

A preliminary optimization used four starts for real and only two per null. Its recorded empirical p=0.296 is superseded by this calibrated symmetric four-start run. Local coordinate ascent cannot guarantee the global optimum, but positive-control relative shifts are recovered at mean 52.9/55 pages and all nulls use the same search policy.

The inference does not extend to arbitrary page-specific alphabet permutations, altered page alignment, key drift, source-specific plaintext distributions, more complex anti-repeat repair, or external second encryption layers. Those require independent tests and powered alternatives.

## Reproduction

Run `node sims/page_shift_synchrony.cjs` (Node.js 22; no packages, secrets or external data) or the explicitly dispatched workflow `.github/workflows/page-shift-synchrony.yml`. The file prints the deterministic JSON score and null/plant summary. No per-commit CI is registered.
