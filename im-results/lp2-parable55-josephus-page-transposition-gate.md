# Source-fixed PARABLE Josephus page-order inversion

**Decision, 14 November 2026, Agent 10, Director #835:** The 55-page elimination order already derived from solved p57 is a valid, exactly reversible permutation of the original rune-bearing LP2 physical pages. Applied directly to the 12,956 original runes, it produces **no unknown plaintext** and leaves both rune statistics and printed word-length order indistinguishable from the original's shuffled-register behavior. It cannot by itself turn the unknown glyph stream into ordinarily ordered native GP29 prose. The separate interpretation as a source-selected pointer to p50 remains provisional and is evaluated independently.

## Authored operand and frozen consumer

The original solved p57 PARABLE contains 20 printed words and 95 GP29 runes. Shedding the first and last rune of each word gives exactly 55 interior runes. The already-published original-source hypothesis interprets the full Euler totient of each interior rune's GP prime as a Josephus counting step over **56** original physical LP2 pages, with starting cursor **p0** and clockwise counting, current survivor as 1. The selected final survivor is **p50**, the sole rune-free original page. The source still lacks a first-party instruction naming Josephus, the chosen cursor or full-totient step. [Reproducer of this source hypothesis](../sims/lp2_parable55_totient_josephus_p50_sft.cjs) and [its scope](lp2-parable55-totient-josephus-p50-original-route.md).

For this task, the consumer is frozen to the **forward elimination order**, with no rotated steps, fitted direction or changed key:

```text
39 49 35 43 8 40 54 27 31 46 51 53 28 11 41 24 26 44 45 18
36 38 13 55 1 3 29 30 0 17 20 10 12 5 23 33 2 32 14 52
37 34 47 6 16 4 42 7 21 25 15 9 22 48 19
```

The input consists of the 55 original page-local *printed transcription strings* in `resources/liber-primus/lp2-transcription.txt`. Each keeps all rune glyphs, original punctuation, line-break-independent word delimiters, and within-page word fragments. Source p50 is omitted because it contains no runes. To read under Josephus, concatenate intact page strings in exactly the sequence above, without inventing separators or changing ciphertext symbols. Its precise inverse redistributes the same page strings into physical order. This changes only page joins: 32 carried words in physical order become 31 under Josephus. Total rune count and sorted rune multiset are preserved exactly.

## Original-input decision

Word lengths are clipped to 1 through 8 plus one bin for 9 and higher; mutual information is computed on all adjacent printed word-length pairs after the chosen page concatenation. This whole-book MI is defined with a different boundary policy than the earlier *within-chapter* MI of 0.012156, so their numeric values should not be equated.

| Original input | Physical print order | Fixed Josephus reading |
| --- | ---: | ---: |
| GP runes | 12,956 | **12,956** |
| Complete or newly joined printed words | 2,896 | **2,897** |
| Adjacent carried words across page joins | 32 | **31** |
| Word-length adjacency mutual information, nats | 0.0122996929 | **0.0119046146** |
| GP rune index of coincidence | 0.0344783979 | **0.0344783979** |

Against **2,000** deterministic Fisher–Yates random page permutations preserving the same original page bodies, the word-length MI null mean is **0.0117131512**, standard deviation **0.0006472028**. The Josephus reading has **z = +0.296**, and **755/2,000** null orders produce an MI at least this large. The original physical order itself is z = +0.906 in the same null. There is no Josephus-specific restoration of native word grammar. The first page read would be original **p39**, a non-opening page of the physical book, and the first 100 rune glyphs belong wholly to its existing apparently ciphertext-only text.

**Exact source-native positive:** Independently GP-normalized Gibran prose is cut into page-sized pieces with exactly the **same 55 original rune counts**, and pieces are distributed into physical page IDs by the inverse of the frozen Josephus permutation. The forward Josephus order reassembles that prose **byte-for-byte**. The prose's complete word-length MI is **0.052218418** versus **0.048834826** even in the deliberately scattered physical order; its rune IoC is **0.0603808467** in both. The control demonstrates that this page transposition preserves most within-page natural-language grammar and the entire rune-frequency signature. It also establishes that the inverse implementation is not accidentally changing symbols or page sizes.

## Cryptanalytic limit and next decision

A permutation of intact original pages cannot change the **unigram count of any of the 29 runes**, and it cannot alter word order inside those pages. Consequently its original IoC stays exactly **0.0344783979**, while the source-native positive is **0.0603808467** even before the correct page ordering is restored. Recovering natural prose from the actual unknown book therefore requires a further operation that changes symbols or word framing, together with source-selected state or key material. The Josephus permutation alone yields no 100-rune coherent original plaintext interval. A second cipher may still employ this page walk to select key material or reset order; this experiment does not reject such an independently authored handoff.

Reproduction and exact output: [single read-only Node.js 22 CommonJS SFT](../sims/lp2_parable_josephus_page_transpose_sft.cjs). Inputs are the versioned original transcription and GP corpus in `resources/liber-primus/` and the pinned `resources/control/gibran_prophet_58585.txt`; all counted runes match the original page corpus rune for rune. No new unknown-page key or plaintext is claimed.
