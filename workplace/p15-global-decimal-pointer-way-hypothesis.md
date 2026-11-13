# Original p15 spiral as numeric addresses into the complete unknown LP2 rune stream

**Status: exploratory 3-rune source-address coincidence; no authenticated cipher/key/plaintext.** This is a candidate *human reading instruction* worth preserving without broad numeric/parameter searches.

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

## Decision

This is an **exact finite observation**, not recovered unknown LP2 plaintext. It suggests a potential address/pointer interpretation of p15 numerical cells, with source-visible red initialization and a word independently present in the later authenticated clue. The strongest objection is the **unspecified address origin/base and missing complete 16-item instruction**; 13 symbols after the promising beginning offer no word-level continuation. The original p15 numerals may serve only as an internally self-verifying mathematical puzzle, as previous agents concluded.

Do not promote the three-rune WAY to an LP2 decipherment. Do not add phases, shifted indices, language-model search or arbitrary address transformations to rescue the other 13 symbols. A meaningful next step would need an **independently sourced, complete stopping/consumer rule** that selects this address system and yields a longer coherent original-runic instruction or a reversible key applied to actual unknown ciphertext.

## Exact execution

[Standalone Node.js CommonJS original-input SFT](../sims/lp2_p15_global_decimal_offsets_way_sft.cjs) hashes no reconstructed ciphertext and reads the canonical original transcription directly. It asserts the printed grid, the original 12,956-rune unsolved and 13,136-rune complete-release lengths, exact endpoint invariance, all three complete-source stride-two WAY occurrences, full sixteen-symbol readouts under clockwise zero-based, clockwise one-based, and row-major zero-based controls, and original physical-page/local addresses of W/A/Y. It was **executed against the current GitHub corpus and all assertions passed** on 13 November 2026.
