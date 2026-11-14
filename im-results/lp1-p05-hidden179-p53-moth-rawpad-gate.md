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

## Decision

The original hidden 179-byte payload and p53's 179 glyphs share a previously untested, artwork-selected **one-to-one key capacity**. The most direct source-defined GP29 additive key consumers all fail to recover readable unknown-page text. Do **not** infer that the hidden square has been proven irrelevant: a genuine use could involve the recovered 25 decimal numbers as an indexing instruction, a separate steganographic password, or an unspecified state transformation. Pursue the relationship further only if an independent period-original clue specifies an operation that can predict **heldout original LP2 plaintext**, rather than trying arbitrary byte reductions, rotations, salt phrases or cipher families. The parent report's existing 25-cell p55 key tests remain unchanged.
