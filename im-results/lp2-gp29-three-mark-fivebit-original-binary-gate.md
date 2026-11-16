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

## Historically typed 2014 Tor-v2 continuation check

The historical Cicada continuations used **16-character RFC4648 Base32** Tor-v2 hostnames. Sixteen such hostnames consume exactly **256 five-bit codes**. Source imagery independently supplies three competing 256-event registers, which were frozen in earlier #1278/#1282: **A** = 225 red runes + all 31 physical 13-dot marks; **B** = the same 225 red runes + 30 red 13-dot marks + the final red 23-dot mark; **C** = the 225 red runes + 31 chapter marks (28 thirteen-dot and three ten-dot, including p7 black). Original page/rune offset order is unchanged and the alphabet/code assignment remains GP29 = 0..28; 10/13/23-dot = 29/30/31. Each source order deterministically gives sixteen 16-character Base32 hostnames.

| Registered event class | First 16-symbol host | Last 16-symbol host | Exact matches among seven documented 2014 Cicada onions |
|---|---|---|---:|
| A | `pisdgt3ap2svf66u` | `6zlwpe66nyeyrus6` | 0 |
| B | `pisdgt3ap2svf66u` | `zlwpe66nyeyrus67` | 0 |
| C | `pisdgt3ap2svf66u` | `kt66zlwpenyeyrus` | 0 |

Every output is automatically syntactically valid Base32 and that fact carries no evidentiary weight: Tor-v2 hostnames have no built-in checksum that authenticates the address as a working historical service. The direct event-to-Tor-base32 consumer fails the independently checkable first-party-host receiver for all three class choices. **The 256-event tapes do not actually cover the full hypothesized 32-symbol alphabet:** A contains only the 13-dot special type (30 represented codes); B contains 13- and 23-dot types (31 represented codes); C contains 10- and 13-dot types (31 represented codes). All three reach exactly 256 events by excluding at least one of the book's three large punctuation classes. Hence the global 32-class register and the red256-event count are independently source-visible observations but do not jointly authenticate a complete 32-code, 256-event channel. No archived service identity or original LP2 destination was established. Other historical hosts or encrypted/processed outputs are untested. The source still does not choose among the three event registers, and a same-length match to an expected Tor format cannot supply the missing selection. This result is distinct from the prior **red16 GP29-integer→Tor-v2** experiment on p3/p23, which has different source selection and numeric conversion.

## Fixed 32×8 table receiver from the same five-bit codes

The manuscript's printed p50 byte grid has **32 rows and eight columns**. The candidate 256-event set also has 32-compatible rune/mark identities and an exact 32×8 cardinality. This independently motivates one unkeyed table lookup: at event ordinal `i`, use event code `e[i] = 0..31` as **row** and `i mod 8` as **column**; output the printed table byte at that cell. It is the direct code-into-grid consumer, with no fitted IV, alphabet permutation, offset, or password. The only event alternatives are the three already physically specified A/B/C registers above.

| Event class | First 16 output bytes | Printable bytes / 256 | Distinct bytes / 256 |
|---|---|---:|---:|
| A | `2a ff 5c 19 56 fb 33 b7 2a af 5c 36 e6 38 c6 f8` | 102 | 115 |
| B | same first 16 | 90 | 117 |
| C | same first 16 | 110 | 113 |

The shared 32-byte start for all three choices is `2aff5c1956fb33b72aaf5c36e638c6f8d3961936e6894815d3b3c5c0a904a7c0`. There is no complete printable-ASCII readout or typed historical file header. More decisively, the **32 possible code inputs** have only **[30,32,30,30,30,31,31,30] distinct outputs** across the eight fixed columns of the printed grid. Six columns therefore contain source-native byte collisions. This direct reader is **not a lossless 32-symbol-to-byte cipher** over the complete rune/mark alphabet; a hidden state or auxiliary channel would be needed to invert it. It can only remain a hypothetical partial or processed payload reader.

The reader is implemented and asserted against all 256 physical events and the unchanged table in the same SFT. These negatives do not exclude an authored table lookup of different semantics. The lack of an original selector among A/B/C and absence of a typed output mean they should not motivate more unfrozen grid permutations.

## Decision for further research

The simple **literal five-bit pack** is rejected as an unencrypted byte/file payload decoder at source-visible chapter starts. This does **not** exclude a keyed binary format or a different authorized codebook. The book does provide a concrete reason to ask about a 32-state receiver, while its observed layout does not determine how an 8-bit p50 table cell would be consumed, how punctuation classes would map to code points, or whether a second input chooses one of eight columns. Every additional parameter is presently free. A useful successor must retrieve a *first-party instruction* that fixes the missing table consumer or validates a complete original byte stream on untouched pages. Avoid guessing offsets, column permutations, byte XORs or extra cipher layers to rescue the failed direct readout.

**Inputs:** `resources/liber-primus/lp2-corpus.json` (physical p0–57 runes), `resources/liber-primus/lp2-ink-annotations.json` (36 large-mark source positions/classes). The SFT reads these unchanged and asserts the exact symbol count, two byte-aligned authentic controls, output prefixes and typed failures.
