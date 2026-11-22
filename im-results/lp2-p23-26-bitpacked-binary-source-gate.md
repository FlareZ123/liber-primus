# Original p23–26 five-dot quintets as a complete byte-serialized file carrier

**Agent 14, 12 November 2026. Status:** bounded original-input negative for two preselected, public GP29 rune-to-bit maps. This investigation recovers **no plaintext, key, executable cipher, packet or destination**. A [manual Windows/Node.js 22 original-input run](https://github.com/FlareZ123/liber-primus/actions/runs/43267482196) passed, including a complete PNG positive plant and wrong-rule control.

## Source-selected input and prior work

The original physical LP2 p23 drawing contains five isolated black circles directly above a **16-rune red title**. The rest of that four-page chapter comprises 197 original body runes on p23 and 270/273/265 on p24/p25/p26, respectively. That produces **1,005 consecutive unmodified body runes = exactly 201 original-order quintets**, without a freely selected start offset or tail deletion. Canonical page lengths are **[213, 270, 273, 265]**; the p23 red heading GP indices are `[1,24,7,21,6,14,23,6,10,17,10,12,16,17,10,26]`. The source-derived body is the only input to the byte hypotheses.

Prior [original-art investigation](lp2-p23-26-original-art-source-gate.md) already tested 5-to-1 rune folds, two 201×5 layouts, Baconian text, ITA2, affine/Hill and historical SSSS families. The aim here is **one-bit-per-source-rune binary file transport** rather than a five-rune-to-one-character cipher. Historical Cicada binary stages and published GP indices/prime values motivate two finite, static assignments. The drawing does **not** state a bit map, binary framing, endianness, file type or CRC, so these are investigator-selected literal conventions, not authenticated creator instructions.

## Two frozen native GP29 readers

For each physical body rune in strict original order, extract **one bit** with no secret lookup table:

1. **Index parity:** GP alphabet index `i & 1`, zero-based original GP29 order.
2. **GP prime parity:** the source's associated published GP prime weight `prime[i] & 1`; note that the 29 assigned primes are all odd except the first weight 2, so this is a deliberately strong low-entropy wrong-hypothesis control as well as a natural source label.

Pack the resulting 1,005 bits MSB-first into bytes. There are 125 full bytes followed by the final five source bits; the final byte is completed with exactly **three zero padding bits**, giving **126 bytes**. Preserve all source page boundaries and printed word segmentation in the input definition; neither authorizes deleting or rearranging source bits. Check complete original binary signatures for gzip, zip, JPEG, bzip2, xz, 7zip, ELF, PDF, OGG, MIDI, RIFF/WAV, PGP-armored and GIF, a full PNG with per-chunk CRC and final IEND, and a zlib inflation if its header fits. An initial marker alone would not establish a valid packet.

| Source bit convention | Ones / 1,005 | ASCII-printable bytes / 126 | Distinct byte values | Longest printable run | File/packet decoder |
|---|---:|---:|---:|---:|---|
| GP alphabet index parity | **481** | **40** | **106** | **4** | **None** |
| GP prime parity | **968** | **1** | **12** | **1** | **None** |

The index-parity stream's exact first 32 bytes in hexadecimal are:

```text
3e50c7753a16ca1ff0a6de3c926197bad973df85cb44ea8a047ada943c567a35
```

The prime-parity stream is heavily composed of `0xff` (**90 of 126 bytes**), an immediate consequence of all-but-one odd GP primes. Neither case produces an authenticated header, parseable file with integrity, sustained printable text, a destination, or a candidate key. This result is limited to the **two frozen direct bit maps**, natural rune order and one byte packing; an encrypted or other-register 1,005-bit payload remains possible.

## Exact complete-format positive and wrong-map controls

A source-independent **69-byte valid PNG** (1×1 RGB) with CRC-checked IHDR/IDAT/IEND and zero-padded remainder is encoded as a 1,005-bit GP29 plant using index2 for zero and index1 for one. The same byte packer exactly recovers all **69/69 PNG bytes**; the complete PNG parser validates the chunk CRCs and IEND and permits only trailing zero bytes. Reinterpreting that same planted GP sequence using **GP prime parity** fails to recover a valid PNG. The tests also assert all 1,005 source positions, original page lengths, heading identities, bit counts, and zero-filled end padding.

This positive shows the file-format detector and bit transport can recognize a complete payload if one is supplied. It does not prove that the historical ciphertext encoded such a file.

## Decision

**Retire the two simple original-order, literal GP-index-parity and GP-prime-parity bitpacked file readings.** The five-dot artwork supplies a grouping clue but no source-selected static binary map or complete file decoder. The unrelated SAT and teleprinter negatives remain separately scoped. Further secret bit assignments, per-page lane changes, format guesses or free-order searches require a source-selected mapping, a known digest or a complete original format discriminator, rather than tuning the 201 quintets to a familiar magic prefix.

Reproduce with [`sims/lp2_p23_26_bitpacked_file_channel_sft.cjs`](../sims/lp2_p23_26_bitpacked_file_channel_sft.cjs), standalone Node.js 22/CommonJS, using only the canonical original GP29 corpus and standard Node libraries. The [dispatch-only Windows workflow](../.github/workflows/agent14-original-source-gates-manual.yml) also executes the independent [direct swap-table PRGA negative](lp2-grid256-direct-swap-prga-original-gate.md); all script and native-planted tests passed in [run 43267482196](https://github.com/FlareZ123/liber-primus/actions/runs/43267482196).
