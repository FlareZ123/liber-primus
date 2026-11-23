# Original word-position successor capacity: all-secret raw-Latin26 obstruction

**Agent13, 23 November 2026, original-input mathematical decision for Director issue #2273.** No unknown LP2 plaintext, key, actual cipher or destination recovered. [Reproducible original-input Node22 SFT](../sims/lp2_wordpos1_prevC_latin26_allsecret_sft.cjs) verifies each page's printed runes against the canonical corpus.

## Model and exact theorem

A simple no-repeat code for ordinary raw Latin A–Z could map each plaintext letter into one of the 28 GP29 outputs unequal to the previous ciphertext rune, leaving two ranks spare for escape/control symbols. More generally, allow a completely arbitrary and secret deterministic output map for *every* pair (previous published GP ciphertext rune h, exact within-word plaintext position j), with original printed spaces unchanged. The current raw Latin letter is the only other argument to the map. Each such state has only **26 possible Latin inputs**, hence at most **26 distinct output runes** for any secret function, even if the function is noninjective. This theorem is key-independent and requires no English model.

## Original ciphertext witness

The script parses all physical LP2 unknown p0–p55 original runes, with p50 rune-free, and asserts exact glyph-index agreement. Only a gap of slashes, whitespace or linebreaks is allowed for a within-word adjacency; any printed dash, stop, number or section marker terminates the word. The fixed word-position test excludes the left-edge fragment on every physical page so that cross-page carries cannot create a false word start.

- The **10,028** within-page, within-word edges include **63 equal** transitions. For **every one of 29 predecessor glyphs**, all **28 different GP29 successors** occur somewhere *inside* an original printed word.
- At the **second rune** of a printed word (j=1) the source has **2,784** eligible transitions, and **24 of 29 predecessor glyphs** exhibit **27 or 28 distinct unequal successors**. These states individually exceed the maximum 26 possible under every secret Latin26 encoder of the specified architecture. At j=2, another **13** rows violate; at j=3, **two**.
- The 24 offending j=1 rows collectively require **38 more output categories** than the 26-letter ceiling. Assigning output categories to the 26 Latin symbols optimally still leaves **at least 41 actual j=1 source occurrences** that must be reclassified as external exceptions, non-Latin symbols, or changing-state emissions.
- With the preceding GP rune **F (index0)** at j=1, original printed words exhibit *all* 28 other glyphs as successors. The script prints one physical page plus exact two local-rune offsets for each of the 28 witnesses.

An independent synthetic reversible 26-letter transition code C=(h+1+P) mod29 has only 26 output glyphs per predecessor and round-trips under the explicit inverse. It provides a positive implementation check.

## Consequence

**A book-global, position-and-previous-ciphertext-state, raw-Latin26 symbolwise no-repeat code cannot emit the original manuscript with all printed word boundaries preserved**, under any secret row functions. Invoking 86 original repeated transitions does not fix the 41 necessary exceptions at this *different*, nonrepeat output-support gate.

Possible escapes include a changing page/chapter/word key, additional plaintext/control symbols used inside words, polygraphic or length-changing coding, a longer ciphertext-state register, or moved plaintext word breaks. This result supplements the earlier [word-start/previous-whole-word raw-Latin26 theorem](lp2-rawlatin26-causal-wordstart-allkey-gate.md), which addresses a different state variable. The existing [GP29 all-secret word-position/predecessor test](lp2-wordposition-prevstate-allsecret-capacity.md) addresses a different 29-symbol input alphabet and cannot be substituted for this exact Latin26 pigeonhole obstruction. **No source-authored decoder is identified.**
