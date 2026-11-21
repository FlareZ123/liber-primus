# Dual-residue word map: corrected source register

**Status: exploratory arithmetic, no recovered plaintext or authenticated decoder.** The original version used the first 29 alphabetic tokens of the signed 2016 message, starting with the separate greeting HELLO and ending mid-sentence at THE. The source-visible alternative is the complete 29-word body THE through DIRECTION, excluding the greeting. The original semantic alignments depend on the former, truncated register and do not survive this correction. The body register is a plausible indexing scaffold, not a source-specified cipher operation. The signed message refers to Liber Primus when it says its words are the map; it does not explicitly prescribe indexing the signed message itself. See [the 2016 register gate](lp2-p50-functional-graph-2016-wordmap.md) and [issue #2045](https://github.com/FlareZ123/liber-primus/issues/2045).

## Exact operation and results

For GP29 indices x, interpret N as a big-endian base-29 integer and compute (q,r)=(N mod 23,N mod 29). Use zero-based q and r as indices into the 29 body words. The p50 address 29q+r is a separate, conditional table-graph hypothesis; it can exceed the 256-cell table. The first two p0 text operands below are *candidate readouts*, not established plaintext. Offsets are zero-based and inclusive.

| Operand | (q,r) | Corrected body words | Former greeting-inclusive prefix words |
|---|---|---|---|
| Candidate p0 title EPIPHANY SEEKS | (18,15) | THEIR / ARE | MAP / WORDS |
| Candidate p0 right RISE phrase EPIPHANY SEEKS THE DEVOTED | (6,23) | THE / AND | SEEKS / ROAD |
| Original p0 offsets 73–79 | (7,13) | DEVOTED / ITS | THE / WAY |
| Candidate p0 horizontal WORDS MAP MEANING NUMBERS | (0,15) | THE / ARE | HELLO / WORDS |
| Original p0 offsets 80–102 | (18,26) | THEIR / ARE | MAP / NUMBERS |
| Original p0 offsets 73–102 | (14,26) | WORDS / ARE | ITS / NUMBERS |
| Original p15 offsets 23–73 | (22,8) | ROAD / LIBER | THE / DEVOTED |
| Original p53 red span 128–178 | (7,9) | DEVOTED / PRIMUS | THE / LIBER |

These results retain the original residues, and therefore the earlier numerical graph and DH comparisons, but the old semantic labels are invalid for the complete body register. The body register changes the claimed title reversal MAP/WORDS, RISE SEEKS/ROAD, prefix THE/WAY, and p15/p53 labels. There is no source-selected reason to restore the truncated prefix to preserve those labels. Candidate readouts and the selection of operands remain conditional. The p15 and p53 51-rune operands share residue 29535 modulo 179², as previously observed; that equality does not independently authenticate this word-map operation.

The second residue is exactly the final GP29 digit: N mod 29 = x_last. It therefore adds no whole-string evidence beyond the final rune. Modulo 23, the powers of 29 repeat every 11 positions. The 667 possible ordered residue pairs are a many-to-one summary, not a reversible decoder. For fixed length seven, 29⁷ input sequences map into at most 667 outputs; apparent word pairs can arise without recovering the six preceding runes. The corrected output has no prospectively fixed unknown plaintext or source-defined reversible receiver. Do not use the proposed map as a keystream or cycle selector absent an independent first-party instruction and a locked original-cipher prediction.

## Scope and reproduction

`node sims/lp2_dual_residue_wordmap_sft.cjs` computes both the legacy `word_pair` and corrected `body_word_pair`, the numeric residues, and the existing graph and window counts from `resources/liber-primus/lp2-corpus.json` and `lp2-grid-256.json`. The old (7,13) prefix pair occurs in 21 seven-rune windows across p0–p55; the p15 (22,8) and p53 (7,9) pairs occur in 19 and 14 51-rune windows respectively. The conditional 11-cycle basin covers 252/256 cells. These are descriptive controls, not evidence of a plaintext solution. The positionally encoded base-29 operation, graph traversal and source selection have not been authenticated.
