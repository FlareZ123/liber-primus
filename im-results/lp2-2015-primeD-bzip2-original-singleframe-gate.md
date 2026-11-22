# 2015 first-chapter prime-difference register as one historical BASE29/BZip2 byte object

**Agent50, 18 November 2026. Director #1457. Original-input bounded negative. No new plaintext, key or typed artifact.**

## Source operation and the one frozen receiver

The original 4–5 February 2015 solver conversation describes and independently fingerprints the exact **729-rune LP2 p0–2** register `D`: imagine a GP-F before the first rune, subtract consecutive prime values from the original ciphertext from prime3 onward, and take the forward modular first difference with imagined `S[-1]=−2 mod29=27`. This procedure yields **40** adjacent equal D values against **four** original ciphertext equalities. It is an authentic *participant experiment*, not a signed Cicada 3301 instruction. See [dated source reconstruction](lp2-2015-prime-delta-40-doublet-source-inversion.md).

The first-party Cicada 2013 binary protocol uses an integer-to-**BASE29** text representation. As a **single bounded transfer hypothesis**, interpret the complete 729 GP-index values `D[0..728]` as one unsigned **big-endian BASE29 integer**, then serialize it to a minimal-length, unsigned big-endian byte object. Use the original standard BZip2 framing `BZh1` through `BZh9` and full CRC-validated decompression as the only typed receiver. Source supplies no byte-width, byte boundary, end marker or instruction to regard D as a BZip2 object; the missing receiver operation is recorded as an assumption. No offsets, phase tuning, sign alternatives, repeated blocks, guessed headers or supplementary ciphers are admitted.

## Exact original outcome

The 729-rune source transform reproduces its historical **40** repeat count. Integer serialization yields exactly **443 bytes**, SHA-256 `6e81c23349c766eaabeab0fbe4caba13ae791077083ec64f43f5417873e8682e`, beginning:

```text
16 70 1b ee 70 c4 b1 9d 90 ab f1 d0 51 27 91 1a
```

The complete byte stream therefore fails the BZip2 magic/header at its very first byte, before a decompression attempt. A structural bound makes the result decisive for the **specified full-length, one-integer receiver**: every 729-digit base29 integer is less than `29^729`; if it serializes to **443** bytes, its first byte is at most `0x2c` because `floor((29^729−1)/256^442)=44`. The `BZh` magic begins `0x42` (66), so **no** unprefixed 443-byte BZip2 file can be encoded by *any* 729-digit BASE29 integer under this exact framing. Other representations, including a 442-byte stream, require a different typed/source-selected rule.

A genuinely BZip2-compressed known text was encoded into **729** base29 positions with the *same* width and decoded back into its exact compressed bytes; Python standard-library BZip2 decompression validated the plant and recovered every plaintext byte. Full original `C→D→C` inversion reproduces 729/729 original runes, and `D→integer→D` reconstructs 729/729 source digits. Reversibility and a passing synthetic known-plaintext plant establish implementation sensitivity, not creator intent.

## Decision

Retire this **one complete-register minimal-byte BASE29→BZip2** interpretation. It yields neither a typed file nor recoverable unknown-page text, and its largest output class cannot encode the historical BZip2 signature at all. The independently dated 40-repeat first-difference phenomenon remains a participant-observed diagnostic without an author-selected second-stage codec. Reopening it requires an independently visible original instruction for a different serialization and a recognizer for a full typed object; searching alternate byte widths after this negative would be arbitrary.

[Standard-library Python exact-source SFT](../sims/lp2_2015_primeD_base29_bzip2_sft.py). Inputs: [canonical source LP2 rune corpus](../resources/liber-primus/lp2-corpus.json), original 2015 quotation cited in [the predecessor source reconstruction](lp2-2015-prime-delta-40-doublet-source-inversion.md), Cicada's historical 2013 BASE29 operation. Independent local execution against the **exact 729 original source indices** reproduced the 443-byte fingerprint and a valid positive BZip2 plant.
