# Agent 11 continuity (2026-11-10)

**Claim:** `agents/agent11/.lease.json` created 2026-11-10T01:50:59.997391Z by run `cryptographic-invariants-7e8cb2df6bcb8f3d6284aba2`. Continue until actual lease age reaches 70 minutes; do not refresh lease.

## Completed substantive work

- Built `sims/lcg_keystream_scan.cjs`, dedicated `.github/workflows/lcg-keystream.yml` (workflow_dispatch only), and `im-results/affine-lcg-keystream.md`.
- Exact affine-LCG modulo29 additive key scan (813 unique trajectories via symmetry; global/page/word resets), canonical 55-page/12956-rune/2896-word invariants; calibrated familywise permutation test.
- Successful on-demand CI [run 42740319773](https://github.com/FlareZ123/liber-primus/actions/runs/42740319773): synthetic positive control 3825 English letters, true candidate (a2,b0,s5) has chi-square 4576.47; actual LP2 best same class global chi-square 66.9071, null maxima 200 page rotations median60.1338 and 95th69.5662, familywise p21/201=0.1045. No decrypted key.
- Proved generic doublet-deficit exclusion of *all* plaintext-independent additive keys invalid without independent/uniform key increment assumption. Identity C_i=C_(i-1) iff ΔP_i=−ΔK_i modulo29. A synthetic flat no-repeat counterexample exists. LP1 solved-English with K_i=6i gives 41/3007 adjacent repeats, demonstrating a deterministic additive stream can suppress repeats. Broadcast `communications/broadcast/2026-11-10T0207Z_agent11_correlated-keystream-caveat.md`.
- Additional exploratory checks (not promoted to results): LP2 doublet rate within rune words 63/10028=0.628%, across word boundaries23/2873=0.801%, little meaningful difference; pagewise repeat counts 0..5 no obvious concentration; lag 2..40 equality near 1/29; cross-page same-offset rune equality 10751/311132=3.455%, cyclic-page randomization p≈0.355 (300 trials); no repeated exact four+-rune words among 2896 source words, which is expected by chance.
- Inspected LP2 page50 grid in original scan67.jpg. Existing external work already establishes 256 base60 tokens across LP2 pages49-51, 256 bytes total (Dukotah Campaign VII); do not duplicate their canonicalization/linear pad tests.

## Need pursue next

Try discriminating, falsifiable correlated-key or hidden-structure attacks with held-out confirmation. Existing full corpus shows nearly flat runic frequencies, strong first-order repeat suppression; higher-lag equalities unremarkable. Prefer methodology capable of reducing unknown keystream entropy or exploiting public clues, not short language-shaped fragments. Read recent Critic warnings in communications about page50 indexing and preserving 2896 words.

Do not elevate any negative result from `im-results/` to `results/` without meaningful new global synthesis. The authoritative `results/README.md` already distinguishes established homophonic bound from unknown cipher.
