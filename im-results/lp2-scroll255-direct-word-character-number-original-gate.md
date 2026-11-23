# Original scroll255 → p8 character-address receiver

**Decision (23 November 2026, Agent20):** The unusually exact **255 complete words** on physical LP2 pp3–7 and **255 following runes** on p8 do *not* support a direct one-character-per-word book-code decoder when the adjacent p8 rune is taken as its GP29 ordinal or the rune's listed GP prime. All four standard absolute index conventions run out of each original word at **at least 212 of 255 positions**. Forced cyclic wrapping produces uniformly distributed, nonlinguistic 255-rune strings. There is no authenticated plaintext, key, or first-party instruction for cyclic word-local addressing. This excludes a simple *specific* human-readable receiver without deciding whether the 255/255 alignment is intentional.

## Independent original clues and strict receiver

The complete original runic words across physical pp3–7, including genuine line/page continuations, total **255 words = 1,145 runes**. The next physical page p8 contains **255 runes**. The uniqueness of this word-count-versus-following-page-length equality across all 1,540 contiguous eligible original page windows was already established by [the distinct scroll registration and stateless-word-map study](../sims/lp2_scroll255_word2rune_anylookup_obstruction_sft.cjs); it is **prior work**, rather than a new claim here.

The signed 2016 Cicada hint says that the book's *words* are the *map* and their *numbers* are the *direction*. The simplest candidate would take source word \`W_i\` at position \`i\` and the *following page's* rune \`Y_i\` to select exactly one glyph \`W_i[k_i]\`. This uses the adjacent 255/255 source registers and a conventional 2014-available GP numeral; it does **not** assume a private word-hash function, GF(4) LFSR, or distant p50 grid. We froze two actual chart interpretations before reading any candidate letter: zero-based GP ordinal \`0…28\` or the GP chart's prime values \`2…109\`. Each has ordinary zero-based and one-based character-index conventions. The decisive test is whether the address even fits the authentic printed word. For completeness, we separately tried the new, unlicensed rule \`(k−base) mod length(W_i)\`, solely to show what rescuing invalid indices by wrapping would produce.

| Original p8 number | Character indexing | In-range | Invalid, 255 total | Full wrapped-string GP29 IoC |
|---|---|---:|---:|---:|
| GP ordinal | 0-based | 43 | **212** | 0.03538675312644743 |
| GP ordinal | 1-based | 43 | **212** | 0.033719314497452524 |
| GP prime value | 0-based | 17 | **238** | 0.03489269723637486 |
| GP prime value | 1-based | 21 | **234** | 0.03594256600277906 |

All direct interpretations fail the finite book-code range requirement on at least 83% of authentic source words. All four modulo repairs yield unfamiliar GP29 sequences with IoC near the uniform-alphabet level \`1/29 ≈ 0.03448\` (the 95-rune solved native p57 passage has ~0.0627; this shorter control is context, not a calibrated likelihood test). None has ordinary consecutive solved-style prose or specifies a key. One must supply an entirely new *source-given* character-position reduction rule to treat them as authored. The near-uniform scores are qualitative supplementary evidence; the raw out-of-bounds counts are the decisive exact exclusion.

## Reproduction and positive controls

[Read-only, single-file Windows Node.js 22 SFT](../sims/lp2_scroll255_direct_word_char_number_gate_sft.cjs) loads only the canonical source transcription and rune chart, asserts the 255/255 counts and exact 1,145-source-rune continuity, performs all four frozen full-original probes, emits the GP transliteration prefix and SHA256 of every 255-rune wrapped readout, and verifies four synthetic **255/255 legal character-address readbacks** on the same original words. The positives establish correct 0/1-index handling without fitting any original p8 digits. Full original output is deterministic and read-only. The 2016 signed message is merely a historically available motivation; it neither explicitly pairs pp3–7 with p8 nor defines modulo-word-length reading.

**Decision fork:** Leave the intriguing source 255/255 registration available as an *uninterpreted relationship*. A genuinely different channel would require its own observable author instruction, e.g. a letter-position normalization or an explicit intermediary key and independent untouched readout. More arbitrary modulo variants cannot overturn the simple index-range obstruction and are low-priority compared with locating an actual inverse or plaintext.
