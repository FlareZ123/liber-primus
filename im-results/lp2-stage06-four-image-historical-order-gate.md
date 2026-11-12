# Original 2014 Stage06 four-image sequence: exact LP1 mapping and LP2 operation gate

**Agent9, 12 November 2026. Decision:** The original pre-LP2 Stage06 four-JPEG sequence is **byte-identical to already solved LP1 pages 06, 07, 09, 08**, in that *source extraction order*. The last two are each stored **with their entire JPEG byte stream reversed** in the original concatenated source. This gives an exact historical mapping and operation, but **no original LP2 plaintext, source-selected runic key, or complete ciphertext inverse**. It does not justify applying the same byte operation to GP29 runes.

## Independently selected original source

The preserved original-stage file directory is [krisyotam/cicada3301, pinned commit 76d3ee8](https://github.com/krisyotam/cicada3301/tree/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage06). Its [README](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage06/README.md) documents conversion of original onion hex to gzip, then extraction of one **3,010,703-byte** concatenated binary comprising four JPEGs in this order. It specifies source start offsets **0, 823807, 1647321, 2371898** with respective sizes **823807, 823514, 724577, 638805**, and literal byte reversal of fragments three and four. The first two images can be read directly.

The same pinned archive preserves [the fourth image's 140-byte OutGuess text](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage06/index.4.outguess), introducing a two-character block rearrangement to a contemporary onion address and the phrase **“TO BELIEVE TRUTH IS TO DESTROY POSSIBILITY.”** The deciphered string is [index.4.decrypted](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage06/index.4.decrypted). The original printed runes in this stage are the already documented **A KOAN** and **DO FOUR UNREASONABLE THINGS EACH DAY**, not a recovered LP2-unknown quotation.

## Exact original-image identity

The four source fragments were compared against the **original 75 book JPEGs** available in `resources/liber-primus/`, rather than thumbnails, perceptual resemblances or modern image redraws. The first two are directly identical at the Git blob-byte level. Reversing the entire byte order of source fragments three and four yields byte-identical book JPEGs. The original bytes, widths and order were not adjusted by a language score.

| Source fragment in archived concatenation | Original LP1 image | Stored bytes | Original JPEG Git blob SHA1 | Stored-fragment Git blob SHA1 |
| --- | --- | ---: | --- | --- |
| `index.1.jpg` | `06.jpg` | 823,807 | `596ae8f80ada7657f77f342d38d05ed0f997cae7` | identical |
| `index.2.jpg` | `07.jpg` | 823,514 | `1ce21df6a0b8013615c2fd98a57a32021f55e4e1` | identical |
| `index.3.jpg.rev` | `09.jpg` | 724,577 | `fa928ae55ac841a795b5c12eead3e14efc8c419b` | `0fdd57c40ece99eaeec71bdf11641d01004737f6` |
| `index.4.jpg.rev` | `08.jpg` | 638,805 | `426124114b6209475778c6ec7e02bf341c92157b` | `7f5cacee030c68e5ea8fcb64d9917cc5e2260ed4` |

These identities were independently calculated from the accompanying **original book JPEG zip** as native Git blob SHA-1 (a `blob {size}\\0` header followed by the unmodified bytes); each matches the archive's pinned Git object identifier. The reversed-fragment identities were obtained by actually reversing all original p09/p08 bytes and hashing them. Every byte is accounted for: 823807+823514+724577+638805=3,010,703.

The [standalone CommonJS SFT](../sims/lp2_stage06_four_image_historical_order_sft.cjs) asserts all six distinct original/reversed hashes, byte-reversal round trips and the four-position order. It additionally compares all **58** original LP2 complete JPEG byte identities `17.jpg`–`74.jpg` with the four Stage06 **direct image identities** and finds **zero exact complete-file duplicates**. This does *not* deny cross-release copied illustration crops.

## Does this supply an original LP2 decoder?

The source itself supplies three precise operations: parse a gzip-wrapped JPEG concatenation, reverse the raw bytes of images three and four, and solve an independent two-character-text rearrangement from the fourth image's OutGuess message. These operations acted on specifically marked **JPEG and ASCII payloads**, with their own recognized magic bytes and an immediately checkable onion destination. The four images are earlier LP1 text, already solved and available in the original 75-image archive. There is **no instruction in this original source to apply one of these operations to LP2 GP29 ciphertext, select a runic alphabet transform, or set a cipher-state clock**.

A potentially helpful visible connection already exists: the p09 LP1 insect appears horizontally reflected in unknown LP2 p2, but it is also reused in LP1 pp13 and16, and the [original full p2 literal reflection gate](lp2-p2-literal-rune-reflection-gate.md) and [original art/cipher-transfer gate](lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md) rejected direct reflection and source-native LP1 inverse variants. The historical Stage06 ordering makes p09 a *contemporary player-visible image* and explains its earlier authorship; it **does not select p09's cipher rule as LP2 p2's inverse** or restore English under already tested operations. A new source selector, not a rearranged source-image manifest, is the necessary missing input.

**Decision for #636:** Retire Stage06's raw four-JPEG order/reversal and fourth-OutGuess-text rearrangement as *direct complete-LP2 decoder sources*. Keep the exact mapping for historical reconstruction and cross-release artwork comparison. Only reopen if a contemporaneous authenticated document ties a specific Stage06 operation/figure to a definite LP2 page and complete reversible runic codec with an untouched-passage prediction. The other three archived non-text `.outguess` binary payloads are outside this exact-byte source-map gate; their presence cannot be treated as proof that they contain an additional decipherment key.
