# Middle English native-GP register gate (#2966)

Agent8, 26 November 2026. **Exploratory register calibration; no new plaintext, key, source-selected receiver or destination.** The decisive four-null C8 test is not yet complete.

## Independent sources and model

- Training: Geoffrey Chaucer, [Troilus and Criseyde, Gutenberg #257](https://github.com/GITenberg/Troilus-and-Criseyde_257/blob/936356e95c3eaf033a7064e7aac62562e120351e/257.txt), Git blob 45829db668a199af8378b507549d0a970b90a6a5. Exact crop between `BOOK I. Incipit Liber Primus` and `Explicit Liber Troili et Criseydis.` (exclusive). Internal Latin book headings retained, a small contamination.
- Heldout: John Gower, [Confessio Amantis, English Prologue, Gutenberg #266, G. C. Macaulay edition](https://github.com/GITenberg/Confessio-Amantis--Or-Tales-of-the-Seven-Deadly-Sins_266/blob/8551b982c2f0efa6bfb3fc775ad619c2954a0c03/266.txt), Git blob a84e11740796df8f70ef5a54fc8d9c919f41831e. Exact exclusive crop from `Absit, et interpres stet procul oro malus.` through `Explicit Prologus`. The Latin epigraph and final Latin heading are excluded.

Both historic works are public domain; these pinned editions are ASCII. The fixed orthographic GP greedy table uses the canonical GP tokens, ING→NG, IO→IA, K/Q→C, V→U, Z→S, thorn/eth→TH, yogh→G (the latter three absent). Word/sentence boundaries are not taken from LP2. No LP2 training. Model: conditional rune 4-grams with recursive backoff to shorter suffix orders, prior weight 12, unigram half-count smoothing. Score mean natural log probability over full 4-grams.

| Corpus | Words | Sentences | GP29 runes | Two-rune words |
|---|---:|---:|---:|---:|
| Chaucer | 67,132 | 2,449 | 245,837 | 15,423 (22.9741%) |
| Gower | 6,578 | 116 | 25,759 | 1,612 (24.5059%) |

## Actual direct diagnostic and word-boundary decision

Executed in isolated JavaScript against both pinned source blobs and the 12,956-rune original stream from pinned external reference `fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb`. The direct diagnostic used xorshift32 seed 2966, 200 heldout windows per length, 2,000 draws per uniform, real LP2 and shuffled null; threshold index 1980 (zero-based sorted ascending) per class. Positive scoring was 100% at all three lengths above every class threshold. No beam positives, wrong-key beam negatives or panel comparison occurred in this diagnostic; it is not C8.

| Length | Uniform threshold | Original-LP2 threshold | Shuffled threshold | Direct power |
|---:|---:|---:|---:|---:|
| 60 | -6.018144 | -6.085444 | -3.912972 | 1.00 |
| 120 | -6.464007 | -6.450830 | -4.205562 | 1.00 |
| 236 | -6.694205 | -6.709891 | -4.364123 | 1.00 |

The C7-style 9-bin word-length counts (last bin ≥9) are Chaucer [2773,15423,20544,9874,9114,4648,2353,1260,1143], Gower [100,1612,1704,903,1104,486,360,152,157], LP2 [83,448,720,513,317,256,216,156,187]. The original's 448/2896 two-rune count is 15.4696%.

Exhaustive contiguous 2,896-word windows (not the external C7 seeded 1,000-window protocol) extend the earlier [native-register boundary decision](lp2-original-wordlength-two-rune-native-register-gate.md) into two genuine Middle English verse donors. Using the C7 G statistic with half-count smoothing against each full donor:

| Donor | Windows | Min two-rune share | LP2 G | Max within-donor G | Windows G ≥ LP2 |
|---|---:|---:|---:|---:|---:|
| Chaucer | 64,237 | 20.1657% | 618.666 | 53.834 | 0 |
| Gower | 3,683 | 22.7210% | 484.628 | 12.269 | 0 |

No donor window has as few two-rune words as LP2. Thus these Middle English orthographies do not repair the original printed-boundary objection. This is a bounded conditional result, not exclusion of Middle English plaintext under changed boundaries, other orthographies, genres, or ciphers. Overlapping windows are not independent draws.

## Full gate status and fork

[Reproduction SFT](../sims/lp2_middle_english_register_gate_sft.py) obtains the exact public texts and sparse-checks out the pinned, unmodified upstream C7/C8 checkers. It builds source manifests, derives corpora and records C7 validation/label/placement, then performs 200 correct-key beam positives and 2,000 each cheap-null plus 500 wrong-key beam decodes at each length, comparing the new model, English incumbent and panel R36. It persists JSON, source and derived corpora/model as a run artifact. The existing manual read-only Python runner [45850131784](https://github.com/FlareZ123/liber-primus/actions/runs/45850131784) successfully acquired the pin and began C7, then failed because the upstream reference `data/keys/welsh/welsh_mabinogion.txt` is gitignored. R36 explicitly documents restoring it from `analysis/round36/P1-panel-r36/inputs_frozen/welsh_mabinogion.txt`; the SFT now restores that exact pinned Git blob (SHA1 b51109cbd939b75b1ea33d09879fcd5a3a9bb0d0) without modifying the checker. The corrected [run 45850489263](https://github.com/FlareZ123/liber-primus/actions/runs/45850489263) is in progress. The initial queued superseded revision was cancelled before scoring.

Agent42 previously attempted a separate Wycliffe/Gawain test with independent sources; [run 45824885259](https://github.com/FlareZ123/liber-primus/actions/runs/45824885259) failed with an upstream HTTP 404 before scoring. Do not conflate that with this direct result or repeat it as evidence.

The issue stays open until the complete C8 comparison. If the panel already achieves ≥0.80 at 236 runes or the new model falls below 0.80 at 1% per-null FPR, stop. Otherwise re-adjudicate only one previously source-ranked original candidate with independent continuation as specified by the Director. No original decryption candidate has been scored.
