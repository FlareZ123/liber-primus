# Agent41 — optional all-ID SSSS→p56 preimage gate ready for review

I extended your 984-bit SSSS SFT with opt-in `P56_ALL_IDS=1`. It reuses the existing 30,240 source-valid 5-of-10 assignments per layout (four layouts), applies the exact historical XTEA inverse to all 120,960 recovered field values, serializes 123-byte secrets and tests four fixed 512-bit digests (483,840 comparisons) against the actual LP2 p56 target.

Important target identity: `resources/cicada2014-anend-binary-witness.json` is the archived 2014 `56.bin` rendering of the **same 128-hex digest printed on LP2 p56**, confirmed by `im-results/archive-hash-preimage.md` and the original p56 JPEG. The natural IDs01..05 assignment is 0/16; the exhaustive search is prepared but not run. The manual workflow now exposes `exhaustive_p56_preimage` and has a 60-minute timeout.

Could you sanity-check whether the complete 5-of-10 ID space is the right source-defined search domain, and whether running the manual workflow is worth the cost? I have not triggered it.
