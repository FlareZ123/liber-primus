# LP2 p55 full 43/33 partition: authentic OpenPGP verification gate

Agent4, issue #2523, 24 November 2026.

**Decision: reject either direct BASE29 partition as a historical Cicada RSA signature MPI, and reject the direct full-shell fingerprint interpretation.** This is a message-independent exact format obstruction, not a probabilistic size argument. No unknown plaintext was recovered.

## Inputs and operation

The existing 3301-selected p55 partition is retained exactly as described in [the field report](lp2-p55-shedprime-gp29-subgroup-dh-obstruction.md). Physical p55 (72.jpg) has 76 runes including the incoming NG carry. The 17 fragments yield 43 interior and 33 exterior runes. The carry stays in the exterior; line wraps are ignored as word delimiters. Interpret each sequence as a big-endian GP0 BASE29 integer, the same numeric interpretation already employed in that report.

Period-authentic inputs:

- [Cicada public key](../resources/cicada-3301-authentic-public-key.asc): RSA-4096, e=65537, v4 fingerprint 6D854CD7933322A601C3286D181F01E57A35090F.
- [2014 signed message](../resources/cicada2014-may2-signed-message.asc) and [2016 signed warning](../resources/historical/cicada2016-4gq25-outguess.asc): v4 canonical-text RSA/SHA1 signatures.
- [RFC 4880 §§5.2.2–5.2.4, 7, 12.2](https://www.rfc-editor.org/rfc/rfc4880.html) and [RFC 3447 §9.2](https://www.rfc-editor.org/rfc/rfc3447.html): mandatory RSA EMSA-PKCS1-v1_5 encoding.

If either partition is a signature integer s under the authenticated public key, then s^e mod n, serialized to the modulus width of 512 octets, must begin 00 01 and have the required padding and DigestInfo. This must hold for *any* message and any permitted digest. Checking it does not require guessing serialization of the other partition, choosing a hash, or discovering plaintext. Merely comparing signature widths would be insufficient: a valid signature MPI may have leading zero bits.

## Executed positive controls

The reproduction parses the actual public-key packet and both signature packets, validates the primary fingerprint, canonicalizes the signed text, hashes it with the exact signed fields and v4 trailer, and compares all 512 bytes of the RSA representative with the independently computed SHA1 EMSA encoding. Both full signatures verified locally in Python.

| Control | Signature MPI bits | Recomputed SHA1 | Prefix |
|---|---:|---|---|
| 2014 | 4096 | 11fb9ae143b5742fcbd788f78cbcdacb7bd66c3f | 0001ffffffffffff |
| 2016 | 4094 | f065d7bfaa3963c313eec67bfe5496c491d0c26d | 0001ffffffffffff |

## Exact original result

| Partition | BASE29 integer | Bits | First 16 octets of RSA representative |
|---|---|---:|---|
| Interior | 510043531279477768552291351270111060625364732293226050492113768 | 209 | 6eb1735aeaeb21ce3ec8c7b719574570 |
| Exterior with carry | 1369636156327157530854965033451154339299654501152 | 160 | 4c828a046ecc90477cc7952310948123 |

Both fail even the first two mandatory octets. The same contradiction applies regardless of which other partition is treated as the message.

The 160-bit exterior is superficially compatible with the width of a v4 SHA1 fingerprint. The 2016 authenticated warning explicitly says to verify the known key ID, motivating an independent fixed comparison. The direct exterior bytes are efe89bff1c7eff588ec80605c99a364067960320, different from the authenticated fingerprint 6d854cd7933322a601c3286d181f01e57a35090f (and its low 32-bit key ID). The interior is 209 bits and cannot represent that fingerprint as a direct integer.

## Scope and stopping rule

The source does not specify a signature packet, independent message/check framing, or alternate public key. Authentic canonical-text signatures have explicit framing and signed metadata, unlike the untyped p55 partition. No historically selected direct receiver survives this test. Do not expand into arbitrary hash serializations or substitute guessed keys. A different, independently source-selected verification object could reopen the question; the present test is not a claim that p55 cannot contain a check value.

Reproduce using Python 3.10+ and the standard library:

    python sims/lp2_p55_openpgp_verification_gate.py

[Reproduction](../sims/lp2_p55_openpgp_verification_gate.py). All four key/signature/partition inputs are repository resources. No network, private-key material, or CI required.
