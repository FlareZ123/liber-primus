# Hidden 179-byte LP1 p05 payload and moth-linked LP2 p53: exact original-rune key gate

**Agent36, 14 November 2026. Classification:** newly linked **exact source sizes**, one bounded direct key-consumer test; **no new plaintext, authenticated keystream, decipherment or destination**.

## Why this is a source-motivated rather than arbitrary key search

An earlier original-JPEG investigation decoded LP1 source image `05.jpg` as **`A || M || reverse(A)`**. The central block `M` has two newline bytes and **358 ASCII hex digits**, yielding **exactly 179 decoded binary bytes** with SHA-256 `82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa`. Nibble-swapping those binary bytes and reversing decimal tokens reconstructs the entire previously known historical 2014 five-by-five 1033 square; the recovered content and original byte identities are verified in [the parent source discovery](lp1-page05-reversed-prefix-anomaly.md).

The original **physical LP2 p53** has **exactly 179 GP29 ciphertext runes**, with **128 black** and **51 red** source glyphs. The identical enlarged moth illustration on physical p53 and p55 is copied from **solved LP1 p05** with a verified original-pixel registration, giving an *independent visual selector* for these recipient pages ([source-art evidence](lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md)). Of the artwork-selected candidates, **p53 uniquely consumes all 179 decoded bytes in exact one-to-one register**, whereas p55 has 76 page-local ciphertext runes. This precise size link had not been applied to the newly recovered p05 decoded **binary** in the p05 report, whose earlier direct test instead repeated the **25 numerical square cells** over p55. Here the 179-byte alternative is frozen before looking at any output.

The connection is still **retrospective**: a decoded **square** can incidentally have a 179-byte serialization, and no original instruction equates these 179 bytes with a GP29 pad. The 179-byte raw stream is a representation of numerals, not an independently demonstrated cryptographic pseudorandom sequence. The exact match and moth justify one cheap direct reversible attempt, not a family of unconstrained KDFs.

## One-to-one original ciphertext experiment

Fix original p53 indices `C[0..178]` from `resources/liber-primus/lp2-corpus.json` and original hidden `05.jpg` decoded bytes `B[0..178]`. Four fully specified byte-to-key maps preserve all 179 source positions in their original binary order:

1. `B[i] % 29` on the authentic decoded bytes.
2. `swapNibbles(B[i]) % 29`, using the independently discovered historical p05 byte operation.
3. `floor(29 * B[i]/256)`, a fixed uniform-bin byte-to-GP29 map.
4. `floor(29 * swapNibbles(B[i])/256)`.

For each, run `P[i] = (C[i] − K[i]) mod29` as in solved LP1 Vigenère, and `P[i] = (C[i] + K[i]) mod29` as a sign control. **The key clock never restarts or skips on a literal F**: the proposed length equality is one key byte per source rune, and adding hypothetical source markers would destroy the exact 179↔179 geometry. No orientation, offset, page permutation, hidden key phase, vocabulary, or alternate plaintext language is fitted.

| Fixed one-byte mapping | Minus-key candidate IoC | Plus-key candidate IoC |
| --- | ---: | ---: |
| Raw byte remainder29 | **0.032891846** | **0.035904840** |
| Nibble-swapped byte remainder29 | **0.034712196** | **0.035716528** |
| Raw byte scaled to29 bins | **0.035339903** | **0.033394012** |
| Nibble-swapped byte scaled to29 bins | **0.032264139** | **0.033142929** |

All eight original-p53 streams remain nonlinguistic in the first 40–85 independently inspected GP rune outputs, with GP29 unigram coincidence close to the uniform baseline `1/29≈0.03448`. The largest observed IoC **0.035904840** is still near uniform and is not independent evidence of natural-language recovery. Each candidate re-encrypts to the exact original source ciphertext; this merely validates reversibility, not correctness. A 179-symbol planted GP29 control round-trips under each mapping.

[Source-exact CommonJS SFT](../sims/lp1_p05_hidden179_lp2_p53_rawpad_sft.cjs) reads the **actual LP1 JPEG** and original LP2 corpus, asserts the complete mirrored JPEG shell, central hex length and payload SHA, validates 179 original p53 rune positions, executes all eight fixed candidates, and fixes the measured IoCs. The original ciphertext is never modified.


## One-to-one bytewise XOR with original GP representations

**Agent 23, 14 November 2026.** The historical 2014 puzzle chain used binary and arithmetic transports, and the 179-byte source block is independently tied to the GP-prime square and moth. A distinct, finite byte-level candidate asks whether p53's 179 original ciphertext glyphs, interpreted as the **source-authored GP ordinals** (0–28) or **GP prime weights** (2–109), are XORed position-by-position with the decoded p05 bytes. XOR is exactly reversible without inventing a key, guessed shift or random IV. For completeness, three exact-length p05 views are fixed from the already proven p05 decoding: the **raw 179 bytes**, the **nibble-swapped 179 bytes** (which display an ASCII decimal square with reversed digit groups), and the **reversed-decimal-token 179-byte ASCII reconstruction** of that square. The latter two are fixed by p05's independently verified original decoding; no key phase or arbitrary rotation is fitted.

The independently checked entire 179-byte output is tested as literal ASCII, preserving every nonprintable value. These are direct byte XOR readouts and are different from the GP29 arithmetic inverse above:

| P05 byte representation | P53 rune representation | ASCII printable / 179 | Alphabetic / 179 | Longest uninterrupted ASCII letter run |
| --- | --- | ---: | ---: | ---: |
| Raw hidden bytes | GP ordinal | **40** | 15 | 2 |
| Raw hidden bytes | GP prime weight | **111** | 57 | 3 |
| Nibble-swapped bytes | GP ordinal | **174** | **0** | **0** |
| Nibble-swapped bytes | GP prime weight | **134** | 60 | 4 |
| Reconstructed decimal square | GP ordinal | **174** | **0** | **0** |
| Reconstructed decimal square | GP prime weight | **135** | 60 | 4 |

None produces ordinary readable ASCII. The two GP-ordinal plus nibble/square variants are stronger algebraic negatives: the source's ASCII spaces, decimal digits and newline are XORed with one-byte values 0–28, so the result **cannot contain ASCII letters** regardless of the original p53 symbols. The remaining four original-input candidates are independently nonprose; every longest alphabetic run is at most four. XORing each output with its same source glyph byte exactly recovers the unchanged p05 stream, a complete lossless positive sanity check. An extra bytewise XOR layer or arbitrary later text transcode would need a new source-selected opcode.

This closes **direct aligned 8-bit ASCII XOR** between the hidden p05 payload and the original p53 rune stream, including both historical source representations of GP symbol values. It does **not** exclude a different cryptographic use of the square, key schedule or physically selected reading order. The [same source-exact CommonJS SFT](../sims/lp1_p05_hidden179_lp2_p53_rawpad_sft.cjs) has been extended with all six XOR readouts and fixed output statistics instead of adding a second test file.

## Recovered square as motif-selected OutGuess password (14 November 2026)

The same source-derived 179-byte numeric square is also a concrete **OutGuess 0.4 passphrase candidate**, because Cicada's authentic 2014 Stage04 `03.jpg` and Stage05 `08.jpg` contained recoverable JPEG DCT steganography. The copied Cicada emblem independently chooses LP2 p53 and p55 as target images. The two exact full-length, fixed ASCII source strings are (a) the recovered 179-byte, decimal-direction-corrected square including its spaces and newlines, and (b) the original 358 printed hex digits from LP1 `05.jpg`'s embedded center. Neither string is truncated to make an attractive password.

The existing source-faithful [OutGuess extractor](../sims/outguess_extract.py) and C JPEG coefficient bitmap reader reproduce the historical `03.jpg` **31,809-byte PGP-signed cleartext**, full SHA-256 `a14c1e144760c361a39da41e4784a9a22a3ce490baf42d9eb99b37feab8a47c1`, under the authentic **`Default key`**. This is the positive detection control. Each original image is hashed before its quantized coefficients are accessed; page `71.jpg` (p54, no copied moth emblem) serves as an exact wrong-target control.

| Original JPEG | Source-179-ASCII header | Reported length | Recovered bytes SHA-256 (first 12) | Printable fraction | Byte entropy |
| --- | --- | ---: | --- | ---: | ---: |
| `05.jpg` (solved LP1, source) | `9721b90a` | 2,745 | `cf3c82cd0a89` | 0.3767 | 7.9401 |
| `70.jpg` (LP2 p53) | `9721b90a` | 2,745 | `d5a0a9025dc6` | 0.3945 | 7.9353 |
| `71.jpg` (LP2 p54, negative control) | `9721b90a` | 2,745 | `12f6973a335f` | 0.3934 | 7.9312 |
| `72.jpg` (LP2 p55) | `9721b90a` | 2,745 | `02db0a488263` | 0.3774 | 7.9315 |

**The identical header is a mechanistic false positive.** Each of these unrelated original JPEGs contains **at least 3,168 leading bytes of all-one bits** in the original OutGuess-eligible coefficient bitmap. The entire four-byte pseudoheader is selected within the first 1,024 such bits, independently of each password. Therefore its apparent capacity fit, matching `8599` seed and `2745` length do **not** indicate embedded data. Even p54's unrelated drawing yields the identical fake result. Every extracted candidate is high-entropy, lacks a known magic/file header or PGP armor and fails to recover readable original text. The second exact 358-hex source key yields capacity failure on p05, two unrelated random 53,779-byte outputs on p53/p54, and an invalid skip modulus on p55. The pair of surviving random outputs have the same forced 4-byte header and no identified payload.

**Decision:** close these two full-length, historically plausible, motif-selected original OutGuess password transfers. The general possibility of some *other independently instructed* password or keyed JPEG transport is unaffected, but neither authentic p05 source string supplies the missing image key. Original inputs, known PGP control, full payload hashes and false-header comparison are executable in [the standalone SFT](../sims/lp1_p05_square_outguess_moth_sft.py), using the already established original-source extractor. No new LP2 plaintext, authentic key or continuation follows.

## Decision

The original hidden 179-byte payload and p53's 179 glyphs share a previously untested, artwork-selected **one-to-one key capacity**. The source-defined GP29 additive consumers and six one-to-one bytewise XOR consumers likewise fail to recover readable unknown-page text. Do **not** infer that the hidden square has been proven irrelevant: a genuine use could involve the recovered 25 decimal numbers as an indexing instruction, a separate steganographic password, or an unspecified state transformation. Pursue the relationship further only if an independent period-original clue specifies an operation that can predict **heldout original LP2 plaintext**, rather than trying arbitrary byte reductions, rotations, salt phrases or cipher families. The parent report's existing 25-cell p55 key tests remain unchanged.
