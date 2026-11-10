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


## 2026-11-10 02:39 UTC: same-offset pair 28/42 structural candidate
- Created and executed `sims/relative_key_reuse_scan.cjs` (CI run 42743234601): 1485 pairs; pair 28/42 269 compared runes, symmetric modulo29 difference chi-square65.2007, family-wise permutation p2/1001=.001998 over 1000 independently page-rotated all-pair scans. Ordinary chi-square74.1487 (p.02597), first/second-half histogram agreement covariance116.2069 (p.007992); these are dependent statistics on same selected pair, symmetry criterion exploratory/post-hoc. Positive synthetic common key passes.
- `sims/relative_key_english_probe.cjs` (CI run 42743752448) tests two-time-pad English bigram Viterbi with physical word delimiters and 240k Shakespeare training. Page28/42 zero-offset language score -1349.496 ranks first of 272 cyclic page42 shifts, but decoded texts are gibberish. Held-out Shakespeare genuine common-key control also rank1 of269 but only36.06% reconstructed rune accuracy; no claimed plaintext/key.
- Self-contained report `im-results/page28-page42-relative-key-anomaly.md`; broadcast `communications/broadcast/2026-11-10T0238Z_agent11_lp2-28-42-relative-key-lead.md`. Additional caveat: observed pair difference pattern lacks predicted known-English GP-runic marginal. Aim for trigram / lexicon constrained joint decoder, independently reconstruct a common key if any readable passage appears. Distinct source JPEGs pages45 and59 visually inspected; rune transcription not independently validated image-by-image.


## 2026-11-10 02:53 UTC: factor-four cross-validation, stronger language failure
- GP-English difference-marginal model `D=(m*(P28-P42)+delta)mod29` fitted **812** distinct scale/offset candidates on first134 aligned rune differences; best m4 (equiv m25 under model symmetry), offset0, score+6.63251 nats relative to uniform. The heldout last135 runes score+6.28655, and the same m4 offset0 is independently best over all models on the heldout half.
- Crucial multiple-comparison correction: `sims/relative_key_scale_validation.cjs` (successful CI [42745361435](https://github.com/FlareZ123/liber-primus/actions/runs/42745361435)) recomputes maximum-symmetry pair among **1485** and selected-pair first-half 812-model fit for **1000** independent page-rotation nulls. Null selected-pair heldout score >=6.28655 occurs7/1000 (p8/1001=.007992). Conjunction of sym>=65.20 and score>=6.28655 occurs1/1000 (p2/1001=.001998). This is still exploratory post-hoc statistic-family choice; no proof cipher.
- `sims/relative_key_trigram_probe.cjs` now tests scale4 via difference inverse22 mod29; run [42744935164](https://github.com/FlareZ123/liber-primus/actions/runs/42744935164) successfully. Real alignment rank improves from47/272 (scale1) to **13/272** (scale4) but output remains gibberish. Heldout true shared-key scale1 plant achieved 68.77% rune accuracy, rank1/269. No plaintext/key recovery.
- Updated unified reader-facing `im-results/page28-page42-relative-key-anomaly.md` with scale4 and caveats (commit b2e3dc63d3b95e0d45ac6fe4901a90c4b978472f). Sent latest broadcast `communications/broadcast/2026-11-10T0252Z_agent11_scale-four-crossvalidation.md`.
- Immediate high-value next: dictionary/word-constraint paired decoder on page28 and42 difference `D'=22*(C28-C42)mod29`; if actual text emerges, prove exact re-encryption under *one identical* key sequence. If alternative statistics are explored, precommit templates or use external holdout to control selection.
