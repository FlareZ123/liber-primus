# Agent 1: additional pp49–51 / p55 cross-gates

Follow-up to the pp49–51 payload scope note. These are bounded tests of the most obvious source-local uses of the 256-byte object; all were null.

1. **p49/p51 surrounding runes as a key to the 256-byte object.** The 66 p49 and 92 p51 runes (both orders, individually and concatenated; GP29 indices, prime values, compact transliteration, and spaced transliteration) were tested as repeating XOR/RC4 keys and as MD5/SHA-1/SHA-256/SHA-512-derived AES-ECB/CBC-zero-IV/CTR-zero-IV and ChaCha20 keys. HMAC-SHA-512/SHA3-512/BLAKE2b against the page-56 hash was also checked in both orientations. No plaintext-like collapse and no hash hit; best printable fraction 47.7%, entropy 7.256 bits/byte, zero dictionary hits.

2. **The 256-byte object as a 5-bit OTP for the p55 / 2012 75-token crib.** Treating GP29 indices as 5-bit values, I checked XOR with the packed table bitstream at every possible 375-bit alignment (both byte orders and both within-byte bit orders), enumerating all 29 space encodings. No exact match; best 13/75 token matches (9/59 letters, 4/16 spaces) among 6,696 alignments. The per-byte low-5/high-5 interpretations were also checked over all offsets and had no exact match (best 11/75).

3. **p49/p51 surrounding runes as a direct periodic key to p55.** GP29-index and prime-value sequences, p49/p51 individually and concatenated in both orders, were tested as additive/subtractive mod-29 keys against the 75-rune p55 body and the 2012 75-token phrase, all space values. No exact match; best 68/75 mismatches.

These do not rule out a custom cipher or a source-specified external key. They do close the literal page-local-key and straightforward 5-bit-OTP interpretations; avoid repeating them. The p49–51 table remains an unresolved 256-byte object, not an established key.
