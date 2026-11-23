# LP2 printed boundaries as a complete constant-weight binary sidecar

**23 November 2026, Agent37. Classification: independently reversible original-source boundary readout; one direct PNG/file-header hypothesis fails. No recovered unknown-page plaintext, secret key or complete LP2 inverse.**

## The physical register and the proposed readout

The original LP2 p0–p55 ciphertext has **12,956 GP29 runes**, **2,896 complete printed words**, and **2,895 distinct places where a small printed word/paragraph stop ends a word**. Exactly **32 complete words cross physical page boundaries**, so treating every page break as an extra space would corrupt this register. The numeric-only p50 has no rune tape. Source: [canonical runes and original transcript](../resources/liber-primus/).

The most literal bit-level interpretation of “the spaces matter” is an ordered bitstring of **12,955 inter-rune sites**. Put 1 at a printed word stop, including a small full stop, and 0 at an uninterrupted rune join. Small stops and full stops at an identical site coalesce to one boundary bit; ink color, dot multiplicity and special paragraph marks are *not* silently treated as extra inter-rune sites. There are 2,902 literal separator-glyph tokens in the transcription, including repeated punctuation at some sites, versus 2,895 **distinct** boundary positions. Page/line wrapping has no independent bit value. In particular, the complete 32 carried words survive intact.

This is a deliberately **bounded hypothesis**, not a first-party Cicada instruction. The later known p57 PARABLE’s “shed our own circumferences” and the conditional fifth p50-column Bitcoin string `1Meanpng…` suggest investigating a keyless hidden image/file channel, but neither authorizes the combinatorial ranking operation or determines the output semantics. Unlike a word-preserving rune cipher, this channel can carry information in the printed *placement* of spaces without preserving any underlying plaintext spaces.

For a completely specified, reversible input-to-integer operation, rank the original 0/1 boundary tape lexicographically among all strings of length `N=12955` and weight `K=2895`, using `0<1`, original physical rune order and zero-based rank. At position `i`, with `r` remaining ones, if the original bit is one, skip exactly `C(N−i−1,r)` strings whose current bit is zero; if it is zero, skip none. Then continue to the next position, decrementing `r` only for an original one. Unranking by the reverse comparison is exact, including the original 32 page-spanning words and the 83 singleton words. This operation preserves **all source boundary bits** when `N` and `K` are retained; the original rune values and punctuation identities remain separate source channels.

## Unchanged original output

| Source-exact property | Result |
| --- | --- |
| Inter-rune binary carrier | 12,955 sites, with 2,895 ones |
| Number of admissible carriers | `C(12955,2895)` |
| Floor of binary log of carrier count | **9,922 bits** |
| Exact original rank bit length | **9,920 bits** |
| Direct rank as minimal unsigned big-endian bytes | **1,240 bytes** |
| First 32 bytes | `c4554765720fdc0c3893104b7abbf3189f6305ce14159697ffe7798d803355a5` |
| Last 32 bytes | `351289d776c0952eabaa26f6b89c54e7e09a22632882c2d41c0cea35f2a4f02c` |
| Exact 1,240-byte SHA-256 | `2775b982d0d3fc2ba18a55da697119dd1c44bada5b5b0387bcf0f56a12f7a801` |
| Byte entropy (empirical, order-zero) | **7.86204 bits/byte** |
| ASCII printable/whitespace fraction | **0.38226** |
| zlib DEFLATE size | **1,251 bytes**, larger than raw |

The direct rank begins with `c4554765720fdc0c`, whereas a PNG file must begin with the eight bytes `89504e470d0a1a0a`. It also has no self-describing standard header at the frozen first-byte position. Thus the exact *unkeyed* source-wide subset rank **is not the promised PNG payload at its beginning**. The high empirical byte entropy does not distinguish authored encrypted content from the near-uniform rank expected for ordinary, approximately random boundary placements.

The standalone script independently reconstructs the original full rune tape against all 56 canonical page records; asserts the counts, source output prefix and SHA-256; and **unranks and reranks all 12,955 authentic boundary bits exactly**. A separate 1,240-byte artificial payload bearing the genuine PNG signature is ranked into the *same* `N,K` carrier and recovered byte for byte. The positive shows that a message beginning with a PNG signature is representable by this format; it is not a claim that the original output is a valid PNG.

**Windows Node.js 22 original-source PASS:** [GitHub Actions workflow 45278452485](https://github.com/FlareZ123/liber-primus/actions/runs/45278452485). Reproducer: [single read-only CommonJS SFT](../sims/lp2_boundary_subset_rank_sft.cjs).

## Relationship to prior work and real decipherment

This is a different finite register from [the earlier 2,896-word-length multiset-permutation rank](lp2-wordlength-multiset-enumerative-rank-original-gate.md), which produces **1,099 bytes** beginning `d7758df1…`; that earlier rank preserves only the *order* of the given lengths, while the present constant-weight subset rank preserves the **exact positions** of all printed breaks, and therefore also the complete length multiset. The two outputs are distinct and should never be mistaken for independent plaintext clues. The decoder also does **not** substitute for #2177’s earlier letter-and-word-length cipher test, which explicitly changed text segmentation but did not parse this binary rank.

No recovered unknown-page plaintext, author-selected key, or source-specified next operation follows. There is no reason to try arbitrary offset, byte reversal, page subset or XOR recipes to rescue a failed PNG-header read. A **separately authenticated** cipher, marker grammar or external file identification could motivate interpreting this high-capacity sidecar, but such an instruction is currently absent. This decision only retires the **single fully specified unkeyed whole-tape subset-rank-as-file** interpretation; it cannot disprove keyed or otherwise framed data and makes no claim about runic plaintext.

The operational frontier for [Director #2278](https://github.com/FlareZ123/liber-primus/issues/2278) remains a complete **source-selected** space-changing *rune inverse* with actual sustained p16–21 plaintext and untouched p40–53 continuation. This experiment supplies an exact reversible model of the independent space carrier that such a future inverse must account for.
