# GP29 plus three large-mark classes: fixed five-bit binary receiver

**Status: source-motivated hypothesis, direct receiver negative; no LP2 plaintext or key.** 16 November 2026, Agent3. [Exact source SFT](../sims/lp2_gp29_three_mark_5bit_original_sft.cjs).

## New finite route and its rival

Original manuscript glyphs supply 29 GP29 rune identities and three **physically distinct large dot-mark types**, with dot counts 10, 13 and 23. This permits a 32-symbol register, the size of one five-bit code. The floral margin on physical pp40–55 contains five small left and right discs; the original p50 numeric field has 32 rows and eight columns. A human might reasonably infer a binary/digital receiver if these independent layout features were designed as a coordinated code. The rival is that three obvious punctuation designs were post-selected to fit 29+3=32; original small punctuation, word dividers and color also remain visible and no printed instruction names a five-bit codec.

Freeze the least-parametric one-to-one candidate: GP29 corpus indices **0..28** in canonical order, followed by **10-dot = 29, 13-dot = 30, 23-dot = 31** in increasing dot-count order. Insert each physical large mark **after** the page-local rune offset recorded in `lp2-ink-annotations.json`; preserve multiple marks at one offset in source order. Concatenate five bits per symbol MSB-first, without silently adding or discarding a terminal pad. Every rune and all 36 original physical large marks are preserved in this serialization. This decoder has a complete inverse given the symbol count and number of trailing bits. Ordinary four-dot stops and commas are intentionally outside the proposed 32-class register; their potential significance remains open.

## Frozen original-input readout

| Pages | Rune symbols | Large marks | Byte count | Residual bits | First 12 output bytes (hex) | Printable ASCII |
|---|---:|---:|---:|---:|---|---:|
| p0–2 | 729 | 2 | 456 | 7 | `7a24334f607ea552f84b3640` | 39.47% |
| p3–7 | 1145 | 8 | 720 | 5 | `a2d88a9450cae0e44036f3da` | 41.53% |
| p8–14 | 1729 | 1 | 1081 | 2 | `729d30ba6513471da61c7349` | 38.85% |
| p15–22 | 1903 | 4 | 1191 | 7 | `f00349e39ab63d40d5250c53` | 40.97% |
| p23–26 | 1021 | 2 | 639 | 3 | `0e0f533ae65454c8455af70c` | 38.65% |
| p27–32 | 1433 | 2 | 896 | 7 | `9b75478f194524c54e94795b` | 39.96% |
| p33–39 | 1680 | 8 | 1055 | 0 | `bb1c502b0741bccb0212b731` | 39.34% |
| p40–53 | 3008 | 2 | 1881 | 2 | `0267a35f28c35da43383942b` | 40.83% |
| p54–55 | 308 | 2 | 193 | 6 | `c4eb7d89ca9fb776d427c4e1` | 38.86% |
| solved p56 | 85 | 3 | 55 | 0 | `caecf27a7aa0d03c944639e9` | 29.09% |
| clear p57 | 95 | 2 | 60 | 5 | `6e0988d25ea28b2149497c30` | 46.67% |

The complete p0–57 source has **13,136 runes + 36 physical marks = 13,172 five-bit symbols**, yielding **8,232 bytes and four residual one-bits** (`1111`). The p57 unique 23-dot terminal maps to code31 (`11111`) under the frozen mapping. All 11 page ranges and the whole-source stream fail the predeclared file-type-at-start recognizers (PNG, PDF, ZIP, gzip, bzip2, xz, GIF, ELF, MZ) and fail a complete printable-ASCII receiver. No page readout recovers an independently typed instruction, a natural GP29 passage, or a verifiable key.

## Decision for further research

The simple **literal five-bit pack** is rejected as an unencrypted byte/file payload decoder at source-visible chapter starts. This does **not** exclude a keyed binary format or a different authorized codebook. The book does provide a concrete reason to ask about a 32-state receiver, while its observed layout does not determine how an 8-bit p50 table cell would be consumed, how punctuation classes would map to code points, or whether a second input chooses one of eight columns. Every additional parameter is presently free. A useful successor must retrieve a *first-party instruction* that fixes the missing table consumer or validates a complete original byte stream on untouched pages. Avoid guessing offsets, column permutations, byte XORs or extra cipher layers to rescue the failed direct readout.

**Inputs:** `resources/liber-primus/lp2-corpus.json` (physical p0–57 runes), `resources/liber-primus/lp2-ink-annotations.json` (36 large-mark source positions/classes). The SFT reads these unchanged and asserts the exact symbol count, two byte-aligned authentic controls, output prefixes and typed failures.
