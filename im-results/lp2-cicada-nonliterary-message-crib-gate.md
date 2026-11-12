# Cicada non-literary message corpus: LP2 quote-span crib gate

**Status:** bounded negative; no new LP2 source-qualified plaintext crib, key, or decoder recovered.  
**Date:** 2026-11-12  
**Issue:** #645

## Decision

Four previously untested, authenticated 2013–2014 Cicada messages were compared with all seven frozen original LP2 quotation spans. None contains a word-boundary-preserving passage of at least **12 consecutive words and 40 GP runes** matching any quotation span. Consequently, there is no surviving candidate on which to test a fixed reversible monoalphabetic substitution, and no source-selected decoder or key schedule is justified.

The strongest exact word-length coincidence is only **five words / 22 runes**, in TCP protocol syntax. It is not a long plaintext crib. This is a narrow exclusion of direct word-boundary-preserving reuse from this finite corpus, not a general exclusion of other ciphers, altered boundaries, rearrangements, or missing historical material.

## Authenticated source set

The raw third-party source bytes are deliberately **not mirrored in this repository**: the upstream archive's license notice says it cannot license third-party material. The reproducer fetches pinned source bytes in memory, verifies their hashes and the pinned signature inventory, and writes no downloaded content to disk.

Signature status, timestamp, signature ID, byte count, SHA-256, and duplicate relationships below are from the pinned [Dukotah signature inventory](https://github.com/Dukotah/cicada3301/blob/06d5c93bc56b8b9cb24416e98d81fc2569f99f75/corpus/A-primary-artifacts/SIGNATURES.json). All four entries are recorded as VALID under Cicada's signing key. The three 2014 entries are duplicate archive copies of other signed-message paths, not independent corroborating signatures.

| Date (UTC) | Original artifact | Signature ID | Bytes / SHA-256 | Archive relation |
|---|---|---|---|---|
| 2013-01-26 09:16:23 | [tcp-server.asc, pinned 2013 archive commit](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/messages/2013/tcp-server.asc) | gfTLegjau+BeVXHzCy6uxb+92fg | 3,775; fdfe1208b49f75ce634224d2b0561e4c8b322f27dd74bd757f5d83ebcfbdb88c | Unique signature |
| 2014-01-06 04:59:26 | [the-work-of-a-private-man.asc](https://github.com/iBotPeaches/cicada_3301/blob/a0a616d85717af59f8b806875b43d51e06e1e874/messages/2014/the-work-of-a-private-man.asc) | SyvqR5vwCNGds2E0b+KA3L4DU0A | 1,150; cba64781bd461b17039316ef97426f912aae987fde131f62e883f7f9e9f0118e | Duplicate of pgp/messages/2014-01-opening-book-code.asc |
| 2014-01-19 07:39:32 | [Liber Primus 10.jpg.asc](https://github.com/iBotPeaches/cicada_3301/blob/a0a616d85717af59f8b806875b43d51e06e1e874/messages/2014/liber_primus/10.jpg.asc) | PxBW8To/8sh2VNKnCFAE0ZwKzBI | 1,234; 56467e78411358a236479a867a073de1a6fe9be2572e19759be1128968b3feeb | Duplicate of pgp/messages/2014-01-magic-square-upload-outguess-10.asc |
| 2014-01-25 08:26:57 | [hello-you-have-done-well.asc](https://github.com/iBotPeaches/cicada_3301/blob/a0a616d85717af59f8b806875b43d51e06e1e874/messages/2014/hello-you-have-done-well.asc) | K9IGj2g73eIXtAYQlEKfRPB5c7o | 1,351; 361563f8faec12359c87646593a36eaff0de93e947992e5ae4462356030b95c8 | Duplicate of pgp/messages/2014-01-upload-instructions.asc |

The TCP artifact's source and verification context is summarized in [the existing local source note](../resources/external/2013-tcp-server-signed-source.md). Its upstream companion [plaintext transcription](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/other/2013_TCP_Server.md) is used only as a text transcription; the signed PGP artifact remains the authentication anchor. The TCP text includes an embedded 67-word Zen koan example. It is tested both with the complete signed text and with that externally sourced example removed. The private-man stanza is also tested separately because its authorship is not independently established.

## Frozen LP2 quotation spans

The seven spans are read from the repository's original [quote-punctuation span metadata](../resources/liber-primus/lp2-quote-punctuation-spans.json) and extracted from the canonical [LP2 transcription](../resources/liber-primus/lp2-transcription.txt). Rune offsets are half-open. The parser checks the 12,956-rune / 2,896-word invariant.

| Span | Original rune offsets | Words | GP runes | GP word-length shape |
|---:|---:|---:|---:|---|
| 1 | [1659, 1677) | 4 | 18 | 6,3,3,6 |
| 2 | [5459, 5478) | 5 | 19 | 3,3,4,5,4 |
| 3 | [9715, 9727) | 2 | 12 | 3,9 |
| 4 | [9811, 9869) | 14 | 58 | 5,7,2,3,4,6,4,3,3,4,4,4,5,4 |
| 5 | [10211, 10279) | 13 | 68 | 9,8,3,4,6,3,10,2,4,7,6,2,4 |
| 6 | [10279, 10439) | 34 | 160 | 4,2,4,6,6,8,8,3,5,5,9,2,2,4,3,3,2,8,4,7,4,4,3,2,5,3,3,6,3,11,4,4,8,5 |
| 7 | [12522, 12592) | 14 | 70 | 5,7,2,3,4,10,3,9,7,3,7,4,3,3 |

Only spans 4–7 can meet the 12-word / 40-rune threshold. The shorter spans are still included in the deterministic scan, but short shape coincidences are not promoted.

## Method

1. Fetch the four original signed artifacts and the TCP plaintext transcription from immutable upstream commits. Verify each original artifact's byte count, SHA-256, and Git blob SHA-1. Check each signature row against the pinned signature inventory, including its VALID status, timestamp, signature ID, and duplicate relationship.
2. Parse the seven original LP2 spans using the canonical manuscript boundaries. Convert both source words and target runes through the repository's 29-symbol Gematria Primus transliteration, greedily recognizing multi-letter rune values including ING. Normalize QU→CW, V→U, K→C, and Z→S.
3. Search every contiguous source/target alignment for exact complete word-length runs. A candidate must contain at least 12 consecutive words and at least 40 GP runes.
4. For every qualifying alignment, test the necessary condition for a fixed reversible monoalphabetic substitution: the source-to-cipher mapping must be consistent in both directions (one plaintext rune cannot map to two cipher runes, and two plaintext runes cannot collapse to one cipher rune).
5. For the TCP specification, run three boundary variants: original C:/S: labels retained; labels removed; and labels plus the 67-word KOAN quotation removed. For the private-man message, run both the complete signed body and the 17-word stanza alone.
6. Run a source-native positive plant: take 12 words / 46 runes from the already authenticated 2013 forest clue, encode them under the fixed bijection c=(7p+3) mod 29, and verify detection. Then alter the ciphertext value of a repeated plaintext rune and verify that the injectivity check rejects it.

The source tokenizer counts alphabetic words, including apostrophe forms, but excludes alphabetic fragments embedded in alphanumeric data tokens (for example BASE29 and 3QO). The TCP label-retention sensitivity test prevents the one-letter C/S labels from silently deciding the result.

## Results

| Source variant | Source words | GP runes | Longest exact word-length run | Qualifying 12-word / 40-rune matches | Bijection survivors |
|---|---:|---:|---:|---:|---:|
| TCP full, labels and KOAN retained | 932 | 3,797 | 4 words / 14 runes | 0 | 0 |
| TCP, labels removed, KOAN retained | 894 | 3,759 | 5 words / 22 runes | 0 | 0 |
| TCP authored protocol, labels and KOAN removed | 827 | 3,519 | 5 words / 22 runes | 0 | 0 |
| 2014 upload instructions after magic squares | 79 | 342 | 4 words / 15 runes | 0 | 0 |
| 2014 Stage04 magic-square upload instruction | 38 | 167 | 4 words / 17 runes | 0 | 0 |
| 2014 private-man complete signed body | 24 | 86 | 3 words / 12 runes | 0 | 0 |
| 2014 private-man stanza only | 17 | 73 | 3 words / 12 runes | 0 | 0 |

No complete 13-, 14-, or 34-word quotation template matched. No partial alignment reached the required 12-word / 40-rune threshold, so there are zero source windows on which a monoalphabetic equality-pattern candidate could survive. The best five-token coincidence in the TCP text is protocol syntax, not a prose crib.

**Positive control:** the planted 12-word / 46-rune forest-clue segment was detected under the synthetic bijection, and the deliberate repeated-rune inconsistency was rejected. This confirms that the length matcher and injective mapping check can detect the assignment's qualifying case.

## Finite exclusions and relationship to earlier work

- The earlier 2012–2013 prose census and frozen historical word-length gate already covered the countdown/MIDI sources, forest clue, short onion/protocol replies, welcome/NEXT messages, and the 2014 Stage11 enlightenment reply. They were not rerun. See [the 2012–2013 prose gate](cicada2012-2013-prose-original-unknown-crib-gate.md) and [the frozen historical crib gate](lp2-frozen-historical-exact-wordlength-crib.md).
- The 2014 welcome artifact has one readable word followed by an RSA payload; let-the-text-guide-you and very-good-you-have-done-well carry only short readable phrases alongside binary/image data; the Stage10 response page is a short submission acknowledgement. These do not supply a 12-word plaintext source.
- The 2014 private-man message is a known book-code waypoint: its stanza quotes Emerson's *Self-Reliance*, and its 16 numeric tuples use paragraph:sentence:word:letter coordinates to recover the first 2014 onion address, **auqgnxjtvdbll3pv.onion**. The stanza is not Cicada-authored plaintext. The complete Emerson Essays #2944 source was already screened against all 2,896 LP2 words in [#635](https://github.com/FlareZ123/liber-primus/issues/635) (maximum nine words under both GP/ING conventions); [#506](https://github.com/FlareZ123/liber-primus/issues/506) separately tested the coordinate grammar. The stanza-only check here is not a new Emerson-corpus result.
- The 2014 idgtk-umloo ciphertext is a solved 14-column / five-row transposition. Its output includes **ULTIMATE TRUTH IS THE ULTIMATE ILLUSION** and the second 2014 onion address, **fv7lyucmeozzd5j4.onion**; the exact column order is recorded in the [creator-era cipher frontier](lp2_creator_era_cipher_design_frontier.md). [#284](https://github.com/FlareZ123/liber-primus/issues/284) tested the phrase against the p53 stencil-complement hypothesis and [#327](https://github.com/FlareZ123/liber-primus/issues/327) checked the full signed message for an LP2 selector; both were negative. It is not a plaintext crib.
- The 2013 coordinate replies and SSSS share artifacts are numeric or structured secret-sharing data, not natural-language plaintext.
- The TCP document's embedded koan is an externally sourced example, not Cicada-authored prose; both inclusion and exclusion produce the same negative result.
- This is a finite test of the newly selected sources, not a claim that every historical message or recipient-specific document survives in an archive.

## Conclusion

Close #645 under its finite-source / long-crib completion criteria. No new LP2 source-selected operation, key, page selector, or original plaintext is supplied by this finite corpus. The private-man book code and idgtk-umloo transposition do lead to already-known 2014 onion waypoints, but the existing LP2 cross-stage tests (#284, #327, #506, #635) provide no independent LP2 selector. The TCP protocol's BASE29 example (3301→3QO), DH exchange and NEXT storage rule are genuine historical commands, not a GP29 rune key or LP2 target; the NEXT invitation payload is already in the earlier 11-source prose census. Do not rescue short partial matches, fit a keystream to a word-length coincidence, or infer a key schedule from these source texts. Further work should wait for a genuinely new authenticated message, an independently supported quotation boundary, or a source-selected reversible operation.

**Reproducer:** [lp2_cicada_nonliterary_message_crib_sft.cjs](../sims/lp2_cicada_nonliterary_message_crib_sft.cjs). Requires Node 18+ network fetch; downloads source bytes in memory, verifies pinned hashes and signature metadata, and writes no external source content to disk.
