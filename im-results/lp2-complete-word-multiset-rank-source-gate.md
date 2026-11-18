# Original LP2 whole-word multiset ordinal stream: exact reversible 17,665-bit gate

**18 November 2026, Agent25, Director #1493. Completed finite experiment.** The complete original GP29 ciphertext admits a deterministic, lossless **per-printed-word multiset-permutation rank** representation totaling **17,664.9537898 capacity bits** over all 2,896 words. This is original-source arithmetic, not recovered plaintext, author-selected key material or a manuscript cipher. One fixed whole-book mixed-radix big-endian byte readout has **no opening recognized file signature**, near-uniform bytes, and no authenticated framing or decoding instruction. The independent solved-p57 positive and 64 original-multiset-preserving controls pass a source-locked Windows experiment.

## Independent puzzle premise

Cicada's signature-valid 2016 message speaks of **words**, **meaning** and **numbers** as a map/direction. The LP2 artifact visibly divides rune text into printed words, its accompanying Gematria Primus legend orders exactly 29 symbols, and the source has many unequal within-word rune arrangements. A classical enumerative code can assign every word its exact rank among arrangements of its observed rune multiset. The serious competing explanation is ordinary near-uniform ciphertext: its internal word orders have the same huge rank capacity without intentionally conveying a second message.

This is a **different object** from the already screened ordering of word lengths (#1472), predecessor-exclusion 28-symbol serial ranks (#1473), word-space gaps (#1208) and arbitrary whole-word transpositions. Every word retains its own rune multiset, punctuation-independent slot, original physical position and length. The original images are primary; the pinned [canonical GP29 word/corpus representations](../resources/liber-primus/lp2-corpus.json) and [source transcription](../resources/liber-primus/lp2-transcription.txt) are asserted rune-exact against one another.

## Mathematical encoder and frozen reader

Merge the **32 real words crossing physical LP2 pages**, ignoring page and typographical line wraps as word delimiters; do not include the runeless p50 as a character page. This yields **2,896 complete source words, 12,956 GP29 runes**, including 84 words whose multiset admits only one ordering and 2,812 informative words.

For word `w` of rune length `k`, GP rune-index multiplicities `m_0,...,m_28` give an exact integer radix

`N_w = k! / (m_0! * ... * m_28!)`.

Define `r_w` as the **zero-based lexicographic rank among all distinct arrangements** in the unchanged, source-published rune index order 0..28. Identical rune occurrences are never artificially distinguished. At a partial prefix with `k'` remaining glyphs and `N'` possible suffixes, the number of complete words beginning with candidate next glyph `x` is exactly `N' * m_x / k'`; sum the blocks for symbols less than the observed next glyph. This gives `0 <= r_w < N_w` without any seed or fitted parameter.

Freeze one simplest whole-book decoder only: concatenate all ranks as a **single mixed-radix integer** in original word order, `R_(i+1)=R_i*N_i+r_i`, starting `R_0=0`. Its total known capacity is `M=∏ N_i`. Interpret `R` as a fixed-width **big-endian byte array of exactly ceil(bit_length(M−1)/8)=2,209 bytes**, with only the leading necessary zero bits; no byte offset scanning, endian trials, chunk resets, post-selected compression type, source symbol transpositions or hidden-pad guesses. Because each original word multiset remains in the source, exact reverse modulus/division retrieves all ranks, and exact distinct-multiset unranking restores the **12,956/12,956 source glyphs** and all printed word boundaries.

This particular whole-book byte framing is our deterministic engineering choice; **no surviving Cicada-authored instruction selects mixed-radix accumulation, big-endian integer serialization or a decoding payload format**. That is the decisive source-selection failure, regardless of whether bytes look uniformly random.

## Original readout and matched controls

| Frozen input | Exact observed result |
| --- | --- |
| Source original printed words | **2,896** complete, 32 across page boundaries |
| Source original runes | **12,956**, every one exactly reconstructed |
| Words with >1 distinct permutation | **2,812** |
| Multiset-permutation total capacity | **17,664.953789800955 bits** |
| Global finite integer bit width | **17,665 bits** |
| Fixed-width big-endian representation | **2,209 bytes** |
| Byte entropy | **7.920031966405044 bits per byte** |
| Printable ASCII byte share | **0.36668175645088275** |
| Recognized file signatures **at byte 0 only** | **none** |
| Opening 16 bytes | `011754f47f82111dd3f706936b45a13d` |

The first source word has **8 distinct GP runes, rank 22,713 among 40,320**; the second has **rank45 of 120**. Thus even the beginning is a precise, checkable deterministic product of source input, rather than a freestanding plaintext assertion. The entire 2,209-byte tape is emitted only through the reproducible SFT, and is **not** a discovered decrypted message or an independently verified key. A raw near-entropy-8 byte record alone cannot decide between encrypted content and arbitrary enumeration of already encrypted runes.

**Source-native positive.** Preserve the original clear physical p57 95 runes and its **20 complete word boundaries**. Their exact word-multiset rank capacity is **131.185566238 bits** (integer width 132 bits); the identical full rank/unrank pipeline restores every source-solved rune and word. This checks the method against true plain-GP input, not a supposed hidden payload.

**Original-word-multiset-matched null.** Freeze xorshift seed `0x33011493`. For 64 repetitions, independently Fisher–Yates shuffle the rune ordering *inside each* of the 2,896 source words, preserving every word length, position, GP rune multiset, total capacity and available range. Encode each with the exact same reader. The observed byte entropy has **rank 53/65** relative to 64 control books, each between **7.8954447583 and 7.9250153480**. Observed printable-byte share has **rank25/65**, with control range **0.3467632413–0.3920325939**. No control has a matching opening signature either. These are small finite descriptive control ranks, not calibrated p-values for the many historical framing options one could invent.

## Discriminating decision and reuse boundary

The **single frozen mixed-radix receiver fails** to supply coherent GP prose, authentic key bytes, an independently typed header or a source-selected interpreter. Because the original author provided no rank-framing instruction, exploring byte offsets, endian swaps, page resets, alternative alphabet orders, arithmetic-model priors or guessed decompression formats would be unlicensed keyless parameter expansion. The test therefore closes the direct public factoradic read, without excluding future evidence of an authorial key-bearing use.

A new attack should begin with an **original primary-source marker or historical command** that independently specifies (i) which word-multiset rank channel is meant, (ii) its interval framing and (iii) an expected file/text/GP29 decoder, then demand at least 150 coherent original-runic plaintext symbols and an untouched holdout. The exact representation does not by itself change the unknown-page decryption frontier.

**Reproduction:** [Node22 CommonJS source-locked SFT](../sims/lp2_word_multiset_factoradic_original_sft.cjs) verifies original corpus and every source-boundary, exact rank/unrank across all 2,896 words, p57 clear positive and 64 declared controls. [Windows GitHub Actions PASS, run 44355560879](https://github.com/FlareZ123/liber-primus/actions/runs/44355560879).
