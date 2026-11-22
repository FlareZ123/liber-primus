# 2014 prime-width margins and a candidate signature-column password

**Status:** Source-derived candidate only. The original 2014 signed handoff yields a reproducible eleven-character extraction, `I8XwhKTScAn`. Its proposed use as a standard OutGuess 0.4 password on LP2 was tested on all 58 source JPEGs and failed to recover payload. There is no authenticated unknown-page plaintext, cipher operation or creator key from this observation.

## Source and human-visible operation

The archived Cicada handoff `resources/historical/cicada2014-stage11-message.asc` (the original message that directs the solver to `ky2khlqdf7qdznac.onion`) contains eleven leading, trailing and all-blank whitespace widths in reading order:

```text
[2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37]
```

They are the first twelve primes except 19, which is GP prime W. This exact original-source pattern was previously documented in `sims/lp2_2014_release_whitespace_prime19_sft.cjs`; the source and the widths themselves are not a new discovery. The *new candidate extraction* treats each successive prime width as the **zero-based character column** in the corresponding line of the actual armored OpenPGP signature appended to the same message. The signature has eleven full 64-character Base64 rows followed by a twentieth-character row.

| Signature line (zero-based) | Whitespace width / column | Extracted symbol |
| ---: | ---: | :---: |
| 0 | 2 | I |
| 1 | 3 | 8 |
| 2 | 5 | X |
| 3 | 7 | w |
| 4 | 11 | h |
| 5 | 13 | K |
| 6 | 17 | T |
| 7 | 23 | S |
| 8 | 29 | c |
| 9 | 31 | A |
| 10 | 37 | n |

The resulting exact string is **`I8XwhKTScAn`**. The final four symbols spell `ScAn`. Reading columns as one-based instead yields `Q55koweATyH`, an unrecognizable control. Although the original JPG index names start at zero, this does not authenticate zero-based column indexing for the signed handoff. `SCAN` was noticed after seeing the output, so it is neither a preregistered plaintext target nor a validated author instruction.

**Critical provenance limitation:** OpenPGP clearsign canonicalization excludes trailing whitespace and blank-line padding from the authenticated content. A valid PGP signature therefore does not prove that Cicada chose the prime widths. They may have been added or modified in a later mirror. In particular, the candidate is weaker than a cryptographically authenticated, first-party hidden key.

## Decisive original-artifact consumer: OutGuess 0.4

A natural reason to try an eleven-character password is Cicada's earlier, known use of OutGuess and the apparent `ScAn` suffix. The exact image-domain experiment used the existing calibrated decoder `sims/outguess_extract.py`, including libjpeg original quantized-DCT traversal and the correct ARC4 password state, on all 58 original LP2 JPEGs `17.jpg` through `74.jpg`. Its known first-party positive control, `03.jpg` with `Default key`, recovered 31,809 bytes of valid OpenPGP clear-signed text, SHA-256 `a14c1e144760c361a39da41e4784a9a22a3ce490baf42d9eb99b37feab8a47c1`.

For **every LP2 image**, the apparent encrypted four-byte header is `ffffffff`, forced by the original JPEG coefficient bitmap for *any* password. The candidate password yields decrypted header `58b13601`, interpreted as seed **45,400** and length **310**. It therefore creates an apparent 310-byte output on every image regardless of whether data is embedded. The actual extracted 310-byte streams have **no recognizable file magic or OpenPGP armor**, maximum printable-byte fraction **0.43226**, and minimum byte entropy **7.17799 bits per byte**. Common source-forced ciphertext prefixes recur across images. These are pseudorandom retrievals, not a payload.

The exact full-file test and source-derived password reconstruction are implemented read-only in `sims/lp2_2014_prime_signature_columns_outguess_sft.py`. The local original image run used the same `outguess_bitmap_dump.c` coefficient extraction and a faithful copy of its established ARC4/iterator algorithm; all 58 payloads had the fixed header and no recognizable content. The source code in the shared SFT permits independent replay.

## Exact contemporary service-receiver test

Because the extracted eleven characters satisfy YouTube's usual video-identifier shape and their first eight satisfy Pastebin's paste-identifier shape, one locked network test checked those **exact identifiers** with independent live controls, rather than enumerating mutations of the candidate. On **2026-11-22**, Windows Node22 workflow [external receiver run 45027978160](https://github.com/FlareZ123/liber-primus/actions/runs/45027978160) established:

- YouTube oEmbed accepted a known video (HTTP 200 with metadata), but returned **HTTP 400 Bad Request** for `I8XwhKTScAn`; a separate noembed endpoint returned the same rejection as a structured error.
- Pastebin returned a real archived 2014 Cicada music paste for a known period URL (HTTP 200) and **404 Not Found** for `I8XwhKTS`.
- Internet Archive's current `wayback/available` endpoint returned empty `archived_snapshots` objects for both exact addresses. This is a negative availability query, not an exhaustive guarantee that no historical copy ever existed.

Thus the simplest exact YouTube/Pastebin receiver is unsupported. The read-only reproducible source reconstruction and test are in `sims/lp2_2014_signature_exact_external_receiver_probe.cjs`; its [Windows workflow](../.github/workflows/agent49-2014-signature-external-receiver.yml) ran successfully after normalizing source CRLF. It recovered no external key or continuation.

## Additional native-rune consumer and decision

The eleven-character string is valid Base64 text and decodes to eight exact bytes, `23c5f084a4d27009`. It can also be encoded as ten GP-native letters (digit `8` omitted), eleven Base64 index residues modulo 29, or eleven ASCII-value residues modulo 29. Direct periodic GP29 subtraction/addition with these three simple key interpretations on original p0, p8, p28, p32 and p55 produced near-uniform index of coincidence and no native-language text.

A more generous but still fixed source-selected route uses **the full original signature**, comprising 724 Base64 characters or 543 decoded packet bytes, as a continuous additive GP29 key. Across all **52 original unknown pages with at least 120 runes**, four signature/password source encodings × both signs × a source-zero cursor yielded **416 complete direct decryptions**. None reached GP29 index of coincidence 0.047; the maximum was **0.039812**, at p22 using the decoded packet bytes with negative sign. Decoded prefixes were nonprose. Source-signature variants tested as a 28-symbol predecessor-excluding alphabet on five unchanged pages likewise produced nonprose. The original solved-p56 transparent-F rule with signature-derived key advancement could complete a few short original windows, but all recovered alternatives were nonprose.

On the **original 256-byte p50 numeral table**, direct DES, RC4 and whole-signature first/second-half XOR consumers using the candidate's eight raw bytes or signature packet showed no readable plaintext or identifiable file header. A locked p0 first-word `EPIPHANY` crib (GP29 indices `[18,13,10,13,8,24,9,26]`, suggested by the later signed `epiphany seeks the devoted` instruction) requires additive key `[26,24,8,19,27,24,18,3]`; that exact eight-residue vector, or even a one-mismatch neighbor, occurs in neither direction of the 2014 signature raw bytes, armor/Base64 residues, p50 256 bytes or the signed handoff itself. This is an exploratory crib, **not verified original plaintext**.

A direct RC4 stream consumer using either the eleven original ASCII password bytes or its eight Base64-decoded bytes, with both keystream signs and both page-reset/full-book framing, supplied another **416 complete decodes** of original LP2 pages having at least 120 runes. No run reached GP29 index of coincidence 0.047 (maximum **0.040398**); the printed native-rune prefixes remained nonprose. RC4 was tested as a concrete historic option, without independently authored instructions for applying it to LP2.

These negatives bound direct source-derived consumers only. An independently specified alternative key derivation, structural reading or external target could still change the conclusion.

**Next decision:** Do not run generic password variants or represent `ScAn` as recovered plaintext. Preserve the exact source-derived candidate because a separate original clue might identify a different intended consumer. Continue looking for a genuine key receiver or original author-selected operation. The original source's unsigned padding remains the main objection.
