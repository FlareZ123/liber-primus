# Original LP2 predecessor-difference base28 byte-carrier gate

**Agent 8, 21 November 2026. Classification: bounded negative direct-output experiment. No unknown-page plaintext, source-authenticated key, or decoder.**

## Why this route could have led to plaintext

The original 2013 Cicada TCP transcript includes an explicit `BASE29` operation. The 55 rune-bearing unsolved LP2 pages contain 12,956 Gematria Primus (GP29) runes but only 86 same-page adjacent equalities across 12,901 eligible pairs. One comparatively simple reversible construction is a predecessor-difference channel: `d[i] = (c[i] - c[i-1]) mod29`; its overwhelmingly nonzero residues may represent base28 digits or a base29 binary numeral, with the rare zeros separating separately serialized packets. If such a numeric stream encodes compressed plaintext, standard container or compression framing could reveal it without guessing an arbitrary language-model message.

This **does not imply** that Cicada authored a 28-radix predecessor codec. The historical BASE29 instruction supplies a numeral precedent, not a transform selector. The experiment is worthwhile only as a finite direct inverse of an unusually strong property of the real ciphertext.

## Fixed input and alternatives

The source is `resources/liber-primus/lp2-corpus.json`, physical p0–p55, in printed order. P50 is rune-free and contributes no symbols. Every first rune has previous ciphertext zero for the global stream; the rival clock restarts the predecessor at each physical page. The finite family tests:

- Both difference signs: current minus previous, previous minus current.
- Continuous or physical-page-reset predecessor clock.
- Three exact unsigned-integer serializers: full differences as base29 digits; zero differences discarded and 1–28 mapped to base28 digits 0–27; or each maximal nonzero interval serialized separately in base28.
- Original/reversed digit sequence and original/reversed output-byte sequence.

There is no fitted key, nonce, selected original page, preferred magic prefix, word reset, or unknown output transformation.

The integer is converted directly into a minimally sized unsigned big-endian byte sequence. This test extends **already published** full-stream and chapter-scoped direct-difference compression negatives; its incremental feature is treating the **86 actual zero-difference sites as boundaries for 87 independently encoded candidate byte packets**, rather than merely omitting those sites. The earlier full-stream family is not a new exclusion here: [all-register DEFLATE gate](lp2-delta28-direct-compressed-transport-original-gate.md), [chapter-scoped and byte-pair gates](lp2-gp28-difference-direct-binary-transport-gate.md), [rank28 framed binary gate](lp2-gp28-unframed-compressed-binary-gate.md). Every candidate is examined for exact file magic (GZIP, ZIP, PDF, PNG, BZIP2, XZ, GIF and valid zlib CMF/FLG); each is also passed through Node 22 GZIP, zlib, raw DEFLATE and Brotli decoders. Valid decompression must consume the entire byte stream and yield at least 64 bytes with 80% printable ASCII. Accidental header compliance alone is not reported as a solution.

## Reproduced original result

| Original difference clock | Zero differences | Nonzero segments | Longest segment |
|---|---:|---:|---:|
| Continuous global, either sign | 86 | 87 | 711 digits |
| Page-reset, either sign | 88 | 89 | 661 digits |

**1,440** exact candidate byte carriers were tested. A few short packets accidentally satisfied the generic zlib CMF/FLG arithmetic, such as prefixes `087a1a40`, `486a66`, and `68a06b0e`. None produced a valid decompressed prose payload. No recovered signed packet, source text, or original-cipher inverse resulted. Direct plain-ASCII byte streams were likewise not found; the compact whole-stream representations were about 7.7–7.9 KB of near-random bytes.

A **synthetic native positive** compresses twelve copies of the original solved instruction `IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE.` using zlib to 68 bytes, converts them to 113 base28 digits, creates a 29-rune cumulative-difference ciphertext with no doublets, reverses it exactly and recovers the plaintext through Node 22's zlib decoder. This verifies that the test catches a genuine source-like compressed document when its declared numeral format is present. It does not validate the historical hypothesis.

**Reproduction:** [read-only CommonJS SFT](../sims/lp2_delta_base28_bytecarriers_sft.cjs) · [Windows Node 22 PASS, run 44935650195](https://github.com/FlareZ123/liber-primus/actions/runs/44935650195).

## Decision

The **new zero-delimited-packet reading** of this already extensively tested direct transport also fails. Retire this *particular direct byte-carrier serialization* as a route to the unsolved plaintext. It neither rejects arbitrary GP28 transforms nor excludes an externally keyed cipher or other serialization. The actual obstacle remains a first-party clue selecting the 29→28 operation, the escape semantics, and a legitimate binary/plaintext consumer. Further byte-order, container, or page-subset sweeps need such a selector; unconstrained extensions would repeat the streetlight search.
