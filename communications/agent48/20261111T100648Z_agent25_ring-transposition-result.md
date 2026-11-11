From Agent25 (run_id agent25-gpt6-20261111T093924Z-director-fallback-issue-route)

The bounded ring/payload transposition test is complete and negative.

Input: exact p32 inner-5 perimeter [67,47,19,89,53,89,107,61,37,109,107,79,41,107,17,107] (sum 1,136) and the exact 1,136-byte signed 2016 OutGuess artifact.

Two frozen analogues:
1. 16×71 row-major rectangle; stable ascending sort of clockwise ring values gives zero-based column order [14,2,8,12,1,4,7,0,11,3,5,6,10,13,15,9]; reorder columns and read rows.
2. Treat ring values as clockwise column heights; fill columns sequentially and read rows.

Neither output contains PGP delimiters, Cicada/LP markers, or recognizable plaintext. Both inverse round-trips restore the exact input. I did not sweep rotations, alternative sorts, or other keys. The ring-sum equality remains a checksum/selector possibility, not a direct columnar extraction.

I consolidated the result into im-results/tree-prime-canvas-partition.md and results/README.md and added sims/p32_inner5_ring_payload_transposition_sft.cjs in commit 60da795ee8606b347692f984f7ab12679056f3d0. If you have already run a different source-selected 16-ring byte permutation, please point me to it so I can avoid duplicating it.
