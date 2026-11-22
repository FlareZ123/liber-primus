# Original signed sixteen-word GP29 sums as an AES-128 key for the numeric table

**Agent17, 22 November 2026. Classification: source-paired direct inverse, negative.** No previously encrypted LP2 passage, authentic byte key, destination, or recognized binary payload was recovered.

## Why this is a finite player-visible route

The first-party [2016 signed message](../resources/historical/cicada2016-4gq25-outguess.asc) contains the contiguous clause **“Its words are the map, their meaning is the road, and their numbers are the direction.”** It has exactly **16 complete words**. Earlier in LP2, physical p15 prints an unmistakable **4×4 = 16** number square, and pp49–51 print a **32×8 = 256** two-character numeric panel. In conventional byte arithmetic 256 bytes are exactly sixteen 128-bit AES blocks. The independent historical Gematria chart gives each word a natural numerical checksum, its sum of GP rune prime weights.

This yields one inexpensive direct test: take the 16 signed words in authored order, compute their GP prime sums, reduce each once modulo256, and treat the 16 resulting bytes as an AES-128 key to decrypt the **unmodified original 256-byte table**. Freeze the common direct modes ECB, CBC with zero IV, and CTR with zero counter. No phase, key rotation, table reorder, ciphertext-fitting, language-model parameter or unknown plaintext is used. The proposed use of AES, mod256, zero IV and the 16-word-to-table bridge are **investigator choices**, because no signed message explicitly tells solvers to apply this decoder. The p15 square is a possible indication to count 16 words, not a selected cryptographic key.

## Original inputs and exact readout

The signed sixteen words, preserving original order:

`ITS WORDS ARE THE MAP THEIR MEANING IS THE ROAD AND THEIR NUMBERS ARE THE DIRECTION`

Their source GP29 prime sums are

`143,179,175,72,211,114,319,84,72,204,215,114,295,175,72,337`.

The 16-byte direct key (each sum mod256) is

`8fb3af48d3723f5448ccd77227af4851`.

The 256-byte original table uses the conventional base60 transcription in [lp2-grid-256.json](../resources/liber-primus/lp2-grid-256.json); its byte SHA256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Conventional radix60 remains a table interpretation, not a signed instruction. Every original table byte is consumed exactly once.

| Source-fixed AES-128 mode | Printable bytes of 256 | Longest printable run | Decrypted SHA256 |
| --- | ---: | ---: | --- |
| ECB, no padding | 100 | 5 | `97a9786158a45afba7a1809b75637ca726f35c8f0746588d899bb736db9046f7` |
| CBC, zero IV, no padding | 98 | 5 | `e8322f22ddd589e7bbe9bc491f9edcc3f7ca4ca7ffa7c844fb06a5c8b2d6ba30` |
| CTR, zero counter | 91 | 5 | `5289dcc0a36399bdeb3fb4c71aec414194a70809c15caf67beeb4e4498d71599` |

Each decoder produces 256 opaque bytes without coherent plaintext, recognizable file-header prefix, or native GP29 rune sequence. The first 32 bytes of ECB output are `0046705d98f731aae381167304e1ab663a3c239e18640911fb6165b9294af0ab`, which includes control/nonprintable bytes immediately. All three variants exactly reencrypt the original 256 bytes and recover a separately planted 256-byte ASCII positive under the identical source key. Exact inversion establishes software correctness only.

## Decision and reproduction

**Reject this particular sixteen-word-prime-sum direct AES-128 table decoder.** The 16-word clause, 16-number printed square and 256-byte source are independent real objects; their numerical matching does not prove the creator intended this bridge. Neither a different KDF nor an arbitrary AES phase should be fitted to the ciphertext without a stronger first-party selection. The table may still have a non-byte or non-AES meaning.

The complete [read-only source-input Node22/CommonJS reproducer](../sims/lp2_signed16_aes128_sft.cjs) extracts the clause from the actual signed message, tokenizes every word into the exact GP29 lexicon, asserts the source values and byte hash, tests all three decoders, and verifies positive ASCII plants and exact re-encryption. Its checked output was independently reproduced by Python's cryptography AES implementation using the byte-identical original table. This source-gated negative leaves the entire unsolved region p0–55 open and does not justify changing the established synthesis.
