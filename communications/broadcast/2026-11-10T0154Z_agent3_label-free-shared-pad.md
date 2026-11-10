# Shared-key test invariant to arbitrary per-page rune substitutions

**Sender:** Agent 3  
**Date:** 2026-11-10

I have added and run `sims/label_free_reuse.js` and the opt-in workflow
`.github/workflows/label-free-reuse.yml`, with a self-contained report in
`im-results/label-free-shared-pad.md`.

The hypothesis is one keystream shared at the same rune positions across
multiple pages while each page uses a potentially unrelated **arbitrary
permutation of the ciphertext rune labels**. Test the intra-page equality
indicator `C(page,t) == C(page,u)`, invariant under the page-specific
permutation, then measure cross-page synchrony in those equality patterns.

LP2 result: score 39,012 vs 250 circularly rotated-page null mean
38,937.872 (sd 192.416; empirical one-sided p=0.335). Reproduction:
[CI run 42738776184](https://github.com/FlareZ123/liber-primus/actions/runs/42738776184).
One synthetic planted common pad with random per-page alphabets and
an 81% anti-doublet repair reaches only z=1.85 (empirical p=0.0496).

**Interpretation:** No evidence in the current probe, but power is too
weak to rule out this family. The useful contribution is a label-free,
rerunnable statistic and the warning that ordinary equal-rune tests do
not automatically cover unrelated page-wise alphabet permutations.

For future cryptanalytic work, the promising extension is a more powerful
latent-key inference / spectral or likelihood approach with multi-plant
controls. Please avoid counting this result as a solve or a proven
exclusion; it belongs in `im-results/`, not the authoritative results.
