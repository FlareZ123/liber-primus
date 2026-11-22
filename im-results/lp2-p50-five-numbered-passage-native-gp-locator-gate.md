# A complete original p50→five-numbered-passage rune locator, without plaintext

**22 November 2026, Agent6. Classification: exact original-source coordinate mapping and a negative on its most direct ciphertext receiver.** This is a finite source-led investigation of a distinct p50 table interpretation. It identifies no recovered unknown LP2 plaintext, authenticated cryptographic key, or author-prescribed operation.

## Human-readable authored clues and an executable proposal

The cuneiform section on original physical LP2 pp36–38 (source images 53.jpg–55.jpg) contains exactly five consecutive **explicitly numbered** runic units, printed **1–5**, with source-rune lengths **139, 91, 98, 96, 129**. Each spans natural printed words and sometimes a page boundary. The original p49–51 numeral panel (source images 66.jpg–68.jpg) prints exactly **256 two-character tokens** across **32×8** visible cells. Every token's first character is an Arabic digit **0–4**, and every second character belongs to the printed 60-character source alphabet, occupying an index **0–59**.

This enables one unusually simple and wholly lossless locator input rule, independent of the arithmetic value of any base60-encoded byte:

1. Keep the table's **original row-major printed order**, including every cell.
2. Read the first printed glyph of each token as the **zero-based item number** into the five authentic **1–5** original passages.
3. Read the second printed glyph as the **zero-based rune index** in that selected passage, in the table's existing base60 alphabet order.
4. Output the rune already printed at that address, as a 29-symbol Gematria Primus value.

Every one of the 256 coordinates is valid without wrapping, out-of-bounds fixes, nonoriginal segmentation, a guessed key, or skipped cells. Even the shortest numbered item has 91 runes and all requested positions are below60. There are **[60, 58, 65, 56, 17]** lookups into original items1–5. The mapping is a plausible human-visible internal **book cipher** reading, consistent with the independently signed 2016 hint about *numbers*, though the text does **not** explicitly direct this cross-chapter lookup. Its first digits0–4 could also simply result from encoding conventional bytes0–255 in base60, so this is an interpretation rather than proof of authorship.

## Exact outputs and untouched ciphertext decision

The resulting 256-rune source-selected sequence has index of coincidence **0.0393995098** (compared with **0.0627099664** on independent clear GP29 p57), and begins in canonical transliteration:

```text
DSWMHIAJEJREOOEAJAUHAEIRFITAHOOEPXDNGWRIANEAJNGAEJTWYFEYPFXIINGHRJAEYATOEYNTPCOEDYYJLAEIWGRYDRJJXHOWSUMAEHHTHTDIEOPSO
```

No GP-native words or coherent instruction emerges from direct reading. To test the cheapest reversible cipher candidate, take the entire *original* runic material flanking the table, **66 p49 runes followed immediately by 92 p51 runes** (158 positions). Decrypt in printed order by `P[i]=(C[i]−K[i]) mod29` using the **first 158 of the 256 retrieved runes**, with no phase shift or fit; the only equally ordinary opposite sign `P[i]=(C[i]+K[i]) mod29` is a strict two-way sensitivity control. Both directions have exact modular inverses, and a planted GP-native clear-page sample replays identically.

| Fixed original material | IoC |
|---|---:|
| Original 158-rune flank | 0.0340240264 |
| `flank − K` | **0.0317665081** |
| `flank + K` | **0.0349915343** |
| Independent clear p57 reference | **0.0627099664** |

Both resulting streams have nonlinguistic word-internal sequences. The literal direct lookup and this one bounded additive consumer therefore **fail the required original-prose test**, despite a fully valid original-source address map. This does not reject a separate original instruction to use the 256 lookups as a data structure, matrix or one input to a multilayer cipher; those would require independently supplied operations.

Reproduce all source-coordinate assertions and original-flank checks in [the standalone Windows Node22 CommonJS test](../sims/lp2_p50_five_numbered_passage_lookup_sft.cjs). The script reads only the pinned canonical `lp2-transcription.txt`, `lp2-corpus.json` and `base60-grid.json`, prints original counts, exact lookup prefix, forward/backward flank outputs, and asserts a synthetic clear-p57 replay without any fitted parameters or HTTP access.

## Decision and next useful action

The exact five-unit numeral→rune reading is a new fully specified *candidate locator*, so it may inform a later discovery if an original source identifies five numbered messages as a keybook. **For now it is a bounded negative on both simple interpretations as actual plaintext/key.** The task of finding an externally hosted named key and a first-party p50 table-address rule remains unsatisfied. Prefer source instructions that supply a genuine operand and cipher consumption rule over reinterpreting this 256-rune output through freely chosen further transforms.
