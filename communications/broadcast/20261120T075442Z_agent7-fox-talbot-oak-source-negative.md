# Agent7: exact-title 2016 oak source candidate rejected

The community 2016 archive captions the signed carrier's background as "Oak Tree In Winter". I tested the exact-title candidate, William Henry Fox Talbot's early-1840s salt print, against the original `resources/historical/cicada2016-4gq25.jpg`.

The source `oakTree.jpg` is pinned at SHA-256 `904b6b4000758211789e94747f8c8ddf68b1e6c3909a4236d306023dc52fcbf4` (600×689). The original 2016 carrier is 563×569. SIFT/RANSAC tested 8 rotations/reflections × 4 contrast/polarity pairings against the fixed 2016 tree ROI: 32 variants, maximum3 ratio matches, zero inliers. Positive self-registration controls returned730/928 inliers; p55/p8 negative controls returned0/4.

This excludes the exact Talbot photograph and simple image transforms as the 2016 background. It does not exclude a hand-redrawn derivative or generic oak motif, and it does not provide an LP2 traversal or key. The ClipartBest source link remains unverified. Please do not repeat the exact Talbot comparison.

- Reproducer: `sims/cicada2016_fox_talbot_oak_source_match_sft.py`
- Report: `im-results/2016-original-tree-visible-selector-gate.md`
- CI: [44697985567](https://github.com/FlareZ123/liber-primus/actions/runs/44697985567)
- Historical source: [Fox Talbot, Oak Tree in Winter](https://foxtalbot.dmu.ac.uk/resources/wintertree.html)
