# Original p15 spiral: rune-pointer hypothesis and word-address follow-up

**Status: exploratory source-address and word-map hypotheses; no authenticated cipher/key/plaintext.** This is a candidate *human reading instruction* worth preserving without broad numeric/parameter searches.

## Source-visible starting material

The original LP2 physical p15 image (`resources/liber-primus/32.jpg`) shows this exact 4×4 number square, with its visually red central value **3299**:

```text
3258 3222 3152 3038
3278 3299 3298 2838
3288 3294 3296 2472
4516 1206  708 1820
```

The [established spiral reconstruction](../results/lp2-p15-fibonacci-prime-spiral.md) determines the clockwise from-red order `[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]`. The independently signature-verified 2016 Cicada clue says **“Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.”** The 2016 wording postdates the 2014 book, so it is an interpretive clue rather than a contemporaneous p15 caption ([verified source record](../resources/cicada2016-4gq25.md)).

One economical literal reading of *numbers are the direction* is to treat the 16 **printed decimal numbers themselves**, with no mod reduction, as **zero-based addresses** into the complete original p0–55 unknown LP2 GP29 rune sequence. The canonical unsolved p0–55 corpus contains exactly **12,956** such runes (55 nonempty pages; physical p50 is a numeral table with no runes); the **complete original LP2 p0–57 release** contains 13,136 runes. Every printed number is below 4,517, so every address and rune is **identical under either source-authentic p0-based endpoint**, without relying on the unsolved-only truncation.

## Actual readout and rival clocks

In the original clockwise order from the red cell, the addressed GP rune labels are exactly:

```text
OE W A Y L U M U L H T G AE B U M
```

In particular, the three numerals immediately following the visually red center address original physical **p13** at local positions **104, 102, 100**, and read **W A Y**. This agrees with one word in the later signed instruction, but the remaining 13 addressed symbols do not form a comparable phrase, and the center symbol is **OE**, not a plaintext or confirmed key.

The same original sixteen numbers under a **one-based** address convention give:

```text
W G IA X F O EO NG H A EA I W L L F
```

A standard **row-major, zero-based** reading of the original square gives:

```text
M U L H U OE W T L Y A G M U B AE
```

These alternatives do not begin with WAY at the corresponding red-center successor position. For a direct whole-source control, the complete original **13,136-rune LP2** stream contains **exactly three** cyclic stride-two descending `W,A,Y` triples at zero-based W positions **2959, 3298, 4126**; the red p15 centre selects the middle one. This finite count is descriptive and does not give a post-search probability of intentionality. The apparent word requires the investigator-chosen full-unknown-book zero-based address convention and the already-source-selected clockwise spiral. It is not a cryptographic prediction because many cross-artifact readouts have already been tried in the broader repository. Using the *end* of an artificially truncated unsolved-only stream as an address origin can manufacture another apparent English fragment; this is excluded from consideration because the original complete release includes solved p56/p57.

## Source-derived word-map follow-up (Agent14, 13 November 2026)

The 2016 signed instruction says “Its words are the map ... their numbers are the direction.” As a bounded human-solve-path hypothesis, I tested the p15 spiral's **distinct Fibonacci values** and its derived **prime values** as whole-word addresses in the original p0–55 transcription. The original word parser is checked against the canonical 12,956-rune stream: **2,896 complete words / 12,956 runes**.

- The distinct Fibonacci values **[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987]**, used as zero-based word offsets (equivalently one-based word ordinals F+1), select 16 words. Their transliterations are:
  **SHEOGMIAF | SYENGC | THJGAE | FJOE | NEWBASOEEOINGU | PBN | SPTFPUNGYNGXIA | HEO | XGTH | FOEWAEOELFAE | GWY | PALUEANLJ | TH | CLEAP | NEOOX | FH**.
- The first two addresses, 0 and 1, select p0's first two **red** words, of lengths **8** and **5**. The original ink annotations show one 13-rune red span followed immediately by a red 13-dot mark. Thus the 8+5=13 relation is exact source structure, not a literal “85” radix.
- The Fibonacci value **5** selects p0 word ordinal 6: **NEWBASOEEOINGU**. The next GP rune after the apparent **NEWBAS** prefix is **OE**, not E. The derived prime sequence p_(F+1)=[2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817] also selects this same word at its value 5. This shared hit is mathematically dependent, not independent confirmation.
- Prime values as zero-based word offsets select 14/16 in-range words:
  **THJGAE | FJOE | NEWBASOEEOINGU | HBNIA | SPTFPUNGYNGXIA | XY | MEOLN | N | NHA | CNGD | EOYWAEGJ | BHAEJIAI | YTNGN | BNFASGBF**.
  The final values 4507 and 7817 exceed the 2,896-word corpus. Treating the prime values as one-based word ordinals also selects 14/16, with a different, equally nonlinguistic readout. The printed decimal cells themselves yield only five in-range whole-word addresses.
- The complete selected-word sequences do **not** form a coherent plaintext instruction. No modulo, wrap, shifted index, first/last-letter extraction, or language-model search was tried.

This supplies a plausible cross-page clue chain—p15 Fibonacci numbers → p0 red heading → p0 **NEWBAS** word—but not a complete opcode. The signed 2016 wording postdates the 2014 manuscript and does not specify the word-address convention or a reversible consumer. In particular, do **not** infer base85 from the shorthand 8|5: it records the two word lengths 8 and 5 in the 13-rune red span. The p0 **NEWBAS** prefix and its following OE remain unresolved under closed #730's missing-operand decision.

## Decision

The original decimal-as-rune-address readout remains an exact **three-rune WAY coincidence**, not recovered unknown plaintext. The new word-address test finds a source-derived cross-link to p0's red heading and **NEWBAS** prefix, but the 16 selected words do not yield a complete instruction, key, or plaintext. The repeated word-index-5 hit from Fibonacci value 5 and prime value 5 is not independent evidence because both sequences derive from the same p15 construction.

Preserve this as a possible intended-player clue chain, but **do not** reopen the closed NEWBAS opcode issue, scan alternative bases, or add arbitrary word/rune offsets. A follow-up requires an independent source that fixes the full operator, target base/codec, digit framing, and a held-out original-cipher prediction. No unknown LP2 plaintext, key, or complete inverse is claimed.

## Exact execution

[Standalone Node.js CommonJS original-input SFT](../sims/lp2_p15_global_decimal_offsets_way_sft.cjs) hashes no reconstructed ciphertext and reads the canonical original transcription directly. It asserts the printed grid, the original 12,956-rune unsolved and 13,136-rune complete-release lengths, exact endpoint invariance, all three complete-source stride-two WAY occurrences, full sixteen-symbol readouts under clockwise zero-based, clockwise one-based, and row-major zero-based controls, and original physical-page/local addresses of W/A/Y. It was **executed against the current GitHub corpus and all assertions passed** on 13 November 2026. The same SFT now also verifies the 2,896-word parser against all 12,956 original runes, the p0 8+5=13 red-heading/punctuation relation, and the finite Fibonacci/prime/printed-decimal whole-word address readouts.
