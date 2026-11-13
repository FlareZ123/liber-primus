# Terminal p55–57 256-rune frame: 180 solved-rune fixed-lookup obstruction

**Agent48, 13 November 2026. Original known-plaintext structural negative; no unknown page solved.**

The manuscript's final physical pages have exactly **76 p55 ciphertext runes + 85 p56 solved runes + 95 p57 clear runes = 256 runes**. The source's pp49–51 numerical grid provides exactly **256 byte-valued cells**. This creates a different original-visible candidate frame from the already tested p53(179)+p54-A(1)+p55(76) frame. The competing frames weaken any inference that the equality alone uniquely specifies a cipher, yet the latter construction gives an independent **180-rune solved terminal control** that was absent from the p53 composite.

**Bounded exact operator:** Assume an arbitrary, wholly secret **static deterministic lookup** from each grid byte to a GP29 rune, or each GP29 rune to a grid byte. The lookup may be any function; neither its values nor a regular algebraic relationship are assumed. Try source-visible row-major, column-major, row-serpentine and column-serpentine byte traversals, each forward/reverse, and forward/reverse reading of the full 256-rune terminal frame. For forward rune order, compare grid slots 76–255 with the actual **known 180 plain runes**; for reverse, compare grid slots 0–179 with the reverse of the known 180. The unknown 76 p55 runes are completely withheld and never guessed.

The known page-56 plaintext is independently fixed as `AN END WITHIN THE DEEP WEB ... TO SEEC OUT THIS PAGE` in native GP orthography; its **85/85** indices are checked by the published prime-totient inverse, including the unique literal-F clock skip at page-local offset56. Page57 is **95/95** source-native clear GP runes.

**Exact minimum contradictions under an arbitrary secret codebook:**

| Grid reading | Best minimum edits, byte → rune | Best minimum edits, rune → byte |
| --- | ---: | ---: |
| Row-major, either reversal | 47 | 153 |
| Column-major, either reversal | 48 | 155 |
| Row-serpentine, either reversal | 44 | 154 |
| Column-serpentine, either reversal | **39** | **151** |

(The minima are over both terminal-rune orientations and grid reversal; detailed all-16 records are emitted by the reproduction script.) Every codebook family would require changing at least 39 of the 180 independently known symbols. The proof is key-independent: group repeated input values and choose the most frequent observed output in each group. Every conflicting output in that group forces an edit. All 16 layouts accept planted arbitrary byte→rune and rune→byte codebooks exactly, confirming the bound's direction.

**Decision:** retire direct fixed byte↔GP29 lookup on the **p55–57 terminal frame**, regardless of unknown codebook, in these source-natural traversals. This does not reject stateful/keyed transforms, bytewise XOR or addition, variable lookups, a reading order requiring further original instructions, or any ciphertext operation restricted to p55 alone. The exact 256 count remains an exploratory source relationship; it is insufficient to choose a lookup. No new plaintext, authenticated key or mechanism follows.

[Exact original-source standalone test](../sims/lp2_grid256_terminal_solved180_lookup_sft.cjs).
