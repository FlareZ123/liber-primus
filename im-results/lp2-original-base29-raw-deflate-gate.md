# Original LP2 direct GP29 positional integer as raw RFC1951 and OpenPGP ZIP

**Agent26, 18 November 2026. Original-input bounded negative. No unknown-page plaintext, key, authenticated cipher, or puzzle destination recovered.** The direct untransformed BASE29 positional-byte transport, on the complete unsolved book, nine image-visible chapters and 55 rune-bearing pages, produces no **complete** valid RFC1951 DEFLATE byte stream or source-typed OpenPGP ZIP-algorithm-one body. Two partial zero-length DEFLATE matches at page-level source bytes are rejected by exact compressed-input consumption.

## Human-visible source premise and prior coverage

The authenticated original 2013 Cicada challenge demonstrates positional **BASE29** conversion, including the worked numerical example \`3301 → 3QO\`. Its original OpenPGP compressed-data teaching material uses ZIP compression (algorithm ID 1), which is **raw RFC1951 DEFLATE** rather than a GZIP file. The latter packet type is a natural exact historical receiver for a numeric GP29 manuscript if the authors deliberately reused that interface. There is **no first-party instruction** telling a solver to read complete LP2 units as raw compressed byte packets, and no source selects their byte width.

Prior direct transport work, [original-book/chapter BASE29 source gate](lp2-original-chapter-base29-direct-file-gate.md), checked standard BZIP2/GZIP/XZ/PNG/ZIP/PDF **file signatures**, and explicitly left headerless raw DEFLATE untested. Separately, [H/G/HG-filtered binary receiver](lp2-dualfactor-deconvolution-base29-compressed-transport.md) did test raw DEFLATE, but only on six **transformed** GP29 residue streams. This experiment newly tests **the unaltered source GP29 integer itself** without either polynomial filter or a guessed key.

## Frozen reversible byte serializations and full source input

Read only \`resources/liber-primus/lp2-corpus.json\`; keep all 29 GP runes at their original ordinal indices 0..28, original source ordering, page boundaries and the nine image-selected visual chapter starts p0,3,8,15,23,27,33,40,54. Physical p50 is a numerical table and has zero prose runes. This produces **65 exact independently printed source units** (one entire 12,956-rune unknown book, nine chapters with rune lengths 729,1145,1729,1903,1021,1433,1680,3008,308, and 55 nonempty physical pages).

For each unit, interpret all GP29 digits **most-significant first** as one integer. Serialize in big-endian bytes (a) with the literal fixed maximum GP29 bit-width \`ceil(n log2(29)/8)\`, and (b) with the canonical minimal big-endian byte width. Only 11 of the 65 fixed/minimal pairs differ; deduplicating identical representations **within each unit** leaves **76 candidate original byte strings**. No leading glyph deletion, offset scanning, reversals, secret keys, alternate alphabets, byte padding beyond this fixed-width convention, format guessing, or post-parse transformations are allowed.

For each of these 76 exact strings:

1. Run Node22's \`zlib.inflateRawSync\` at **byte offset zero** with 1 MiB output cap and \`info:true\`. A frame is accepted only if the decompressor consumes **the complete input**, measured from \`engine.bytesWritten\`.
2. If the original first byte is literal \`01\`, separately treat it as the historical OpenPGP ZIP *compression algorithm identifier* and attempt raw-DEFLATE on its exact subsequent byte body. An OpenPGP packet header or arbitrary offset is never invented.
3. Record every syntactically accepted partial frame, including 0-byte decodings, to distinguish false 2-byte early stops from genuine compressed messages. Flag a **complete** output of at least 32 bytes with at least 80% printable ASCII/whitespace as a language candidate; do not rely solely on this heuristic for the complete-frame verdict.

## Complete original result

| Source-original metric | Exact result |
| --- | ---: |
| Unsolved rune symbols / rune-bearing pages | 12,956 / 55 |
| Distinct source units (book + chapters + pages) | 65 |
| Fixed/minimal distinct byte strings within those units | **76** |
| Complete direct raw RFC1951 frames | **0** |
| Complete OpenPGP ZIP-algorithm-one raw bodies | **0** |
| Syntactically parsable but incomplete raw frames | **2** |
| Partial cases | p20 and p28, fixed-width, 164 input bytes each |
| Bytes consumed / decompressed payload in both partial cases | **2 / 0** |
| Any other accepted raw or source-typed ZIP body frames | **0** |
| Complete coherent 32+-byte printables | **0** |

The two accepted partial inputs are **not** compressed payloads: both stop at two bytes, leaving 162 of 164 original bytes unused. The maximum printable fraction among all outputs of length at least 32 is therefore zero by an empty set. No unencrypted compressed English, OpenPGP ZIP literal, source key or unknown-text solution was obtained.

## Positive checks, exact execution and follow-up decision

The **same source-exact test** compresses genuine original *solved p57 PARABLE* runes three times with raw DEFLATE, encodes that byte packet as minimal GP29 digits, recovers the exact compressed bytes, and inflates to the original complete solved text. The same independent positive passes when a literal OpenPGP algorithm-one byte \`01\` prefixes the compressed body. A deliberately appended 16-byte junk trailer is rejected by the complete-consumption rule, proving the two partial original hits are not misclassified as complete streams.

- [Read-only CommonJS SFT](../sims/lp2_original_base29_raw_deflate_sft.cjs)
- [Manual Windows Node22 workflow](../.github/workflows/agent26-direct-base29-deflate.yml)
- [Successful original-and-positive CI run 44341018959](https://github.com/FlareZ123/liber-primus/actions/runs/44341018959), Windows Server 2022, Node v22.23.4.

**Cryptanalytic decision:** retire **the complete-source-unit, untransformed, positional-GP29 → exact raw-DEFLATE/OpenPGP-ZIP-body** hypothesis. It is independent of, and therefore closes a gap in, the already-failed direct headered compressed-file test. The failure does **not** rule out encrypted or keyed packets, another authentic representation, original page imagery or an external source. Reopen only when a Cicada-authored instruction specifies a different operand, byte framing or actual decoder, or an independent unknown-page plaintext is obtained. The general solution remains open.
