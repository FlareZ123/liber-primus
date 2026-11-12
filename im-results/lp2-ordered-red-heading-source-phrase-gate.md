# Ordered LP2 red headings: source-phrase gate and fixed original reading

**Decision, 12 November 2026 (Director Issue #453):** no source-selected plaintext or decipherment mechanism emerges from the nine major red-title sequence. A finite, source-motivated **lossless monoalphabetic substitution/quotation gate** excludes direct quotation of the longer original headings from six pre-2014/solved-Cicada source corpora, even granting a different secret alphabet to **each** heading. Short later-head matches are numerous, incompatible across headings, and not plaintext evidence. Do not use these accidental short phrases as cribs.

[Passing original-source Node 22 test](https://github.com/FlareZ123/liber-primus/actions/runs/43130461425) · [Single-file CJS reproducer](../sims/lp2_red_title_ordered_phrase_source_sft.cjs) · [source red spans](../resources/liber-primus/lp2-ink-annotations.json) · [original printed breaks](../resources/lp2-transcription.txt).

## What the original reader sees

The 58 physical LP2 pages, unlike a fully normalized text stream, distinguish red from black glyphs and present different large red heading/section-start markers. The stable source-ink annotation identifies **18 red spans containing 225 red rune glyphs** across the complete 58-page release. The nine previously source-defined main titled units begin at these **physical** positions; their first 113 runes are the fixed major heading stream:

| Source page/rune offset | Rune count | Exact printed word lengths in GP runes |
|---|---:|---|
| p0:0 | 13 | 8,5 |
| p3:0 | 16 | 2,11,3 |
| p8:0 | 12 | 4,8 |
| p15:9 | 11 | 4,2,5 |
| p23:0 | 16 | 2,6,3,5 |
| p27:0 | 19 | 3,12,4 |
| p33:0 | 10 | 2,8 |
| p33:91 | 8 | 3,5 |
| p40:0 | 8 | 3,5 |

This nine-unit selection is independently fixed in the [full-body red-title self-key report](lp2-red-heading-self-key-vigenere-gate.md) and used unchanged here. Crucially, it excludes the long **51-rune** red p53 verse that is itself already the subject of a [92-book pre-2014 quotation scan](lp2-page53-red-verse.md); it also excludes the remaining non-main starts (p3@119, p6@71, p7@194, p15@0, p39@119, p54@0) and both solved pp56–57 red headings. No red glyph was reclassified or source transcription altered. The complete 18-span register is checked in the SFT, preventing ambiguous claims that all 225 red runes form one conventional set of nine titles.

The two solved red-heading **controls have different register behavior**: p56's printed 2+3-rune red heading decodes as *AN END* using its authenticated original prime/totient mechanism, while p57's red seven-rune heading directly spells *PARABLE*. Original red ink therefore identifies a visual role, without identifying a single common decryption operation.

## Frozen comparison, without key fitting

A human reading the 2012–2014 puzzles was directly exposed to Blake, Crowley's *Book of the Law*, and the earlier solved LP1 text. We use only existing byte-preserved repo texts, exactly the original nine printed word-length patterns and two already attested GP spellings: ordinary greedy GP digraphs and the solved-text alternate **ING→ᛝ**. Other normalization is fixed (V→U, K→C, Z→S; Q→CW if encountered). Remove chapter verse numbers, corpus headings and the 2012 chorus metadata in their documented roles. For each consecutive source phrase of the same GP word lengths, ask whether **one arbitrary bijection of 29 GP symbols** maps the entire heading to that phrase while preserving repeated letters across its original printed words.

This test is deliberately more permissive than a literal quotation: every heading may use a completely unrelated secret alphabet, any mapping of letters, and any contiguous position in the source. It preserves the original number/order of words and their rune equality pattern. It does **not** try arbitrary transpositions, phrase substitutions, different plaintext-language registers or fitted arithmetic keys.

| Original source text | Source word tokens | First six headings, exact-pattern matches | p33:0 / p33:91 / p40:0 matches |
|---|---:|---:|---|
| 2012 Blake *Marriage* participant excerpt | 121 | 0 | 0 / 0 / 1 |
| 2012 MIDI Blake chorus (the original 56 words) | 56 | 0 | 0 / 0 / 1 |
| 2013 *Book of the Law* I | 1,897 | 0 | 1 / 0 / 9 |
| 2013 *Book of the Law* II | 1,968 | 0 | 2 / 3 / 18–19 |
| 2013 *Book of the Law* III | 2,002 | 0 | 1 / 3 / 14–15 |
| LP1 and solved LP2 source plaintext reference | 875 | 0 | 0 / 0 / 5 |

The count ranges are the two **predeclared** NG/ING tokenizations. The 2012 Blake chorus is 56 words after discarding a textual metadata comment, rather than 112 tokens when that metadata is accidentally included. Printed p40:0 is only 3+5 runes and coincidentally compatible with the already solved Blake phrase “that lives”; Book I offers “thou Hadit,” “his woman,” and others. The shorter matches are one-phrase compatibility, **not** source attribution. The original printed p33 titles and p40 title share **zero** consistent source-ordered two-heading substitutions in any of these texts, under either orthography: no single 29-rune bijection works simultaneously on an earlier candidate p33 phrase and a later candidate p40 phrase from the same source.

The source script tests a deliberately planted scrambled source phrase under an arbitrary 29-label bijection and recovers its exact pattern match; it also checks the literal solved p57 **PARABLE** and p56 red 2+3 structure. Original words and alphabet identities come directly from the canonical 58-page corpus and from original printed breaks.

## Decision

No exact historical passage covers any of the **six longer first titles** within the finite, Cicada-linked source set, even under the permissive per-title secret-substitution model. Isolated two-word matches at p33/p40 conflict under a single shared alphabet and cannot specify a decipherment operation or predict an untouched original rune.

Retire the **ordered red heading as a direct quotation/simple substitution channel from these named sources**. This leaves legitimate mechanisms involving changing state, resegmentation, different source texts or explicit external selectors open, but none is currently selected. The full red-span source inventory remains usable by a future decoder; the previously tested red-title self-key, same-pad and p53 extended-verse routes must not be rerun under this label.
