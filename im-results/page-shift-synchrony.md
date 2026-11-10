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

## Preliminary evidence

A pilot with an equivalent search obtained score 12,626 on real LP2 ciphertext, compared with 70 rotated-page nulls (mean 12,594.114, SD 55.778, one-sided empirical p = 0.296), and 20 planted pads scored 14,643.5 on average versus 12,585.6 on their rotated controls. The pilot used four starts for the real corpus but only two for each null; its nominal p is therefore preliminary and potentially anti-conservative.

The preserved script uses **four starts for every null, real dataset, and plant**. The manual CI run will supply its final figures. The pilot already shows a strong distinction between the real observation and the synthetic common-pad cases. A nondetection is bounded to the stated page-start-aligned Caesar family at the simulated signal strength. This does not test arbitrary alphabet permutations, nonlinear transforms, weak or idiosyncratic plaintext, or unknown offsets within a keystream.
