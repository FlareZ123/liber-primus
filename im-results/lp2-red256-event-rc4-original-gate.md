# 256 colored-rune/13-dot events as an RC4 key: original-source gate

**16 November 2026, Agent46. Classification: source-shaped but unauthenticated decoder candidate; bounded negative.** No new original LP2 plaintext, historical key, complete inverse, or continuation address was found.

## Causal premise and competing explanation

The canonical derived LP2 ink tape records **225 red GP runes plus 31 large thirteen-dot marks**, giving exactly 256 chronological events. The original pp49–51 print **256 base60 two-character cells**, conditionally interpreted as 256 bytes. Both 256-sized objects are visible to an exhaustive manuscript reader. A first-party historical tool, OutGuess, uses an ARC4-derived state generator ([original OutGuess arc.c](https://sources.debian.org/src/outguess/1%3A0.2-8/arc.c)). A finite hypothesis is therefore that the red-event tape is the secret stream-cipher key, while the printed 256-byte table or the full runic ciphertext is the receiver. The rival is that the equal size is coincidence and the historical ARC4 mechanism was used only for steganographic extraction, with no LP2 text-encryption role.

Crucially, **the source never instructs a solver to use RC4 here**. The original p0 first 13 red letters and its large mark after rune13 are retained under the 16 November corrected photographic boundary; counts elsewhere come from the canonical *derived* annotations and are not an independently completed whole-book colored-ink census. These uncertainties limit this test to the precise canonical event interpretation.

## Frozen direct inverse

Read original GP rune indices 0–28 for the 225 colored glyphs and byte 29 for each thirteen-dot mark, stable chronological order by physical page/rune offset; do not consume other punctuation. The tape begins `15,8,18,3,6,19,27,0,15,26,18,21,5,29,29`. Use these 256 bytes as the **direct standard RC4 KSA key**, with PRGA starting at byte0, and test the exact printed order plus its one complete reversal.

The two direct recipients are:

1. XOR the first 256 RC4 stream bytes against the source's **entire** printed-row-major 256-byte table; inspect signature and 7-bit printable payload.
2. Reduce RC4 stream bytes mod29 for a whole-book continuous, page-nonreset additive GP29 key; the two decrypt signs give four models across two key orientations. The separate differential family uses nonzero step `1 + streamByte % 28`, with `P[i]=(C[i]-C[i-1] ± step) mod29`, `C[-1]=0`; two signs and two key orientations make four further models. No word-boundary key reset, fitted phase, key hashing, arbitrary drop count or tunable mapping.

This model uses the identical **12,956** canonical unknown original GP rune indices on physical pp0–55 and all **256** source table bytes (SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`). The CJS reproducer checks the standard RC4 `Key` known-answer vector `eb9f7781b734ca72a7`. Independent in-tool original-source execution verified exact planted p57 GP29 recovery for all eight rune models and lossless forward re-encryption of the actual 12,956-symbol ciphertext.

## Original outcome

| Direct RC4 red-event key | Printed-table XOR: printable /256 | First 24 decrypted table bytes, hex |
| --- | ---: | --- |
| Chronological | 100 | `cc2b273815a8a64635eecb0d3748076332041699c77680c0` |
| Fully reversed | 100 | `8f4eda9bf4678cb50aafa64835022c8e2f55781405e02f3f` |

Neither direct XOR output has an apparent natural-language introduction or a standard common file header. This is a diagnostic, not a statistical proof that the bytes cannot be encrypted binary.

| Direct source-key GP29 recipient | Chronological key IoC | Reversed key IoC |
| --- | ---: | ---: |
| Untouched original ciphertext | 0.03447840 | 0.03447840 |
| Additive subtract | 0.03447753 | 0.03446962 |
| Additive add | 0.03451343 | 0.03448014 |
| Differential subtract | 0.03448009 | 0.03450986 |
| Differential add | 0.03447758 | 0.03454756 |

All eight decoded originals retain GP29 coincidence at effectively the uniform `1/29 = 0.03448276` baseline, and none yields authentic prose in the fixed unselected prefix. This finite candidate does not supply a decipherment.

**Decision:** Retire only literal standard-RC4 direct-key use of the entire chronological or reversed GP-index/13-dot event tape as tested above. A genuine author-selected state/key/receiver could lead elsewhere, but a 256-size coincidence does not warrant KDF, nonce, bit-depth or key-encoding searches without an independent original clue. Do not promote this null to the authoritative solved-results synthesis.

**Reproducer:** [source-exact read-only CJS](../sims/lp2_red256_event_rc4_source_sft.cjs). This complements, without replacing, the different [table-as-RC4-key](lp2-grid256-rc4-original-gate.md) and [red-event/table 13/31-LCG XOR](red256-lcg-xor-grid-event-key-inverse.md) original-source gates.
