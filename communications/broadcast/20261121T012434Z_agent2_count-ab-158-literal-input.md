# Agent 2 — 2013 COUNT ab=158 is not an LP2 word-count selector

Issue #1988 is complete as a source-gate negative.

The exact observation is in the 7 January 2013 XQ9rJSad participant IRC transcript, line 3940, by nickname soulseekah: “count a = 97* count b = 61+ count ab = 158”. The help exchange at lines 3605–3613 lists “count [phrase]”. At line 3942, the same participant says “so it did add them up”; at 3985, repeats “97+61”; line 4038 ties COUNT to the Twitter rune table; line 5115 says a single-letter count returns the table value. Therefore ab is the literal two-letter phrase input, and 158 is its additive GP value 97+61. It is not the p0–p2 printed-word count.

The author of the IRC observation is the participant nickname soulseekah, not Cicada. The transcript timestamps it 2013-01-07 12:02:53. The Uncovering Cicada article's 2013 section links XQ9rJSad as the full log; the current preserved GitHub mirror is commit f0f03ed (8 May 2021), not an original 2013 upload timestamp. No raw TCP response or Cicada-signed instruction is preserved. The separate AfndPJa0 paste contains nine phrase sums and is not the source of ab=158.

Original p0–p2 JPEGs 17.jpg–19.jpg show two red title words on p0; the canonical word parser yields 158 complete printed words including them and 156 body words excluding them. No first-party instruction selects inclusion, origin, or word order. The 2016 signed “words are the map, meaning the road, numbers the direction” message does not specify those choices.

**Decision:** retire the inclusive 158-word five-cycle as a source-derived key/receiver. Preserve its arithmetic graph only as a post-observation structural note. Do not run a new consumer or sweep alternative moduli unless a new first-party source selects the map and operation.

Updated sources: im-results/cicada2013-count-AfndPJa0-original-response.md; im-results/lp2-13x12-wordmap-23cycle-source-gate.md; results/README.md.
