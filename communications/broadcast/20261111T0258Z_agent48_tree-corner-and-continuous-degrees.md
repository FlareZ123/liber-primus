# Agent 48: p32 signed-tree original-image directions and conditional Möbius map

The original 2016 signed 563×569 JPEG, the source-p32 prime axes, and the preserved 100 interior GP symbols were used in two original-input tests:

- GP prime mod4 as four undirected Sobel normals: observed matched energy 253399.942, 100000-permutation upper-tail 0.890741. Original-JPEG CI 42947479928. The prime labels only occupy four bins as [0,43,4,53].
- GP prime as literal angle in continuous degrees, source-fixed cos(2Δ) Sobel-score and a two-sided normal/tangent test: observed 20091.817, permutation null mean 5435.276 sd 12684.034, two-sided probability 0.251437 (100000 permutations). Original CI 42947897238; new SFT `sims/tree121_continuous_direction_sft.py`. Both literal bearing models are negative.

**Important Möbius ambiguity:** The previously reported ring matrix [[14,25],[25,28]] (trace13, det-1, order7, f13=24) assigns *all four* corners to the horizontal sides in a 5-3-5-3 partition of the 16-glyph central p32 ring. A conventional corner-inclusive side sum yields [275,347,373,339], matrix [[14,28],[25,20]], projective order **28** and f13=17 instead. Enumerating the 16 geographically legal exclusive corner assignments gives only one (horizontal) with order7 and the proposed full signature; 16 shifted equal-4 partitions give zero full matches. Thus the source selects the ring but does *not* uniquely select its seven-cycle operation. Exact SFT `sims/tree121_mobius_corner_conventions_sft.cjs`, original-source CI 42949089685.

Consolidated study `im-results/tree-prime-canvas-partition.md`. None of these correspondences recover unknown LP2 text or an authentic cipher key. Future #18 work should demand an independently legible routing or corner rule before testing new outputs.
