# Three non-dropcap red passages form an exact 76-rune p55 candidate key

**Status: provisional structural candidate; direct decipherment fails. Agent 1, 13 November 2026.** The independent original-image dropcap census divides the 16 red-rune spans on unknown LP2 pp0–55 into 13 ornamental-dropcap headings and three non-dropcap red passages. The latter total **76 runes**, exactly as many as the last encrypted physical LP2 page p55. This provides a concrete, otherwise unkeyed candidate register, but **recovers no plaintext, cryptographic mechanism, key or puzzle endpoint**.

## Original, source-selected input

| Red passage | Position within physical LP2 page | GP29 runes | Printed word lengths |
|---|---|---:|---|
| p7, original image 24.jpg | rune offsets 194–207 | **14** | 2, 4, 3, 2, 3 |
| p15, original image 32.jpg | offsets 9–19 | **11** | 4, 2, 5 |
| p53, original image 70.jpg | offsets 128–178 | **51** | 5, 4, 4, 11, 2, 3, 2, 6, 5, 5, 2, 2 |
| **Concatenated, manuscript page order** | | **76** | **20 complete words** |
| **Last unknown p55**, original image 72.jpg | offsets 0–75 | **76** | 1 carried rune + 16 words |

The three source passages are uniquely selected by the visually distinct *non-dropcap* criterion, before consulting their lengths or p55 text. The [original red-ink image census](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/P1-red-ink/channel.json) distinguishes them. The exact rune indices, red annotations and printed word breaks are checked against the repository's [LP2 corpus](../resources/liber-primus/lp2-corpus.json), [ink annotations](../resources/liber-primus/lp2-ink-annotations.json) and [transcription](../resources/liber-primus/lp2-transcription.txt). The p55 first rune NG completes a word begun on p54. Its 76-rune physical-page register retains that carried rune; deleting it would silently change the proposed alignment.

The numerical coincidence alone has limited force. Of all 560 triples of the 16 red spans, **seven** sum to 76. The original signed 2016 message about words being a map does not explicitly specify these three red passages or their role as a key. The present experiment tests an affordable, motivated decryption instead of manufacturing a fitted alignment.

## Actual p55 inverse with the entire red key

Let R denote the 76 concatenated original red GP29 indices and C the unmodified 76 p55 GP29 indices, beginning at zero. The basic manuscript-alphabet additive operations are P=(C−R) mod29 and P=(C+R) mod29, with no secret phase or permutation.

| Fixed direct operation | Decoded GP29 index of coincidence | Opening GP transliteration |
| --- | ---: | --- |
| C−R | **0.036491228070** | \`IAOEYDCMEOWHUPFAEOCEAGSEORPIABBWPUOWSIAAEA...\` |
| C+R | **0.035438596491** | \`SEAEOYNJOENGUFJEOOENGTUMROEGETLBLTIABTHT...\` |

Both outputs remain uniform-like against the GP29 reference 1/29 ≈ 0.03448276, with no continuous readable text. Atbashing every red rune before addition is algebraically equivalent to adding a constant to the same outputs, so it is not an independent recovery.

## Key-free complete two-text shared-pad test

Since the red passages themselves are encrypted-looking words, test whether the red 76 and p55 76 might have been enciphered under the same **otherwise completely unknown** mod29 pad. For identical additive sign the pad cancels exactly as \`P55=Pred−R+C+delta mod29\`; for opposite signs, \`P55=R+C−Pred+delta mod29\`. These relations leave all 76 secret pad digits unrestricted.

The exact word-trie solver demands a simultaneous possible plaintext under the repository's 28,770 native-GP English words, preserving 20 original red word boundaries and all 16 complete p55 word boundaries. P55's initial cross-page carry is deliberately left free. Two additional, *more permissive* models give each original red passage a different independently secret Caesar offset (29³ possibilities), before requiring a complete two-text dictionary reading. Exact finite-state reachability, with no language-scored beam, produces:

| Pad family | First offset with no feasible dictionary states, zero-based |
| --- | ---: |
| Same-sign, literal pad reuse | **29** |
| Opposite-sign, literal pad reuse | **29** |
| Same-sign, three independent secret red-page Caesar offsets | **33** |
| Opposite-sign, three independent secret red-page Caesar offsets | **32** |

Thus none reaches a full 76-rune reading. To check solver power, independent native-GP **positive controls** use both same- and opposite-sign unknown pads, then both again with three independently selected red-span offsets. All **four planted controls reach 76/76**, using the same word boundaries and dictionary. The source-only test is exhaustive for its frozen dictionary, not a proof against English outside that vocabulary, false word boundaries, a different alphabet, or a nonlinear cipher.

## Decision and reproduction

Retain the image-selected, exact-length 76-rune register as a **candidate**. Direct mod29 encryption, even with the generous class of two text streams and three separate offsets, supplies no plaintext. Other transforms require an independently authenticated cipher/key instruction instead of arbitrary rescoring. This structural match alone does not justify promoting the red register to a solved key or deciphering the book around it.

**Source-exact CommonJS SFT:** [\`sims/lp2_red_internal76_sharedpad_sft.cjs\`](../sims/lp2_red_internal76_sharedpad_sft.cjs). Node.js 22, four positive plants, checked-in reference sources, complete original stream, programmatic dictionary automata. **Passed** on [manual GitHub Actions run 43359737797](https://github.com/FlareZ123/liber-primus/actions/runs/43359737797), existing [manual-word-length-probe](../.github/workflows/manual-word-length-probe.yml) option \`red76-internal\`.
