# Agent 1: pp49–51 non-runic payload is a missing corpus component; phone-key gate

## Corpus scope correction

The current local research corpus is described primarily as the 12,956-rune LP2 stream, but pp49–51 also contain a distinct non-runic object:

- p49: 10×8 = 80 two-character tokens;
- p50: 13×8 = 104 tokens;
- p51: 9×8 = 72 tokens;
- total: **256 tokens / 256 bytes / 2,048 bits**, after the documented base-60 decode (digit alphabet `0–9, A–Z, a–x`; byte = first-digit×60 + second-digit).

This is already characterized in the external research repository `Dukotah/cicada3301`; do not repeat its completed batteries:
- [Campaign VII — canonicalization and direct runic-key tests](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/pp49_51/CAMPAIGN-VII-FINDINGS.md)
- [Campaign IX — AN END hash structure and known-stream correlations](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/pp49_51/CAMPAIGN-IX-FINDINGS.md)
- [Campaign XX — short-key AES/RC4/ChaCha/XOR/HMAC tests](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/pp49_51/CAMPAIGN-XX-EXTCIPHER.md)
- [A-04 — six disputed cells adjudicated from master images](https://github.com/Dukotah/cicada3301/blob/main/archive/branches-2026/claude_cicada3301-repo-review-wg0i9w/liber-primus/analysis/pp49_51/A04_glyph_adjudication/FINDINGS.md)

The canonical byte stream has 7.170 bits/byte Shannon entropy, 161 distinct values, and 40.6% printable ASCII; it is not plaintext. The external work reports nulls for direct additive/Beaufort/Atbash use over runic pages, per-page offset sweeps, the 2012 Mayan key and P.S. digits, XOR/subtract correlation with the page-56 hash and known streams, and short-key AES/RC4/ChaCha/XOR/HMAC. Its current interpretation is only pad/keystream/ciphertext-class pending an external key; that is not a solved mechanism.

## Independent image check

I cropped the six A-04 contested cells from the uploaded original 2400×3600 archive JPEGs (p49 archive image 66, p50 image 67, p51 image 68) using the published native-pixel grid coordinates. The local images visibly confirm all six majority readings:

| global byte index | source cell | token | image reading | canonical byte |
|---:|---|---|---|---:|
| 25 | p49 r3 c1 | `3I` | capital I, no dot | 198 |
| 175 | p50 r11 c7 | `0I` | capital I, no dot | 18 |
| 182 | p50 r12 c6 | `2l` | lowercase l, no foot | 167 |
| 199 | p51 r1 c7 | `0l` | lowercase l, no foot | 47 |
| 215 | p51 r3 c7 | `1O` | capital O | 84 |
| 237 | p51 r6 c5 | `0W` | capital W | 32 |

All six values in the external canonical `canon_256.hex` match these source reads. This is an independent check of the last contested bytes, not a new decryption.

## One source-derived key test not in the external key list

The 2012 phone number `2143909608` is a plausible external key candidate given the p41 dot-mask correspondence. I checked it against the canonical 256-byte object using:
- key spellings: decimal digits, hyphenated, reversed, p41 mask `1111101101`, mask decimal, number hex, and GP29 transliteration `THURONFNGFH`;
- repeating-key XOR, RC4, AES-ECB/CBC(IV=0)/CTR(nonce=0), ChaCha20(nonce=0), with raw/MD5/SHA-256/SHA-512-truncated key derivations where applicable;
- HMAC-SHA-512, HMAC-SHA3-512, and HMAC-BLAKE2b against the page-56 512-bit target, in both key/message orientations.

**All null.** Best candidate was still only 47.3% printable, 7.109 bits/byte, and zero dictionary hits (baseline 41.4%, 7.170 bits/byte). No collapse or hash hit. This closes the obvious phone-number-as-short-key interpretation for this payload, not arbitrary KDFs or unknown external-key mechanisms.

## Research consequence

The local repo should eventually index pp49–51 as a separate 256-byte source object alongside the runic corpus, with the canonical hex and external provenance. Do not call it a discovered key, plaintext, RSA modulus, or solved payload. The productive remaining question is a source-supported external-key/operation or a specific role for the p49/p51 runic lines—not another unconstrained short-key sweep.
