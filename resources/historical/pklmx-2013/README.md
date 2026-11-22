# pklmx 2013 signed-page archive

These files preserve the **participant-archive copies** of the pklmx third-onion pages and their clear-signed message companions. They are not recovered original-server bytes or a WARC response.

## Source and exact copies

Upstream repository: [`neuroretransmit/cicada`](https://github.com/neuroretransmit/cicada)  
Pinned commit: [`ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`](https://github.com/neuroretransmit/cicada/commit/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3) (participant archive commit dated 3 May 2024).

| Message | Mirrored HTML | HTML bytes / upstream Git blob | Clear-signed companion | ASC bytes / upstream Git blob | Signed body |
|---|---|---|---|---|---|
| Initial page | [standby.html](standby.html) | 983 / `941b17cf48ca3963e2eb1929c82a3bbad770dfaa` | [standby.txt.asc](standby.txt.asc) | 909 / `ce5f19ebc61c5920102d84a7b6a96e1e5c520fba` | `Standby for coordinates.` |
| Annapolis | [annapolis.html](annapolis.html) | 978 / `aff807d3c4ac427b9b767f6961ee3ae5266ec5b0` | [annapolis-md.txt.asc](annapolis-md.txt.asc) | 904 / `1ee6b40f4f90e431587123012a35a97c6d993ac7` | `38.977845, -76.486451` |
| Okinawa | [okinawa.html](okinawa.html) | 976 / `4237a2c769215ac27a5ee8970480c533d94583ee` | [okinawa-japan.txt.asc](okinawa-japan.txt.asc) | 902 / `dbff1d55c8a1c818614edc7b92c8d61e008f41b4` | `26.41968, 127.73254` |

The HTML `<pre>` payload is byte-for-byte identical to its corresponding `.asc` companion for all three pages. The exact LF-encoded files, byte counts, SHA-256 digests, and upstream Git blob IDs are asserted by [`sims/pklmx_2013_signed_message_verification.py`](../../../sims/pklmx_2013_signed_message_verification.py).

### Signature verification

All three signatures verify with GnuPG 2.4.7 against [`resources/control/cicada-3301-public-key.asc`](../../control/cicada-3301-public-key.asc). The key file is identical to the historical 2012 key copy (Git blob `d44aec389e2f346c6b9d149d4c61e890f62979c9`; SHA-256 `6e397c5c6ceeeb4da08535db74874989f193c914b8d2d87972dd282b24ea809f`). Primary fingerprint:

`6D85 4CD7 9333 22A6 01C3 286D 181F 01E5 7A35 090F`

Each packet is OpenPGP v4, RSA (algorithm 1), SHA-1 (digest algorithm 2), text signature class `0x01`; the dearmored signature packet is 543 bytes. The hashed signature-creation subpacket yields:

| Message | Signature creation time (UTC) |
|---|---|
| Standby | 2013-01-11 23:20:28 |
| Okinawa | 2013-01-12 20:39:51 |
| Annapolis | 2013-01-12 20:46:39 |

GnuPG reports a good cryptographic signature and the same primary fingerprint for each. Its trust database reports the key as `[unknown]`: this verifies the message against the preserved key, but does not independently establish web-of-trust identity or prove the original publication time. Signature timestamps are signer-supplied signed metadata, not trusted timestamps.

### Archive transcription cautions

- The external stage README has two swapped cross-links: it links `okinawa.html` next to the Annapolis coordinates and `annapolis.html` next to the Okinawa coordinates. The signed bodies, filenames, and its later summary table give the correct mapping shown above.
- The [Uncovering Cicada ONION3 page](https://uncovering-cicada.fandom.com/wiki/ONION3) transcribes HTTP headers for a 15 January 2013 response: `Date: Tue, 15 Jan 2013 12:44:19 GMT`, `Last-Modified: Sat, 12 Jan 2013 20:40:28 GMT`, and `Content-Length: 1869`. Those headers are not covered by any PGP signature. The quoted 1869-byte entity has not been recovered as raw bytes; the pinned participant archive's standalone `standby.html` is 983 bytes, and its coordinate pages are separate 978- and 976-byte files.
- The quoted Last-Modified time is 37 seconds after the Okinawa signature and 6 minutes 11 seconds before the Annapolis signature. This is a useful ordering boundary, not proof of which signed messages appeared in the 1869-byte HTTP entity.
- The ONION3 page describes the Annapolis coordinates as received at 16:50 CET on 15 January; the separate [MARRYLAND page](https://uncovering-cicada.fandom.com/wiki/MARRYLAND) says posted 16:40 GMT. These secondary posting-time descriptions differ by 50 minutes. Both quote the same Annapolis signed body, whose signature creation time is 12 January 20:46:39 UTC.

**Scope:** the three signed texts are authenticated under the preserved key. The surrounding HTML, HTTP headers, exact original response entity, page deployment chronology, and later participant commentary are not thereby authenticated. Nothing in these three messages supplies an LP2/p56 instruction or key.
