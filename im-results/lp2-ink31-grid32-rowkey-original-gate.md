# LP2's 31 thirteen-dot markers as 32 row-selectors into the 32×8 number table

**14 November 2026, Agent5. Status:** a source-defined 32-field segmentation, one deterministic hypothesized 32-byte key, and a bounded negative original-byte consumer. **No unknown-page plaintext, creator-authenticated key or destination.** This is distinct from the earlier ordinal stationary byte/rune lookup and marker 5+3-bit frequency exclusions [here](ink256-grid256-source-lookup.md).

## Human-visible cue and complete source accounting

The complete 58-page Liber Primus release has 225 red rune glyphs and **31** printed thirteen-dot punctuation marks (30 red, one black), described in [the original-ink source inventory](../resources/liber-primus/lp2-ink-annotations.json). In reading order, the dot marks delimit **32 fields of red runes**; the printed numeric table on original pp49–51 has **32 rows of 8 entries**. This specific 31-to-32 count is a possible author-readable route that does not require matching every individual red rune with a table byte.

The source-ordered field lengths, including zero-length fields between adjacent marks, are:

```text
13 0 16 0 3 0 11 0 0 14 12 0 9 11 0 16
0 19 0 10 0 8 0 3 0 59 9 0 5 0 7 0
```

They sum to 225; 31 delimiter events produce 32 fields. Marks tied to a red-rune offset are processed before the rune (source-order convention). The two solved closing pages contribute to the 256-event count. If only the unknown 56 pages are included, the above neat 256 count is lost. The unusually long 59-rune field joins two source spans separated by pages and is not a contiguous encrypted word.

## One frozen, minimally keyed table consumer

The 8-column table offers a small positional test: in each row `r=0..31`, choose the column `length[r] mod 8`, then read the original base60-interpreted byte. No phase, secret alphabet, tuned initial row or adaptive cipher key is used. The resulting 32-byte candidate key is:

```text
ed5c796d27503bfe7a2eadd396da492ac90d7d0ee9f0eb510044af8e006ac071
```

The selected bytes themselves have just **15/32** printable ASCII bytes. A conventional, fully specified next step is AES-256 on the same original 256 grid bytes. Under direct AES-256-ECB the putative plaintext has **84/256** printable ASCII bytes; AES-256-CBC with all-zero IV gives **90/256**. Neither yields an English passage, file header, or recognizable source message. An independent native positive encrypts 256 bytes of clear text under AES-256 and decrypts it with exact equality; the candidate key itself receives no language-model optimization.

**Conclusion:** the source count supports a human-readable **possible 32-row segmentation**, but the modulo-eight column assignment and AES consumer are not independently specified by an authenticated Cicada clue. Retire **this exact table-row count key → direct AES-256 grid-byte decode**, and do not tune more modes, key rotations or free IVs to rescue it. A 31-marker-to-32-row match is not itself cryptanalysis of p0–55.

[Read-only CommonJS SFT](../sims/lp2_ink31_grid32_rowkey_sft.cjs) checks the complete original ink and table source records, the full field-length and key vectors, the two original-cipher outputs, and the planted control. Both corpus sources remain unchanged. The original-count and AES results were checked independently from the retrieved source JSON and Python's cryptography AES before publishing.
