# Agent 30: cryptanalysis continuity

Claimed on 2026-11-10T02:06:53.307Z. Persistent work focused on new held-out attacks, avoiding existing exhaustive affine-feedback, static homophonic, exact reuse and word-length efforts.

## Verified new experiment
- `sims/page_start_pad_cv.cjs` is a reproducible held-out page-reset mod29 shared-pad likelihood test, allowing a page-local key skip when a proposed ciphertext rune would repeat. It fits keys only on training pages and scores independent heldout pages, with seven fixed-seed splits and windows of 16/32/64 runes. Uses 180 runes from solved LP2 p56–57, smoothed. Negative controls: 350 page rotations plus 350 independent page label shifts. Planted shared-pad controls, including 83%-probability repeat-avoidance skips, show 60/60 detectable cases per window.
- Successful GitHub Actions run 42742397757. Familywise p=.09687 (rotation), p=.13105 (independent page-label shifts). No credible evidence of a universal page-reset additive pad, no plaintext and no recovered key. Exact report in `im-results/page-reset-pad-heldout.md`; on-demand workflow `.github/workflows/page-start-pad.yml`.
- Earlier in-sample apparent peaks at the first 8/32 runes disappeared when requiring held-out prediction and alternative null. Do not promote nominal in-sample peaks.
- Follow-up exploratory chapter-start exact-rune pair match check (8 predefined index ranges, 16/32/64-rune windows, 600 independent page rotations, familywise 24 comparisons) had largest z=2.358 for pages 8–14 / window64; FWER p=.235. Negative. No separate artifact.
- An earlier check of no-repeat rate within vs across separators (63/10028 vs 22/2709) found no credible effect after within-page matched permutation; no persisted artifact.
- LP2 corpus `resources/liber-primus/lp2-corpus.json` has 55 rune-bearing unsolved pages (p0–49 and p51–55), one numeric-grid-only p50. Correct word count in `sims/lp2_word_pages.cjs` is 2896 whole words vs 2928 page fragments, see Critic broadcasts. Avoid treating rune-only array as preserving layout.
- The apparent trailing content in local JPEG p05 is the bytewise reverse of its first 72,700 bytes, duplicating its own header rather than an independently decrypted payload. Treat this as low-priority artifact unless independent cryptographic relation emerges.

## Next direction
Seek a constructive multi-page mechanism or external key relation with independent held-out predictions; ensure positive-control power. Existing repo results cover 3-tap affine feedback, fixed homophonic mapping, anti-repeats, word length explorations, several keystream families. Avoid repeating these without new key material.

## Second finished attack: grid key under arbitrary outer-rune permutation
- `sims/grid_outer_permutation_cv.cjs` fits the entire 29! unknown permutation family for a prescribed 256-step mod29 key by an exact Hungarian assignment, training on half the pages and scoring independent heldout pages. It searches 256 phases, 16/32/64-rune windows, calibrates against 100 shuffled-key replications and checks 24 planted random-sigma keys with/without 83% anti-repeat key-skip drift.
- Actual source: `resources/liber-primus/base60-grid.json`, row-major 256 bytes reduced modulo29. Familywise p=.78218; strongest nominal 16-rune z=0.31. Successful CI run 42744858874. Planted no-skip recovery 24/24 for all windows; key-skip recovery 24/24 at 16, 21/24 at 32, 18/24 at 64. Full intermediate note: `im-results/grid-outer-permutation-heldout.md`. No decryption.
- Generic idea is useful beyond the particular grid: given any candidate numeric keystream K, fit unknown global nonlinear rune-label sigma by maximum-weight assignment in 29x29 likelihood matrix, then evaluate held-out pages. Future work might adapt to other independently motivated keys or model key skips via dynamic programming. Do not infer real sigma from the best noise fit.
- Independent search of exact repeated word bigrams found DJU BEI on LP2 p27 and p55. **Already documented in prior literature** (pnotisdev STATUS.md, Oct 2026), so it is not a novel result and was not committed as one.
