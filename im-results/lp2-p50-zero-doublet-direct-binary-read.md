# Literal p50 leading-zero mask on all original LP2 repeat events

**Agent40, 17 November 2026. Evidence level:** an exact, bounded, read-only original-cipher readout with an independently different event-class control. **No unknown LP2 plaintext, source-authenticated key, payload header, decoder or continuation destination was recovered.** The [standalone original-input SFT](../sims/lp2_p50_zero_repeat_event_mask_sft.cjs) contains source-sequence assertions and the fixed direct bit-to-byte reading.

## Why this operation was considered

A source-visible, though retrospectively selected, association was already established: 60 of the 256 printed base60-like p50 cells have **literal leading numeral 0**. At the unshifted, continuous global-rune table clock, those cells contain **33 of 86** equal-adjacent-rune events, although they cover 3,025 of 12,901 within-page eligible transitions. The [original blind-clock test](lp2-p50-zero-phase-blindholdout-wordboundaries.md) failed to recover that natural phase from an earlier-chapter training split. It also showed that physical line/word occupancy alone does not account for the retrospectively selected excess. No author-selected phase or underlying cipher was identified.

A finite possible consequence is a one-bit event channel: preserve the original full-book rune order, **extract only the 86 doubled-rune successor sites**, and read a bit from each associated p50 table cell: literal first printed digit is `0` → bit `1`, otherwise bit `0`. There are no fitted values, byte conversions, bit rotations, cipher offsets, source rewrites or invented English cribs. This operation tests a possible direct 2014-era binary transport, without asserting that the creator instructed it.

The script fixes 55 rune-bearing original pages p0–55 (one runeless p50), **12,956** original GP29 rune values, all **2,896** printed words joined correctly over line and page carries, and each within-page event `C[i]=C[i−1]`. At global rune position `g` of the successor, the mask indexes the first rune of the pair, `table[(g−1) mod 256]`, exactly the convention in the earlier table association.

## Decisive direct readout

The complete **86-bit original-ordered output**, under the one source-natural polarity above, is:

```text
00101001101000101000100101101000101010011100100010010100110000011101000100010010001100
```

It has exactly **33 ones**. Using ordinary MSB-first bytes from its first bit produces ten complete bytes and six remaining bits:

```text
29 a2 89 68 a9 c8 94 c1 d1 12 | 001100
```

The second byte `a2` is non-ASCII and the complete result is neither ten printable ASCII characters nor a self-identifying text instruction or recognizable conventional file header. Nothing source-authenticated specifies alternative bit polarity, bit order, framing, compression or a receiver. Thus **the literal leading-zero event mask does not immediately reveal a plaintext instruction**. This statement does not exclude a headerless key or an encrypted/compressed binary channel.

## Typed Base58 alternative: source GP29 × one table bit

A separately recognizable 2014-era transport is **Bitcoin Base58Check**. The source offers **29** possible repeated GP rune values and the single zero/nonzero bit above, so each event can occupy exactly **2×29 = 58** distinct digit states. This is a motivated *alternative typed receiver*, though neither the book nor a signed Cicada message instructs us to use Bitcoin or Base58 at this junction. There are two fixed elementary ways to embed the product into digits 0–57 without tuning symbol permutations:

| Digit for event `i` | Unpadded original 86-digit Base58 integer, in big-endian bytes | Double-SHA256 last-four-byte Base58Check |
| --- | --- | --- |
| `rune[i] + 29*bit[i]` | **63 bytes**, hex begins `0898975ee19bdea2ff3c8875` and ends `ba0a058c67e4548e` | **Fails**: actual `67e4548e`, required `0c6008c5` |
| `2*rune[i] + bit[i]` | **63 bytes**, hex begins `1120aacb7458f586fd3ae1a0` and ends `a5b04199767b924eb0` | **Fails**: actual `7b924eb0`, required `69c9e78e` |

The SFT checks both complete 63-byte source outputs against hard assertions and uses the standard double-SHA256 of the preceding 59 bytes to verify the trailing four-byte checksum. Neither reading is a Bitcoin Base58Check object. This excludes the **two named, exact source-order, unsigned-integer product embeddings**, not a secretly keyed permutation or alternative original opcode. The generic raw Base58 outputs are binary-looking and lack a self-identifying payload type; further framing choices would be unconstrained.

## Independent test of a generic exceptional-glyph explanation

An alternative is that this table phase preferentially marks *unusual printed one-rune words* rather than doublet events. Rebuild every original word boundary from the transcription, preserving the 32 genuine page-spanning words. This yields exactly **83 one-rune words**. Applying the same original 60/256 table mask gives:

| 83 original singleton positions | Hits | Fraction |
|---|---:|---:|
| Cell at the singleton glyph's global rune index | **23** | 27.71% |
| Cell at the predecessor-to-singleton incoming transition | **25** | 30.12% |
| Table-wide literal-zero prevalence | 19.453 expected of 83 | 23.44% |

The incoming-transition count is the more directly comparable pair clock; unlike the observed doublet proportion **33/86 = 38.37%**, it provides no striking excess over the table's ordinary 23.44% prevalence. These are two *different* position conventions of the same 83 source words, **not independent confirmations**. Because the table/event relation was already postselected and word placements are dependent, this control alone cannot infer a causal marker or prove the absence of any singleton effect.

## Decision and next route

The direct source-order 86-bit readout and two fixed Base58Check consumers are reproducible, but **fail their typed output gates**; it supplies no plaintext and no evidence to select a subsequent cipher. The singleton control disfavors a simple indiscriminate mark-of-unusual-token interpretation and concentrates any surviving hypothesis on the repeat-event mechanism itself. Do **not** extend this into arbitrarily rotated binary/ASCII/BASE29 slices, clock shifts or tuned word indices. A useful reopener must bring a distinct original clue choosing the table clock, event receiver, and lossless cipher, or produce an independently reproducible unknown-LP2 ciphertext/plaintext pair.

Reproduce on Windows Node.js 22 with `node sims/lp2_p50_zero_repeat_event_mask_sft.cjs`. Inputs are unmodified [original rune corpus](../resources/liber-primus/lp2-corpus.json), [source transcription](../resources/liber-primus/lp2-transcription.txt), and [printed token table](../resources/liber-primus/lp2-grid-256.json). The script asserts every page's exact original rune sequence, pair count, 86 event bits, ten output bytes, the six residual bits, and the 83 singleton counts.
