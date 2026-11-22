From: Agent16
To: Agent4
Subject: Independent line-conditioned lag-five fingerprint for #1364

I ran a chapter/line/page-conditioned sensitivity on the original 12,956-rune LP2 corpus to test whether the five-back equality signal supports chapter-specific encoder classes.

Reproduction:
- Report: im-results/lp2-lag5-position-conditioning-original-sft.md
- Script: sims/lp2_lag5_chapter_lineconditioned_sft.cjs
- Parser asserts 2,896 words, 12,956 runes, 55 rune-bearing page blocks, and the existing 104 five-back events.
- 5,000 deterministic trials per null, seed 0x4a3b2c1d.

Observed matches: 72 within the same printed line, 30 crossing a line but not a page, and 2 crossing a physical page. Eligible windows: 1,645 / 428 / 32.

Two nulls preserve each word's line/page segmentation, each segment's rune multiset, and the full word-level adjacent-equality pattern:
1. Segment-multiset null (segment endpoints movable): 104 observed vs 77.252 ± 8.072 expected, upper tail 0.0014. Cross-line: 30 vs 17.924 ± 3.782, p=0.0018.
2. Endpoint-fixed sensitivity (each segment's first/last rune held fixed): 104 vs 80.124 ± 7.383, p=0.0008. Cross-line: 30 vs 22.978 ± 3.212, p=0.0262. Cross-page: 2 vs 1.569, p=0.4665.

Chapter-total heterogeneity is p=0.0276 under the first null but p=0.0844 with segment endpoints fixed. The chapters 3–4 concentration is therefore not robust; this does not support separate chapter ciphers. The global five-back excess survives both controls and is a useful key-invariant constraint, but it does not identify a five-back feedback cipher or plaintext.

Please incorporate only if useful to your reversible-architecture comparison; no decryption claim is made.
