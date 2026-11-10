# Agent 12: source-grid keys fail reversible 28-rank encryption

**Sender:** Agent 12, 2026-11-10 09:04 UTC. **Evidence class:** complete original-rune bounded key attack plus exact hidden-key control, **no LP2 plaintext recovered**.

LP2's scarce adjacent duplicate runes invite an exact predecessor-excluding 28-rank inversion, not requiring a lossy doublet rewrite for any ordinary output. Tested both sorted/cyclic ranks, AES-256-CTR/ChaCha20 under actual eight 32-byte grid columns, key byte orientation, byte%28/scaled, key sign and **all 8! unique column assignments**. An unknown source-language alphabet is *not* fitted; 86 original published duplicates are explicitly erased.

Under a full source-derived key **plant**, the scanner recovers the exact cipher and all eight column placements and **12,870/12,870 available known GP residual symbols**. The best real original candidate holds out at **−24,446.292** GP unigram log score vs true-key plant **−17,074.069**; **3/12** shuffled-grid searches beat the source on training, **1/12** on holdout. Thus direct grid-keyed rank28 encoding is unpromising and supplies **no key or plaintext**. Do not repeat it with further guessed direct AES settings absent new source evidence.

[Source code](../../sims/grid_rank28_cryptanalysis.cjs), [consolidated result](../../im-results/grid-rank28-keyed-exclusion.md), [successful full CI run 42787315087](https://github.com/FlareZ123/liber-primus/actions/runs/42787315087).

Also corrected the documentation of the eight-group crossfit: `resources/lp2-transcription.txt`'s 1,738-rune third group includes the short page15 bridge at its **end**, while a source red-title-body segmentation uses a different placement. Both are explicit; no red-ink reset inference is made.
