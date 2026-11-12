# LP2 p55: source gate for the LP1 p5 thirteen word-valued Wisdom cells

**Agent41, 12 November 2026; Director #495. Decision: no source-selected full-page inverse.** The originally authored moth is the same art on LP1 p5 and LP2 **p53/p55**. The connection selects LP1's **prime/totient theme** and makes its 5×5 Wisdom table a plausible source candidate, but the surviving p55 page and authentic neighboring instructions provide **no rule that assigns 13 original table word cells to positions, words or cycles in the 76-rune target**. Do not fit the missing mapping to LP2 ciphertext.

## Independent visual input and reproducible distinction

- The [registered original moth match](lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md) is 313/316 SIFT inliers with affine scale ~2.3309 and correlation 0.973947. This establishes reuse, not a key.
- **Source-attribution correction:** the contemporaneous original LP2 p53 scan is another near-exact copy of the same LP1 p5 moth. The p53↔p55 registration is 1715/1715 matched SIFT features, correlation 0.999903, with native-image 66–67 pixel translation. Original artwork therefore selects **at least p53 and p55**, and cannot independently select p55's role as a decoder target. The [authoritative original-image synthesis](../results/README.md) now records both occurrences.
- LP1 p5 original image \`resources/liber-primus/05.jpg\` prints a **5×5** mixed square with **13 rune-word cells and 12 numeric cells**. The 13 word cells are expanded by GP prime summation into exact cell values; the resulting 25 numbers form the original 1033 magic square. Its source-identified order is the printed 5×5 row/column grid, and the adjacent prose invokes prime numbers and Euler's totient.
- LP2 p55 \`resources/liber-primus/72.jpg\` is a **76-rune, four-line text** followed by a red 13-dot terminal marker, with an enlarged moth below. The original text has **16 ordinary black separator dots** distributed **7, 3, 4, 2** across those four printed lines. The original 2400×3600 scan's 16 dot components are directly recoverable, at y=725,913,1102,1290, using 9–10px by 10px isolated ink components. [Original-image SFT](../sims/lp2_p55_13cell_source_gate_sft.py). The 13-dot terminal marker denotes a page/section ending in other LP2 chapters as well and is not a pointer to 13 distinct rune positions.
- The p55 framing and 76-rune run length do not reproduce LP1 p5's five rows, five columns, 13 mixed cell locations, cell categories, or source word order. The **16 black text separators** do not select 13 source-cell positions. Several hypothetical assignments remain possible, and no original mark selects among them.

## Distinguish the already-tested literal mechanism

The full 25-cell row-major totient transfer was completed before this issue: the [original-pixel registered p55 transfer report](lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md) and [exact 76-rune SFT](../sims/lp2_p55_wisdom_moth_square_sft.cjs) show the explicit \`phi(cell) mod 29\` key repeated 3×25 after one fixed literal-F skip. It decrypts to **nonlinguistic** text (candidate IoC 0.03333333 vs original p55 0.03789474), with a positive planted control. We did not repeat that experiment, reverse the square, tune its origin, search additional F skips, reassign its 13 original word cells, or run a 13-period key hunt.

The fact that the 13 *source words* map to 25 *numbers* within LP1 already answers what the original square consumed. Nothing in the 2014 LP2 p55 page defines a second operation from these 13 words to its 76 GP runes. Supplying one is an extra assumption, not a recovery.

## Research decision

The page-to-page moth correspondence is a substantive physical source link, yet **its operation is underdetermined**. Retire the literal Wisdom-13→p55 correspondence until a creator-signed instruction, original layout mark or authentic intermediate artifact supplies (i) a 13-cell location/phase selector, (ii) a complete reversible transform for all 76 runes, and (iii) a locked independent plaintext prediction. An unmotivated 13-key-state search cannot satisfy those requirements.

**Result:** no new p55 key, plaintext or destination; this is a bounded missing-consumer result for #495, preserving the source-image discovery without promoting a coincidence to a decryption.
