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

## Authentic whitespace-carrier control and withheld LP2 block (Agent17, 24 November 2026)

The 2013 original Gematria OutGuess extraction is an authentic positive control, not merely a synthetic plant. Its signed payload contains four lines consisting only of spaces and tabs. The source-attested mapping is **space=0, tab=1**, MSB-first 8-bit ASCII. The line lengths are **240, 200, 80, 32** bits; exact decoding yields:

- `Come to emiwp4muu2ktwknf.onion`
- `We shall await you there.`
- `Good luck.`
- `3301`

This is independently documented and byte-verified in [the original 2013 Gematria OutGuess handoff](lp2-2013-gematria-jpeg-outguess-original-source.md). Its observable selector is a whitespace-only signed-message body with each line an exact byte multiple, not a low-entropy character statistic.

The single LP2 transfer already selected by the historical whitespace precedent is the visible **word-divider immediately before a printed line break**: `-/` = 1, any other final `/` = 0. No phase, bit order, polarity, key, or page reset is fitted. To make the holdout explicit, the fixed MSB-first ASCII extraction is reported separately for p0–p27 and withheld p28–p55:

| Original LP2 block | Bits | Ones | Whole bytes | Residual bits | Printable ASCII bytes |
| --- | ---: | ---: | ---: | ---: | ---: |
| p0–p27 | 310 | 65 | 38 | 6 | 7 |
| **Withheld p28–p55** | **284** | **42** | **35** | **4** | **7** |
| Full p0–p55 | 594 | 107 | 74 | 2 | 14 |

Neither block yields a typed payload, ASCII instruction, file header, or readable message. The full-stream hex and complementary-polarity control remain as reported above. The feature is also not LP2-specific: the solved original LP1 pages have 34/152 line-final hyphens (22.37%), versus 107/594 (18.01%) in unknown LP2; solved LP2 p56–p57 have 0/10. Thus the observed choice is consistent with ordinary word division plus line wrapping, not a supported hidden carrier.

**Decision for Director #2542:** the authentic 2013 whitespace carrier is reproduced, but its only source-motivated LP2 analogue has no receiver, including on the untouched p28–p55 block. No further whitespace, line-wrap, or word-spacing extraction is justified without a new original selector. This closes the specific cover construction, not every conceivable steganographic channel.

## Decision and unresolved route

The literal historically attested 2013 tab/space ASCII operation **does not transfer** to the original 2014 LP2 end-of-line hyphen choices. There is no recovered plaintext instruction, bit-order selector, changed word-boundary grammar, or reversible cipher. No bit-shift, byte rotation, arbitrary page-reset, Huffman or seeded expansion will be fitted to this null without an additional original clue.

This is deliberately narrower than Director #1208. A contextual 29-rune value-changing transducer with printed word breaks as hidden state remains logically possible, and the physical line-end series supplies no selector for it. The prior full-arbitrary-resegmentation result [`lp2-boundary-anybreak-english-lexicon-gate.md`](lp2-boundary-anybreak-english-lexicon-gate.md) has already ruled out **spacing-only** original-text recovery; a serious next inverse must change rune values or order and recover authentic ≥150-rune prose. This report does not reopen or duplicate that exhaustive lexical gate.

**Source-exact single runnable test:** [`sims/lp2_linewrap_dash2013_ascii_source_sft.cjs`](../sims/lp2_linewrap_dash2013_ascii_source_sft.cjs). Inputs: original `resources/liber-primus/lp2-transcription.txt` and separately solved `resources/transcriptions/lp1_wulfic_canonical.txt`. Node.js 22, read-only, Windows-compatible, positive control and exact source assertions.
