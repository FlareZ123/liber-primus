# P8's source-selected MXIX=1019 inverse has no direct binary container

**Scope and status (23 November 2026).** This is a bounded *negative decipherment decision* on actual physical LP2 page p8. It is **not** recovered plaintext, a proven p8 key, or an interpretation of the page's meaning. It tests one historically motivated second-stage readout left open by the existing [p8 red-heading/prime-clock study](../workplace/2014-prime19-p8-xix-black-clock-source-path.md), rather than retrying arbitrary additional keys.

## Independent original inputs and proposed human solve path

Physical p8 has a 12-rune red heading and 243 subsequent black runes, from [the original corpus](../resources/liber-primus/lp2-corpus.json) and [ink annotations](../resources/liber-primus/lp2-ink-annotations.json). The first complete red word is GP0 **[14,10,14,19]**, transliterated **XIXM**. Reversal gives the conventional Roman numeral **MXIX=1019**. This is a source-visible *candidate* prime-stream index. Neither reversal nor prime-stream application is specified by a signed Cicada instruction.

The final known solved page p56 uses the explicit **prime-totient key**, advancing its key clock only on non-F plaintext runes. Hypothesis: apply exactly that reversible historical cipher to p8's original black ciphertext with prime index **1019**, then regard its 243 plaintext GP29 symbols as a *single source-ordered radix29 integer containing compressed or otherwise typed binary data*. This tests a compressed intermediate even when direct GP-letter output is meaningless. The native 2014 puzzle used compressed payloads elsewhere, which makes a direct container check historically motivated. No arbitrary offsets or encryption passwords are selected.

## Exhaustive literal-F inverse under the frozen prime index

The p8 black section has eight literal ciphertext F positions (zero-based black offsets) **22, 149, 171, 177, 180, 184, 191, 233**. Every F ciphertext has exactly two historical branches: transparent plaintext F with no prime step, or an ordinary non-F plaintext using the next prime. For every other ciphertext glyph, the ordinary inverse must produce a non-F symbol.

Enumerating the complete **2^8=256** branch family yields **exactly three legal, re-encrypting masks** (bit 0 corresponds to offset22):

| Transparent-F bit mask | Consumed prime steps | Whole 243-digit radix29 byte length | F-excluded radix29 byte length |
| --- | ---: | ---: | ---: |
| 7 | 240 | 148 | 146 |
| 135 | 239 | 148 | 145 |
| 255 | 235 | 148 | 143 |

These same three paths and exact clocks are independently established in the prior p8 prime-clock study. In all three, the first sixteen inverse rune indices are **[8,13,14,2,3,25,12,26,20,4,17,6,27,10,14,14]**, with no native-GP text recovery.

## Direct binary test and result

For each legal inverse, interpret (a) all 243 GP29 decoded symbols and (b) the non-F symbols only, as a **big-endian base29 integer** packed into minimal bytes. For each, inspect original and reversed byte order. This produces **12 concrete original-source byte streams**. Test initial magic for gzip, zlib, raw ZIP, bzip2, XZ, PNG, JPEG, PDF and PGP armor. Run native zlib, gzip and strict raw-DEFLATE on each, accepting only at least 50 decoded bytes with at least 90% readable ASCII.

**Result:** **zero typed headers and zero readable decompressions.** Whole-sequence forward streams are each **148 bytes**. Their shared source prefix is **068e72d64da34d6cec2f175499791e36**, an unrecognized binary header. The F-excluded streams start **119e2e5b**, **9b860324** and **0e69211e** respectively. An independent CPython standard-library check also found **zero successful gzip, bzip2, XZ, zlib, or raw-DEFLATE decompressions** on the twelve original streams. No recovered English bytes or complete payload resulted.

The read-only, source-backed [Node22 CommonJS SFT](../sims/lp2_p8_mxix1019_binary_container_sft.cjs) freezes the original word and black input, enumerates every legal skip, asserts precise forward re-encryption, serializes source-runic digits without fitted keys, and includes two independent positives: the genuine solved p56 cipher and a byte-compressed native message planted through the exact proposed p8 prime/F/radix29 inverse. The SFT was added during this invocation; the original-path arithmetic and direct decompression were separately checked in tool runtimes. A separate GitHub Actions execution has not been asserted.

## Decision and precise open branch

The **direct prime1019→radix29→standard compressed or typed file** route fails on the original p8 black ciphertext. It does **not** exclude a different key start, a genuinely supplied binary frame, altered radix packing, an additional keyed cipher, or a non-file intermediate; none is justified by the cited red source word. Further searches over such variables would require an independent original clue selecting the extra operation and a typed recipient. The uniquely readable XIXM/MXIX word remains an interesting but **provisional** navigation/key-source clue, with no unknown plaintext yet recovered.
