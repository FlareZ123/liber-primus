# Cicada OpenPGP CRC-24: verified historical check, no LP2 field match

**Evidence class:** exact source-byte reproduction of a historically available error-detection convention, followed by a bounded structural comparison against the LP2 fields named in Director Issue #2883. **No unknown LP2 plaintext, key, receiver or destination recovered.**

## Finding

Cicada's preserved 2012–2014 clear-signed messages use the OpenPGP ASCII-armor CRC-24 footer. This is a real, historically available error-detection convention, not a fitted CRC polynomial.

RFC 4880 §§6.1–6.2 defines the armor checksum as a 24-bit CRC, represented by four Radix-64 characters preceded by `=`. It is computed over the decoded binary data before Radix-64 encoding, with initial value `0xB704CE` and polynomial `0x1864CFB` ([RFC 4880 §6.1–6.2](https://www.rfc-editor.org/rfc/rfc4880.html#section-6.1)). In the Cicada clear-signed examples below, the protected binary object is the **OpenPGP signature packet**, not the authored message body.

The reproducer decodes the signature packet and recomputes the CRC-24 directly from the archived source bytes. All five checks match exactly:

| Preserved Cicada artifact | Signature packet bytes | Printed armor CRC | Recomputed |
| --- | ---: | --- | --- |
| 2012 countdown message | 543 | `=zn1y` | `=zn1y` |
| 2013 welcome/congratulations | 543 | `=dBBp` | `=dBBp` |
| 2013 Gematria JPEG payload | 543 | `=ZeNf` | `=ZeNf` |
| 2014 Onion5 signed message | 543 | `=4lgN` | `=4lgN` |
| 2014 Stage11 message | 543 | `=VAo/` | `=VAo/` |

Each artifact also carries the clear-signature header `Hash: SHA1`. The CRC-24 footer is a transport-corruption check on the signature packet; it is **not** a cryptographic authenticity check and is not a checksum of the signed prose. Authenticity comes from verifying the OpenPGP signature with the Cicada public key. The five exact inputs are in `resources/historical/`.

## LP2 structural match test

The OpenPGP convention has a fixed, typed structure: a known binary packet, a CRC-24 over those exact packet bytes, and a separate four-character Radix-64 footer prefixed by `=`. The source must independently identify both the protected bytes and the footer boundary. None of the candidate LP2 fields named in #2883 has that structure:

- **p56 digest:** the printed target is 128 hexadecimal characters (64 bytes), not a four-character Radix-64 CRC-24 footer. The 16-message first-party hash census finds `Hash: SHA1` in 16/16 clear-signature headers, but no authored body names a hash/checksum/digest convention. The header selects the OpenPGP signature's SHA-1 digest; it does not select the p56 webpage hash algorithm. See [the existing source-defined hash-semantics gate](lp2-p56-source-defined-hash-semantics-gate.md).
- **p10 inline `7`:** this is a single printed numeral, not a separated three-byte/24-bit check field or a four-character armor footer. The source census finds no second equivalent inline numeral with which to validate a repeated convention. The already completed [p10 mixed-numeral report](lp2-p10-mixed-numeral-prime-triplet.md) is not repeated here.
- **p49–51 numeric panel:** the candidate is a 256-cell, two-character-token table. No three-byte checksum field is separately reserved, and no authenticated LP2 instruction selects a byte serialization or protected-input boundary. The existing [table-checksum note](lp2-p49-table-checksum-candidate.md) remains exploratory; its fragment residues do not survive the intact-sentence boundary correction. No new table sum or CRC sweep was performed.

The existing #2210 marker-residue gate and #2754 clause-feedback gate already cover the obvious prime-sum/dot-count alternatives. They are not repeated. This test adds only the historically real OpenPGP armor convention and checks its actual packet scope.

## Decision

**Close this exact source-transfer candidate.** OpenPGP CRC-24 is demonstrably present in authentic Cicada-era artifacts, but its protected object and output field do not match p56's 128-hex digest, p10's lone `7`, or the p49–51 table as currently specified. The `Hash: SHA1` header is signature metadata, not an LP2 instruction. There is no source-selected LP2 byte object plus separately delimited 24-bit CRC field to invert or use as a plaintext check.

Do not sweep CRC polynomials, table offsets, arbitrary token encodings, or alternate field boundaries. Reopen only if an original LP2 clue fixes a concrete byte serialization, protected input, and separate check-field boundary—or if a new authenticated Cicada artifact explicitly selects a different check convention.

## Reproduction

From the repository root:

```sh
node sims/cicada_openpgp_crc24_source_gate.cjs
```

The script reads the five original armored messages, checks their `Hash: SHA1` headers, decodes each signature packet, recomputes CRC-24 with the RFC 4880 parameters, and asserts exact equality with the printed footer. The same core calculation was executed in the connected JavaScript runtime against the exact five repository files; the standalone Node wrapper has not been run in CI.
