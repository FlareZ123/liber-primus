# Source-armored Cicada OpenPGP signature metadata: no hidden notation/key subpacket

**Original-input decision (Agent34, 18 November 2026).** The repository's 27 armored `.asc` resources include 24 OpenPGP cleartext-signed/source-signed messages and three public-key objects. Every one of the **24 recovered signature packets** is a version-4 signature with exactly one hashed **type 2 signature creation-time** subpacket and one unhashed **type 16 issuer key ID** subpacket. None carries an OpenPGP signature notation (type 20), policy URL (26), preferred keyserver (24), signer's user ID (28), critical extension, or an unknown private/experimental subpacket. **No secret instruction, new creator-selected LP2 key, unknown plaintext or destination emerged.**

## Authored human solve route and rival

A 2012–2017 player could directly run an OpenPGP packet inspector on the author's signed Cicada releases. A signature packet can include authenticated human-readable notation or policy-URL fields alongside the visible signed prose. Those fields could, in principle, carry a key or further URL without being shown in a normal cleartext viewer. The rival is the ordinary signature format: creation time and issuer ID are routine metadata, and RSA signature material should not be interpreted as a message without a distinct selector. This bounded test inspects original source packets only; it does not claim that historical original authors hid instructions in the signature layer.

## Exact tested source and positive control

[SFT](../sims/lp2_cicada_original_pgp_subpackets_sft.cjs) reads every `resources/**/*.asc` file, separates exact `BEGIN/END PGP SIGNATURE` armors, decodes the original binary OpenPGP packets and parses both hashed and unhashed variable-length subpackets. For notation, the parser reconstructs the signed binary notation-name and value from their explicit length fields. A synthetic v4 signature containing type-20 `research.example`=`SOURCE-DERIVED-KEY` is parsed and asserted **exactly**, proving the scanner actually detects a hidden notation field when present. This planted positive is laboratory data, not an original Cicada signature. Public-key-only armors were examined for signature blocks but correctly contained none.

The [successful Windows Node 22 CI run #44275474414](https://github.com/FlareZ123/liber-primus/actions/runs/44275474414) independently executes the checked-in SFT against the full checked-in source corpus and prints all 24 individual packet field lists. Examples include the original 2014 Stage11 distributor signature (the source directing players to `ky2khlqdf7qdznac.onion`), 2013 clue messages, 2016 image clues and 2017 signed statement. All 24 signatures show `hashed:[2]`, `unhashed:[16]`. Twenty-three use hash algorithm ID 2 (SHA-1), and the 2017 statement uses ID 10 (SHA-512). The exact distinguishing property tested here is the **subpacket set**, not the hash choice.

| Source input | Verified packet count | Type 20/24/26/28 or unknown extension |
| --- | ---: | ---: |
| All original `.asc` records present in `resources/` | 24 | **0** |
| Planted v4 signature with type-20 notation | 1 | **1, exact known name/value** |

## Decision and scope

Retire the proposal that a currently preserved, signed Cicada source in this corpus gives a hidden LP2 key or continuation via **nonstandard OpenPGP signature subpacket metadata**. Do not repeat the same notation search or attempt to derive meaning from ordinary 32-bit signature timestamps or unsigned issuer IDs absent a signed instruction. The test does **not** search private historical messages missing from `resources/`, inspect unknown archival packets, audit human-visible source prose, challenge PGP authenticity, or extract cryptographic plaintext from raw RSA signatures. Those are different questions. An externally found first-party signature containing a **new** subpacket is the only source event that would justify reopening this route. This metadata-negative result is an intermediate scope exclusion, not an established cipher or progress toward decrypting the 56 unknown LP2 pages.
