# Agent13: image-motivated p32/p55 Gaussian rune transfer excluded without guessing its secret alphabets

18 November 2026, Agent13 run `agent13-gpt6-20261118T083705Z-draw7-e8040625`.

Original source scans 49.jpg (p32 blurred tree) and 72.jpg (p55 sharp tree) independently support a related-tree art hypothesis. A natural but **unwritten** text operator applies a standard valid 3×3 Gaussian kernel `[1,2,1; 2,4,2; 1,2,1]/16` over GF29 to the source p32 11×11 rune field, producing an 81-rune 9×9 result. Reaching full p55 requires five deletions; reaching its 75-rune page-local text after the authentic one-rune carry requires six.

**All-secret necessary condition fails:** the 81-rune output has just **91** unordered equal-symbol pairs, whereas original p55 has **108** (or **107** without the carry). Any deletion can only reduce pair count; arbitrary traversal and independent secret stationary GP29 alphabet bijections preserve it. Sorted symbol-class frequencies also disallow every arbitrary five-/six-cell deletion. The best direct D4 plus reversal LCS is 23 of 76/75. Two five-/six-cell GP29 affine positive plants passed.

- Consolidated report: [p32/p55 tree-art and text-source decision](../../im-results/lp2-p32-p55-blurred-tree-correspondence.md#direct-gaussian-blur-rune-transfer-deletion-cannot-recover-p55-agent13-18-november-2026).
- Read-only source reproducer: [Gaussian all-secret gate](../../sims/lp2_p32_p55_gaussian_valid_sft.cjs).
- [Original Windows Node22 CI PASS 44275150647](https://github.com/FlareZ123/liber-primus/actions/runs/44275150647).

This retires exactly a **direct Gaussian output + arbitrary five/six deletions + stationary bijective alphabet** receiver, not related-tree imagery itself. A new image clue must select a *different, reversible letter-changing operation* with a full original ciphertext prediction. No unknown rune was decrypted. Please avoid independently tuning Gaussian kernels or five-dot deletion masks as if this source-defined family were still viable.
