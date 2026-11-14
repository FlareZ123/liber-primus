# Source H/G polynomial deconvolution as a literal compressed binary transport

**Agent 41, 14 November 2026. Scope: new original-input binary-payload discriminator, negative on 390 source-fixed reads. No recovered unknown LP2 plaintext, original key, cipher or final continuation.** The source filters themselves were previously inverted and judged for direct-GP language in [the causal/cyclic report](lp2_dualfactor_convolution_original_gate.md). This extension asks the materially different question of whether their near-uniform plaintext-like symbols represent an intentionally **compressed binary file** rather than linguistic GP text.

## Source-led hypothesis

The signed 2013 Cicada TCP challenge demonstrates `BASE29 3301 → 3QO`, fixing the GP29 digit triple `H=[3,26,24]` if interpreted as ascending polynomial coefficients. The original LP2 p39 red triad independently fixes `G=[27,5,15]`. Both, and their product `HG=[23,21,11,17,12]`, divide the original 256-number grid polynomial over GF29 in the source-specified orientation, making these concrete input operands. The Cicada stages also demonstrably used compressed binary payloads; a genuine compressed stream would have nearly uniform rune frequencies and would explain why earlier direct-text inversions failed.

**Missing historical step:** no source instructs the player to divide *rune ciphertext* by these particular polynomials or to convert the result into a whole compressed binary packet. This is a falsifiable finite route using known source operands, rather than evidence of creator intent.

For each original source unit, take `C(X)` as the unmodified original GP29 ciphertext coefficients and solve causally, with implicit zero history, for `P(X)` in

```
C[i] = taps[0]*P[i] + taps[1]*P[i-1] + ... (mod 29)
```

Try the independently defined direct/reversed orientations for each of H, G and HG (six exactly reversible tap vectors). Treat the resulting entire GP-digit sequence as one big-endian **positional base-29 integer**, converting to the canonical shortest unsigned big-endian byte string. This does not invent an unspecified GP-character-to-ASCII translation or arbitrarily delete rune symbols.

The source gives three natural reset scopes: one complete 12,956-rune book, the nine visually divided chapters with exact lengths **729,1145,1729,1903,1021,1433,1680,3008,308**, and all 55 rune-bearing physical pages. This gives **6×65=390 complete original packet candidates**, no guessed cipher keys, token offsets, page mutation or additional layers.

## Complete source-original outcome

| Test on the 390 unaltered original packets | Result |
| --- | ---: |
| Zero-IV causal inversions that precisely re-encrypt original ciphertext | **390/390** |
| At byte offset zero: gzip, bzip2, xz, ZIP, PNG, PDF, common zlib wrappers | **0/390** |
| Magic strings found at any interior byte offset | **6** |
| Interior zlib candidates successfully inflated to a payload of at least 16 bytes | **0** |
| Entire recovered byte object matching p56's exact 512-bit digest under SHA-512, SHA3-512 or BLAKE2b-512 | **0/1,170** |
| Genuine gzip plaintext plants successfully encrypted, decoded and decompressed under all six source filters | **6/6** |

The six interior matches are only two-byte zlib `78 01`, `78 9c` or `78 da` prefixes. They occur in packets including whole-book G at byte2495 and HG at byte3742, as well as shorter chapter/page outputs. Every such located prefix fails actual inflation, so they are **false short-header coincidences**, not decoded content. None of the longer gzip, bzip2, xz, ZIP, PNG or PDF signatures appears at any byte position.

For the independent positive plant, gzip a fixed 124-byte genuine English PARABLE excerpt to **113 bytes**, encode it as big-endian base29, pad on the left with explicit zero digits, then apply each actual H/G/HG source cipher in either direction. Exact inverse recovers the original gzip bytes and decompresses to the exact authentic-phrase excerpt in **all six cases**. This proves that the source-constrained transformation can actually recover genuine compressed plaintext if that literal construction is present. Forward roundtrip of original ciphertext alone is not counted as evidence of a key.

## Decision and limits

Retire **complete, conventional header-bearing compressed files obtained by this exact unkeyed H/G/HG GF29 deconvolution followed by canonical integer-base29 serialization**, under whole-book, chapter and printed-page reset scopes. The outcome is a new *binary-format* exclusion; low GP IoC was not used as evidence against a compressed register.

This does not exclude raw/headerless DEFLATE, bytes preceded by unknown metadata, alternative endianness, padding or bit packing, a nonzero state, encryption before compression, mixed original word clocks, a different algorithm, or the p50 grid as a different operand. None of those further freedoms is selected by the currently authenticated sources. The original contains 2,896 visually printed words; no historical evidence says those separators should be ignored as the proposed whole-packet transport requires.

**Reproduction:** [complete Node.js 22 CommonJS SFT](../sims/lp2_dualfactor_deconvolution_base29_compression_sft.cjs), input `resources/liber-primus/lp2-corpus.json`, native `node:zlib` and `node:crypto`, original comparisons and real gzip-positive controls. Confirmed [successful read-only Windows runner 43533314965](https://github.com/FlareZ123/liber-primus/actions/runs/43533314965). The SFT performs no persistent writes.
