# Physical-page carry mask as a 56-bit DES key for the 256-byte table

**Agent3, 15 November 2026. Classification:** one bounded *source-visible but unauthenticated* direct original-cipher inversion. **Negative:** no original p50 plaintext, content signature, transferable cipher key, or LP2 message recovered.

## A motivated route and its weakest assumption

The unknown book has exactly **56 physical LP2 pages (p0–55)**, and a human reading the original JPEGs encounters a binary visual fact at each physical page boundary: a printed GP29 word either continues onto the next page or does not. The original LP2 table on p49–51 prints **256 two-character cells**, a multiple of the 8-byte block used by historically common DES. The number **56** also happens to be the DES effective key length in bits.

This suggests one bounded operational question: do 56 page-carry flags, read in the original source order, yield a conventional DES key that decodes the p49–51 table? The crucial premise is unsupported: **no first-party Cicada statement selects DES, identifies these flags as a key, or authorizes base60 table bytes**. Ordinary page composition can generate the flags. This is a cheap one-shot test only, not a reason to search alternate key orders, modes, padding, or IVs.

## Fixed source derivation

Use the original 29-rune alphabet in `resources/liber-primus/lp2-corpus.json`, the independently exact source page boundaries in `lp2-transcription.txt`, and the original p49–51 32×8 cells in `lp2-grid-256.json`. Join printed line wraps and physical page continuations without creating new rune words; an actual word carry is present if its original GP rune sequence has parts on **two physically consecutive source pages**. Physical p50 is rune-free; the final p55→solved p56 break is explicitly a noncarry. The source parser asserts **2,896 whole unknown printed words** and **12,956 original runes**.

The 56 flags indexed by source physical page p0 through p55 are:

```text
11011110110000001011010111010101010100001111111110011010
```

There are exactly **32 one-bits**, matching the previously recognized 32 actual carried words. The eight groups of seven bits, interpreted most significant bit first, acquire the normal **odd DES parity bit in each byte's least significant position**. This single chosen expansion yields the DES key:

```text
df612cba5486fe34
```

Apply **DES-ECB decryption** to the exact original 256-byte candidate derived from the table's two-character 60-glyph interpretation in printed row-major order; turn off padding. Node's supported `des-ede3` cipher with three copies of the same key is exactly single DES's EDE3 identity. There is no guessed secret key, page permutation, mode selection, offset, or changed source digit.

## Original result

| Original input | Bytes | Strict printable ASCII | Shannon byte entropy | First 16 decoded bytes |
| --- | ---: | ---: | ---: | --- |
| Original source-derived table (base60) | 256 | 103/256 | 7.16965 bits/byte | `cbe7a7ba61ed7eb75cf99cdef704b7d4` |
| Source-key DES-ECB output | 256 | **89/256** | 7.14710 bits/byte | `24f5b3f493dd34d8177b0ba86d98d7fb` |

The direct decrypted table does **not** begin with known ZIP/PGP/PDF/GZIP/BZIP2/PNG headers or coherent English. The original source key is **not authenticated** and the decoded bytes offer no independent selector or meaningful manuscript continuation.

The SFT contains an authentic *native-source phrase* synthetic plant, expanded to 256 bytes, which undergoes the same DES key and ECB mode and is recovered **byte-for-byte 256/256**. It verifies that the tested inverse is actually reversible, without using the plant to select or tune the original key.

## Decision

Retire this **one** simple mapping of original visible page continuation → 56 DES bits → original table bytes. Do not rerun key-order, secret phase, DES-CBC IV, random AES variants or unknown ciphertext encoding without an independent first-party clue that selects those degrees of freedom. A genuine recovered key/decoder must predict source-original unknown-page plaintext and survive a held-out original paragraph; no such plaintext is present here.

[Self-contained Node22 CommonJS SFT](../sims/lp2_pagecarry56_des256_original_sft.cjs) · [successful Windows original-source execution](https://github.com/FlareZ123/liber-primus/actions/runs/43721982485). Sources for the `createDecipheriv()` and padding behavior are the [Node.js crypto documentation](https://nodejs.org/api/crypto.html). This is intermediate negative evidence in `im-results/`, not an established LP2 cipher conclusion.
