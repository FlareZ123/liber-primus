# 2014 LP2 JPEG password source gate

**Decision: bounded public-source negative.** No surviving source examined supplies a creator-provided password or derivation explicitly tied to the 58 Stage11 JPEGs. The two published OpenPuff password spellings belong to the earlier `Interconnectedness` MP3 extraction, not the Stage11 image set. No LP2 carrier extraction was attempted.

## Acceptance rule

Issue [#246](https://github.com/FlareZ123/liber-primus/issues/246) requires an explicit historical link between a fixed password/key derivation and the LP2 Stage11 page JPEG carriers. A password for another carrier, a solver's guess, or a generic steganography instruction does not satisfy that requirement.

## Stage11 release and callback

- The pinned [Stage11 HTML index](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage11/ky2khlqdf7qdznac.onion/index.html) is 1,640 bytes and contains title `133`, a `div` id `331`, and sequential references `0.jpg`–`57.jpg`. It contains no password, key derivation or steganography instruction. This is an archive copy, not an independently authenticated raw HTTP response.
- The PGP-signed [“Your enlightenment awaits you” message](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/messages/2014/hello-your-enlightenment.asc) points to `ky2khlqdf7qdznac.onion`, says “We look forward to hearing from you,” and ends with “3301.” It contains no password or OpenPuff direction.
- The PGP-signed [callback/form body](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/messages/2014/hello-you-have-done-well.asc) asks solvers to submit three magic squares and a Tor URL, generate a GnuPG key pair, and publish the public key at `/key.asc`. It does not direct use of a password on the Stage11 JPEGs.
- The participant's pinned [sixth-onion archive](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/008-sixth-onion/README.md) reproduces the signed OutGuess payloads on `10.jpg`–`13.jpg`. They repeat the instruction to host a CGI upload service and submit the squares and service URL. These payloads are not a passphrase derivation for the later 58-image Stage11 set.
- The May 2 participant callback archive records `GET /key.asc`, `GET /`, and `POST /cgi-bin/upload`; the saved log has no request body, key fingerprint or client trace. The preserved `message.txt.asc` is clear-signed, not a recipient-specific encrypted envelope. The example `cgi.py` is explicitly a never-used participant mock. See the consolidated [upload-direction/outbound-envelope audit](2014-stage11-upload-direction-correction.md).

## The known OpenPuff passwords belong to the MP3

The two historical walkthroughs disagree on the spelling, but agree on the carrier and operation:

- The pinned [fifth-onion walkthrough](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/README.md) specifies OpenPuff v4.00, password `33011033`, B/C disabled, and 50% MP3 bit selection to extract `magicsquares.txt` from the `Interconnectedness` MP3. It links the password to the 1033/3301 column sums.
- The pinned [iBotPeaches extraction note](https://github.com/iBotPeaches/cicada_3301/blob/a0a616d85717af59f8b806875b43d51e06e1e874/other/Interconnected_OpenPuff.md) reports `33011103` for the same `interconnected.mp3`, 50% MP3 selection and a 745-byte output with reported CRC32 `6A8C41E3`.

The discrepancy remains an MP3 positive-control issue. Neither source ties either spelling to the 58 Stage11 JPEGs. The existing [OpenPuff JPEG capacity report](openpuff-jpeg-capacity-gate.md) correctly leaves native extraction unexecuted pending the authorized positive control in [Issue #39](https://github.com/FlareZ123/liber-primus/issues/39); this task does not authorize bypassing that manual-dispatch requirement.

## Bounded archive search

The pinned iBotPeaches 2014 message tree was checked for `welcome.asc`, `the-work-of-a-private-man.asc`, `very-good-you-have-done-well.asc`, `idgtk-umloo.asc`, `let-the-text-guide-you.asc`, and the `liber_primus/00`–`03` and `10`–`13` signed payloads. The latter four repeat the upload instruction; the other inspected bodies provide their own text/image or an unrelated RSA-OAEP challenge, not a Stage11-JPEG password.

Bounded GitHub code-search results on the public archive repositories:

| Query | Result |
|---|---|
| `neuroretransmit/cicada`: `password path:2014` | One hit: `2014/007-fifth-onion/README.md` (MP3 password) |
| `neuroretransmit/cicada`: `OpenPuff path:2014` | `2014/007-fifth-onion/README.md` and `2014/008-sixth-onion/README.md`; no LP2-JPEG key derivation |
| `neuroretransmit/cicada`: `passphrase path:2014` | Zero hits |
| `iBotPeaches/cicada_3301`: `password path:messages/2014` | Zero hits |
| `iBotPeaches/cicada_3301`: `OpenPuff path:messages/2014` | Zero hits |

The iBotPeaches repository-wide password search returned the MP3 extraction note and two software implementation/test files, not a 2014 message linking a password to Stage11 JPEGs. These searches cover preserved public repositories, not private participant mailboxes or lost onion/server storage.

## Research decision

1. No source-selected LP2-JPEG password or derivation was found in the bounded public 2014 corpus.
2. Do not test `33011033` or `33011103` against LP2 JPEGs; their documented carrier is the earlier MP3.
3. Do not generate wordlists, reinterpret the unrelated RSA-OAEP block, or bypass Issue #39's manual positive-control gate.
4. Reopen only if an authentic dated source explicitly connects a fixed password/key derivation and tool/version to one or more Stage11 JPEGs, or a recipient-preserved instruction/capture supplies that link. A qualifying key would still require the source-native positive control specified in #246 before any LP2 carrier test.

**Boundary:** this is a negative result for the identified surviving public archives. It does not prove that no private recipient archive, deleted message, unpreserved onion response or creator-side record ever existed. No LP2 plaintext, key, carrier payload or destination is recovered.
