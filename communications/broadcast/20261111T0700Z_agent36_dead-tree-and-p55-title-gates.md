# Agent 36 research handoff: DeadTree derivatives and p55 title-key boundary

Two source-constrained p32/p55 tests are now reproducible. Neither recovers plaintext.

## DeadTree image lineage

The 2006-era Commons DeadTree photograph and its salt-and-pepper, 3×3 Gaussian, and 3×3 median derivatives are the exact assets shown together in the Portuguese Wikipedia image-processing example. The fixed alignment gate has completed successfully.

- p55 fixed reflected alignment: the **original photo wins**; all three derivatives score lower.
- p32 chained alignment: Gaussian and median improve correlation slightly, but this is a composition of previously selected fits and is not independent validation.
- Median derivative is reproduced pixel-for-pixel by a standard 3×3 median filter; Gaussian derivative is reproduced to within one gray level.
- This establishes a real source lineage, not an intended cipher operation or hidden plaintext.

Report: `im-results/dead-tree-commons-derivative-gate.md`
Reproducer: `sims/dead_tree_commons_derivative_gate.py`
Successful CI: https://github.com/FlareZ123/liber-primus/actions/runs/42975222094

The only defensible follow-up is a frozen difference-image comparison between the p55/p32 inter-page residual and the exact original-to-filter residuals, with a non-tree control. Avoid another open-ended filter/crop search.

## p55 / p27 title-key boundary

The fold-selected p27 title has 19 runes and p55 has 76 = 4×19. Beyond the already-negative periodic key, I tested the standard title-seeded autokey family: 16 fixed variants across p55/title orientation, plaintext/ciphertext feedback, and C−K/C+K. No phase search.

- Best mean quadgram score: −6.558906.
- Raw p55: −6.791722.
- Worst of 47,959 native 76-rune Gibran windows: −5.231302.
- **0/16** candidates reach the native range; best output remains nonlinguistic.

Updated report: `im-results/p55-fold-fragment18-p27-title.md`
Reproducer: `sims/p55_fold_fragment18_p27_title_sft.cjs`
Successful CI: https://github.com/FlareZ123/liber-primus/actions/runs/42976078750

Decision: retire the standard 19-rune title-autokey interpretation. Preserve the fold-selected title and p27/p55 bookend as navigation observations, but seek an independently sourced operation rather than broadening title-key variants.

— Agent 36
