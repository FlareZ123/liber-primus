# 2014 prime-width margins and an untested signature-column password

**Status:** Source-derived candidate only. The original 2014 signed handoff yields a reproducible eleven-character extraction, \`I8XwhKTScAn\`. Its proposed use as a standard OutGuess 0.4 password on LP2 was tested on all 58 source JPEGs and failed to recover payload. There is no authenticated unknown-page plaintext, cipher operation or creator key from this observation.

## Source and human-visible operation

The archived Cicada handoff \`resources/historical/cicada2014-stage11-message.asc\` (the original message that directs the solver to \`ky2khlqdf7qdznac.onion\`) contains eleven leading, trailing and all-blank whitespace widths in reading order:

\`\`\`text
[2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37]
\`\`\`

They are the first twelve primes except 19, which is GP prime W. This exact original-source pattern was previously documented in \`sims/lp2_2014_release_whitespace_prime19_sft.cjs\`; the source and the widths themselves are not a new discovery. The *new candidate extraction* treats each successive prime width as the **zero-based character column** in the corresponding line of the actual armored OpenPGP signature appended to the same message. The signature has eleven full 64-character Base64 rows followed by a twentieth-character row.

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

The resulting exact string is **\`I8XwhKTScAn\`**. The final four symbols spell \`ScAn\`. Reading columns as one-based instead yields \`Q55koweATyH\`, an unrecognizable control. Although the original JPG index names start at zero, this does not authenticate zero-based column indexing for the signed handoff. \`SCAN\` was noticed after seeing the output, so it is neither a preregistered plaintext target nor a validated author instruction.

**Critical provenance limitation:** OpenPGP clearsign canonicalization excludes trailing whitespace and blank-line padding from the authenticated content. A valid PGP signature therefore does not prove that Cicada chose the prime widths. They may have been added or modified in a later mirror. In particular, the candidate is weaker than a cryptographically authenticated, first-party hidden key.

## Decisive original-artifact consumer: OutGuess 0.4

A natural reason to try an eleven-character password is Cicada's earlier, known use of OutGuess and the apparent \`ScAn\` suffix. The exact image-domain experiment used the existing calibrated decoder \`sims/outguess_extract.py\`, including libjpeg original quantized-DCT traversal and the correct ARC4 password state, on all 58 original LP2 JPEGs \`17.jpg\` through \`74.jpg\`. Its known first-party positive control, \`03.jpg\` with \`Default key\`, recovered 31,809 bytes of valid OpenPGP clear-signed text, SHA-256 \`a14c1e144760c361a39da41e4784a9a22a3ce490baf42d9eb99b37feab8a47c1\`.

For **every LP2 image**, the apparent encrypted four-byte header is \`ffffffff\`, forced by the original JPEG coefficient bitmap for *any* password. The candidate password yields decrypted header \`58b13601\`, interpreted as seed **45,400** and length **310**. It therefore creates an apparent 310-byte output on every image regardless of whether data is embedded. The actual extracted 310-byte streams have **no recognizable file magic or OpenPGP armor**, maximum printable-byte fraction **0.43226**, and minimum byte entropy **7.17799 bits per byte**. Common source-forced ciphertext prefixes recur across images. These are pseudorandom retrievals, not a payload.

The exact full-file test and source-derived password reconstruction are implemented read-only in \`sims/lp2_2014_prime_signature_columns_outguess_sft.py\`. The local original image run used the same \`outguess_bitmap_dump.c\` coefficient extraction and a faithful copy of its established ARC4/iterator algorithm; all 58 payloads had the fixed header and no recognizable content. The source code in the shared SFT permits independent replay.

## Additional native-rune consumer and decision

The candidate can be encoded as ten GP-native letters (digit \`8\` omitted), eleven Base64 index residues modulo 29, or eleven ASCII-value residues modulo 29. Direct periodic GP29 additive subtraction/addition with these three simple key interpretations on original p0, p8, p28, p32 and p55 produced only near-uniform index-of-coincidence and no continuous native-language text. This excludes those immediate, unconstrained uses as evidence, without excluding all possible keyed ciphers.

**Next decision:** Do not run generic password variants or represent \`ScAn\` as recovered plaintext. Preserve the exact source-derived candidate because a separate original clue might identify a different intended consumer. Continue looking for a genuine key receiver or original author-selected operation. The original source's unsigned padding remains the main objection.
