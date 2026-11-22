# Opening LP2 chapter's 32 physical lines versus the later 32×8 byte table

**Agent20, 22 November 2026. Intermediate original-source alignment and bounded decoder rejection. No unknown plaintext, author-selected key or reversible book-wide operation recovered.**

## Independent source observation

The original opening LP2 physical pages p0–p2 (`resources/liber-primus/17.jpg`–`19.jpg`) show **12, 12 and 9 printed rune-bearing lines**, respectively, for a total of **33**. The first line of p0 carries an **8+5=13-rune red title** and seven following black runes. Removing that single *whole printed line* leaves **exactly 32 unmodified physical rune lines**, containing 709 runes. Their printed page distribution is **11 + 12 + 9 lines**.

The original runeless p50 table is printed across physical p49–p51 as **32 rows of 8 two-character tokens**, containing **256 tokens**. Both the 32×8 shape and the opening chapter's one-heading-line separation are directly visible to a 2014 reader. The text/table pairing itself is *not* attested by a first-party Cicada instruction.

This is distinct from the previously reported **13 red title runes + 156 body words (13×12 or 12×13)** and the full **729-rune (27²)** opening chapter. The first 13 red runes leave **716 black-body runes**, including the seven black runes on the title's printed line. For the present 32-line test those seven runes are deliberately excluded from the receiver, because the hypothesis is specifically one *remaining printed line per table row* rather than one whole black-body rune tape per table row.

The source has two other separately reported count links: p0's first black fragment contains 249 runes, the opening three-page chapter has 158 printed words (two red, 156 black), and the p50 source bytes have `T[249]=158, T[158]=249`. Those prior observations make an original table navigation possible but do **not** select the row cipher tested here.

## Frozen operational checks

Freeze the 32 source text lines and 32 table rows in their printed order. Read each table token under both conventional base60 and the preexisting drop-`f` base59 alphabet, with *no fitted offset or page reset*. Two direct receiver types are evaluated.

1. **Fully reversible row-wise additive GP29 receiver.** For text line `r`, apply its eight corresponding table byte values as a period-eight GP29 additive key to the line, starting at its first rune. Both additive directions are tested. The decoder includes exact re-encryption of every source rune.
2. **Short read-out, not a full decoder.** Each of the eight cells in table row `r` selects one rune from printed line `r`, using original numeric byte, token low digit, token high digit, byte quotient by eight, or byte quotient by29, reduced modulo the exact line rune count. Test forward reading and alternating-line reverse reading. This finite family can at most expose a 256-rune secondary instruction. No pointer candidate can by itself recover all 709 line runes.

Both variants rely on an **unproven** link between the distant numeric table and the first chapter. Their modulo-line-count convention is a natural finite reading, never a creator-authenticated command.

| Original-text consumer | Fixed variants | Lowest decoded GP29 IoC | Highest decoded GP29 IoC |
| --- | ---: | ---: | ---: |
| Row-wise additive, 709 runes | 4 | 0.0341413 | **0.0347191** |
| Table-to-line pointer, 256 extracted runes | 20 | 0.03272 | **0.03928** |

The authentic solved p57 clear-GP29 control has **IoC 0.062709966405**. Original source line stream remains cipherlike under all four reversible direct row keys. The strongest pointer readouts likewise lack continuous readable GP-native prose. These scores are diagnostic; a score below the clear p57 level is not a theorem ruling out every language or keyed transduction.

### Distinguishing the geometries

The full opening printed chapter has 33 rune-bearing lines. Using the nine source page-aligned group starts p0, p3, p8, p15, p23, p27, p33, p40, p54, the other broad groups contain respectively 55, 79, 86, 46, 65, 80, 135 and 15 *rune-bearing physical lines*. Some headings occur midpage and p50 has no rune lines; these are comparative page spans, not exact colored-header clauses. This makes the opening's first-line-plus-32 layout a distinct visual candidate, though not an independently authenticated p50 mapping.

## Decision

The **32-line / 32-row geometry is real**, and it nominates one inexpensive, physically readable way to test the p50 table against a specific unknown chapter. **The direct source-ordered row-key and line-selector consumers are negative**. They do not yield authentic plaintext, and no first-party inscription specifies how eight table bytes should be converted to a reversible rule on roughly 20–25 runes per printed line.

Only advance the geometry if an *independent original cue* selects a value-changing eight-column operation or supplies a decryptable held-out fragment. Do not rescue the failed receiver by adjusting arbitrary phases, radices, word partitions, directions, or substitutions.

**Exact original inputs:** `resources/liber-primus/lp2-transcription.txt`, `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp2-grid-256.json`, physical images `17.jpg`–`19.jpg` and `66.jpg`–`68.jpg`. **Reproducer:** [single-file Windows Node22 SFT](../sims/lp2_p0_32line_p50_rowkey_sft.cjs), successfully executed [read-only CI run 44965869748](https://github.com/FlareZ123/liber-primus/actions/runs/44965869748).
