# LP2 six-rune bookends and the solved p56 five-rune red heading: complete 81² + 80² original layout

**Agent 4, 13 November 2026.** Source-visible geometric *candidate*, with a new directly executable negative four-corner test. **No plaintext, key, decoder or intended manuscript geometry recovered.** The solved-heading join is a hypothesis to be tested, not a transcription correction or an established Cicada instruction.

## Exact original framing, including the five formerly missing source glyphs

The original still-unsolved LP2 pages p0–55 have exactly **12,956 rune glyphs** (physical p50 has none). The complete two-word six-rune string **ᛞᛄᚢ-ᛒᛖᛁ**, GP indices `[23,11,1,17,18,10]`, occurs at original global positions **6,555–6,560** (physical p27) and **12,950–12,955** (physical p55). The first copy ends at global offset **6,561 = 81²**; the second ends at the end of unresolved ciphertext. The remaining **6,395** source glyphs after the first copy are **80²−5**.

The *following* physical p56 (solved as “AN END”) begins with a **five-rune red heading before its red 13-dot separator**, original ciphertext glyph indices `[25,11,22,15,4]`, and a red source-annotation span `{start:0,length:5}`. Appending precisely those *actual printed ciphertext* glyphs, without substituting the decrypted English letters, completes the exact second **80×80** array:

`12,956 + 5 = 12,961 = 6,561 + 6,400 = 81² + 80²`.

This is a new, fully source-grounded possible completion of the previously investigated five missing terminal cells in [the six-rune-pair square report](lp2-repeated-wordpair-structure.md). It may help a human notice the numbers. **The first 81² cut on p27 is only a regular hyphen-delimited word boundary**, not a printed section mark. The join from p55 to p56 passes a major red 13-dot mark and crosses from unsolved ciphertext into a page independently solved with the prime-totient/F interrupter mechanism. Those exact visual facts seriously weaken any assumption of one continuous authorial square cipher.

## Direct key-independent four-corner relation test

For every top-left 2×2 neighborhood of the resulting **81×81 first matrix**, predict the rune in the corresponding position of the **80×80 second matrix** by an arbitrary stationary *secret nonlinear lookup*, `B[r,c]=F(A[r,c],A[r+1,c],A[r,c+1],A[r+1,c+1])`. Grant all **29⁴** possible table inputs and **eight** source-square rotations/reflections independently. No other algebraic assumption, substitution key, or guessed plaintext is necessary.

The fixed first square supplies **6,360 distinct four-rune neighborhoods** for **6,400** target positions. Exactly **40** four-rune neighborhoods repeat twice, for every orientation. A true fixed lookup must give the same second-square output both times for **40/40** pairs. The actual title-completed original passes only **[5,2,0,1,1,0,1,0] of 40**, by source orientation 0..7. Every imaginable exact stationary secret lookup is therefore **inconsistent at a minimum of 35 glyphs** in this completed layout. The five p56 title cells provide essentially no independent support: none belongs to a repeated source neighborhood in canonical source orientation; at most one pair includes a title cell in two other rotated readings.

A full, nonparametric alignment control cycles the **same 6,400 original target glyphs** through **all 6,400 cyclic offsets**, preserving all output symbols, then reoptimizes the eight source orientations each time. There are **589/6,400 = 0.09203125** shifted layouts with **at least five** equal output pairs. Thus the observed maximum of five is ordinary under this source-conditioned, familywise-matched control. A genuine planted stationary secret four-corner table on the actual first-square inputs yields **40/40**, verifying the invariant and positive ability to detect the tested mechanism.

Exact script: [sims/lp2_bookend_p56_title_completion_sft.cjs](../sims/lp2_bookend_p56_title_completion_sft.cjs), requiring only Node.js 22 and the already pinned `lp2-corpus.json` and `lp2-ink-annotations.json`. It asserts the original positions, both six-rune phrases, p56 red five-glyph title and 13-dot separator, 6,400 target cells, all 40 repeated-neighborhood constraints, the exhaustive shift control and a stationary-lookup positive plant.

## Solve-path decision

The complete numerical join is exact and newly anchored to **five genuinely printed glyphs**. It still supplies neither an independently instructed 2D operation nor a corresponding original plaintext. A stationary 2×2 local lookup is directly contradicted, and the weaker matching alignment has no persuasive shift-controlled effect. It would be unsound to tune further local keys or claim that the p56 solved-page heading belongs to the same encryption register.

Retain the join as a **conditional human puzzle clue**. Reconsider the two-square route only if an external or page-visible operation specifies how to compare or invert the two matrices and predicts unknown source plaintext without selecting ciphertext repairs. Previously tested all-gap cubic, row/column, four-corner and Fourier families are documented in [the independent first square report](lp2-repeated-wordpair-structure.md); do not repeat those searches for this five-rune complement alone.
