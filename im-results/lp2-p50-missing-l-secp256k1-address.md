# Original p50 missing-L column -> a recognizable Bitcoin address

**Agent45 source derivation and Agent20 original-image follow-up, 23 November 2026. Classification: conditional source-constrained address; frozen floral16 and whole-release RGB image-mean consumers tested, without recovered plaintext or authenticated author instruction.**

## Source-selected input

The unchanged 2014 p49–p51 numeric table on original scans 66.jpg–68.jpg contains 32 printed rows of eight two-character digits. An independently observed cluster of consecutive neighboring hexadecimal-looking printed tokens forms 48→49→4A→4B and 4D→4E→4F, with 4C missing. Read as ASCII, the two runs form HIJK[L]MNO. This independently noticed missing L is an intelligible *conditional* selector of the zero-based fifth **L** column of eight, without choosing the column after seeing its cryptographic output. The visually read original table and the spatial comparisons are preserved in [source report](lp2-p50-highband-spatial-successor-chain.md); the missing-L fifth-column AES-256 attempt and its negative remain documented in [earlier report](lp2-p50-missing4c-dualradix-terminal-split.md).

The complete 32 original fifth-column source tokens, top-down:

    1b 47 1g 2U 0s 3o 1Q 1k 3J 1s 2r 3u 1N 0E 0s 0D
    2n 45 46 0q 1j 2S 2O 0c 2u 3E 1A 0w 2O 3w 0M 30

The independently used normal 60-digit alphabet is 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx. Evaluating these exact 32 tokens as byte values yields the 32-byte scalar:

    61 f7 66 96 36 e6 56 6a c7 72 ad ec 53 0e 36 0d
    a9 f5 f6 34 69 94 90 26 b0 c2 46 3a 90 ee 16 b4

No visually ambiguous I/l token occurs in this column. The existing *separate* missing-4C dual-radix arithmetic bridge to p55's 76 runes and the known p56–57 180 runes also requires base60, providing a conditional source-before-output reason for using that alphabet rather than the competing f-deleted base59 reading. Neither hexadecimal ASCII nor base60 has an explicit first-party typed instruction.

## Direct standard cryptographic calculation

Read the printed scalar as a secp256k1 private-key integer. Use the established Bitcoin mainnet P2PKH derivation available by 2014: multiply the secp256k1 generator, serialize the point as 33-byte *compressed* public key, apply SHA-256 followed by RIPEMD-160 to that point, prepend 0x00, append the first four bytes of double SHA-256, and encode Base58Check.

Original printed 32-byte scalar hexadecimal:

    61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4

Derived compressed secp256k1 public key hexadecimal:

    03ac234dba2f6b2891c4c6032e1378f2e29ed22ce18e34737fa94e34c8f1963a64

Derived Bitcoin P2PKH address:

    1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK

The initial characters are **1Meanpng**, containing the intelligible seven-character substring **Meanpng**. A possible, entirely unconfirmed interpretation is **MEAN PNG**, an instruction to average source images as a PNG output. No original page or signed source actually specifies that operation, page group, registration or reducer. This is an unusually legible and *testable* candidate pointer; it is not a decrypted runic message.

## Source-convention comparison and calibration

All eight table columns have 32 values. Under the two earlier source-viable numeric alphabets (radix60 and radix59) and the two standard P2PKH public-key encodings (compressed and uncompressed), there are **32** fixed natural address candidates. Only original **radix60, column4, compressed** begins with 1Meanpng. Different conventions change the address, including:
- Same radix60, same column4, **uncompressed**: 1ATpEDYVi7WF72jntLq85Y5R2vtDjkZrUv.
- **Radix59**, same column4, compressed: 1EXiPou2VcwCp93WgmLyia11Ybp98zFebh.

The source-exact [single-file CommonJS SFT](../sims/lp2_p50_missingl_bitcoin_vanity_source_sft.cjs) asserts original column tokens and source bytes, the complete compressed public key, the final address and competing conventions. It separately passes the canonical private-key-1 Bitcoin compressed P2PKH test vector (1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH). Independently executed [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45169743395), commit b1032994.

**Selection and provenance limitation:** The missing L/32-byte source operand was observed before the Bitcoin test. The very choice of Bitcoin as the decoding system, compressed mode, and interpretation of Meanpng was not selected or predicted from authenticated first-party material before it was tried. Although this address looks conspicuous, no calibrated random-creator probability or authenticated solved-text claim follows from a post-observation recognition. A P2PKH address exists for practically every valid 256-bit input; the mere existence of an address is expected.

## Read-only Bitcoin mainnet receiver: exact original address has no chain history

**23 November 2026 at 12:03:57 UTC:** Both independently hosted public Esplora providers, Blockstream and mempool.space, returned valid address records for **1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK** with chain_stats.tx_count=0, mempool_stats.tx_count=0, funded_txo_count=0, funded_txo_sum=0 and spent_txo_sum=0. Their two complete live responses agree. This closes a direct historical-transaction/OP_RETURN lookup for that exact standard compressed P2PKH address **as of the check time**; no transaction from 2014, or any other year, was returned. It does not test the existence of unrelated Bitcoin addresses, off-chain messages, other address serializers or mnemonic/image operands. It also cannot distinguish intentional dormant vanity pointer from accidental vanity coincidence.

Read-only API source [Blockstream Esplora specification](https://github.com/Blockstream/esplora/blob/master/API.md); exact independently runnable Node22 [Esplora checker](../sims/lp2_p50_meanpng_chain_history_sft.cjs); [Windows CI PASS with both providers' full results](https://github.com/FlareZ123/liber-primus/actions/runs/45170710818).

## Frozen original-image consumer: 16 floral originals, direct mean PNG

**Independent source basis:** physical LP2 p40–p55 are the sixteen consecutively distributed flower-framed pages, archive **57.jpg–72.jpg**. Every page has the same **2400×3600** pixel canvas with identical-position left and right floral artwork. This makes the complete contiguous group and identity registration the simplest original-source-locked target for the *conditional* Meanpng reading, without choosing a subset or registration by looking for plaintext. This is still an interpretation of a **post-selected** Bitcoin address, not an authenticated instruction.

**One frozen 2014-executable operation:** decode all sixteen original JPEGs to RGB; for every coordinate and channel take the **equal-weight arithmetic mean**, round nearest byte with ties upward, and save a lossless RGB PNG. No threshold, contrast stretching, encryption, resized page, channel selector, selected subpages or OCR-driven postselection is allowed. Source-exact standalone [Python/Pillow/numpy SFT](../sims/lp2_p50_meanpng_floral16_original_sft.py) reproduces this direct fixed consumer from the original JPEG directory; the maintainer ZIP was independently decoded and executed. The mean RGB pixel-array SHA-256 is:

    1df3e6a9cd49cd2d09a9c945077e3877b956651d4b25cb38dcf9c9be9a26c259

**Original outcome:** the output contains the visibly intact shared floral plates, a superposition of mutually different black rune lines and the faint known individual-page p53 insect / p55 tree ornaments. No independent new instruction, recognizable hidden alphabet, external location, source-derived key, or contiguous unknown-page plaintext emerges by direct image viewing. Precisely **6,008,117 / 8,640,000** pixel positions have the same RGB value across all sixteen originals; **5,232,527 / 5,280,000** pixels in the fixed exterior region outside x=500..1899, y=600..2999 are identical, showing that most information affected by averaging is inside the printed page-content region. Thus pixelwise averaging largely preserves common art while mixing distinct source plaintext/ciphertext glyph regions. These measured invariants and output pixel digest are asserted in the SFT, which writes the PNG atomically under a lock.

**Bounded decision:** direct all-floral literal RGB mean is a mechanically reproducible original-input *image* operation, but is not a useful plaintext/key receiver under the frozen selection. More importantly **no original first-party clue fixes the fifth-column→Bitcoin→image-mean chain or identifies an image receiver or subsequent cipher decoder**. Do not tune subsets, color transforms, threshold levels, or overlays to rescue Meanpng; a newly found first-party selection would justify a distinct experiment. This closes the bounded mean-PNG instruction tested in #2386 while leaving unrelated image steganography open.

## Distinct whole-release consumer: direct average of all 58 original LP2 scans

**Agent46, 23 November 2026, independent extension of the already-frozen floral16 result.** The 58 published 2014 LP2 scans (archive `17.jpg`–`74.jpg`) all have the identical native **2400×3600** canvas. The conditional `1Meanpng` address can therefore be given a second source-complete, zero-subset-selection image receiver: all 58 pages rather than the 16 flower-framed pages. Before viewing the output, fix all 58 images, identity registration, RGB decode, equal-weight pixelwise mean with nearest-byte rounding (ties up), and literal PNG output. There is no cropping, alignment, subset choice, contrast stretch or tuned color/channel operation.

The exact source-mean RGB SHA-256 from the maintainer-supplied original 75-image ZIP is **`2b8592cb5b994f2cc6731796bcbd6d46f48e5504e8c57cef0bb1be8dcef5b5b2`**. In the single resulting image, the shared central text-line positions fuse into horizontally shaded bands and the multiple chapter illustrations overlap; there is **no independently legible hidden message, key, or usable original-cipher receiver from direct viewing**. The entire 58-page mean is a mathematically defined image, not a decryption of the rune tape. The reproducible [standalone Python SFT](../sims/lp2_meanpng_all58_original_sft.py) checks all 58 exact dimensions, the source RGB digest, and atomically writes the literal PNG under a lock. The underlying computation was executed against the maintainer ZIP; GitHub Actions execution has **not** been claimed for this new test.

This closes the simplest *full-release* literal RGB-mean alternative to the separately completed floral16 mean. It does **not** prove the Bitcoin vanity string accidental, exclude other codecs, or authorize further image-subset tuning. Recovering unknown LP2 plaintext still needs a first-party selected decoder.

## Competing source operations and next decisive decision

A different direct p50 hypothesis has now been independently excluded: the 256 values do not themselves encode a contiguous standard AES-128/192/256 *expanded schedule* in eight natural source read orders. All 1,176 exact original windows fail (at most five internally matching expanded bytes versus 160–208 required), while known positive vectors pass [source-only AES SFT](../sims/lp2_p50_aes_keyschedule_source_sft.cjs), [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45166682669). This separate negative does not constrain secp256k1.

A plausible human intended-solve-path **requires more**: find a contemporaneous independent Cicada Bitcoin/address/EC clue; retire the direct on-chain receiver at the exact compressed P2PKH address after two independent provider responses show zero history; recognize that both the direct 16-floral and entire-58-page pixel means have now been run and produced no recoverable receiver; resume image averaging only if a new first-party clue fixes the image subset, pixel operator and decoding target; finally obtain independently withheld original LP2 plaintext with an exact reversible original-cipher mechanism.

Do not infer funds, private ownership, a blockchain endpoint, or the final puzzle destination from the address alone. The 56 unknown LP2 physical pages remain undeciphered. Retain this reproducible **candidate address/key** for independent adversarial evaluation.
