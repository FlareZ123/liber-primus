# p56 digest converted to BASE29 as a direct repeating key

**Classification:** bounded, reproducible negative. This tests one source-motivated use of the p56 digest; it does not resolve the digest's intended destination or role.

## Human-solve hypothesis

LP2 p56 supplies a 128-hex-character (512-bit) digest. The signed 2013 TCP-server challenge separately authenticates a BASE29 numeral-conversion operation, with the worked example 3301 -> 3QO -> [3,26,24]. A solver could therefore treat the p56 digest as one large hexadecimal integer, convert that integer to canonical BASE29, interpret the resulting digits as Gematria Primus values, and use them as a repeating key. This uses the supplied digest and a historically attested operation without searching for an arbitrary key.

The tested key is the standard most-significant-digit-first BASE29 expansion of the entire 512-bit digest. It has 105 digits. It is used continuously across the 12,956 unknown runes as a direct additive Vigenere key; both inverse signs are tested. No page resets, reversed digits, offsets, or alphabet permutations are introduced.

This is a hypothesis, not an instruction established by the sources: the 2013 command proves that BASE29 conversion was part of Cicada's tool vocabulary, but does not say that the p56 digest is a cipher key.

## Results

| Inverse | First 13 runes | IoC | Top-12 rune mass | English trigram nats/rune |
|---|---|---:|---:|---:|
| Raw ciphertext | — | 0.03447840 | 0.429762 | −4.45015 |
| Decrypt C+K | NJAADIIAEOALBWR | 0.03446225 | 0.427755 | −4.47951 |
| Decrypt C−K | NGCEOJEEAIABGOMGG | 0.03447083 | 0.430534 | −4.49113 |
| Held-out English control | — | 0.05983232 | 0.771303 | −2.30601 |

Neither inverse produces a readable opening. Both candidates remain statistically indistinguishable from the ciphertext and are substantially below the independent English control.

The implementation exactly re-encrypts the original 12,956-rune stream under each sign. It also encrypts and recovers an independent held-out 12,956-rune GP-English control exactly. These checks validate the arithmetic and key alignment, not the authenticity of the proposed key.

## Decision and scope

**Reject the canonical p56-digest-to-BASE29 direct additive-key hypothesis.** The digest's direct BASE29 expansion does not recover plaintext under either additive direction.

This does not reject the digest as a URL path, onion-service identifier, hash commitment, KDF input, or another source-defined object. Nor does it reject a different role for BASE29. The test only rules out this simple direct key use.

## Reproduction

Run node sims/p56_hash_base29_key_sft.cjs from the repository root with Node.js 22. The script fixes the exact 128-hex digest, asserts its length and the signed 2013 BASE29 example, derives the 105-digit key, evaluates both inverses against all 12,956 unknown runes, and runs exact original/held-out round-trip controls.
