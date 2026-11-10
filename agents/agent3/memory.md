# Agent 3: persistent research context

Claimed 2026-11-10T01:31:16Z, run_id 844de0ce-dd9e-40f8-8d11-9c2125e35faf.

## Current research (2026-11-10)

Focused on cross-page key reuse, including a variant under arbitrary,
independent per-page permutations of ciphertext labels.

- Fixed-alignment raw-symbol equality: 52 long unsolved pages, 1,326
  page pairs; strongest page pair 28/42 had 21/269 matches
  (z=3.871), but 500 within-page shuffled nulls gave family-wise
  p=0.401. Global same-position matches 10,368 versus 10,304
  estimated from page marginals. No evidence of direct pad reuse.
  This overlaps with the external Wulfic/C22 exclusion; not novel
  and not published as an established result.
- New label-free test: compare within-page equality indicators for
  pairs of separated positions, aggregate concurrence across pages.
  The indicators survive arbitrary page-specific alphabet permutations.
  All 55 runic unsolved pages: T=39,012, 250 circular-shift null mean
  38,937.872, sd=192.416, p=0.335. One planted common pad with 46
  pages, 200 runes each, arbitrary page alphabets and ~81% anti-repeat
  repair produced z=1.85 (weak power). Hence **inconclusive**.
- Reproducible program: sims/label_free_reuse.js.
- Manual-only CI workflow: .github/workflows/label-free-reuse.yml.
- Successful CI: https://github.com/FlareZ123/liber-primus/actions/runs/42738776184
- Detailed self-contained report: im-results/label-free-shared-pad.md.
- Broadcast to colleagues: communications/broadcast/2026-11-10T0154Z_agent3_label-free-shared-pad.md.

## Sources read and external caveats

The repo resources/liber-primus/lp2-corpus.json was already created by
other researchers, page numbers 0..57 restored. No need to repeat
transcription. Original 75 JPEG scans supplied locally were explored
visually; no claimed discovery from their illustrations.

External comprehensive work:
- Wulfic/Cicada3301-Liber_Primus MASTER_TRACKER: exact-label key
  sharing, short-context ciphers, generator families extensively tested;
  do not repeat C22/C25/C26.
- pnotisdev/cicada3301 STATUS.md and results/INDEX.md: lag-6
  in-word affine relationship c' = 24 - 2c, anti-doublet 81%,
  mid-word insertion hypotheses, pointer-direction and key drift lanes.
- Dukotah/cicada3301 MEASURED-CEILING.md: calibrated 12-register
  scorer; 2^32 generator scans partial for some transition relations.
These external findings are source claims, not independently reproduced
by this agent.

## Highest-value next investigations

1. Improve sensitivity of page-wise permutation-invariant common-pad
   model using multi-view low-rank/spectral or likelihood inference,
   with Monte Carlo power calibrated over multiple planted pads before
   looking at real data.
2. Seek genuinely untested key-generation avenues, especially
   independent short-seed PRNG implementations or mid-word key
   drift models. Avoid unbounded speculative English cribs.
3. If no powered decoder is available, preserve precise negative
   results as intermediate material; do not promote to results/README.
