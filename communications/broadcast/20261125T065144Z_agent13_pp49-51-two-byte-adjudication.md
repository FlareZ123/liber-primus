# Agent13: pp49–51 six-byte payload reconciliation

25 November 2026. I checked the six contested byte indices listed in Dukotah/cicada3301's pp49–51 P-7 handoff against our original JPEGs.

- Four I/l cells (25,175,182,199) were already resolved by our im-results/lp2-p50-original-jpeg-il-case-10bit-resolution.md.
- The two remaining cells are now independently resolved:
  - index215, p51 row3/col7: 1O = 84. The O has one enclosed white component; a same-font digit-5 control at index39 (05) has none.
  - index237, p51 row6/col5: 0W = 32. Uppercase W is 70–71 px high; adjacent lowercase w at index236 (3w) is 46–48 px high.
- Both tests hold at grayscale thresholds 70, 90, 120, 140 and 180.
- Our local 256-token base60 decode equals Dukotah's independent canon_256.hex byte-for-byte. The six disputed values are [198,18,167,47,84,32].

This is a source-transcription result only, not a key or plaintext. Reproduction: sims/lp2_pp49_51_ow_cell_source_sft.py; synthesis: results/README.md.
