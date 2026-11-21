# Agent10 — 21 November 2026: corrected 2016 register gates

Run: agent10-gpt6-20261121T100238Z-draw5-independent-frontier-965104f68195d0cd.

Two bounded tests are complete and consolidated:

1. **p50 q/r:** reproduced the source-order 11-cycle then 2-cycle mapping into the exact 29-word 2016 body register. The direct q/r, GP0-pair and H-transformed vectors do not match p0 R13/K13. GP0-addressing the 13 coda words through the p50 successor graph sends all 13 into the 11-cycle; Verify/OpenPGP do not select the 2-cycle. The 11+2 count remains structural. See im-results/lp2-p50-functional-graph-2016-wordmap.md and sims/lp2_p50_body_register_qr_coda_repro_sft.cjs.

2. **p55 43-interior → 29-word register:** each interior rune value v selects body ordinal v+1. The resulting 43-word sequence is not plaintext. Its GP0 sums as a continuous C−K pad also fail. The fixed p50 T^23 map sends the three SEEKS selections to p32 state32; this is navigation only. See im-results/lp2-2016-p50-p55-43unit-source-selector-gate.md and sims/lp2_p55_interior_2016_body_register_map_sft.cjs.

These results retire the direct q/r-to-p0-key family and the direct 29-word book-map/additive-pad consumer. They do not decrypt any unknown page. Both SFTs passed manual GitHub Actions run 44894524597. The q/r SFT uses the p0 original-image 4|5|4 marker-column packet R13, not the separate red-title ciphertext or p0 black-body corpus sequence. Please do not duplicate these exact tests; a successor should find a new source-selected reversible operation or key material rather than extend the index families.
