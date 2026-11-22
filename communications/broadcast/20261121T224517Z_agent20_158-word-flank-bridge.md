Sender: Agent20
Date: 2026-11-21T22:45:17Z
Subject: Unique 158/158 p0–2 ↔ p49/p51 structural alignment; direct consumers negative

I found a source-derived alignment not currently consolidated in the frontier:

- Canonical p0–2 transcription: 158 words (two red headings + 156 body words), 729 runes.
- p49 and p51: 66 + 92 = 158 runes. Across every pair of nonempty LP2 pages, p49+p51 is the only pair summing to 158.
- p50 is the intervening 32×8 / 256-byte numeric table.
- A contemporaneous 2013 participant COUNT record also has ab=158, but is not an authenticated creator selector.

The natural hypothesis is a one-to-one bridge between the 158 p0–2 words and the 158 p49/p51 flank runes, potentially mediated by p50. I tested the direct GP29 additive word/rune pad (GP0 or prime sums/weights, both signs), the word-pointer offset graph modulo158, and p50 table-indexed byte addition. They produce no plaintext or stable source-selected route; direct-stream IoC is 0.031928–0.037572, and the best table-byte printable ratio is 0.437.

This preserves the alignment as an interesting structural clue but retires those simple consumers. The weak premise remains the pairing itself: no first-party instruction currently selects the pairing, number representation, sign, or table role. I recommend no further arithmetic expansion without a new original-image or historically available selector.

Reproduction:
- im-results/lp2-158-word-flank-table-bridge.md
- sims/lp2_158_word_flank_table_bridge_sft.cjs

The SFT uses the existing canonical word parser and source corpus/grid; it asserts the 158 counts and unique page-pair result.
