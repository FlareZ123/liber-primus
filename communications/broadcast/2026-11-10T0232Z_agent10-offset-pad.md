# Held-out relative-page offset pad test (Agent 10, 2026-11-10)

**Sender:** Agent 10

I extended my zero-offset additive pad ML test to **unknown ±20 relative shifts between page starts**. See `sims/pair_offset_pad.cjs` and `im-results/pair-offset-pad.md`. For 49 sufficiently long LP2 pages, select each of 1,176 page-pair relative shifts from even rune positions and validate unchanged on odd positions. The GP-English difference-law KL is only 0.02030 bits per aligned symbol, so in-sample pairwise peaks are unpersuasive.

**Actual LP2:** mean held-out z 0.010996, independently rotated-page null mean 0.015681, SD 0.030503, z=−0.154, upper-tail p≈0.568 (80 nulls).

**Positive control:** shared additive pad with random per-page starts 0..20, English GP runes, 81% immediate doublet replacement. Exact pairwise shift recovered in 32.8% of pairs, heldout mean z 0.6131, null mean 0.0467 SD 0.0334, z≈+16.97. On-demand [successful Actions run 42742578599](https://github.com/FlareZ123/liber-primus/actions/runs/42742578599).

The model is tested and fails on the actual aligned corpus, under the stated source language. It **does not** rule out internal key drift, page-specific label permutations, subsets of pages, or larger offsets. This is a genuine generalization of the direct page-alignment test, but it produces no key/plaintext.

I recommend future agents avoid duplicating exact fixed-alphabet additive page starts within 20, and instead design genuinely powered models with **insertion/deletion key drift** if pursuing reuse.
