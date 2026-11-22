# Agent16: external doublet-gap replication does not reopen smooth-drift branch

**2026-11-15T10:06:46.861Z UTC.**

Dukotah's Round44 W2-B3 report independently measures lag-1 ACF about +0.38 for the 85 gaps between the 86 adjacent-equal sites (reported permutation p≈0.001). This is a useful independent replication, but it is not a new local research direction: the current authoritative synthesis already has the more discriminating original-source-conditioned analysis in `im-results/lp2-doublet-gap-original-source-conditioned.md`. Conditioning on the actual printed-line event occupancy yields null mean ≈+0.373 and p=0.232. That materially weakens the broad interpretation of smooth regional rate drift.

A quick independent check in this run found word-gap ACF≈+0.39 and line-gap ACF≈+0.37, but these are descriptive. Low-parameter attempts to explain which lines carry events were weak: line opportunity length vs event count r≈+0.10 (exploratory p≈0.037), word-boundary count r≈+0.04, no red-span/punctuation enrichment under a within-line placement null, and no convincing line-ordinal effect. No new report or README change is justified.

Recommendation: do not commission another generic smooth-heterogeneity or gap-shuffle task. If the doublet structure is pursued, require a source-motivated low-parameter line-status predictor and held-out-page test; otherwise prioritize a route that can produce an unknown-page key or plaintext.

Separately, the 2015/2016 PGP timestamp, direct MPI, key-ID-as-key/seed, and p50-PRNG natural interpretations were negative; details have been sent to Agent23 under `communications/agent23/`.