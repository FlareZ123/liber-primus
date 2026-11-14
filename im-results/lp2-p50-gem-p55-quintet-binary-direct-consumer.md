# 2016 dimension-selected GEM vs. LP2 terminal quintet packet: exact direct-byte consumer

**Agent 5, 14 November 2026. Research status:** bounded original-input negative for one short, reversible, historically plausible source-to-source byte decipherment. **No unknown Liber Primus plaintext, authentic key or authorial transport format recovered.**

## Why this route was chosen

Two recently documented, independently constructed source readings create a prospective *key* and *ciphertext carrier*:

1. The archived [2016 Cicada-signed text](../resources/historical/cicada2016-4gq25-outguess.asc) says that Liber Primus words are the map, their meaning the road and their numbers the direction. The original signed picture dimensions are **563×569**, corresponding to standard prime ordinals **103 and 104**. A provisional original-table interpretation, already developed independently by Agent 6, splits the printed p49–51 32×8 grid's byte into **B=29q+r**; the remainder indexes the Gematria Primus rune, while \(q+1\) gives a conventional keypad direction. Starting at one-based cell103 and following these directions yields **103→111→119→127→128→119**, hence rune path **OOGEM** with a **GEM** three-cycle. The independent height-selected cell104 gives the **OG** cycle. This is a conditional readout: the signed text specifies neither the precise keypad nor the 29-rune quotient/remainder operation. [Original graph hypothesis](lp2-p50-directional-functional-graph-prime-ordinal-starts.md).
2. Original p55 contains a single rune continued from p54, followed by **75 physical-page runes**. A previously published *hypothetical* 5-GP-rune to 3-byte plus 1-overflow-bit reversible readout produces **45 bytes**, with first byte21 matching the carried rune's index21, final byte45 matching packet length and an apparent **43-byte middle payload**. This is an observation, **not** an authenticated serialized byte format. Its fifteen overflow bits are \`10010 00000 00000\`. See [source-specific packet investigation](lp2-terminal-quintet-overflow-channel.md).

Historical Cicada 2014 used **bytewise XOR** on original OutGuess-supplied byte shares, and known GP29 decipherment used additive/Vigenère operations. That motivates a narrow *actual decoding attempt*: use the independently original-selected **GEM** three-rune cycle as a repeating byte key on the 43-byte putative terminal payload, and check the directly source-motivated fixed alphabets and byte operators. The competing **Y** one-rune self-loop appears at the pre-existing source-indicated physical p50 first token, original global grid cell81 (2014 div331 and 2016 image height569 conditional book-word paths). Test its direct byte interpretations as a genuine rival, avoiding more key search.

## Exact frozen decoder

The proposed source-derived 43 bytes, untouched and in physical reading order, are:

\`\`\`text
023cbcedd14959802c8aee4d43d09b0ead8f8e12d2f139066f3e8892b6460c27a66059a2e9bc7310637750
\`\`\`

Test exactly seven source-named short repeated key mappings:

| Source loop | Bytes as key |
| --- | --- |
| GEM, literal ASCII | \`47 45 4d\` |
| GEM, GP29 zero-based indices | \`06 12 13\` |
| GEM, GP prime weights | \`11 43 47\` |
| GEM, GP29 one-based indices | \`07 13 14\` |
| Y, literal ASCII | \`59\` |
| Y, GP29 index | \`1a\` |
| Y, GP prime weight | \`67\` |

Apply each as a repeating XOR mask, a bytewise additive mask, or a bytewise subtractive mask modulo 256, always starting with the **first middle-packet byte**. There are exactly **21 distinct declared configurations**, with no fitted phase/nonce/permutation or free key bytes. These operations all have explicit inverses and preserve the full 43 bytes. Test whether a decoded result is ordinary printable ASCII at a deliberately generous threshold **32/43 printable bytes**, or begins with a standard PDF/ZIP/PNG/gzip/XZ/bzip2/JSON/HTTP source signature. A true 43-character ASCII plant, encrypted by the source GEM ASCII XOR, must be exactly recovered.

## Original result and decision

All 21 candidates fail the direct ASCII/file-format criterion. The **maximum is only 20/43** ASCII-printable bytes, attained under GEM prime weights with byte subtraction and also Y-GP with subtraction. None starts with any declared recognizable file signature. The source-English 43-byte plant round-trips **43/43** under the exact GEM-ASCII XOR inverse.

The original model's source-selected ingredients are unusually concrete, but the crucial *consumer* is still conditional: neither the 2016 signed text nor original p55 image instructs packing five runes into three bytes, applying a key from the new 3-cycle, or using XOR on this page. These are independent analyst proposals. This scoped failure means **GEM/Y do not directly reveal a 43-byte plain English/file payload by these fixed elementary operations**. It does not exclude binary encrypted or compressed data, an actual different key, a different source graph, or a nonlinear decryption selected by an undiscovered clue. It supplies no justification to fit additional per-byte transformations around failed outputs.

**Reproducibility:** [source-only Windows-compatible Node22 SFT](../sims/lp2_p50_gem_p55_quintet_binary_consumer_sft.cjs), which re-extracts the original table paths and original p55 packet before performing all 21 inverses and a positive plaintext plant. It does not rely on a manually copied plaintext guess.

**Independent execution witness:** the declared original-input 21-case gate, native planted ASCII control and every source geometry assertion passed on Windows/Node.js 22 in [GitHub Actions run 43595880025](https://github.com/FlareZ123/liber-primus/actions/runs/43595880025) (job132450143657). The run confirms a scoped negative, without authenticating the speculative packetization or original author intent.
