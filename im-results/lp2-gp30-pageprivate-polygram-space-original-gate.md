# GP30 page-private polygrams and genuine word-space movement: an all-secret exclusion

**Agent4, 23 November 2026.** This is a new, reproducible **conditional original-cipher negative**, not an original plaintext recovery. It refines the earlier GP29 fixed-packet equality report by allowing word boundaries to become genuine members of a 30-symbol cipher alphabet. It gives a separate, arbitrary secret block permutation **to every physical page**, and the author can choose each page's packet phase. The five- and seven-cell 2014 puzzles make polygraphic grouping human-conceivable; no authenticated Cicada instruction specifies this particular GP30 cipher.

## Source-complete 30-symbol input

Parse the full original 2014 runic page transcription, retaining all **12,956** GP29 rune symbols and exactly **2,896** authentic completed words (including **32** genuine words crossing a printed page seam). Physical line and page wraps do not terminate words. Map the single punctuation token completing each printed word to an extra **SPACE=29** symbol, retaining its original ink type in the input sidecar. Thus the finite ciphertext contains **15,852** symbols over GP30, partitioned into **55** real rune-bearing physical pages; the printed numerical p50 is runeless. A hypothetical decoder can change arbitrary runes into spaces and spaces into runes. It can place word breaks in wholly new positions and alter every rune identity.

For any fixed width k and physical page s, group the original token stream into consecutive complete k-packets starting at page-local phase phi in {0,...,k-1}. Grant an **arbitrary unrelated bijection on all 30^k packet values for every original page**, plus an arbitrary permutation of complete packet order; the few fringe tokens shorter than k are outside the test. The equality relation among complete packets is invariant under every possible such key and block shuffle. For an even more generous necessary-condition test, let the original ciphertext choose each page's phase that **maximizes** duplicate packet pairs and the candidate plaintext separately choose each page's phase that **minimizes** them. If min E(plaintext) > max E(original), the specified family is impossible for that plaintext under *every* secret key and phase. Even a deterministic, lossy block lookup cannot split plaintext equalities, so the one-sided exclusion also applies to it.

## Exact original and independently native-registered comparison

The all-phase page-private original *maximum* collision pairs for the full 15,852-token manuscript are:

| k tokens per block | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Original 55-page maximum | 1,783 | 56 | 3 | **0** | 0 | 0 | 0 |
| Original p16–21 maximum | 241 | 8 | 0 | **0** | 0 | 0 | 0 |
| Original held-out p40–53 maximum | 417 | 13 | 1 | **0** | 0 | 0 | 0 |

Each of 128 source-native GP30 windows from each of three separately checked-in Gibran, Shakespeare, Emerson source books has **exactly 15,852 tokens**, including spaces encoded with the independently validated original LP1 orthography and its held-out authentic clear LP2 p57. Overlay the 55 original physical page token lengths. The plaintext collision score grants **independent minimum selection over all k alignments on every page**. With frozen xorshift32 seed 0x33012026, the complete count is **384 reference windows**:

| Control book | k4 full-book minimum E | k5 full-book minimum E | k6 full-book minimum E | k5 full-book sources impossible |
|---|---:|---:|---:|---:|
| Gibran | 145 | **38** | 3 | 128/128 |
| Shakespeare | 64 | **8** | 2 | 128/128 |
| Emerson | 66 | **6** | 1 | 128/128 |
| Actual unknown LP2 source: maximum | **3** | **0** | **0** | n/a |

For **every one of all 384** original-sized native-GP windows, even k=6 has strictly more page-private complete-packet equalities than the original source's **zero**. All k2–k4 original-specific complete training p16–21 and separate held-out p40–53 comparisons also exclude all **384/384** native windows after granting the same wholly free page phases. At k=5, the *shorter section* training coverage is **362/384**, and held-out p40–53 is **380/384**, so these shorter segments alone are conditional and have exceptions. For k7 and k8, some complete native windows achieve zero collision and the all-key collision test cannot exclude those sources; do not extend the k2–k6 claim to arbitrary block sizes.

A **real reversible GP30 positive cipher** in the SFT uses distinct page-private integer maps x↦7x+salt (mod 30^5), with inverted maps, changing both original rune values and actual SPACE positions. It decrypts and reencrypts **all 15,852** independently native-coded tokens under 55 separate page key/phase choices, and also round-trips the **entire authentic 95-rune, 20-word clear p57 control**. It demonstrates that the packet-invariance obstruction applies even when word gaps really move.

## What this changes

A static, complete-width **2–6-token page-local GP30 polygraphic substitution**, regardless of the enormous unconstrained secret 30^k key tables, packet order and independently chosen page phases, cannot map this exact printed unknown ciphertext into the **384 tested source-native English full-book samples**. This directly closes a useful subset of the #2278 value- and word-space-changing hypothesis. It does not rule out nonlocal block movement across pages, a per-packet/history-evolving key, variable-length coding or an atypical plaintext language. There is **no plaintext, authentic codebook, key, or author-selected LP2 inverse**, and ordinary English controls are finite, sampled reference witnesses rather than an all-language theorem.

**Windows Node22 original-source PASS:** [workflow 45111239900](https://github.com/FlareZ123/liber-primus/actions/runs/45111239900), on the committed script after correcting a Windows CRLF-only reference-parser issue. **Reproduce:** [self-checking Windows Node22/CommonJS SFT](../sims/lp2_gp30_pageprivate_polygram_original_sft.cjs); inputs are the frozen original rune transcription and GP29 corpus plus three checked-in prose sources. The SFT tests original source position and counts, authentic p57 glyph spelling, both independent physical sections, all per-page packet phases, all 384 native comparison windows, and forward/inverse GP30 word-space movement. No plaintext content was fitted to the ciphertext.
