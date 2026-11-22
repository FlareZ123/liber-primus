# Physical line-ending hyphens as 2013-style ASCII framing

**16 November 2026, Agent46; Director #1208. Intermediate original-source framing decision, no recovered unknown LP2 prose or key.** This is an independent finite clue-to-message test, not an arbitrary key sweep.

## Why this original feature is interesting

In 2013 Cicada demonstrably hid ASCII instructions in literal tab/space line data. The 2014 manuscript likewise prints visible separators between runic words, including cases with an explicit word-divider **immediately before a physical line break**. The first source-led question is whether this naturally binary feature is a second, standalone instruction channel, which could tell the solver how to interpret printed word separators before any opaque GP29 ciphertext is attacked.

The original LP2 transcript uses `/` for the physical line break and `-` for a visible word-divider. Extract **one bit per line**: `-/` = 1, any other final `/` = 0. Ignore all internal dashes, dots and page-boundary markers. Follow the previously demonstrated 2013 transport in the specific **MSB-first eight-bit ASCII** framing without changing bit phase, using all eight bits per byte and discarding only the terminal incomplete byte. Test the complementary 0/1 polarity once as a control. No trial KDF, key, page order or unknown-language score.

## Original data and result

All original physical pp0–55 are kept in printed order, including the rune-free numeric p50 as an absent text page. The canonical manuscript transcription has **55 rune-bearing unsolved pages and 594 physical runic line breaks**, with **107 word-dividers immediately before a line break**. That is **107 one-bits (18.01%)**. There are 74 complete ASCII bytes and 2 terminal bits.

| Source bits | Printable ASCII bytes | First 32 bytes (hex) |
| --- | ---: | --- |
| Dash before line end = 1 | **14/74** | `e1810080040102c10ce000692020101609a09088201200010098000c82a48c43` |
| Complementary polarity | **13/74** | `1e7eff7ffbfefd3ef31fff96dfdfefe9f65f6f77dfedfffeff67fff37d5b73bc` |

Neither has readable wording, an ASCII instruction, or a plausible file header. An exact planted MSB-first `KEY` is recovered **3/3** to validate the packing. The original *solved* LP2 p56–57 have **10** such lines with **zero** line-final dashes; the original solved LP1 corpus has **152** line breaks and **34** line-final dashes (22.37%). The same feature therefore occurs in ordinary plaintext pages, where the dashes already serve normal word-division and typographic line wrapping. These controls cannot rule out a second channel chosen to be active only on unsolved pages, but they provide a direct editorial explanation for the channel.

## Decision and unresolved route

The literal historically attested 2013 tab/space ASCII operation **does not transfer** to the original 2014 LP2 end-of-line hyphen choices. There is no recovered plaintext instruction, bit-order selector, changed word-boundary grammar, or reversible cipher. No bit-shift, byte rotation, arbitrary page-reset, Huffman or seeded expansion will be fitted to this null without an additional original clue.

This is deliberately narrower than Director #1208. A contextual 29-rune value-changing transducer with printed word breaks as hidden state remains logically possible, and the physical line-end series supplies no selector for it. The prior full-arbitrary-resegmentation result [`lp2-boundary-anybreak-english-lexicon-gate.md`](lp2-boundary-anybreak-english-lexicon-gate.md) has already ruled out **spacing-only** original-text recovery; a serious next inverse must change rune values or order and recover authentic ≥150-rune prose. This report does not reopen or duplicate that exhaustive lexical gate.

**Source-exact single runnable test:** [`sims/lp2_linewrap_dash2013_ascii_source_sft.cjs`](../sims/lp2_linewrap_dash2013_ascii_source_sft.cjs). Inputs: original `resources/liber-primus/lp2-transcription.txt` and separately solved `resources/transcriptions/lp1_wulfic_canonical.txt`. Node.js 22, read-only, Windows-compatible, positive control and exact source assertions.
