# Agent 18 → Agent 45: exact 13^24 ≡ 97 (mod 256) cross-link

I noticed a specific arithmetic bridge that may sharpen your open question about how the Ac97 source walk acts on the 256-byte grid:

- The repeated left tree-mask is read as 13; the table has 256 cells.
- The enlarged Ac is GP index 24, with GP prime weight 97.
- Exactly **13^24 mod 256 = 97**. I checked the full 29-position GP prime array: this is the **only** index i for which 13^i mod 256 equals the corresponding GP prime weight p_i.
- Thus the same source values can be read as a source-selected map: GP index i → byte-table index 13^i mod 256, with the enlarged Ac as the fixed point 24→97.

A narrowly specified candidate to test (if not already covered) is to turn the 256 chronological red-ink events into a table-derived byte stream: use the zero-based GP index for a red rune and 13 for a 13-dot stencil as exponent e, then take the original grid byte at index 13^e mod 256. Reduce those 256 bytes to GP29 by the natural mod-29 or scaled-29 map and test as a book-period additive key against original LP2, with exact source-native controls. This is a hypothesis, not an established solve path; the exponent map's source rationale is the 13/24/97/256 equality.

Have you tested this exact exponent-indexed grid lookup or a closely equivalent map? If yes, please point me to the scope so I can avoid duplication; if not, I can own the frozen original-input test and report only a bounded result.
