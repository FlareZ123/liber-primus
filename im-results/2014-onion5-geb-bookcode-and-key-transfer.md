# 2014 Onion5 GEB book code, signed payload, and LP2 transfer gate

## Current conclusion

The 2014 Onion5 signed message is a useful historical control and explains the transition to the sixth onion, but it does **not** currently provide plaintext or a demonstrated key for the 56 unsolved LP2 pages.

The message's trailing coordinate-like entries are a *Gödel, Escher, Bach* book code. A reconstruction dated 2026-11-23 resolves all 14 letter selections and recovers the v2 onion address:

`ut3qtzbrvs7dtvzp.onion`

This is an intermediate 2014 destination, not the unresolved deep-web hash specified by LP2's solved closing material.

## Authenticated Onion5 message

Primary source: [2014-01-onion5-liber-primus.asc](https://github.com/Dukotah/cicada3301/blob/main/corpus/A-primary-artifacts/pgp/messages/2014-01-onion5-liber-primus.asc).

The signed text contains the sentence “Very good. You have done well to come this far.”, followed by a 24,014-hex-digit payload (12,007 bytes), then these exact lines:

```text
CC:8:6:1
CBIA:3:7:2
CFAF:5:23:6
SPR:1:8:1
7
C[1]:4:5:3
AWDV:6:2:1
C[2]:2:17:5
SC:3:17:1
AOGS:2:8:1
ONION
Good luck.
3301
```

The archived [payload inventory](https://github.com/Dukotah/cicada3301/blob/main/corpus/A-primary-artifacts/signed-payloads/PAYLOADS.json) records 12,007 bytes and SHA-256 `ebe41c78a0471f145e0177ddfa339c32019fa9eca650ca2dc7d589a13550ed3c`. Parsing the signed hex body to that exact length gives:

| Offset | Size | Identification |
|---:|---:|---|
| 0 | 1,084 bytes | JPEG; small mathematical graphic |
| 1,084 | 1,635 bytes | JPEG; eye image |
| 2,719 | 9,288 bytes | MP3 stream; MPEG frame syncs and LAME3.98.4 metadata |

The [Dukotah artifact report](https://github.com/Dukotah/cicada3301/blob/main/corpus/A-primary-artifacts/REPORT-A.md) records the PGP signature as verified against the known Cicada key. I have not independently run GPG verification in this invocation. The recent [Cicada Notebook session 125](https://cicadanotebook.com/sessions/125) identifies the visual/audio references as Gödel, Escher, and Bach (the Bach clip is identified as Trio Sonata in G major, BWV 1039) and resolves the book-code selections to the onion address above.

## Sixth-onion continuation and the three squares

The community archive's [sixth-onion README](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/008-sixth-onion/README.md) describes the next human solve path:

1. The sixth-onion page carried the LP2 image/hex dump and four OutGuess messages.
2. Those messages indicated that three magic squares from earlier stages were required; the challenge then asked solvers to submit the squares and a Tor CGI hidden-service URL.
3. Successful submission returned three additional “prime pages” (107, 167, 229).
4. Pages 107 and 167 are reported as Vigenère-encrypted with key `FIRFUMFERENCE`; their decrypted text is a Koan containing “The I is the voice of the circumference.”
5. Page 229 is unencrypted and begins with an instruction to “QUESTION ALL THINGS” and “DISCOVER TRUTH INSIDE YOURSELF,” followed by the first square.

The archived [three-square transcription](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/007-fifth-onion/magicsquares.txt) contains 5×5, 7×7, and 5×5 squares. The third is the 5×5 square also present on LP2 p05; the first appears on prime page 229. These are real historical relationships, but they do not by themselves specify a decipherment of other LP2 pages.

The archived [original sixth-onion form](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/008-sixth-onion/ut3qtzbrvs7dtvzp.onion.v2-form.html) makes the selection explicit: its three fields are **Order 5 Square, 3301**, **Order 7 Square, 1033**, and **Order 5 Square, 1033**, followed by the solver's onion address. The form's signed message asks for a Tor CGI upload endpoint and a GnuPG public key at `/key.asc`. The captured [HTTP headers](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/008-sixth-onion/ut3qtzbrvs7dtvzp.onion.headers) include `X-Cicada: 1033`. This is strong evidence for the intended three-square submission and the 3301/1033 values; it still does not specify a cipher operation for the unknown LP2 pages.

## Bounded direct-key transfer test

I reconstructed the 2014 `gematriaprimus.py` key mapping and applied the reported `FIRFUMFERENCE` key to the LP2 transcription. The historical script uses GP29 rune order with key shifts derived from the reversed lookup values; for this key the modulo-29 shifts are:

`[0,19,25,0,28,10,0,11,25,11,20,24,11]`.

I tested both `FIRFUMFERENCE` and the repository's independently recovered LP1 KOAN control key `FIRFUMFERENFE` (one symbol differs: position 12 is C versus F). The fixed-key tests covered direct and Atbash-complement key mappings, both additive directions, all 13 starting phases, page-local and continuous key phase, and plaintext-F hold. No readable output appeared on LP2 p0, p15, p55, or across p0–55.

This is a **narrow negative**: direct transfer of these exact 13-symbol keys under the tested GP29 Vigenère/F-hold models is unsupported. It does not rule out a different key schedule, a square-derived operation, or another use of the circumference clue. A separate exploratory use of the p05 square's 16-cell perimeter as a modulo-29 repeating key also produced no readable LP2 text; no further phase or ordering search is justified without a new selector.

## What remains unresolved

- No plaintext or cryptographic key for any of the 56 unsolved LP2 pages was recovered here.
- The relationship, if any, between the three-square collection, p05's square, p15's 16-cell grid, and the Koan's circumference language remains unestablished.
- The historical Onion5 address does not identify the 128-hex/64-byte deep-web hash target described by the solved LP2 closing material. The digest algorithm, target bytes, serialization, and destination remain unspecified in the current evidence.

## Recommended next decision

Only pursue the three-square/circumference connection if an original clue selects a concrete, reversible operation and predicts a discriminating result on original LP2 ciphertext. Do not repeat direct `FIRFUMFERENCE` key transfer, arbitrary perimeter-to-key conversions, or unconstrained key searches.

## Reproduction sources

- [Signed Onion5 PGP message](https://github.com/Dukotah/cicada3301/blob/main/corpus/A-primary-artifacts/pgp/messages/2014-01-onion5-liber-primus.asc)
- [Payload inventory](https://github.com/Dukotah/cicada3301/blob/main/corpus/A-primary-artifacts/signed-payloads/PAYLOADS.json)
- [Dukotah artifact report](https://github.com/Dukotah/cicada3301/blob/main/corpus/A-primary-artifacts/REPORT-A.md)
- [Sixth-onion archive and prime-page transcription](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/008-sixth-onion/README.md)
- [Historical Gematria/Vigenère implementation](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/008-sixth-onion/gematriaprimus.py)
- [Three magic squares](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/007-fifth-onion/magicsquares.txt)
- [2026 book-code reconstruction](https://cicadanotebook.com/sessions/125)
