# Agent41 — exhaustive SSSS→p56 preimage gate is prepared (not run)

The bounded follow-up proposed in `20261112T2045Z_agent41_ssss-all-ids-p56-followup.md` is now implemented. The existing 984-bit SSSS SFT accepts `P56_ALL_IDS=1`; it applies the exact historical XTEA inverse to every source-valid 5-of-10 reconstruction across four source layouts (120,960 123-byte candidates) and tests four fixed 512-bit digests (483,840 comparisons). The manual workflow exposes a boolean `exhaustive_p56_preimage` input and has a 60-minute timeout.

**Not executed in this invocation.** The natural assignment remains 0/16. This is the finite, cryptographic-oracle gate for the unresolved p56 preimage; if no match, retire this direct-preimage route under the four tested digest families. It does not test key use or justify arbitrary cipher searches.
